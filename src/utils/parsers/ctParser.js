import {
  expandForwardByStage,
  parseDecimalField,
  parseIntegerField
} from './parserUtils.js'

export function parseCT(lines, stageCount) {
  const records = lines
    .filter(line => line.startsWith('CT '))
    .map(parseCTLine)
    .filter(Boolean)

  const numberOfStages = stageCount || Math.max(...records.map(record => record.estagio), 0)
  return expandForwardByStage(records, numberOfStages, record => record.codigo_usina)
}

function parseCTLine(line) {
  const codigo_usina = parseIntegerField(line.slice(4, 7))
  const subsistema = parseIntegerField(line.slice(9, 11))
  const estagio = parseIntegerField(line.slice(24, 26))

  if (codigo_usina === null || subsistema === null || estagio === null) return null

  return {
    codigo_usina,
    subsistema,
    nome_termica: line.slice(14, 24).trim(),
    estagio,
    inflex_pesado: parseDecimalField(line.slice(29, 34)),
    disp_pesado: parseDecimalField(line.slice(34, 39)),
    cvu_pesado: parseDecimalField(line.slice(39, 49)),
    inflex_medio: parseDecimalField(line.slice(49, 54)),
    disp_medio: parseDecimalField(line.slice(54, 59)),
    cvu_medio: parseDecimalField(line.slice(59, 69)),
    inflex_leve: parseDecimalField(line.slice(69, 74)),
    disp_leve: parseDecimalField(line.slice(74, 79)),
    cvu_leve: parseDecimalField(line.slice(79, 89))
  }
}
