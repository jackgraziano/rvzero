import {
  expandForwardByStage,
  parseDecimalField,
  parseIntegerField
} from './parserUtils.js'

export function parseIA(lines, stageCount, loadLevelCount = 3) {
  const records = lines
    .filter(line => line.startsWith('IA '))
    .map(line => parseIALine(line, loadLevelCount))
    .filter(Boolean)

  const numberOfStages = stageCount || Math.max(...records.map(record => record.estagio), 0)
  return expandForwardByStage(
    records,
    numberOfStages,
    record => `${record.subsistema_de}\u0000${record.subsistema_para}`
  )
}

function parseIALine(line, loadLevelCount) {
  const estagio = parseIntegerField(line.slice(4, 6))
  const subsistema_de = line.slice(9, 11).trim()
  const subsistema_para = line.slice(14, 16).trim()

  if (estagio === null || !subsistema_de || !subsistema_para) return null

  const capacidades = []
  for (let patamar = 0; patamar < loadLevelCount; patamar += 1) {
    const start = 19 + patamar * 20
    capacidades.push({
      de_para: parseDecimalField(line.slice(start, start + 10)),
      para_de: parseDecimalField(line.slice(start + 10, start + 20))
    })
  }

  return {
    estagio,
    subsistema_de,
    subsistema_para,
    flag_penalidade: parseIntegerField(line.slice(17, 18)),
    capacidades
  }
}
