/**
 * Utilitários para comparação de dados entre dadgers
 * Funções reutilizáveis para alinhar e comparar registros
 */

/**
 * Encontra o estágio correspondente a uma data específica
 * @param {string} data - Data no formato dd/mm/aaaa
 * @param {object} dadgerData - Dados do dadger
 * @returns {number|null} Número do estágio ou null se não encontrado
 */
export function encontrarEstagioPorData(data, dadgerData) {
  if (!dadgerData.info_dadger?.datas_estagios) return null

  for (const [estagio, dataEstagio] of Object.entries(dadgerData.info_dadger.datas_estagios)) {
    if (dataEstagio === data) {
      return parseInt(estagio)
    }
  }
  return null
}

/**
 * Verifica se dois valores são diferentes
 * @param {any} val1 - Primeiro valor
 * @param {any} val2 - Segundo valor
 * @returns {boolean} true se diferentes, false se iguais
 */
export function hasDiff(val1, val2) {
  if (val1 === null && val2 === null) return false
  if (val1 === null || val2 === null) return true
  return val1 !== val2
}

/**
 * Formata um número para exibição
 * @param {number} value - Valor numérico
 * @returns {string} Valor formatado ou '-' se null/undefined
 */
export function formatNumber(value) {
  if (value === null || value === undefined) {
    return '-'
  }
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3
  })
}

/**
 * Coleta todos os valores únicos de uma propriedade em arrays de dois dadgers
 * @param {Array} array1 - Array do primeiro dadger
 * @param {Array} array2 - Array do segundo dadger
 * @param {string} property - Propriedade a extrair
 * @returns {Array} Array com valores únicos ordenados
 */
export function collectUniqueValues(array1, array2, property) {
  const values = new Set()

  array1.forEach(item => values.add(item[property]))
  array2.forEach(item => values.add(item[property]))

  return Array.from(values).sort((a, b) => a - b)
}

/**
 * Encontra o estágio correspondente a uma data específica
 * @param {string} data - Data no formato dd/mm/aaaa
 * @param {object} dadgerData - Dados do dadger
 * @returns {number|null} Número do estágio ou null se não encontrado
 */
export function encontrarEstagioPorDataV2(data, dadgerData) {
  if (!dadgerData.info_dadger?.datas_estagios) return null

  const datasEstagios = dadgerData.info_dadger.datas_estagios
  // datasEstagios é um objeto { 1: "01/01/2025", 2: "08/01/2025", ... }
  for (const [estagio, dataEstagio] of Object.entries(datasEstagios)) {
    if (dataEstagio === data) {
      return parseInt(estagio)
    }
  }
  return null
}

/**
 * Coleta todas as datas únicas presentes nos dois dadgers
 * @param {object} dadger1Data - Dados do primeiro dadger
 * @param {object} dadger2Data - Dados do segundo dadger
 * @returns {Array<string>} Array de datas únicas ordenadas
 */
export function collectUniqueDates(dadger1Data, dadger2Data) {
  const datas = new Set()

  // Coletar datas do dadger 1
  if (dadger1Data.info_dadger?.datas_estagios) {
    Object.values(dadger1Data.info_dadger.datas_estagios).forEach(data => datas.add(data))
  }

  // Coletar datas do dadger 2
  if (dadger2Data.info_dadger?.datas_estagios) {
    Object.values(dadger2Data.info_dadger.datas_estagios).forEach(data => datas.add(data))
  }

  // Ordenar por data
  return Array.from(datas).sort((a, b) => {
    const [diaA, mesA, anoA] = a.split('/').map(Number)
    const [diaB, mesB, anoB] = b.split('/').map(Number)
    return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB)
  })
}

/**
 * Alinha registros de dois dadgers por estágio e chave secundária
 * @param {Array} registros1 - Registros do primeiro dadger
 * @param {Array} registros2 - Registros do segundo dadger
 * @param {object} dadger1Info - Info do primeiro dadger
 * @param {object} dadger2Info - Info do segundo dadger
 * @param {string} secondaryKey - Chave secundária para agrupamento (ex: 'subsistema')
 * @param {Function} transformFn - Função para transformar cada registro alinhado
 * @returns {Array} Array de registros alinhados
 */
