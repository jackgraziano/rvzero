import test from 'node:test'
import assert from 'node:assert/strict'

import { compareDadgerBlocks } from '../../src/core/comparators/dadger/index.js'

const EXPECTED_DADGER_BLOCKS = [
  'AC',
  'CT',
  'DP',
  'FD',
  'HE',
  'HQ',
  'HV',
  'IA',
  'MP',
  'OUTROS',
  'PQ',
  'RE',
  'RI',
  'RQ',
  'TI',
  'UH',
  'VE',
  'VI'
]

test('comparador puro cobre todos os blocos DADGER exibidos pelo site', () => {
  const left = dadgerFixture(100)
  const right = dadgerFixture(101)
  const blocks = compareDadgerBlocks(left, right, {
    mode: 'estagio',
    options: {
      includeEqual: true,
      includeOutsideCommonHorizon: true
    }
  })

  assert.deepEqual(Object.keys(blocks).sort(), EXPECTED_DADGER_BLOCKS)
  const duration = blocks.VI.find(occurrence =>
    occurrence.fields.duracao_horas
  )
  const flows = blocks.VI.filter(occurrence =>
    occurrence.fields.vazao_defluente
  )
  assert.equal(duration.fields.duracao_horas.changed, false)
  assert.equal(flows[0].fields.vazao_defluente.changed, true)
  assert.equal(flows[1].fields.vazao_defluente.changed, false)
})

test('VI preserva repetições e compara cada posição da sequência histórica', () => {
  const left = dadgerFixture(100)
  const right = dadgerFixture(100)
  left.VI = [
    {
      numero_usina: 156,
      duracao_horas: 360,
      vazoes_defluentes: [10, 20, 30]
    },
    {
      numero_usina: 156,
      duracao_horas: 168,
      vazoes_defluentes: [40]
    }
  ]
  right.VI = [
    {
      numero_usina: 156,
      duracao_horas: 360,
      vazoes_defluentes: [10, 21]
    },
    {
      numero_usina: 156,
      duracao_horas: 168,
      vazoes_defluentes: [40]
    }
  ]

  const blocks = compareDadgerBlocks(left, right, {
    mode: 'estagio',
    options: {
      includeEqual: true,
      includeOutsideCommonHorizon: true
    }
  })

  assert.equal(blocks.VI.length, 6)
  const firstRecord = blocks.VI.filter(occurrence =>
    occurrence.identity.sequenceIndex === 0
  )
  const firstFlows = firstRecord.filter(occurrence =>
    occurrence.fields.vazao_defluente
  )
  assert.equal(firstRecord[0].fields.duracao_horas.changed, false)
  assert.equal(firstFlows[0].status, 'equal')
  assert.equal(firstFlows[1].status, 'changed')
  assert.equal(firstFlows[2].fields.vazao_defluente.left, 30)
  assert.equal(firstFlows[2].fields.vazao_defluente.right, null)

  const secondRecord = blocks.VI.filter(occurrence =>
    occurrence.identity.sequenceIndex === 1
  )
  assert.deepEqual(
    secondRecord.map(occurrence => occurrence.status),
    ['equal', 'equal']
  )
})

test('VI alinha QDEFs pela semana histórica derivada do DT de cada deck', () => {
  const left = viDeck('21/02/2026', [311, 449, 485, 380, 210])
  const right = viDeck('28/02/2026', [423, 346, 449, 485, 504])
  const blocks = compareDadgerBlocks(left, right, {
    mode: 'data',
    options: {
      includeEqual: true,
      includeOutsideCommonHorizon: true
    }
  })
  const flows = blocks.VI.filter(occurrence =>
    occurrence.fields.vazao_defluente
  )

  assert.equal(flows.length, 6)
  const sharedEqual = flows.find(occurrence =>
    occurrence.calendar.date === '07/02/2026'
  )
  assert.equal(sharedEqual.status, 'equal')
  assert.equal(sharedEqual.calendar.leftIndex, 2)
  assert.equal(sharedEqual.calendar.rightIndex, 3)
  assert.equal(sharedEqual.fields.vazao_defluente.left, 449)
  assert.equal(sharedEqual.fields.vazao_defluente.right, 449)

  const sharedChanged = flows.find(occurrence =>
    occurrence.calendar.date === '14/02/2026'
  )
  assert.equal(sharedChanged.status, 'changed')
  assert.equal(sharedChanged.calendar.leftIndex, 1)
  assert.equal(sharedChanged.calendar.rightIndex, 2)

  const onlyLeftHistory = flows.find(occurrence =>
    occurrence.calendar.date === '17/01/2026'
  )
  assert.equal(onlyLeftHistory.status, 'outside-common-horizon')
  assert.equal(onlyLeftHistory.calendar.leftIndex, 5)
  assert.equal(onlyLeftHistory.calendar.rightIndex, undefined)

  const onlyRightHistory = flows.find(occurrence =>
    occurrence.calendar.date === '21/02/2026'
  )
  assert.equal(onlyRightHistory.status, 'outside-common-horizon')
  assert.equal(onlyRightHistory.calendar.leftIndex, undefined)
  assert.equal(onlyRightHistory.calendar.rightIndex, 1)
})

