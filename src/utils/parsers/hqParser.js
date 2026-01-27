/**
 * Parser do bloco HQ (Restrições de Vazão)
 * Composto por: HQ (cabeçalho), LQ (limites), CQ (coeficientes)
 * Expande estágios faltantes por número de restrição
 */

export function parseHQ(lines, numeroEstagios) {
  const restricoes = []
  let restricaoAtual = null

  for (const line of lines) {
    if (line.startsWith('HQ ')) {
      // Nova restrição - salvar a anterior se existir
      if (restricaoAtual) {
        restricoes.push(restricaoAtual)
      }

      const numero = parseInt(line.substring(4, 7).trim())
      const estagioInicial = parseInt(line.substring(9, 11).trim())
      const estagioFinal = parseInt(line.substring(14, 16).trim())

      if (!isNaN(numero) && !isNaN(estagioInicial) && !isNaN(estagioFinal)) {
        restricaoAtual = {
          numero_restricao: numero,
          estagio_inicial: estagioInicial,
          estagio_final: estagioFinal,
          limites: [],
          coeficientes: []
        }
      }
    } else if (line.startsWith('LQ ') && restricaoAtual) {
      const limite = parseLQLine(line)
      if (limite) {
        restricaoAtual.limites.push(limite)
      }
    } else if (line.startsWith('CQ ') && restricaoAtual) {
      const coef = parseCQLine(line)
      if (coef) {
        restricaoAtual.coeficientes.push(coef)
      }
    }
  }

  // Salvar última restrição
  if (restricaoAtual) {
    restricoes.push(restricaoAtual)
  }

  if (!numeroEstagios || numeroEstagios === 0) {
    numeroEstagios = Math.max(...restricoes.map(r => r.estagio_final), 0)
  }

  // Expandir estágios para cada restrição
  const expandidos = expandirRestricoes(restricoes, numeroEstagios)

  return expandidos
}

function parseLQLine(line) {
  // LQ: 1-2, numero: 5-7, estagio: 10-11
  // pesado_min: 15-24, pesado_max: 25-34
  // medio_min: 35-44, medio_max: 45-54
  // leve_min: 55-64, leve_max: 65-74

  const estagio = parseInt(line.substring(9, 11).trim())

  const pesado_min_str = line.substring(14, 24).trim()
  const pesado_max_str = line.substring(24, 34).trim()
  const medio_min_str = line.substring(34, 44).trim()
  const medio_max_str = line.substring(44, 54).trim()
  const leve_min_str = line.substring(54, 64).trim()
  const leve_max_str = line.substring(64, 74).trim()

  if (isNaN(estagio)) return null

  return {
    estagio,
    pesado_min: pesado_min_str ? parseFloat(pesado_min_str) : null,
    pesado_max: pesado_max_str ? parseFloat(pesado_max_str) : null,
    medio_min: medio_min_str ? parseFloat(medio_min_str) : null,
    medio_max: medio_max_str ? parseFloat(medio_max_str) : null,
    leve_min: leve_min_str ? parseFloat(leve_min_str) : null,
    leve_max: leve_max_str ? parseFloat(leve_max_str) : null
  }
}

function parseCQLine(line) {
  // CQ: 1-2, numero: 5-7, estagio: 10-11
  // numero_usina: 15-17, coeficiente: 20-29, tipo_variavel: 35-38

  const estagio = parseInt(line.substring(9, 11).trim())
  const numero_usina = parseInt(line.substring(14, 17).trim())
  const coeficiente_str = line.substring(19, 29).trim()
  const tipo_variavel = line.substring(34, 38).trim()

  if (isNaN(estagio) || isNaN(numero_usina)) return null

  return {
    estagio,
    numero_usina,
    coeficiente: coeficiente_str ? parseFloat(coeficiente_str) : null,
    tipo_variavel: tipo_variavel || null
  }
}

/**
 * Expande cada restrição em múltiplos registros (um por estágio)
 * Aplica forward-fill para LQ e CQ
 */
function expandirRestricoes(restricoes, numeroEstagios) {
  const expandidos = []

  for (const restricao of restricoes) {
    const { numero_restricao, estagio_inicial, estagio_final } = restricao

    // Criar mapa de dados por estágio
    const limitePorEstagio = criarMapaEstagio(restricao.limites)
    const coeficientesPorEstagio = criarMapaEstagioArray(restricao.coeficientes)

    // Expandir do estágio inicial ao final (ou até numeroEstagios)
    const estagioFinalReal = Math.min(estagio_final, numeroEstagios)

    for (let estagio = estagio_inicial; estagio <= estagioFinalReal; estagio++) {
      const limites = buscarOuHerdar(limitePorEstagio, estagio, estagio_inicial)
      const coeficientes = buscarOuHerdarArray(coeficientesPorEstagio, estagio, estagio_inicial)

      expandidos.push({
        numero_restricao,
        estagio,
        limites,
        coeficientes
      })
    }
  }

  return expandidos
}

function criarMapaEstagio(items) {
  const mapa = {}
  for (const item of items) {
    mapa[item.estagio] = item
  }
  return mapa
}

function criarMapaEstagioArray(items) {
  const mapa = {}
  for (const item of items) {
    if (!mapa[item.estagio]) {
      mapa[item.estagio] = []
    }
    mapa[item.estagio].push(item)
  }
  return mapa
}

function buscarOuHerdar(mapa, estagio, estagioInicial) {
  if (mapa[estagio]) {
    return mapa[estagio]
  }

  // Buscar o último estágio anterior que tenha dados
  for (let e = estagio - 1; e >= estagioInicial; e--) {
    if (mapa[e]) {
      return mapa[e]
    }
  }

  return null
}

function buscarOuHerdarArray(mapa, estagio, estagioInicial) {
  if (mapa[estagio]) {
    return mapa[estagio]
  }

  // Buscar o último estágio anterior que tenha dados
  for (let e = estagio - 1; e >= estagioInicial; e--) {
    if (mapa[e]) {
      return mapa[e]
    }
  }

  return []
}
