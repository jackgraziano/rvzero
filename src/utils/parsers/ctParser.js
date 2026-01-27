/**
 * Parser do bloco CT (Usinas Térmicas)
 * Formato posicional CT
 * Expande estágios faltantes por codigo_usina
 */

export function parseCT(lines, numeroEstagios) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('CT ')) {
      const registro = parseCTLine(line)
      if (registro) {
        registros.push(registro)
      }
    }
  }

  // Se não temos numero de estagios, calcular do próprio CT
  if (!numeroEstagios || numeroEstagios === 0) {
    numeroEstagios = Math.max(...registros.map(r => r.estagio), 0)
  }

  // Expandir estágios faltantes por codigo_usina
  const expandidos = expandirEstagios(registros, numeroEstagios)

  // Retornar registros expandidos (não agregar)
  return expandidos
}

/**
 * Expande estágios faltantes para cada usina
 * Cada estágio não cadastrado usa o valor do último estágio cadastrado antes dele
 */
function expandirEstagios(registros, numeroEstagios) {
  const expandidos = []

  // Agrupar por codigo_usina
  const porUsina = {}
  for (const reg of registros) {
    if (!porUsina[reg.codigo_usina]) {
      porUsina[reg.codigo_usina] = []
    }
    porUsina[reg.codigo_usina].push(reg)
  }

  // Para cada usina, expandir os estágios
  for (const usina in porUsina) {
    const regs = porUsina[usina]

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
            codigo_usina: ultimoAnterior.codigo_usina,
            subsistema: ultimoAnterior.subsistema,
            nome_termica: ultimoAnterior.nome_termica,
            estagio: estagio,
            inflex_pesado: ultimoAnterior.inflex_pesado,
            disp_pesado: ultimoAnterior.disp_pesado,
            cvu_pesado: ultimoAnterior.cvu_pesado,
            inflex_medio: ultimoAnterior.inflex_medio,
            disp_medio: ultimoAnterior.disp_medio,
            cvu_medio: ultimoAnterior.cvu_medio,
            inflex_leve: ultimoAnterior.inflex_leve,
            disp_leve: ultimoAnterior.disp_leve,
            cvu_leve: ultimoAnterior.cvu_leve
          })
        }
      }
    }
  }

  return expandidos
}

function parseCTLine(line) {
  // Leitura posicional:
  // CT: 1-2
  // codigo_usina: 5-7
  // subsistema: 10-11
  // nome_termica: 15-24
  // estagio: 25-26
  // inflex_pesado: 30-34
  // disp_pesado: 35-39
  // cvu_pesado: 40-49
  // inflex_medio: 50-54
  // disp_medio: 55-59
  // cvu_medio: 60-69
  // inflex_leve: 70-74
  // disp_leve: 75-79
  // cvu_leve: 80-89

  const codigo_usina = parseInt(line.substring(4, 7).trim())
  const subsistema = parseInt(line.substring(9, 11).trim())
  const nome_termica = line.substring(14, 24).trim()
  const estagio = parseInt(line.substring(24, 26).trim())

  const inflexPesadoStr = line.substring(29, 34).trim()
  const dispPesadoStr = line.substring(34, 39).trim()
  const cvuPesadoStr = line.substring(39, 49).trim()

  const inflexMedioStr = line.substring(49, 54).trim()
  const dispMedioStr = line.substring(54, 59).trim()
  const cvuMedioStr = line.substring(59, 69).trim()

  const inflexLeveStr = line.substring(69, 74).trim()
  const dispLeveStr = line.substring(74, 79).trim()
  const cvuLeveStr = line.substring(79, 89).trim()

  const inflex_pesado = inflexPesadoStr ? parseFloat(inflexPesadoStr) : 0
  const disp_pesado = dispPesadoStr ? parseFloat(dispPesadoStr) : 0
  const cvu_pesado = cvuPesadoStr ? parseFloat(cvuPesadoStr) : 0

  const inflex_medio = inflexMedioStr ? parseFloat(inflexMedioStr) : 0
  const disp_medio = dispMedioStr ? parseFloat(dispMedioStr) : 0
  const cvu_medio = cvuMedioStr ? parseFloat(cvuMedioStr) : 0

  const inflex_leve = inflexLeveStr ? parseFloat(inflexLeveStr) : 0
  const disp_leve = dispLeveStr ? parseFloat(dispLeveStr) : 0
  const cvu_leve = cvuLeveStr ? parseFloat(cvuLeveStr) : 0

  if (isNaN(codigo_usina) || isNaN(subsistema) || isNaN(estagio)) {
    return null
  }

  return {
    codigo_usina,
    subsistema,
    nome_termica,
    estagio,
    inflex_pesado,
    disp_pesado,
    cvu_pesado,
    inflex_medio,
    disp_medio,
    cvu_medio,
    inflex_leve,
    disp_leve,
    cvu_leve
  }
}
