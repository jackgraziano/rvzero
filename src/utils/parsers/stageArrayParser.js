import {
  parseFixedWidthNumbers,
  parseIntegerField
} from './parserUtils.js'

export function parseStageArray(
  lines,
  {
    mnemonic,
    valueField,
    stageCount,
    supportsItaipuSet = false,
    entityField = 'numero_usina'
  }
) {
  const records = []

  for (const line of lines) {
    if (!line.startsWith(`${mnemonic} `)) continue

    const entity = parseIntegerField(line.slice(4, 7))
    if (entity === null) continue

    const record = {
      [entityField]: entity
    }

    if (supportsItaipuSet) {
      record.conjunto_itaipu = line.slice(7, 9).trim() || null
    }

    record[valueField] = parseFixedWidthNumbers(line, 9, 5, stageCount)
    records.push(record)
  }

  return records
}
