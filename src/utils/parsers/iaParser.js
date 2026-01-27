/**
 * Parser para o bloco IA - Intercâmbio entre subsistemas
 */

/**
 * Parse de uma linha IA
 */
function parseIALine(line) {
  try {
    const estagio = parseInt(line.substring(4, 6).trim())
    const subsistema_de = line.substring(9, 11).trim()
    const subsistema_para = line.substring(14, 16).trim()
    const flag_penalidade = parseInt(line.substring(17, 18).trim()) || 0

    // Capacidades por patamar (5 patamares x 2 direções)
    const capacidades = {
      // Patamar 1
      p1_de_para: parseFloat(line.substring(19, 29).trim()) || 0,
      p1_para_de: parseFloat(line.substring(29, 39).trim()) || 0,
      // Patamar 2
      p2_de_para: parseFloat(line.substring(39, 49).trim()) || 0,
      p2_para_de: parseFloat(line.substring(49, 59).trim()) || 0,
      // Patamar 3
      p3_de_para: parseFloat(line.substring(59, 69).trim()) || 0,
      p3_para_de: parseFloat(line.substring(69, 79).trim()) || 0,
      // Patamar 4
      p4_de_para: parseFloat(line.substring(79, 89).trim()) || 0,
      p4_para_de: parseFloat(line.substring(89, 99).trim()) || 0,
      // Patamar 5
      p5_de_para: parseFloat(line.substring(99, 109).trim()) || 0,
      p5_para_de: parseFloat(line.substring(109, 119).trim()) || 0
    }

    return {
      estagio,
      subsistema_de,
      subsistema_para,
      flag_penalidade,
      ...capacidades
    }
  } catch (error) {
    console.error('Erro ao parsear linha IA:', line, error)
    return null
  }
}

/**
 * Expandir estágios faltantes por intercâmbio (de-para)
 */
function expandirEstagios(registros, numeroEstagios) {
  // Agrupar por intercâmbio (de-para)
  const porIntercambio = {}

  for (const reg of registros) {
    const key = `${reg.subsistema_de}-${reg.subsistema_para}`
    if (!porIntercambio[key]) {
      porIntercambio[key] = []
    }
    porIntercambio[key].push(reg)
  }

  // Expandir cada grupo
  const expandidos = []

  for (const [key, regs] of Object.entries(porIntercambio)) {
    // Ordenar por estágio
    regs.sort((a, b) => a.estagio - b.estagio)

    let ultimoValor = null

    for (let estagio = 1; estagio <= numeroEstagios; estagio++) {
      const regExistente = regs.find(r => r.estagio === estagio)

      if (regExistente) {
        expandidos.push(regExistente)
        ultimoValor = regExistente
      } else if (ultimoValor) {
        // Repetir último valor conhecido
        expandidos.push({
          ...ultimoValor,
          estagio
        })
      }
    }
  }

  return expandidos
}

/**
 * Parse do bloco IA completo
 */
export function parseIA(lines, numeroEstagios) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('IA ')) {
      const registro = parseIALine(line)
      if (registro) {
        registros.push(registro)
      }
    }
  }

  // Expandir estágios faltantes
  const expandidos = expandirEstagios(registros, numeroEstagios)

  return expandidos
}
