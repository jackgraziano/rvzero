/**
 * Parser do bloco RE (Restrições Elétricas)
 * Composto por: RE (cabeçalho), LU (limites), FU, FT, FI, FE (fatores)
 * Expande estágios faltantes por número de restrição
 */

export function parseRE(lines, numeroEstagios) {
  const restricoes = []
  let restricaoAtual = null

  for (const line of lines) {
    if (line.startsWith('RE ')) {
      // Nova restrição - salvar a anterior se existir
      if (restricaoAtual) {
        restricoes.push(restricaoAtual)
      }

      const numero = parseInt(line.substring(4, 8).trim())
      const estagioInicial = parseInt(line.substring(9, 11).trim())
      const estagioFinal = parseInt(line.substring(14, 16).trim())

      if (!isNaN(numero) && !isNaN(estagioInicial) && !isNaN(estagioFinal)) {
        restricaoAtual = {
          numero_restricao: numero,
          estagio_inicial: estagioInicial,
          estagio_final: estagioFinal,
          limites: [],
          fatores_uh: [],
          fatores_ut: [],
          fatores_interligacao: [],
          fatores_contrato: []
        }
      }
    } else if (line.startsWith('LU ') && restricaoAtual) {
      const limite = parseLULine(line)
      if (limite) {
        restricaoAtual.limites.push(limite)
      }
    } else if (line.startsWith('FU ') && restricaoAtual) {
      const fator = parseFULine(line)
      if (fator) {
        restricaoAtual.fatores_uh.push(fator)
      }
    } else if (line.startsWith('FT ') && restricaoAtual) {
      const fator = parseFTLine(line)
      if (fator) {
        restricaoAtual.fatores_ut.push(fator)
      }
    } else if (line.startsWith('FI ') && restricaoAtual) {
      const fator = parseFILine(line)
      if (fator) {
        restricaoAtual.fatores_interligacao.push(fator)
      }
    } else if (line.startsWith('FE ') && restricaoAtual) {
      const fator = parseFELine(line)
      if (fator) {
        restricaoAtual.fatores_contrato.push(fator)
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

function parseLULine(line) {
  // LU: 1-2, numero: 5-8, estagio: 10-11
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

function parseFULine(line) {
  // FU: 1-2, numero: 5-8, estagio: 10-11
  // numero_usina: 15-17, fator: 20-29, frequencia: 31-32

  const estagio = parseInt(line.substring(9, 11).trim())
  const numero_usina = parseInt(line.substring(14, 17).trim())
  const fator_str = line.substring(19, 29).trim()
  const frequencia_str = line.substring(30, 32).trim()

  if (isNaN(estagio) || isNaN(numero_usina)) return null

  return {
    estagio,
    numero_usina,
    fator: fator_str ? parseFloat(fator_str) : null,
    frequencia: frequencia_str ? parseInt(frequencia_str) : 0
  }
}

function parseFTLine(line) {
  // FT: 1-2, numero: 5-8, estagio: 10-11
  // numero_usina: 15-17, subsistema: 20-21, fator: 25-34

  const estagio = parseInt(line.substring(9, 11).trim())
  const numero_usina = parseInt(line.substring(14, 17).trim())
  const subsistema = parseInt(line.substring(19, 21).trim())
  const fator_str = line.substring(24, 34).trim()

  if (isNaN(estagio) || isNaN(numero_usina)) return null

  return {
    estagio,
    numero_usina,
    subsistema: !isNaN(subsistema) ? subsistema : null,
    fator: fator_str ? parseFloat(fator_str) : null
  }
}

function parseFILine(line) {
  // FI: 1-2, numero: 5-8, estagio: 10-11
  // subsistema_de: 15-16, subsistema_para: 20-21, fator: 25-34

  const estagio = parseInt(line.substring(9, 11).trim())
  const subsistema_de = line.substring(14, 16).trim()
  const subsistema_para = line.substring(19, 21).trim()
  const fator_str = line.substring(24, 34).trim()

  if (isNaN(estagio)) return null

  return {
    estagio,
    subsistema_de,
    subsistema_para,
    fator: fator_str ? parseFloat(fator_str) : null
  }
}

function parseFELine(line) {
  // FE: 1-2, numero: 5-8, estagio: 10-11
  // numero_contrato: 15-17, submercado: 20-21, fator: 25-34

  const estagio = parseInt(line.substring(9, 11).trim())
  const numero_contrato = parseInt(line.substring(14, 17).trim())
  const submercado = parseInt(line.substring(19, 21).trim())
  const fator_str = line.substring(24, 34).trim()

  if (isNaN(estagio) || isNaN(numero_contrato)) return null

  return {
    estagio,
    numero_contrato,
    submercado: !isNaN(submercado) ? submercado : null,
    fator: fator_str ? parseFloat(fator_str) : null
  }
}

/**
 * Expande cada restrição em múltiplos registros (um por estágio)
 * Aplica forward-fill para LU, FU, FT, FI, FE
 */
function expandirRestricoes(restricoes, numeroEstagios) {
  const expandidos = []

  for (const restricao of restricoes) {
    const { numero_restricao, estagio_inicial, estagio_final } = restricao

    // Criar mapa de dados por estágio
    const limitePorEstagio = criarMapaEstagio(restricao.limites)
    const fatoresUhPorEstagio = criarMapaEstagioArray(restricao.fatores_uh)
    const fatoresUtPorEstagio = criarMapaEstagioArray(restricao.fatores_ut)
    const fatoresIntPorEstagio = criarMapaEstagioArray(restricao.fatores_interligacao)
    const fatoresContPorEstagio = criarMapaEstagioArray(restricao.fatores_contrato)

    // Expandir do estágio inicial ao final (ou até numeroEstagios)
    const estagioFinalReal = Math.min(estagio_final, numeroEstagios)

    for (let estagio = estagio_inicial; estagio <= estagioFinalReal; estagio++) {
      const limites = buscarOuHerdar(limitePorEstagio, estagio, estagio_inicial)
      const fatores_uh = buscarOuHerdarArray(fatoresUhPorEstagio, estagio, estagio_inicial)
      const fatores_ut = buscarOuHerdarArray(fatoresUtPorEstagio, estagio, estagio_inicial)
      const fatores_interligacao = buscarOuHerdarArray(fatoresIntPorEstagio, estagio, estagio_inicial)
      const fatores_contrato = buscarOuHerdarArray(fatoresContPorEstagio, estagio, estagio_inicial)

      expandidos.push({
        numero_restricao,
        estagio,
        limites,
        fatores_uh,
        fatores_ut,
        fatores_interligacao,
        fatores_contrato
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
