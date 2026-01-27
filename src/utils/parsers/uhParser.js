/**
 * Parser para o bloco UH - Usinas Hidráulicas
 * Nota: Este bloco só é declarado para o estágio 1
 */

/**
 * Parse de uma linha UH
 */
function parseUHLine(line) {
  try {
    const numero_usina = parseInt(line.substring(4, 7).trim())
    const ree = parseInt(line.substring(9, 11).trim()) || 0
    const volume_armazenado_pct = parseFloat(line.substring(14, 24).trim()) || 0
    const vazao_defluente_min = parseFloat(line.substring(24, 34).trim()) || 0
    const chave_evaporacao = parseInt(line.substring(39, 40).trim()) || 0
    const estagio_producao = parseInt(line.substring(44, 46).trim()) || 1
    const volume_morto = parseFloat(line.substring(49, 59).trim()) || 0
    const limite_vertimento = parseFloat(line.substring(59, 69).trim()) || 1.0e21
    const chave_balanco_patamar = parseInt(line.substring(69, 70).trim()) || 0

    return {
      numero_usina,
      ree,
      volume_armazenado_pct,
      vazao_defluente_min,
      chave_evaporacao,
      estagio_producao,
      volume_morto,
      limite_vertimento,
      chave_balanco_patamar
    }
  } catch (error) {
    console.error('Erro ao parsear linha UH:', line, error)
    return null
  }
}

/**
 * Parse do bloco UH completo
 * Nota: UH só existe para estágio 1, não precisa de expansão
 */
export function parseUH(lines) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('UH ')) {
      const registro = parseUHLine(line)
      if (registro) {
        registros.push(registro)
      }
    }
  }

  return registros
}
