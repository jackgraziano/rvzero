import { parseDecimalField, parseIntegerField } from './parserUtils.js'

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
  const lines = content.split(/\r?\n/)

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
            codPEE: parseIntegerField(parts[1]),
            nomePEE: parts[2] || ''
          })
        }
        break

      case 'PEE-CONFIG-PER':
        // Formato: PEE-CONFIG-PER;CodPEE;PerIni;PerFin;EstadoOperEolica
        if (parts.length >= 5) {
          result['PEE-CONFIG-PER'].push({
            codPEE: parseIntegerField(parts[1]),
            perIni: parseIntegerField(parts[2]),
            perFin: parseIntegerField(parts[3]),
            estadoOperEolica: parts[4] || ''
          })
        }
        break

      case 'PEE-SUBM':
        // Formato: PEE-SUBM;CodPEE;CodSubm
        if (parts.length >= 3) {
          result['PEE-SUBM'].push({
            codPEE: parseIntegerField(parts[1]),
            codSubm: parseIntegerField(parts[2])
          })
        }
        break

      case 'PEE-POT-INST-PER':
        // Formato: PEE-POT-INST-PER;CodPEE;PerIni;PerFin;PotInstPEE
        if (parts.length >= 5) {
          result['PEE-POT-INST-PER'].push({
            codPEE: parseIntegerField(parts[1]),
            perIni: parseIntegerField(parts[2]),
            perFin: parseIntegerField(parts[3]),
            potInstPEE: parseDecimalField(parts[4])
          })
        }
        break

      case 'PEE-GER-PER-PAT-CEN':
        // Formato: PEE-GER-PER-PAT-CEN;CodPEE;PerIni;PerFin;Pat;Cen;GerEolica
        if (parts.length >= 7) {
          result['PEE-GER-PER-PAT-CEN'].push({
            codPEE: parseIntegerField(parts[1]),
            perIni: parseIntegerField(parts[2]),
            perFin: parseIntegerField(parts[3]),
            pat: parseIntegerField(parts[4]),
            cen: parseIntegerField(parts[5]),
            gerEolica: parseDecimalField(parts[6])
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
