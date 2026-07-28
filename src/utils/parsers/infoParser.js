import { buildStageCalendar, formatBrazilianDate, parseBrazilianDate } from '../temporal.js'

/**
 * Processa informações gerais do dadger
 * @param {Array<string>} lines - Linhas do arquivo
 * @returns {object} Objeto com informações gerais
 */
export function parseInfoDadger(lines) {
  const infoDadger = {}

  // TE é metadado descritivo do arquivo, não conteúdo comparável.
  for (const line of lines) {
    if (!line.startsWith('TE ')) continue
    const titulo = line.slice(2).trim()
    if (titulo) infoDadger.titulo = titulo
    break
  }

  // Procurar a linha DT (data_base)
  for (const line of lines) {
    if (line.startsWith('DT ')) {
      const dataBase = parseDataBase(line)
      if (dataBase) {
        infoDadger.data_base = dataBase
      }
      break
    }
  }

  return infoDadger
}

/**
 * Faz o parse da linha DT para extrair a data_base
 * Formato esperado: 'DT  dd   mm   aaaa'
 * @param {string} line - Linha contendo DT
 * @returns {string} Data no formato dd/mm/aaaa
 */
function parseDataBase(line) {
  const parts = line.substring(2).trim().split(/\s+/)

  if (parts.length >= 3) {
    const dia = parts[0].padStart(2, '0')
    const mes = parts[1].padStart(2, '0')
    const ano = parts[2]
    const date = parseBrazilianDate(`${dia}/${mes}/${ano}`)

    return date ? formatBrazilianDate(date) : null
  }

  return null
}

/**
 * Calcula as datas de todos os estágios
 * @param {string} dataBase - Data base no formato dd/mm/aaaa
 * @param {number} numeroEstagios - Número total de estágios
 * @returns {object} Objeto com as datas de cada estágio (chave: número do estágio)
 */
export function calcularDatasEstagios(dataBase, numeroEstagios, registrosDP = []) {
  return Object.fromEntries(
    buildStageCalendar(dataBase, numeroEstagios, registrosDP)
      .map(stage => [stage.numero, stage.data_inicio])
  )
}

/**
 * Calcula o número máximo de estágios a partir de um array de registros
 * @param {Array} registros - Array de registros com propriedade 'estagio'
 * @returns {number} Número máximo de estágios
 */
export function calcularNumeroEstagios(registros) {
  let maxEstagio = 0

  for (const registro of registros) {
    if (registro.estagio > maxEstagio) {
      maxEstagio = registro.estagio
    }
  }

  return maxEstagio
}
