import { groupBy, parseDecimalField, parseIntegerField } from './parserUtils.js'

/**
 * O CM é escrito depois de todas as linhas HE da mesma restrição. Portanto, a
 * associação correta é pelo número da restrição, não pela linha HE precedente.
 */
export function parseHE(lines) {
  const restrictions = lines
    .filter(line => line.startsWith('HE '))
    .map(parseHELine)
    .filter(Boolean)
  const coefficients = lines
    .filter(line => line.startsWith('CM '))
    .map(parseCMLine)
    .filter(Boolean)
  const coefficientsByRestriction = groupBy(
    coefficients,
    coefficient => coefficient.numero_restricao
  )

  return restrictions.map(restriction => ({
    ...restriction,
    coeficientes: coefficientsByRestriction.get(restriction.numero_restricao) ?? []
  }))
}

function parseHELine(line) {
  const numero_restricao = parseIntegerField(line.slice(4, 7))
  const estagio = parseIntegerField(line.slice(25, 27))
  if (numero_restricao === null || estagio === null) return null

  return {
    numero_restricao,
    estagio,
    tipo_limite: parseIntegerField(line.slice(9, 10)),
    limite_inferior: parseDecimalField(line.slice(14, 24)),
    penalidade: parseDecimalField(line.slice(28, 38)),
    flag_calculo_prod: parseIntegerField(line.slice(39, 40)),
    flag_tipo_valores: parseIntegerField(line.slice(41, 42)),
    flag_trat_nao_atend: parseIntegerField(line.slice(43, 44)),
    arquivo_produtividades: line.slice(45, 105).trim() || null,
    flag_tolerancia: parseIntegerField(line.slice(106, 107))
  }
}

function parseCMLine(line) {
  const numero_restricao = parseIntegerField(line.slice(4, 7))
  const ree = parseIntegerField(line.slice(9, 12))
  if (numero_restricao === null || ree === null) return null

  return {
    numero_restricao,
    ree,
    coeficiente: parseDecimalField(line.slice(14, 24))
  }
}
