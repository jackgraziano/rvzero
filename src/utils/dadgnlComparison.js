import { hasDiff } from './comparison.js'
import {
  addDays,
  compareBrazilianDates,
  formatBrazilianDate,
  parseBrazilianDate
} from './temporal.js'

const TG_FIELDS = [
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

const GL_FIELDS = [
  'subsistema',
  'geracao_pesado',
  'duracao_pesado',
  'geracao_medio',
  'duracao_medio',
  'geracao_leve',
  'duracao_leve'
]

export function dadgnlWeekDate(week, dadgerData) {
  const baseDate = dadgerData?.info_dadger?.data_base
  const start = addDays(baseDate, (Number(week) - 1) * 7)
  return start ? formatBrazilianDate(start) : null
}

export function alignDadgnlTG(
  dadgnl1Data,
  dadgnl2Data,
  options = {}
) {
  return alignTemporalRecords(
    dadgnl1Data?.TG ?? [],
    dadgnl2Data?.TG ?? [],
    dadgnl1Data,
    dadgnl2Data,
    {
      ...options,
      temporalField: 'estagio',
      temporalAbbreviation: 'Est',
      fields: TG_FIELDS
    }
  )
}

export function alignDadgnlGL(
  dadgnl1Data,
  dadgnl2Data,
  options = {}
) {
  return alignTemporalRecords(
    dadgnl1Data?.GL ?? [],
    dadgnl2Data?.GL ?? [],
    dadgnl1Data,
    dadgnl2Data,
    {
      ...options,
      temporalField: 'semana',
      temporalAbbreviation: 'Sem',
      fields: GL_FIELDS
    }
  )
}

export function alignDadgnlGS(dadgnl1Data, dadgnl2Data) {
  return alignStaticRecords(
    dadgnl1Data?.GS ?? [],
    dadgnl2Data?.GS ?? [],
    record => record.mes,
    ['numero_semanas']
  )
}

export function alignDadgnlNL(dadgnl1Data, dadgnl2Data) {
  return alignStaticRecords(
    dadgnl1Data?.NL ?? [],
    dadgnl2Data?.NL ?? [],
    record => record.codigo_usina,
    ['subsistema', 'lag']
  )
}

function alignTemporalRecords(
  records1,
  records2,
  dadgnl1Data,
  dadgnl2Data,
  {
    compareMode = 'estagio',
    dadger1Data = null,
    dadger2Data = null,
    temporalField,
    temporalAbbreviation,
    fields
  }
) {
  const weekCount1 = dadgnl1Data?.info_dadgnl?.numero_semanas ?? 0
  const weekCount2 = dadgnl2Data?.info_dadgnl?.numero_semanas ?? 0
  const dates1 = buildDateSet(weekCount1, dadger1Data)
  const dates2 = buildDateSet(weekCount2, dadger2Data)
  const rows = new Map()

  indexTemporalRecords(
    records1,
    1,
    dadger1Data,
    compareMode,
    temporalField,
    rows
  )
  indexTemporalRecords(
    records2,
    2,
    dadger2Data,
    compareMode,
    temporalField,
    rows
  )

  return [...rows.entries()]
    .map(([key, indexed]) => {
      const first = indexed.dadger1
      const second = indexed.dadger2
      const onlyInOne = !first || !second
      const sameTemporality = compareMode === 'data'
        ? Boolean(
          indexed.date &&
          dates1.has(indexed.date) &&
          dates2.has(indexed.date)
        )
        : indexed.temporalIndex <= weekCount1 &&
          indexed.temporalIndex <= weekCount2
      const differences = Object.fromEntries(
        fields.map(field => [
          `diff_${field}`,
          hasDiff(first?.[field], second?.[field])
        ])
      )
      const hasValueDifference = Object.values(differences).some(Boolean)
      const withDisplay = (record, date) => record
        ? {
            ...record,
            display: formatTemporalDisplay(
              record,
              temporalField,
              temporalAbbreviation,
              date,
              compareMode
            )
          }
        : null

      return {
        key,
        dadger1: withDisplay(first, indexed.date),
        dadger2: withDisplay(second, indexed.date),
        date: indexed.date,
        temporalOrder: compareMode === 'data'
          ? parseBrazilianDate(indexed.date)?.getTime() ??
            Number.MAX_SAFE_INTEGER
          : indexed.temporalIndex,
        onlyInOne,
        sameTemporality,
        has_diff: sameTemporality && (onlyInOne || hasValueDifference),
        ...differences,
        ...sortableFields(first, second, fields)
      }
    })
    .sort(compareRows)
}

function indexTemporalRecords(
  records,
  side,
  dadgerData,
  compareMode,
  temporalField,
  rows
) {
  records.forEach(record => {
    const temporalIndex = record[temporalField]
    const date = compareMode === 'data'
      ? dadgnlWeekDate(temporalIndex, dadgerData)
      : null
    const temporalKey = compareMode === 'data'
      ? date
        ? `data:${date}`
        : `sem-data:${side}:${temporalIndex}`
      : `indice:${temporalIndex}`
    const key = JSON.stringify([temporalKey, record.codigo_usina])
    const indexed = rows.get(key) ?? {
      dadger1: null,
      dadger2: null,
      date,
      temporalIndex
    }

    indexed[`dadger${side}`] = record
    rows.set(key, indexed)
  })
}

function alignStaticRecords(records1, records2, getIdentity, fields) {
  const rows = new Map()

  records1.forEach(record => {
    rows.set(String(getIdentity(record)), {
      dadger1: record,
      dadger2: null
    })
  })
  records2.forEach(record => {
    const key = String(getIdentity(record))
    const indexed = rows.get(key) ?? { dadger1: null, dadger2: null }
    indexed.dadger2 = record
    rows.set(key, indexed)
  })

  return [...rows.entries()]
    .map(([key, { dadger1, dadger2 }]) => {
      const differences = Object.fromEntries(
        fields.map(field => [
          `diff_${field}`,
          hasDiff(dadger1?.[field], dadger2?.[field])
        ])
      )
      const onlyInOne = !dadger1 || !dadger2

      return {
        key,
        dadger1,
        dadger2,
        onlyInOne,
        sameTemporality: true,
        has_diff: onlyInOne || Object.values(differences).some(Boolean),
        ...differences,
        ...sortableFields(dadger1, dadger2, fields)
      }
    })
    .sort((first, second) =>
      String(first.key).localeCompare(String(second.key), 'pt-BR', {
        numeric: true
      })
    )
}

function buildDateSet(weekCount, dadgerData) {
  return new Set(
    Array.from({ length: weekCount }, (_, index) =>
      dadgnlWeekDate(index + 1, dadgerData)
    ).filter(Boolean)
  )
}

function formatTemporalDisplay(
  record,
  temporalField,
  abbreviation,
  date,
  compareMode
) {
  const index = record[temporalField]
  if (compareMode === 'data') {
    return date ? `${date} · ${abbreviation} ${index}` : `${abbreviation} ${index}`
  }
  if (record.data_inicio) {
    return `${abbreviation} ${index} · ${record.data_inicio}`
  }
  return `${abbreviation} ${index}`
}

function sortableFields(first, second, fields) {
  return Object.fromEntries(
    fields.map(field => [field, first?.[field] ?? second?.[field] ?? null])
  )
}

function compareRows(first, second) {
  if (first.date || second.date) {
    const dateComparison = compareBrazilianDates(first.date, second.date)
    if (dateComparison !== 0) return dateComparison
  } else if (first.temporalOrder !== second.temporalOrder) {
    return first.temporalOrder - second.temporalOrder
  }

  const firstCode =
    first.dadger1?.codigo_usina ?? first.dadger2?.codigo_usina ?? 0
  const secondCode =
    second.dadger1?.codigo_usina ?? second.dadger2?.codigo_usina ?? 0
  return firstCode - secondCode
}
