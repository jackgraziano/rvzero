/**
 * Parser principal do dadger
 * Orquestra todos os parsers de blocos individuais
 */

import { parseInfoDadger, calcularDatasEstagios, calcularNumeroEstagios } from './infoParser.js'
import { parseDP } from './dpParser.js'
import { parsePQ } from './pqParser.js'
import { parseCT } from './ctParser.js'
import { parseIA } from './iaParser.js'
import { parseUH } from './uhParser.js'
import { parseTI } from './tiParser.js'
import { parseMP } from './mpParser.js'
import { parseFD } from './fdParser.js'
import { parseVE } from './veParser.js'

/**
 * Função principal para fazer o parse do dadger
 * @param {string} fileContent - Conteúdo do arquivo dadger
 * @returns {object} JSON estruturado com os dados do dadger
 */
export function parseDadger(fileContent) {
  const result = {
    info_dadger: {},
    DP: [],
    PQ: [],
    CT: [],
    IA: [],
    UH: [],
    TI: [],
    MP: [],
    FD: [],
    VE: []
  }

  // Dividir o arquivo em linhas
  const lines = fileContent.split('\n')

  // Processar informações gerais
  result.info_dadger = parseInfoDadger(lines)

  // Processar bloco DP
  result.DP = parseDP(lines)

  // Calcular número de estágios
  let numeroEstagios = 0
  if (result.DP.length > 0) {
    numeroEstagios = calcularNumeroEstagios(result.DP)
    result.info_dadger.numero_estagios = numeroEstagios

    // Calcular as datas dos estágios
    if (result.info_dadger.data_base && numeroEstagios > 0) {
      result.info_dadger.datas_estagios = calcularDatasEstagios(
        result.info_dadger.data_base,
        numeroEstagios
      )
    }
  }

  // Processar bloco PQ (passa numero_estagios para expansão)
  result.PQ = parsePQ(lines, numeroEstagios)

  // Processar bloco CT (passa numero_estagios para expansão)
  result.CT = parseCT(lines, numeroEstagios)

  // Processar bloco IA (passa numero_estagios para expansão)
  result.IA = parseIA(lines, numeroEstagios)

  // Processar bloco UH (só existe para estágio 1, não precisa expansão)
  result.UH = parseUH(lines)

  // Processar bloco TI (todos os estágios são declarados, não precisa expansão)
  result.TI = parseTI(lines)

  // Processar bloco MP (todos os estágios são declarados, não precisa expansão)
  result.MP = parseMP(lines)

  // Processar bloco FD (todos os estágios são declarados, não precisa expansão)
  result.FD = parseFD(lines)

  // Processar bloco VE (todos os estágios são declarados, não precisa expansão)
  result.VE = parseVE(lines)

  return result
}
