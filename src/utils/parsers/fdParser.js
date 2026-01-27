/**
 * Parser para o bloco FD - Fatores de Disponibilidade
 * Nota: Este bloco declara todos os estágios explicitamente (não precisa expansão)
 */

/**
 * Parse de uma linha FD
 */
function parseFDLine(line) {
  try {
    const numero_usina = parseInt(line.substring(4, 7).trim())
    const conjunto_itaipu = line.substring(7, 9).trim() || null

    // Ler 24 fatores de disponibilidade (F5.0 cada, começando na posição 10)
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
    console.error('Erro ao parsear linha FD:', line, error)
    return null
  }
}

/**
 * Parse do bloco FD completo
 * Nota: FD sempre declara todos os estágios, não precisa expansão
 */
export function parseFD(lines) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('FD ')) {
      const registro = parseFDLine(line)
      if (registro) {
        registros.push(registro)
      }
    }
  }

  return registros
}
