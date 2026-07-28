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
import { parseRE } from './reParser.js'
import { parseHQ } from './hqParser.js'
import { parseHV } from './hvParser.js'
import { parseRI } from './riParser.js'
import { parseHE } from './heParser.js'
import { parseAC } from './acParser.js'
import { parseOutros } from './outrosParser.js'
import { parseRQ } from './rqParser.js'
import { parseVI } from './viParser.js'
import { buildStageCalendar } from '../temporal.js'

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
    VE: [],
    RE: [],
    HQ: [],
    HV: [],
    RI: [],
    HE: [],
    AC: [],
    RQ: [],
    VI: [],
    OUTROS: {}
  }

  // Dividir o arquivo em linhas
  const lines = fileContent.split(/\r?\n/)

  // Processar informações gerais
  result.info_dadger = parseInfoDadger(lines)

  // Processar bloco DP
  result.DP = parseDP(lines)

  if (!result.info_dadger.data_base) {
    throw new Error('DADGER inválido: registro DT ausente ou com data inválida')
  }

  if (result.DP.length === 0) {
    throw new Error('DADGER inválido: bloco DP ausente ou sem registros válidos')
  }

  // Calcular número de estágios
  let numeroEstagios = 0
  if (result.DP.length > 0) {
    numeroEstagios = calcularNumeroEstagios(result.DP)
    result.info_dadger.numero_estagios = numeroEstagios

    result.info_dadger.numero_patamares = Math.max(
      ...result.DP.map(record => record.numero_patamares),
      0
    )
    result.info_dadger.estagios = buildStageCalendar(
      result.info_dadger.data_base,
      numeroEstagios,
      result.DP
    )
    result.info_dadger.datas_estagios = calcularDatasEstagios(
      result.info_dadger.data_base,
      numeroEstagios,
      result.DP
    )
  }

  // Processar bloco PQ (passa numero_estagios para expansão)
  result.PQ = parsePQ(lines, numeroEstagios)

  // Processar bloco CT (passa numero_estagios para expansão)
  result.CT = parseCT(lines, numeroEstagios)

  // Processar bloco IA (passa numero_estagios para expansão)
  result.IA = parseIA(
    lines,
    numeroEstagios,
    result.info_dadger.numero_patamares
  )

  // Processar bloco UH (só existe para estágio 1, não precisa expansão)
  result.UH = parseUH(lines)

  // Processar bloco TI (todos os estágios são declarados, não precisa expansão)
  result.TI = parseTI(lines, numeroEstagios)

  // Processar bloco MP (todos os estágios são declarados, não precisa expansão)
  result.MP = parseMP(lines, numeroEstagios)

  // Processar bloco FD (todos os estágios são declarados, não precisa expansão)
  result.FD = parseFD(lines, numeroEstagios)

  // Processar bloco VE (todos os estágios são declarados, não precisa expansão)
  result.VE = parseVE(lines, numeroEstagios)

  // Processar bloco RE (restrições elétricas com expansão de estágios)
  result.RE = parseRE(lines, numeroEstagios)

  // Processar bloco HQ (restrições de vazão com expansão de estágios)
  result.HQ = parseHQ(lines, numeroEstagios)

  // Processar bloco HV (restrições de armazenamento com expansão de estágios)
  result.HV = parseHV(lines, numeroEstagios)

  // Processar bloco RI (restrições de Itaipu com expansão de estágios)
  result.RI = parseRI(lines, numeroEstagios)

  // Processar bloco HE (restrições de energia armazenada - Vminop)
  result.HE = parseHE(lines)

  // Processar bloco AC (alteração de cadastro)
  result.AC = parseAC(lines, result.info_dadger.estagios)

  // Vazão defluente mínima histórica (um valor por estágio)
  result.RQ = parseRQ(lines, numeroEstagios)

  // Tempo de viagem e vazões defluentes anteriores ao horizonte
  result.VI = parseVI(lines)

  // Processar outros blocos (capturar linhas como strings simples)
  result.OUTROS = parseOutros(lines)

  return result
}
