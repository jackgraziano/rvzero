/**
 * Parser do bloco HE (Vminop - Restrições de Energia Armazenada)
 * Composto por: HE (cabeçalho da restrição), CM (coeficientes)
 * Cada HE define uma restrição para um estágio específico
 */

export function parseHE(lines) {
  const restricoes = []
  let restricaoAtual = null

  for (const line of lines) {
    if (line.startsWith('HE ')) {
      // Nova restrição - salvar a anterior se existir
      if (restricaoAtual) {
        restricoes.push(restricaoAtual)
      }

      const numero = parseInt(line.substring(4, 7).trim())
      const tipo_limite = parseInt(line.substring(9, 10).trim())
      const limite_inferior_str = line.substring(14, 24).trim()
      const estagio = parseInt(line.substring(25, 27).trim())
      const penalidade_str = line.substring(28, 38).trim()
      const flag_calculo_prod = parseInt(line.substring(39, 40).trim()) || 0
      const flag_tipo_valores = parseInt(line.substring(41, 42).trim()) || 0
      const flag_trat_nao_atend = parseInt(line.substring(43, 44).trim()) || 0
      const arquivo_produtividades = line.substring(45, 105).trim()
      const flag_tolerancia = parseInt(line.substring(106, 107).trim()) || 0

      if (!isNaN(numero) && !isNaN(estagio)) {
        restricaoAtual = {
          numero_restricao: numero,
          estagio,
          tipo_limite: !isNaN(tipo_limite) ? tipo_limite : null,
          limite_inferior: limite_inferior_str ? parseFloat(limite_inferior_str) : null,
          penalidade: penalidade_str ? parseFloat(penalidade_str) : null,
          flag_calculo_prod,
          flag_tipo_valores,
          flag_trat_nao_atend,
          arquivo_produtividades: arquivo_produtividades || null,
          flag_tolerancia,
          coeficientes: []
        }
      }
    } else if (line.startsWith('CM ') && restricaoAtual) {
      const coef = parseCMLine(line)
      if (coef) {
        restricaoAtual.coeficientes.push(coef)
      }
    }
  }

  // Salvar última restrição
  if (restricaoAtual) {
    restricoes.push(restricaoAtual)
  }

  return restricoes
}

function parseCMLine(line) {
  // CM: 1-2, numero: 5-7, ree: 10-12, coeficiente: 15-24

  const numero = parseInt(line.substring(4, 7).trim())
  const ree = parseInt(line.substring(9, 12).trim())
  const coeficiente_str = line.substring(14, 24).trim()

  if (isNaN(ree)) return null

  return {
    numero_restricao: numero,
    ree,
    coeficiente: coeficiente_str ? parseFloat(coeficiente_str) : null
  }
}
