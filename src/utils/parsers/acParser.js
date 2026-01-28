/**
 * Parser do bloco AC (Alteração de Cadastro)
 * Cada linha AC modifica parâmetros de uma usina usando diferentes mnemônicos
 * Formato: AC <usina> <mnemônico> <dados> [mês] [semana] [ano]
 */

export function parseAC(lines) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('AC ')) {
      const usina = parseInt(line.substring(4, 7).trim())
      const mnemonico = line.substring(9, 15).trim()

      // Dados começam na posição 19 (campo 4)
      const dados = line.substring(19, 69).trim()

      // Mês (70-72), semana (75), ano (77-80)
      const mes = line.substring(69, 72).trim()
      const semana_str = line.substring(74, 75).trim()
      const ano_str = line.substring(76, 80).trim()

      const semana = semana_str ? parseInt(semana_str) : null
      const ano = ano_str ? parseInt(ano_str) : null

      if (!isNaN(usina) && mnemonico) {
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
