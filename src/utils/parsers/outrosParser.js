/**
 * Parser para blocos pequenos e simples
 * Armazena linhas como strings sem processar campos individuais
 */

// Lista de mnemônicos que devem ser capturados
const MNEMONICOS_OUTROS = [
  'AR', 'CD', 'EV', 'FA', 'SB', 'UE', 'TX', 'GP', 'NI', 'IR', 'FC',
  'RQ', 'EZ', 'TE', 'VL', 'VU', 'VA', 'CX', 'VI'
  // RI não está aqui pois tem parser específico (riParser.js)
]

/**
 * Captura linhas de blocos simples sem processar campos
 * @param {Array} lines - Linhas do arquivo dadger
 * @returns {Object} Objeto com arrays de strings para cada mnemônico
 */
export function parseOutros(lines) {
  const result = {}

  // Inicializar arrays vazios para cada mnemônico
  for (const mnem of MNEMONICOS_OUTROS) {
    result[mnem] = []
  }

  // Capturar linhas que começam com os mnemônicos
  for (const line of lines) {
    // Ignorar linhas vazias e comentários
    if (!line || line.trim() === '' || line.startsWith('&')) {
      continue
    }

    // Verificar se a linha começa com algum mnemônico da lista
    for (const mnem of MNEMONICOS_OUTROS) {
      if (line.startsWith(mnem + ' ')) {
        result[mnem].push(line)
        break
      }
    }
  }

  return result
}
