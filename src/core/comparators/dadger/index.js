import { alignSequences, collectUniqueDates, encontrarEstagioPorData, semanticEqual } from '../../../utils/comparison.js'
import { buildCotvolSnapshots, cotvolSignature } from '../../../utils/cotvol.js'
import {
  includeOccurrence,
  makeOccurrence,
  sortOccurrences
} from '../../report/occurrence.js'
import {
  calendarFor,
  compareStageArrayBlock,
  compareTemporalRecordBlock
} from './temporal.js'
import { compareVI } from './vi.js'

const TEMPORAL_RECORD_BLOCKS = [
  {
    block: 'DP',
    secondaryKey: 'subsistema',
    identity: (_record, subsistema) => ({ subsistema }),
    fields: [
      'numero_patamares',
      'carga_pesada',
      'horas_pesada',
      'carga_media',
      'horas_media',
      'carga_leve',
      'horas_leve'
    ]
  },
  {
    block: 'PQ',
    secondaryKey: 'subsistema',
    identity: (_record, subsistema) => ({ subsistema }),
    fields: ['geracao_pesado', 'geracao_medio', 'geracao_leve']
  },
  {
    block: 'CT',
    secondaryKey: 'codigo_usina',
    identity: (_record, codigo_usina) => ({ codigo_usina }),
    fields: [
      'nome_termica',
      'subsistema',
      'inflex_pesado',
      'disp_pesado',
      'cvu_pesado',
      'inflex_medio',
      'disp_medio',
      'cvu_medio',
      'inflex_leve',
      'disp_leve',
      'cvu_leve'
    ]
  },
  {
    block: 'IA',
    secondaryKey: record => `${record.subsistema_de}\u0000${record.subsistema_para}`,
    identity: record => ({
      subsistema_de: record?.subsistema_de ?? null,
      subsistema_para: record?.subsistema_para ?? null
    }),
    fields: ['flag_penalidade', 'capacidades']
  },
  {
    block: 'RI',
    secondaryKey: record => `${record.usina}\u0000${record.subsistema}`,
    identity: record => ({
      usina: record?.usina ?? null,
      subsistema: record?.subsistema ?? null
    }),
    fields: ['pesado', 'medio', 'leve']
  },
  {
    block: 'HE',
    secondaryKey: 'numero_restricao',
    identity: (_record, numero_restricao) => ({ numero_restricao }),
    fields: [
      'tipo_limite',
      'limite_inferior',
      'penalidade',
      'flag_calculo_prod',
      'flag_tipo_valores',
      'flag_trat_nao_atend',
      'arquivo_produtividades',
      'flag_tolerancia',
      'coeficientes'
    ]
  },
  {
    block: 'RE',
    secondaryKey: 'numero_restricao',
    identity: (_record, numero_restricao) => ({ numero_restricao }),
    ignoredFields: ['estagio_inicial', 'estagio_final'],
    fields: [
      'estagio_inicial',
      'estagio_final',
      'limites',
      'fatores_uh',
      'fatores_ut',
      'fatores_interligacao',
      'fatores_contrato'
    ]
  },
  {
    block: 'HQ',
    secondaryKey: 'numero_restricao',
    identity: (_record, numero_restricao) => ({ numero_restricao }),
    ignoredFields: ['estagio_inicial', 'estagio_final'],
    fields: ['estagio_inicial', 'estagio_final', 'limites', 'coeficientes']
  },
  {
    block: 'HV',
    secondaryKey: 'numero_restricao',
    identity: (_record, numero_restricao) => ({ numero_restricao }),
    ignoredFields: ['estagio_inicial', 'estagio_final'],
    fields: ['estagio_inicial', 'estagio_final', 'limites', 'coeficientes']
  }
]

