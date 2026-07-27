import {
  expandForwardByStage,
  parseDecimalField,
  parseIntegerField
} from './parserUtils.js'

/**
 * Pequena geração: cada fonte é cadastrada apenas quando muda. O valor vigente
 * deve ser propagado por fonte e subsistema antes da soma por subsistema.
 */
export function parsePQ(lines, stageCount) {
  const records = lines
    .filter(line => line.startsWith('PQ '))
    .map(parsePQLine)
    .filter(Boolean)

  const numberOfStages = stageCount || Math.max(...records.map(record => record.estagio), 0)
  const expanded = expandForwardByStage(
    records,
    numberOfStages,
    record => `${record.fonte_geracao}\u0000${record.subsistema}`
  )
  const aggregated = new Map()

  for (const record of expanded) {
    const key = `${record.estagio}\u0000${record.subsistema}`
    const current = aggregated.get(key) ?? {
      estagio: record.estagio,
      subsistema: record.subsistema,
      geracao_pesado: 0,
      geracao_medio: 0,
      geracao_leve: 0
    }

    current.geracao_pesado += record.geracao_pesado ?? 0
    current.geracao_medio += record.geracao_medio ?? 0
    current.geracao_leve += record.geracao_leve ?? 0
    aggregated.set(key, current)
  }

  return [...aggregated.values()].sort(
    (first, second) =>
      first.estagio - second.estagio ||
      first.subsistema - second.subsistema
  )
}

function parsePQLine(line) {
  const fonte_geracao = line.slice(4, 14).trim()
  const subsistema = parseIntegerField(line.slice(14, 16))
  const estagio = parseIntegerField(line.slice(19, 21))

  if (!fonte_geracao || subsistema === null || estagio === null) return null

  return {
    fonte_geracao,
    subsistema,
    estagio,
    geracao_pesado: parseDecimalField(line.slice(24, 29)),
    geracao_medio: parseDecimalField(line.slice(29, 34)),
    geracao_leve: parseDecimalField(line.slice(34, 39))
  }
}
