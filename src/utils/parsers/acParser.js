import { parseIntegerField } from './parserUtils.js'

/**
 * Parser do bloco AC (Alteração de Cadastro)
 * Cada linha AC modifica parâmetros de uma usina usando diferentes mnemônicos
 * Formato: AC <usina> <mnemônico> <dados> [mês] [semana] [ano]
 */

export function parseAC(lines) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('AC ')) {
      const usina = parseIntegerField(line.slice(4, 7))
      const mnemonico = line.slice(9, 15).trim()

      // Dados começam na posição 19 (campo 4)
      const dados = line.slice(19, 69).trimEnd()

      // Mês (70-72), semana (75), ano (77-80)
      const mes = line.slice(69, 72).trim()
      const semana = parseIntegerField(line.slice(74, 75))
      const ano = parseIntegerField(line.slice(76, 80))

      if (usina !== null && mnemonico) {
        registros.push({
          usina,
          mnemonico,
          dados,
          mes: mes || null,
          semana,
          ano,
          linha_original: line
        })
      }
    }
  }

  return registros
}