const STAGE_ARRAY_BLOCKS = [
  {
    block: 'TI',
    valueField: 'vazoes',
    entityField: 'numero_usina'
  },
  {
    block: 'MP',
    valueField: 'fatores',
    entityField: 'numero_usina',
    includeItaipuSet: true
  },
  {
    block: 'FD',
    valueField: 'fatores',
    entityField: 'numero_usina',
    includeItaipuSet: true
  },
  {
    block: 'VE',
    valueField: 'volumes',
    entityField: 'numero_usina'
  },
  {
    block: 'RQ',
    valueField: 'vazoes_minimas_pct',
    entityField: 'numero_ree'
  }
]

const UH_FIELDS = [
  'ree',
  'volume_armazenado_pct',
  'vazao_defluente_min',
  'chave_evaporacao',
  'estagio_producao',
  'volume_morto',
  'limite_vertimento',
  'chave_balanco_patamar',
  'status'
]

export function compareDadgerBlocks(leftDadger, rightDadger, { mode, options }) {
  const result = {}

  for (const config of TEMPORAL_RECORD_BLOCKS) {
    result[config.block] = compareTemporalRecordBlock({
      ...config,
      leftDadger,
      rightDadger,
      mode,
      options
    })
  }

  for (const config of STAGE_ARRAY_BLOCKS) {
    result[config.block] = compareStageArrayBlock({
      ...config,
      leftDadger,
      rightDadger,
      mode,
      options
    })
  }

  result.UH = compareUH(leftDadger, rightDadger, { mode, options })
  result.AC = compareAC(leftDadger, rightDadger, { mode, options })
  result.VI = compareVI(leftDadger, rightDadger, { mode, options })
  result.OUTROS = compareOutros(leftDadger, rightDadger, options)

  return Object.fromEntries(
    Object.entries(result).filter(([, occurrences]) => occurrences.length > 0)
  )
}

function compareUH(leftDadger, rightDadger, { mode, options }) {
  const records1 = leftDadger?.UH ?? []
  const records2 = rightDadger?.UH ?? []
  const plants = new Set([
    ...records1.map(record => record.numero_usina),
    ...records2.map(record => record.numero_usina)
  ])
  const sameDt = leftDadger?.info_dadger?.data_base === rightDadger?.info_dadger?.data_base

  return sortOccurrences([...plants].map(numero_usina => {
    const left = records1.find(record => record.numero_usina === numero_usina) ?? null
    const right = records2.find(record => record.numero_usina === numero_usina) ?? null
    return makeOccurrence({
      fileType: 'dadger',
      block: 'UH',
      identity: { numero_usina },
      calendar: {
        date: mode === 'data' ? leftDadger?.info_dadger?.data_base ?? null : null,
        index: mode === 'estagio' ? 1 : null,
        leftIndex: 1,
        rightIndex: 1,
        sameTemporality: mode === 'estagio' || sameDt
      },
      left,
      right,
      fieldNames: UH_FIELDS
    })
  }).filter(occurrence => includeOccurrence(occurrence, options)))
}

function compareAC(leftDadger, rightDadger, { mode, options }) {
  const records1 = normalizeAC(leftDadger)
  const records2 = normalizeAC(rightDadger)
  const plants = new Set([
    ...records1.map(record => record.usina),
    ...records2.map(record => record.usina)
  ])
  const occurrences = []

  for (const usina of [...plants].sort((first, second) => first - second)) {
    const plantRecords1 = records1.filter(record => record.usina === usina)
    const plantRecords2 = records2.filter(record => record.usina === usina)
    const keys = new Set([
      ...plantRecords1.map(record => acKey(record, mode)),
      ...plantRecords2.map(record => acKey(record, mode))
    ])

    for (const key of [...keys].sort()) {
      const group1 = plantRecords1.filter(record => acKey(record, mode) === key)
      const group2 = plantRecords2.filter(record => acKey(record, mode) === key)
      alignSequences(group1, group2, comparableACValue)
        .forEach(({ left, right }, sequenceIndex) => {
          const record = left ?? right
          const occurrence = makeOccurrence({
            fileType: 'dadger',
            block: 'AC',
            identity: {
              usina,
              mnemonico: record?.mnemonico ?? null,
              sequenceIndex
            },
            calendar: acCalendar(
              left,
              right,
              leftDadger,
              rightDadger,
              mode
            ),
            left,
            right,
            fieldNames: record?.cotvol
              ? ['coeficientes']
              : ['dados', 'mes', 'semana', 'ano'],
            compareField: (leftValue, rightValue, field) => {
              if (field === 'coeficientes') return !semanticEqual(leftValue, rightValue, [])
              return (leftValue ?? null) !== (rightValue ?? null)
            }
          })
          if (includeOccurrence(occurrence, options)) occurrences.push(occurrence)
        })
    }
  }

  return sortOccurrences(occurrences)
}

