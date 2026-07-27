import { parseFixedWidthNumbers, parseIntegerField } from './parserUtils.js'

export function parseRQ(lines, stageCount) {
  const records = []

  for (const line of lines) {
    if (!line.startsWith('RQ ')) continue

    const numero_ree = parseIntegerField(line.slice(4, 7))
    if (numero_ree === null) continue

    records.push({
      numero_ree,
      vazoes_minimas_pct: parseFixedWidthNumbers(line, 9, 5, stageCount)
    })
  }

  return records
}
