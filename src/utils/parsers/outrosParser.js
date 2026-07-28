/**
 * Mnemônicos já interpretados por parsers estruturados, inclusive os registros
 * filhos de restrições. Os demais registros ativos de duas letras são mantidos
 * integralmente para que o comparador não perca blocos novos ou pouco usados.
 */
const STRUCTURED_MNEMONICS = new Set([
  'TE', 'DT', 'DP', 'PQ', 'CT', 'IA', 'UH', 'TI', 'MP', 'FD', 'VE', 'VI',
  'RE', 'LU', 'FU', 'FT', 'FI', 'FE',
  'HQ', 'LQ', 'CQ', 'HV', 'LV', 'CV',
  'RI', 'HE', 'CM', 'AC', 'RQ'
])

export function parseOutros(lines) {
  const result = {}

  for (const line of lines) {
    if (!line || line.trim() === '' || line.startsWith('&')) continue

    const match = /^([A-Z0-9]{2})\s/.exec(line)
    if (!match || STRUCTURED_MNEMONICS.has(match[1])) continue

    const mnemonic = match[1]
    if (!result[mnemonic]) result[mnemonic] = []
    result[mnemonic].push(line)
  }

  return result
}
