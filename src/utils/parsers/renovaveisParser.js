/**
 * Parser para arquivos renovaveis.*
 * Formato: CSV separado por ';', linhas com '&' são comentários
 */

/**
 * Agrega dados de geração por submercado, período e patamar
 * Calcula média dos cenários para cada combinação
 * @param {Array} geracao - Dados de PEE-GER-PER-PAT-CEN
 * @param {Array} submercados - Dados de PEE-SUBM (mapeamento PEE -> Submercado)
 * @returns {Array} Dados agregados
 */
function agregarGeracaoPorSubmercadoPeriodoPatamar(geracao, submercados) {
  // Criar mapa codPEE -> codSubm
  const peeToSubm = {}
  submercados.forEach(s => {
    peeToSubm[s.codPEE] = s.codSubm
  })

  // Agrupar por submercado-periodo-patamar
  const agregado = {}

  geracao.forEach(g => {
    const codSubm = peeToSubm[g.codPEE]
    if (!codSubm) return // PEE sem submercado definido

    const key = `${codSubm}-${g.perIni}-${g.pat}`

    if (!agregado[key]) {
      agregado[key] = {
        submercado: codSubm,
        periodo: g.perIni,
        patamar: g.pat,
        somaGeracao: 0,
        countCenarios: 0,
        peesContribuintes: new Set()
      }
    }

    agregado[key].somaGeracao += g.gerEolica || 0
    agregado[key].countCenarios += 1
    agregado[key].peesContribuintes.add(g.codPEE)
  })

  // Converter para array e calcular médias
  return Object.values(agregado).map(item => ({
    submercado: item.submercado,
    periodo: item.periodo,
    patamar: item.patamar,
    geracaoMedia: item.countCenarios > 0 ? item.somaGeracao / item.countCenarios : 0,
    numCenarios: item.countCenarios,
    numPEEs: item.peesContribuintes.size
  }))
}

/**
 * Parseia arquivo renovaveis (CSV com ';' como separador)
 * @param {string} content - Conteúdo do arquivo
 * @returns {object} Dados parseados estruturados
 */
export function parseRenovaveis(content) {
  const lines = content.split('\n')

  const result = {
    tipo: 'renovaveis',
    'PEE-CAD': [],
    'PEE-CONFIG-PER': [],
    'PEE-SUBM': [],
    'PEE-POT-INST-PER': [],
    'PEE-GER-PER-PAT-CEN': []
  }

  for (const line of lines) {
    // Ignorar comentários (linhas que começam com &)
    if (line.trim().startsWith('&') || line.trim() === '') {
      continue
    }

    // Split por ';'
    const parts = line.split(';').map(p => p.trim())

    if (parts.length === 0) continue

    const blockId = parts[0]

    // Parse de cada tipo de bloco
    switch (blockId) {
      case 'PEE-CAD':
        // Formato: PEE-CAD;CodPEE;NomePEE
        if (parts.length >= 3) {
          result['PEE-CAD'].push({
            codPEE: parseInt(parts[1]) || null,
            nomePEE: parts[2] || ''
          })
        }
        break

      case 'PEE-CONFIG-PER':
        // Formato: PEE-CONFIG-PER;CodPEE;PerIni;PerFin;EstadoOperEolica
        if (parts.length >= 5) {
          result['PEE-CONFIG-PER'].push({
            codPEE: parseInt(parts[1]) || null,
            perIni: parseInt(parts[2]) || null,
            perFin: parseInt(parts[3]) || null,
            estadoOperEolica: parts[4] || ''
          })
        }
        break

      case 'PEE-SUBM':
        // Formato: PEE-SUBM;CodPEE;CodSubm
        if (parts.length >= 3) {
          result['PEE-SUBM'].push({
            codPEE: parseInt(parts[1]) || null,
            codSubm: parseInt(parts[2]) || null
          })
        }
        break

      case 'PEE-POT-INST-PER':
        // Formato: PEE-POT-INST-PER;CodPEE;PerIni;PerFin;PotInstPEE
        if (parts.length >= 5) {
          result['PEE-POT-INST-PER'].push({
            codPEE: parseInt(parts[1]) || null,
            perIni: parseInt(parts[2]) || null,
            perFin: parseInt(parts[3]) || null,
            potInstPEE: parseFloat(parts[4]) || null
          })
        }
        break

      case 'PEE-GER-PER-PAT-CEN':
        // Formato: PEE-GER-PER-PAT-CEN;CodPEE;PerIni;PerFin;Pat;Cen;GerEolica
        if (parts.length >= 7) {
          result['PEE-GER-PER-PAT-CEN'].push({
            codPEE: parseInt(parts[1]) || null,
            perIni: parseInt(parts[2]) || null,
            perFin: parseInt(parts[3]) || null,
            pat: parseInt(parts[4]) || null,
            cen: parseInt(parts[5]) || null,
            gerEolica: parseFloat(parts[6]) || null
          })
        }
        break

      default:
        // Ignorar linhas com IDs desconhecidos
        break
    }
  }

  // Agregar dados de geração por submercado, período e patamar
  result.geracaoAgregada = agregarGeracaoPorSubmercadoPeriodoPatamar(
    result['PEE-GER-PER-PAT-CEN'],
    result['PEE-SUBM']
  )

  return result
}
