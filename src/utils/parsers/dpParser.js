import { parseDecimalField, parseIntegerField } from './parserUtils.js'

/**
 * Parser para o bloco DP (Demanda por Patamar)
 */

/**
 * Processa o bloco DP (demanda por patamar)
 * @param {Array<string>} lines - Linhas do arquivo
 * @returns {Array} Array com registros DP
 */
export function parseDP(lines) {
  const dpArray = []

  for (const line of lines) {
    if (line.startsWith('DP ')) {
      const registro = parseDPLine(line)
      if (registro) {
        dpArray.push(registro)
      }
    }
  }

  return dpArray
}

/**
 * Faz o parse de uma linha DP (leitura posicional)
 * Formato posicional:
 * - Posições 1-2: DP
 * - Posições 5-6: estágio
 * - Posições 10-11: subsistema
 * - Posições 20-29: carga patamar 1 (pesada)
 * - Posições 30-39: horas patamar 1 (pesada)
 * - Posições 40-49: carga patamar 2 (média)
 * - Posições 50-59: horas patamar 2 (média)
 * - Posições 60-69: carga patamar 3 (leve)
 * - Posições 70-79: horas patamar 3 (leve)
 * @param {string} line - Linha DP
 * @returns {object} Objeto com os dados do registro DP
 */
function parseDPLine(line) {
  const estagio = parseIntegerField(line.slice(4, 7))
  const subsistema = parseIntegerField(line.slice(9, 12))
  const numero_patamares = parseIntegerField(line.slice(14, 16))

  if (estagio === null || subsistema === null || numero_patamares === null) {
    return null
  }

  const registro = {
    estagio,
    subsistema,
    numero_patamares
  }

  // Patamar 1 - Pesada
  registro.carga_pesada = parseDecimalField(line.slice(20, 30))
  registro.horas_pesada = parseDecimalField(line.slice(30, 40))

  // Patamar 2 - Média
  registro.carga_media = parseDecimalField(line.slice(40, 50))
  registro.horas_media = parseDecimalField(line.slice(50, 60))

  // Patamar 3 - Leve
  registro.carga_leve = parseDecimalField(line.slice(60, 70))
  registro.horas_leve = parseDecimalField(line.slice(70, 80))

  return registro
}
