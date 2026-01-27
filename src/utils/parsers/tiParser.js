/**
 * Parser para o bloco TI - Turbinagem/Vazão desviada por usina
 * Nota: Este bloco declara todos os estágios explicitamente (não precisa expansão)
 */

/**
 * Parse de uma linha TI
 */
function parseTILine(line) {
  try {
    const numero_usina = parseInt(line.substring(4, 7).trim())

    // Ler 24 vazões (F5.0 cada, começando na posição 10)
    const vazoes = []
    for (let i = 0; i < 24; i++) {
      const inicio = 9 + i * 5
      const fim = inicio + 5
      const valorStr = line.substring(inicio, fim).trim()
      // Se está em branco, considerar como null (missing), não como 0
      const valor = valorStr === '' ? null : parseFloat(valorStr)
      vazoes.push(valor)
    }

    return {
      numero_usina,
      vazoes
    }
  } catch (error) {
    console.error('Erro ao parsear linha TI:', line, error)
    return null
  }
}

/**
 * Parse do bloco TI completo
 * Nota: TI sempre declara todos os estágios, não precisa expansão
 */
export function parseTI(lines) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('TI ')) {
      const registro = parseTILine(line)
      if (registro) {
        registros.push(registro)
      }
    }
  }

  return registros
}
