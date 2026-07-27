import { compareBrazilianDates } from './temporal.js'

export function encontrarEstagioPorData(data, dadgerData) {
  const dates = dadgerData.info_dadger?.datas_estagios ?? {}
  const entry = Object.entries(dates).find(([, stageDate]) => stageDate === data)
  return entry ? Number(entry[0]) : null
}

export function hasDiff(first, second) {
  if (first == null && second == null) return false
  return first !== second
}

export function semanticEqual(first, second, ignoredKeys = ['estagio']) {
  return stableSerialize(first, new Set(ignoredKeys)) ===
    stableSerialize(second, new Set(ignoredKeys))
}

function stableSerialize(value, ignoredKeys) {
  if (value == null) return 'null'
  if (typeof value !== 'object') return JSON.stringify(value)

  if (Array.isArray(value)) {
    return `[${value
      .map(item => stableSerialize(item, ignoredKeys))
      .sort()
      .join(',')}]`
  }

  const entries = Object.entries(value)
    .filter(([key]) => !ignoredKeys.has(key))
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item, ignoredKeys)}`)
  return `{${entries.join(',')}}`
}

export function formatNumber(value) {
  if (value == null) return '-'
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3
  })
}

export function formatNumberScientific(value) {
  if (value == null) return '-'
  if (value >= 1.0e20) return '∞'
  return formatNumber(value)
}

export const formatLimite = formatNumber

export function formatRange(minimum, maximum) {
  if (minimum == null && maximum == null) return '-'
  return `${formatNumber(minimum)} - ${formatNumber(maximum)}`
}

export function collectUniqueValues(array1, array2, propertyOrSelector) {
  const select = selector(propertyOrSelector)
  const values = new Set([...array1, ...array2].map(select))
  return [...values].sort(compareValues)
}

export function collectUniqueDates(dadger1Data, dadger2Data) {
  const dates = new Set([
    ...Object.values(dadger1Data.info_dadger?.datas_estagios ?? {}),
    ...Object.values(dadger2Data.info_dadger?.datas_estagios ?? {})
  ])
  return [...dates].sort(compareBrazilianDates)
}

export function alignByEstagio(
  records1,
  records2,
  dadger1Info,
  dadger2Info,
  secondaryKey,
  transform
) {
  const select = selector(secondaryKey)
  const secondaryValues = collectUniqueValues(records1, records2, select)
  const stageCount1 = dadger1Info?.numero_estagios ??
    Math.max(...records1.map(record => record.estagio), 0)
  const stageCount2 = dadger2Info?.numero_estagios ??
    Math.max(...records2.map(record => record.estagio), 0)
  const maximumStage = Math.max(stageCount1, stageCount2)
  const map1 = indexTemporalRecords(records1, select)
  const map2 = indexTemporalRecords(records2, select)
  const aligned = []

  for (let stage = 1; stage <= maximumStage; stage += 1) {
    const sameTemporality = stage <= stageCount1 && stage <= stageCount2
    for (const secondaryValue of secondaryValues) {
      const record1 = map1.get(temporalKey(stage, secondaryValue)) ?? null
      const record2 = map2.get(temporalKey(stage, secondaryValue)) ?? null
      if (!record1 && !record2) continue

      aligned.push(transform(
        record1,
        record2,
        !record1 || !record2,
        sameTemporality,
        stage,
        secondaryValue
      ))
    }
  }

  return aligned
}

export function alignByData(
  records1,
  records2,
  dadger1Data,
  dadger2Data,
  secondaryKey,
  transform
) {
  const select = selector(secondaryKey)
  const secondaryValues = collectUniqueValues(records1, records2, select)
  const map1 = indexTemporalRecords(records1, select)
  const map2 = indexTemporalRecords(records2, select)
  const aligned = []

  for (const date of collectUniqueDates(dadger1Data, dadger2Data)) {
    const stage1 = encontrarEstagioPorData(date, dadger1Data)
    const stage2 = encontrarEstagioPorData(date, dadger2Data)
    const sameTemporality = stage1 !== null && stage2 !== null

    for (const secondaryValue of secondaryValues) {
      const record1 = stage1 === null
        ? null
        : map1.get(temporalKey(stage1, secondaryValue)) ?? null
      const record2 = stage2 === null
        ? null
        : map2.get(temporalKey(stage2, secondaryValue)) ?? null
      if (!record1 && !record2) continue

      aligned.push(transform(
        record1,
        record2,
        !record1 || !record2,
        sameTemporality,
        date,
        secondaryValue
      ))
    }
  }

  return aligned
}

/**
 * Alinhamento de sequências por distância de edição. Uma inserção no meio não
 * desloca todas as linhas seguintes, evitando cascatas de falsos positivos.
 */
export function alignSequences(first, second, normalize = value => value) {
  const rows = first.length + 1
  const columns = second.length + 1
  const costs = Array.from({ length: rows }, () => Array(columns).fill(0))

  for (let row = 0; row < rows; row += 1) costs[row][0] = row
  for (let column = 0; column < columns; column += 1) costs[0][column] = column

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const equal = normalize(first[row - 1]) === normalize(second[column - 1])
      costs[row][column] = Math.min(
        costs[row - 1][column] + 1,
        costs[row][column - 1] + 1,
        costs[row - 1][column - 1] + (equal ? 0 : 1)
      )
    }
  }

  const aligned = []
  let row = first.length
  let column = second.length

  while (row > 0 || column > 0) {
    const equal = row > 0 && column > 0 &&
      normalize(first[row - 1]) === normalize(second[column - 1])
    const diagonalCost = row > 0 && column > 0
      ? costs[row - 1][column - 1] + (equal ? 0 : 1)
      : Infinity

    if (diagonalCost === costs[row][column]) {
      aligned.push({ left: first[row - 1], right: second[column - 1] })
      row -= 1
      column -= 1
    } else if (row > 0 && costs[row - 1][column] + 1 === costs[row][column]) {
      aligned.push({ left: first[row - 1], right: null })
      row -= 1
    } else {
      aligned.push({ left: null, right: second[column - 1] })
      column -= 1
    }
  }

  return aligned.reverse()
}

function selector(propertyOrSelector) {
  return typeof propertyOrSelector === 'function'
    ? propertyOrSelector
    : record => record[propertyOrSelector]
}

function indexTemporalRecords(records, select) {
  return new Map(
    records.map(record => [
      temporalKey(record.estagio, select(record)),
      record
    ])
  )
}

function temporalKey(stage, secondaryValue) {
  return `${stage}\u0000${String(secondaryValue)}`
}

function compareValues(first, second) {
  if (typeof first === 'number' && typeof second === 'number') return first - second
  return String(first).localeCompare(String(second), 'pt-BR', { numeric: true })
}
