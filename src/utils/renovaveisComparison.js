import { hasDiff } from './comparison.js'
import { compareBrazilianDates, parseBrazilianDate } from './temporal.js'

export function renewablePeriodDate(record, dadgerData) {
  if (!record || !dadgerData) return null
  return dadgerData.info_dadger?.datas_estagios?.[record.periodo] ?? null
}

export function alignRenovaveisGeneration(
  renovaveis1Data,
  renovaveis2Data,
  {
    compareMode = 'estagio',
    dadger1Data = null,
    dadger2Data = null
  } = {}
) {
  const records1 = renovaveis1Data?.geracaoAgregada ?? []
  const records2 = renovaveis2Data?.geracaoAgregada ?? []
  const dates1 = new Set(
    Object.values(dadger1Data?.info_dadger?.datas_estagios ?? {})
  )
  const dates2 = new Set(
    Object.values(dadger2Data?.info_dadger?.datas_estagios ?? {})
  )
  const rows = new Map()

  indexRecords(records1, 1, dadger1Data, compareMode, rows)
  indexRecords(records2, 2, dadger2Data, compareMode, rows)

  return [...rows.entries()]
    .map(([key, indexed]) => {
      const { ren1, ren2, date, period } = indexed
      const onlyInOne = !ren1 || !ren2
      const sameTemporality = compareMode === 'data'
        ? Boolean(date && dates1.has(date) && dates2.has(date))
        : true
      const diffGeracaoMedia = hasDiff(
        ren1?.geracaoMedia,
        ren2?.geracaoMedia
      )
      const diffNumPEEs = hasDiff(ren1?.numPEEs, ren2?.numPEEs)
      const diffNumCenarios = hasDiff(
        ren1?.numCenarios,
        ren2?.numCenarios
      )

      return {
        key,
        ren1,
        ren2,
        date,
        period,
        periodLabel: compareMode === 'data'
          ? date ?? 'Sem data associada'
          : `Período ${period}`,
        timeOrder: compareMode === 'data'
          ? parseBrazilianDate(date)?.getTime() ?? Number.MAX_SAFE_INTEGER
          : Number(period),
        submercado: ren1?.submercado ?? ren2?.submercado,
        patamar: ren1?.patamar ?? ren2?.patamar,
        geracaoMedia: ren1?.geracaoMedia ?? ren2?.geracaoMedia,
        onlyInOne,
        sameTemporality,
        diff_geracaoMedia: diffGeracaoMedia,
        diff_numPEEs: diffNumPEEs,
        diff_numCenarios: diffNumCenarios,
        has_diff: sameTemporality && (
          onlyInOne ||
          diffGeracaoMedia ||
          diffNumPEEs ||
          diffNumCenarios
        )
      }
    })
    .sort(compareAlignedRows)
}

function indexRecords(records, side, dadgerData, compareMode, rows) {
  records.forEach(record => {
    const date = compareMode === 'data'
      ? renewablePeriodDate(record, dadgerData)
      : null
    const temporalKey = compareMode === 'data'
      ? date
        ? `data:${date}`
        : `sem-data:${side}:${record.periodo}`
      : `periodo:${record.periodo}`
    const key = JSON.stringify([
      temporalKey,
      record.submercado,
      record.patamar
    ])
    const indexed = rows.get(key) ?? {
      ren1: null,
      ren2: null,
      date,
      period: record.periodo
    }

    indexed[`ren${side}`] = record
    rows.set(key, indexed)
  })
}

function compareAlignedRows(first, second) {
  if (first.date || second.date) {
    const dateComparison = compareBrazilianDates(first.date, second.date)
    if (dateComparison !== 0) return dateComparison
  } else {
    const periodComparison =
      Number(first.period ?? Number.MAX_SAFE_INTEGER) -
      Number(second.period ?? Number.MAX_SAFE_INTEGER)
    if (periodComparison !== 0) return periodComparison
  }

  const submarketComparison = compareValues(
    first.submercado,
    second.submercado
  )
  if (submarketComparison !== 0) return submarketComparison
  return compareValues(first.patamar, second.patamar)
}

function compareValues(first, second) {
  if (first == null && second == null) return 0
  if (first == null) return 1
  if (second == null) return -1
  if (typeof first === 'number' && typeof second === 'number') {
    return first - second
  }
  return String(first).localeCompare(String(second), 'pt-BR', {
    numeric: true
  })
}