function compareOutros(leftDadger, rightDadger, options) {
  const outros1 = leftDadger?.OUTROS ?? {}
  const outros2 = rightDadger?.OUTROS ?? {}
  const mnemonics = new Set([...Object.keys(outros1), ...Object.keys(outros2)])
  const occurrences = []

  for (const mnemonic of [...mnemonics].sort()) {
    const lines1 = outros1[mnemonic] ?? []
    const lines2 = outros2[mnemonic] ?? []
    alignSequences(lines1, lines2, line => line.trimEnd())
      .forEach(({ left, right }, sequenceIndex) => {
        const occurrence = makeOccurrence({
          fileType: 'dadger',
          block: 'OUTROS',
          identity: { mnemonico: mnemonic, sequenceIndex },
          calendar: { sameTemporality: true },
          left: left == null ? null : { linha: left.trimEnd() },
          right: right == null ? null : { linha: right.trimEnd() },
          fieldNames: ['linha']
        })
        if (includeOccurrence(occurrence, options)) occurrences.push(occurrence)
      })
  }

  return sortOccurrences(occurrences)
}

function normalizeAC(dadgerData) {
  if (!dadgerData) return []
  return [
    ...buildCotvolSnapshots(dadgerData.AC ?? [], dadgerData.info_dadger),
    ...(dadgerData.AC ?? []).filter(record => record.mnemonico !== 'COTVOL')
  ]
}

function acKey(record, mode) {
  if (record.cotvol) {
    if (record.estagio === null) return 'COTVOL-estatico'
    const period = mode === 'data'
      ? record.data_inicio
      : `estagio-${record.estagio}`
    return `COTVOL-${period}`
  }

  return `${record.mnemonico}-${record.mes ?? ''}-${record.semana ?? ''}-${record.ano ?? ''}`
}

function comparableACValue(record) {
  return record.cotvol ? cotvolSignature(record) : record.dados.trimEnd()
}

function acCalendar(left, right, leftDadger, rightDadger, mode) {
  const record = left ?? right
  if (!record?.cotvol || record.estagio === null) {
    return { sameTemporality: true }
  }

  if (mode === 'data') {
    const dates1 = new Set(Object.values(leftDadger?.info_dadger?.datas_estagios ?? {}))
    const dates2 = new Set(Object.values(rightDadger?.info_dadger?.datas_estagios ?? {}))
    return {
      date: record.data_inicio,
      leftIndex: encontrarEstagioPorData(record.data_inicio, leftDadger),
      rightIndex: encontrarEstagioPorData(record.data_inicio, rightDadger),
      sameTemporality: dates1.has(record.data_inicio) && dates2.has(record.data_inicio)
    }
  }

  return {
    ...calendarFor(
      mode,
      record.estagio,
      record.estagio <= (leftDadger?.info_dadger?.numero_estagios ?? 0)
        ? { estagio: record.estagio }
        : null,
      record.estagio <= (rightDadger?.info_dadger?.numero_estagios ?? 0)
        ? { estagio: record.estagio }
        : null,
      record.estagio <= (leftDadger?.info_dadger?.numero_estagios ?? 0) &&
        record.estagio <= (rightDadger?.info_dadger?.numero_estagios ?? 0)
    ),
    leftSourceDate: left?.data_inicio ?? null,
    rightSourceDate: right?.data_inicio ?? null
  }
}
