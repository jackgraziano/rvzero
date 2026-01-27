/**
 * Parser do bloco PQ (Pequenas Usinas)
 * Formato: PQ, nome, subsistema, estagio, pesado, medio, leve
 * Expande estágios faltantes e agrega por (estagio, subsistema)
 */

export function parsePQ(lines, numeroEstagios) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('PQ ')) {
      const registro = parsePQLine(line)
      if (registro) {
        registros.push(registro)
      }
    }
  }

  // Se não temos numero de estagios, calcular do próprio PQ
  if (!numeroEstagios || numeroEstagios === 0) {
    numeroEstagios = Math.max(...registros.map(r => r.estagio), 0)
  }

  // Expandir estágios faltantes por fonte
  const expandidos = expandirEstagios(registros, numeroEstagios)

  // Agregar por (estagio, subsistema)
  const agregado = {}
  for (const reg of expandidos) {
    const key = `${reg.estagio}-${reg.subsistema}`

    if (!agregado[key]) {
      agregado[key] = {
        estagio: reg.estagio,
        subsistema: reg.subsistema,
        geracao_total: 0
      }
    }

    agregado[key].geracao_total += reg.geracao_total
  }

  // Converter objeto em array
  return Object.values(agregado)
}

/**
 * Expande estágios faltantes para cada fonte
 * Cada estágio não cadastrado usa o valor do último estágio cadastrado antes dele
 */
function expandirEstagios(registros, numeroEstagios) {
  const expandidos = []

  // Agrupar por fonte_geracao
  const porFonte = {}
  for (const reg of registros) {
    if (!porFonte[reg.fonte_geracao]) {
      porFonte[reg.fonte_geracao] = []
    }
    porFonte[reg.fonte_geracao].push(reg)
  }

  // Para cada fonte, expandir os estágios
  for (const fonte in porFonte) {
    const regs = porFonte[fonte]

    // Ordenar por estágio
    regs.sort((a, b) => a.estagio - b.estagio)

    // Criar mapa de estágios cadastrados
    const estagiosCadastrados = {}
    for (const reg of regs) {
      estagiosCadastrados[reg.estagio] = reg
    }

    // Expandir todos os estágios de 1 até numeroEstagios
    for (let estagio = 1; estagio <= numeroEstagios; estagio++) {
      if (estagiosCadastrados[estagio]) {
        // Estágio já cadastrado, usar o valor dele
        expandidos.push(estagiosCadastrados[estagio])
      } else {
        // Estágio não cadastrado, buscar o último estágio anterior
        let ultimoAnterior = null
        for (let e = estagio - 1; e >= 1; e--) {
          if (estagiosCadastrados[e]) {
            ultimoAnterior = estagiosCadastrados[e]
            break
          }
        }

        if (ultimoAnterior) {
          // Criar novo registro com o estágio atual mas os valores do anterior
          expandidos.push({
            fonte_geracao: ultimoAnterior.fonte_geracao,
            subsistema: ultimoAnterior.subsistema,
            estagio: estagio,
            geracao_pesado: ultimoAnterior.geracao_pesado,
            geracao_medio: ultimoAnterior.geracao_medio,
            geracao_leve: ultimoAnterior.geracao_leve,
            geracao_total: ultimoAnterior.geracao_total
          })
        }
      }
    }
  }

  return expandidos
}

function parsePQLine(line) {
  // Leitura posicional:
  // PQ: 1-2
  // fonte_geracao: 5-14
  // subsistema: 15-16
  // estagio: 20-21
  // geracao_pesado: 25-29
  // geracao_medio: 30-34
  // geracao_leve: 35-39

  const fonte_geracao = line.substring(4, 14).trim()
  const subsistema = parseInt(line.substring(14, 16).trim())
  const estagio = parseInt(line.substring(19, 21).trim())

  const geracaoPesadoStr = line.substring(24, 29).trim()
  const geracaoMedioStr = line.substring(29, 34).trim()
  const geracaoLeveStr = line.substring(34, 39).trim()

  const geracao_pesado = geracaoPesadoStr ? parseFloat(geracaoPesadoStr) : 0
  const geracao_medio = geracaoMedioStr ? parseFloat(geracaoMedioStr) : 0
  const geracao_leve = geracaoLeveStr ? parseFloat(geracaoLeveStr) : 0

  // Calcular total
  const geracao_total = geracao_pesado + geracao_medio + geracao_leve

  if (isNaN(subsistema) || isNaN(estagio)) {
    return null
  }

  return {
    fonte_geracao,
    subsistema,
    estagio,
    geracao_pesado,
    geracao_medio,
    geracao_leve,
    geracao_total
  }
}
