import {
  expandForwardByStage,
  parseDecimalField,
  parseIntegerField
} from './parserUtils.js'

export function parseRI(lines, stageCount) {
  const records = lines
    .filter(line => line.startsWith('RI '))
    .map(parseRILine)
    .filter(Boolean)

  const numberOfStages = stageCount || Math.max(...records.map(record => record.estagio), 0)
  return expandForwardByStage(
    records,
    numberOfStages,
    record => `${record.usina}\u0000${record.subsistema}`
  )
}

function parseRILine(line) {
  const usina = parseIntegerField(line.slice(4, 7))
  const estagio = parseIntegerField(line.slice(8, 11))
  const subsistema = parseIntegerField(line.slice(12, 15))

  if (usina === null || estagio === null || subsistema === null) return null

  return {
    usina,
    estagio,
    subsistema,
    pesado: parsePatamar(line, 16),
    medio: parsePatamar(line, 51),
    leve: parsePatamar(line, 86)
  }
}

function parsePatamar(line, start) {
  return {
    p60_min: parseDecimalField(line.slice(start, start + 7)),
    p60_max: parseDecimalField(line.slice(start + 7, start + 14)),
    p50_min: parseDecimalField(line.slice(start + 14, start + 21)),
    p50_max: parseDecimalField(line.slice(start + 21, start + 28)),
    carga_ande: parseDecimalField(line.slice(start + 28, start + 35))
  }
}
