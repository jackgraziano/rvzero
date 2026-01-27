/**
 * Parser para o bloco MP - Manutenção Programada
 * Nota: Este bloco declara todos os estágios explicitamente (não precisa expansão)
 */

/**
 * Parse de uma linha MP
 */
function parseMPLine(line) {
  try {
    const numero_usina = parseInt(line.substring(4, 7).trim())
    const conjunto_itaipu = line.substring(7, 9).trim() || null

    // Ler 24 fatores de manutenção (F5.0 cada, começando na posição 10)
    const fatores = []
    for (let i = 0; i < 24; i++) {
      const inicio = 9 + i * 5
      const fim = inicio + 5
      const valorStr = line.substring(inicio, fim).trim()
      // Se está em branco, considerar como null (missing), não como 0
      const valor = valorStr === '' ? null : parseFloat(valorStr)
      fatores.push(valor)
    }

    return {
      numero_usina,
      conjunto_itaipu,
      fatores
    }
  } catch (error) {
    console.error('Erro ao parsear linha MP:', line, error)
    return null
  }
}

/**
 * Parse do bloco MP completo
 * Nota: MP sempre declara todos os estágios, não precisa expansão
 */
export function parseMP(lines) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('MP ')) {
      const registro = parseMPLine(line)
      if (registro) {
        registros.push(registro)
      }
    }
  }

  return registros
}
