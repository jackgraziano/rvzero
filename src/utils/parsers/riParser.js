/**
 * Parser do bloco RI (Restrições de Itaipu)
 * Expande estágios faltantes usando forward-fill
 */

export function parseRI(lines, numeroEstagios) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('RI ')) {
      const usina = parseInt(line.substring(4, 7).trim())
      const estagio = parseInt(line.substring(8, 11).trim())
      const subsistema = parseInt(line.substring(12, 15).trim())

      // Patamar pesado
      const p60_min_pesado = parseFloat(line.substring(16, 23).trim()) || null
      const p60_max_pesado = parseFloat(line.substring(23, 30).trim()) || null
      const p50_min_pesado = parseFloat(line.substring(30, 37).trim()) || null
      const p50_max_pesado = parseFloat(line.substring(37, 44).trim()) || null
      const carga_ande_pesado = parseFloat(line.substring(44, 51).trim()) || null

      // Patamar médio
      const p60_min_medio = parseFloat(line.substring(51, 58).trim()) || null
      const p60_max_medio = parseFloat(line.substring(58, 65).trim()) || null
      const p50_min_medio = parseFloat(line.substring(65, 72).trim()) || null
      const p50_max_medio = parseFloat(line.substring(72, 79).trim()) || null
      const carga_ande_medio = parseFloat(line.substring(79, 86).trim()) || null

      // Patamar leve
      const p60_min_leve = parseFloat(line.substring(86, 93).trim()) || null
      const p60_max_leve = parseFloat(line.substring(93, 100).trim()) || null
      const p50_min_leve = parseFloat(line.substring(100, 107).trim()) || null
      const p50_max_leve = parseFloat(line.substring(107, 114).trim()) || null
      const carga_ande_leve = parseFloat(line.substring(114, 121).trim()) || null

      if (!isNaN(usina) && !isNaN(estagio) && !isNaN(subsistema)) {
        registros.push({
          usina,
          estagio,
          subsistema,
          pesado: {
            p60_min: p60_min_pesado,
            p60_max: p60_max_pesado,
            p50_min: p50_min_pesado,
            p50_max: p50_max_pesado,
            carga_ande: carga_ande_pesado
          },
          medio: {
            p60_min: p60_min_medio,
            p60_max: p60_max_medio,
            p50_min: p50_min_medio,
            p50_max: p50_max_medio,
            carga_ande: carga_ande_medio
          },
          leve: {
            p60_min: p60_min_leve,
            p60_max: p60_max_leve,
            p50_min: p50_min_leve,
            p50_max: p50_max_leve,
            carga_ande: carga_ande_leve
          }
        })
      }
    }
  }

  // Expandir estágios faltantes
  return expandirEstagios(registros, numeroEstagios)
}

/**
 * Expande estágios faltantes usando forward-fill
 */
function expandirEstagios(registros, numeroEstagios) {
  if (registros.length === 0 || !numeroEstagios) {
    return registros
  }

  const expandidos = []

  // Para cada estágio de 1 até numeroEstagios, expandir usando forward-fill
  for (let estagio = 1; estagio <= numeroEstagios; estagio++) {
    // Buscar se este estágio foi declarado
    let registro = registros.find(r => r.estagio === estagio)

    // Se não foi declarado, usar o último estágio anterior declarado (forward-fill)
    if (!registro) {
      for (let e = estagio - 1; e >= 1; e--) {
        const anterior = registros.find(r => r.estagio === e)
        if (anterior) {
          // Criar cópia com novo número de estágio
          registro = {
            ...anterior,
            estagio
          }
          break
        }
      }
    }

    if (registro) {
      expandidos.push(registro)
    }
  }

  return expandidos
}