export function alignByEstagio(registros1, registros2, dadger1Info, dadger2Info, secondaryKey, transformFn) {
  const alinhados = []

  const todosEstagios = collectUniqueValues(registros1, registros2, 'estagio')
  const todosSecondary = collectUniqueValues(registros1, registros2, secondaryKey)

  // Coletar quais estágios existem em cada dadger
  const estagiosNoDadger1 = new Set(registros1.map(r => r.estagio))
  const estagiosNoDadger2 = new Set(registros2.map(r => r.estagio))

  for (const estagio of todosEstagios) {
    // Verificar se este estágio existe em ambos os dadgers
    const estagioExisteEm1 = estagiosNoDadger1.has(estagio)
    const estagioExisteEm2 = estagiosNoDadger2.has(estagio)
    const sameTemporality = estagioExisteEm1 && estagioExisteEm2

    for (const secondaryValue of todosSecondary) {
      const reg1 = registros1.find(r => r.estagio === estagio && r[secondaryKey] === secondaryValue)
      const reg2 = registros2.find(r => r.estagio === estagio && r[secondaryKey] === secondaryValue)

      if (reg1 || reg2) {
        const onlyInOne = !reg1 || !reg2
        const aligned = transformFn(reg1, reg2, onlyInOne, sameTemporality, estagio, secondaryValue)
        alinhados.push(aligned)
      }
    }
  }

  return alinhados
}

/**
 * Alinha registros de dois dadgers por data e chave secundária
 * @param {Array} registros1 - Registros do primeiro dadger
 * @param {Array} registros2 - Registros do segundo dadger
 * @param {object} dadger1Data - Dados completos do primeiro dadger
 * @param {object} dadger2Data - Dados completos do segundo dadger
 * @param {string} secondaryKey - Chave secundária para agrupamento (ex: 'subsistema')
 * @param {Function} transformFn - Função para transformar cada registro alinhado
 * @returns {Array} Array de registros alinhados
 */
export function alignByData(registros1, registros2, dadger1Data, dadger2Data, secondaryKey, transformFn) {
  const alinhados = []

  const todasDatas = collectUniqueDates(dadger1Data, dadger2Data)
  const todosSecondary = collectUniqueValues(registros1, registros2, secondaryKey)

  // Coletar quais datas existem em cada dadger
  const datasNoDadger1 = new Set(
    dadger1Data.info_dadger?.datas_estagios ? Object.values(dadger1Data.info_dadger.datas_estagios) : []
  )
  const datasNoDadger2 = new Set(
    dadger2Data.info_dadger?.datas_estagios ? Object.values(dadger2Data.info_dadger.datas_estagios) : []
  )

  for (const data of todasDatas) {
    // Verificar se esta data existe em ambos os dadgers
    const dataExisteEm1 = datasNoDadger1.has(data)
    const dataExisteEm2 = datasNoDadger2.has(data)
    const sameTemporality = dataExisteEm1 && dataExisteEm2

    for (const secondaryValue of todosSecondary) {
      const estagio1 = encontrarEstagioPorData(data, dadger1Data)
      const estagio2 = encontrarEstagioPorData(data, dadger2Data)

      const reg1 = estagio1 ? registros1.find(r => r.estagio === estagio1 && r[secondaryKey] === secondaryValue) : null
      const reg2 = estagio2 ? registros2.find(r => r.estagio === estagio2 && r[secondaryKey] === secondaryValue) : null

      if (reg1 || reg2) {
        const onlyInOne = !reg1 || !reg2
        const aligned = transformFn(reg1, reg2, onlyInOne, sameTemporality, data, secondaryValue)
        alinhados.push(aligned)
      }
    }
  }

  return alinhados
}
