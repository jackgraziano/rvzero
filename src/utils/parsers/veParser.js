/**
 * Parser para o bloco VE - Volume de Espera
 * Nota: Este bloco declara todos os estágios explicitamente (não precisa expansão)
 */

/**
 * Parse de uma linha VE
 */
function parseVELine(line) {
  try {
    const numero_usina = parseInt(line.substring(4, 7).trim())

    // Ler 24 volumes de espera (F5.0 cada, começando na posição 10)
    const volumes = []
    for (let i = 0; i < 24; i++) {
      const inicio = 9 + i * 5
      const fim = inicio + 5
      const valorStr = line.substring(inicio, fim).trim()
      // Se está em branco, considerar como null (missing), não como 0
      const valor = valorStr === '' ? null : parseFloat(valorStr)
      volumes.push(valor)
    }

    return {
      numero_usina,
      volumes
    }
  } catch (error) {
    console.error('Erro ao parsear linha VE:', line, error)
    return null
  }
}

/**
 * Parse do bloco VE completo
 * Nota: VE sempre declara todos os estágios, não precisa expansão
 */
export function parseVE(lines) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('VE ')) {
      const registro = parseVELine(line)
      if (registro) {
        registros.push(registro)
      }
    }
  }

  return registros
}
