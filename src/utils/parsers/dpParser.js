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
  // Leitura posicional
  const estagio = parseInt(line.substring(5, 7).trim())
  const subsistema = parseInt(line.substring(10, 12).trim())
  const numero_patamares = 3 // Sempre 3 patamares

  const registro = {
    estagio,
    subsistema,
    numero_patamares
  }

  // Patamar 1 - Pesada
  const cargaPesadaStr = line.substring(20, 30).trim()
  const horasPesadaStr = line.substring(30, 40).trim()
  registro.carga_pesada = cargaPesadaStr ? parseFloat(cargaPesadaStr) : null
  registro.horas_pesada = horasPesadaStr ? parseFloat(horasPesadaStr) : null

  // Patamar 2 - Média
  const cargaMediaStr = line.substring(40, 50).trim()
  const horasMediaStr = line.substring(50, 60).trim()
  registro.carga_media = cargaMediaStr ? parseFloat(cargaMediaStr) : null
  registro.horas_media = horasMediaStr ? parseFloat(horasMediaStr) : null

  // Patamar 3 - Leve
  const cargaLeveStr = line.substring(60, 70).trim()
  const horasLeveStr = line.substring(70, 80).trim()
  registro.carga_leve = cargaLeveStr ? parseFloat(cargaLeveStr) : null
  registro.horas_leve = horasLeveStr ? parseFloat(horasLeveStr) : null

  return registro
}