test('VI compara a duração mesmo sem semanas históricas comuns', () => {
  const left = viDeck('31/01/2026', [10, 20], 360)
  const right = viDeck('06/06/2026', [10, 20], 168)
  const blocks = compareDadgerBlocks(left, right, {
    mode: 'data',
    options: {
      includeEqual: true,
      includeOutsideCommonHorizon: true
    }
  })

  const duration = blocks.VI.find(occurrence =>
    occurrence.fields.duracao_horas
  )
  const flows = blocks.VI.filter(occurrence =>
    occurrence.fields.vazao_defluente
  )
  assert.equal(duration.status, 'changed')
  assert.equal(duration.fields.duracao_horas.left, 360)
  assert.equal(duration.fields.duracao_horas.right, 168)
  assert.equal(
    flows.every(occurrence =>
      occurrence.status === 'outside-common-horizon'
    ),
    true
  )
})

function viDeck(baseDate, flows, duration = 360) {
  return {
    info_dadger: {
      data_base: baseDate,
      numero_estagios: 1,
      datas_estagios: { 1: baseDate },
      estagios: [{
        numero: 1,
        data_inicio: baseDate,
        duracao_horas: 168
      }]
    },
    VI: [{
      numero_usina: 156,
      duracao_horas: duration,
      vazoes_defluentes: flows
    }]
  }
}

function dadgerFixture(value) {
  return {
    info_dadger: {
      data_base: '31/01/2026',
      numero_estagios: 1,
      datas_estagios: { 1: '31/01/2026' },
      estagios: [{ numero: 1, data_inicio: '31/01/2026' }]
    },
    DP: [{
      estagio: 1,
      subsistema: 1,
      numero_patamares: 3,
      carga_pesada: value,
      horas_pesada: 30,
      carga_media: value,
      horas_media: 74,
      carga_leve: value,
      horas_leve: 64
    }],
    PQ: [{ estagio: 1, subsistema: 1, geracao_pesado: value, geracao_medio: value, geracao_leve: value }],
    CT: [{ estagio: 1, codigo_usina: 1, nome_termica: 'UTE', subsistema: 1, inflex_pesado: value }],
    IA: [{ estagio: 1, subsistema_de: '1', subsistema_para: '2', flag_penalidade: 0, capacidades: [{ de_para: value, para_de: value }] }],
    UH: [{ numero_usina: 1, ree: 1, volume_armazenado_pct: value }],
    TI: [{ numero_usina: 1, vazoes: [value] }],
    MP: [{ numero_usina: 1, conjunto_itaipu: '50', fatores: [value] }],
    FD: [{ numero_usina: 1, conjunto_itaipu: '50', fatores: [value] }],
    VE: [{ numero_usina: 1, volumes: [value] }],
    RQ: [{ numero_ree: 1, vazoes_minimas_pct: [value] }],
    VI: [{
      numero_usina: 156,
      duracao_horas: 360,
      vazoes_defluentes: [value, 0]
    }],
    RE: [{
      numero_restricao: 1,
      estagio: 1,
      estagio_inicial: 1,
      estagio_final: 1,
      limites: { pesado_min: value },
      fatores_uh: [{ numero_usina: 1, frequencia: 1, fator: value }],
      fatores_ut: [],
      fatores_interligacao: [],
      fatores_contrato: []
    }],
    HQ: [{
      numero_restricao: 1,
      estagio: 1,
      estagio_inicial: 1,
      estagio_final: 1,
      limites: { pesado_min: value },
      coeficientes: [{ numero_usina: 1, tipo_variavel: 'QDEF', coeficiente: value }]
    }],
    HV: [{
      numero_restricao: 1,
      estagio: 1,
      estagio_inicial: 1,
      estagio_final: 1,
      limites: { limite_inferior: value },
      coeficientes: [{ numero_usina: 1, tipo_variavel: 'VARM', coeficiente: value }]
    }],
    RI: [{ estagio: 1, usina: 1, subsistema: 1, pesado: { p60_min: value }, medio: {}, leve: {} }],
    HE: [{ estagio: 1, numero_restricao: 1, tipo_limite: 1, coeficientes: [{ ree: 1, coeficiente: value }] }],
    AC: [{ usina: 1, mnemonico: 'TESTE', dados: String(value), mes: null, semana: null, ano: null }],
    OUTROS: { ZZ: [`ZZ ${value}`] }
  }
}
