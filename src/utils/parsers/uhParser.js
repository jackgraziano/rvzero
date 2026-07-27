import { parseDecimalField, parseIntegerField } from './parserUtils.js'

export function parseUH(lines) {
  return lines
    .filter(line => line.startsWith('UH '))
    .map(parseUHLine)
    .filter(Boolean)
}

function parseUHLine(line) {
  const numero_usina = parseIntegerField(line.slice(4, 7))
  if (numero_usina === null) return null

  return {
    numero_usina,
    ree: parseIntegerField(line.slice(9, 11)),
    volume_armazenado_pct: parseDecimalField(line.slice(14, 24)),
    vazao_defluente_min: parseDecimalField(line.slice(24, 34)),
    chave_evaporacao: parseIntegerField(line.slice(39, 40)),
    estagio_producao: parseIntegerField(line.slice(44, 46)),
    volume_morto: parseDecimalField(line.slice(49, 59)),
    limite_vertimento: parseDecimalField(line.slice(59, 69)),
    chave_balanco_patamar: parseIntegerField(line.slice(69, 70)),
    status: line.slice(71).trim() || null
  }
}
