import {
  parseIntegerField
} from './parserUtils.js'

const FLOW_START = 14
const FLOW_WIDTH = 5

/**
 * VI descreve o tempo de viagem da água e a sequência histórica de vazões
 * defluentes usada antes do horizonte do estudo. A quantidade de QDEFs é
 * dinâmica e a ordem dos valores é significativa.
 */
export function parseVI(lines) {
  return lines
    .filter(line => line.startsWith('VI '))
    .map(parseVILine)
    .filter(Boolean)
}

function parseVILine(line) {
  const numero_usina = parseIntegerField(line.slice(4, 7))
  const duracao_horas = parseIntegerField(line.slice(9, 12))
  if (numero_usina === null || duracao_horas === null) return null

  const flowText = line.slice(FLOW_START).trimEnd()
  const flowCount = Math.ceil(flowText.length / FLOW_WIDTH)
  const vazoes_defluentes = Array.from(
    { length: flowCount },
    (_, index) => parseIntegerField(
      flowText.slice(index * FLOW_WIDTH, (index + 1) * FLOW_WIDTH)
    )
  )

  return {
    numero_usina,
    duracao_horas,
    vazoes_defluentes
  }
}
