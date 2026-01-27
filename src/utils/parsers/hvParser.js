/**
 * Parser do bloco HV (Restrições de Armazenamento)
 * Composto por: HV (cabeçalho), LV (limites), CV (coeficientes)
 * Expande estágios faltantes por número de restrição
 */

export function parseHV(lines, numeroEstagios) {
  const restricoes = []
  let restricaoAtual = null

  for (const line of lines) {
    if (line.startsWith('HV ')) {
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
    } else if (line.startsWith('LV ') && restricaoAtual) {
      const limite = parseLVLine(line)
      if (limite) {
        restricaoAtual.limites.push(limite)
      }
    } else if (line.startsWith('CV ') && restricaoAtual) {
      const coef = parseCVLine(line)
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

function parseLVLine(line) {
  // LV: 1-2, numero: 5-7, estagio: 10-11
  // limite_inferior: 15-24, limite_superior: 25-34

  const estagio = parseInt(line.substring(9, 11).trim())

  const limite_inferior_str = line.substring(14, 24).trim()
  const limite_superior_str = line.substring(24, 34).trim()

  if (isNaN(estagio)) return null

  return {
    estagio,
    limite_inferior: limite_inferior_str ? parseFloat(limite_inferior_str) : null,
    limite_superior: limite_superior_str ? parseFloat(limite_superior_str) : null
  }
}

function parseCVLine(line) {
  // CV: 1-2, numero: 5-7, estagio: 10-11
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
 * Aplica forward-fill para LV e CV
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
