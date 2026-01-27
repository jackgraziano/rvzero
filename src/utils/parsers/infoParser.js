/**
 * Parser para informações gerais do dadger
 */

/**
 * Processa informações gerais do dadger
 * @param {Array<string>} lines - Linhas do arquivo
 * @returns {object} Objeto com informações gerais
 */
export function parseInfoDadger(lines) {
  const infoDadger = {}

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
  // Remover 'DT' do início e fazer split por espaços
  const parts = line.substring(2).trim().split(/\s+/)

  if (parts.length >= 3) {
    const dia = parts[0].padStart(2, '0')
    const mes = parts[1].padStart(2, '0')
    const ano = parts[2]

    return `${dia}/${mes}/${ano}`
  }

  return null
}

/**
 * Calcula as datas de todos os estágios
 * @param {string} dataBase - Data base no formato dd/mm/aaaa
 * @param {number} numeroEstagios - Número total de estágios
 * @returns {object} Objeto com as datas de cada estágio (chave: número do estágio)
 */
export function calcularDatasEstagios(dataBase, numeroEstagios) {
  const datas = {}

  // Parsear a data_base (formato dd/mm/aaaa)
  const [dia, mes, ano] = dataBase.split('/').map(Number)
  const dataInicial = new Date(ano, mes - 1, dia)

  // Gerar as datas para cada estágio (incrementando 7 dias)
  for (let i = 0; i < numeroEstagios; i++) {
    const data = new Date(dataInicial)
    data.setDate(dataInicial.getDate() + (i * 7))

    const diaFormatado = String(data.getDate()).padStart(2, '0')
    const mesFormatado = String(data.getMonth() + 1).padStart(2, '0')
    const anoFormatado = data.getFullYear()

    // Estágio começa em 1, não em 0
    datas[i + 1] = `${diaFormatado}/${mesFormatado}/${anoFormatado}`
  }

  return datas
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
