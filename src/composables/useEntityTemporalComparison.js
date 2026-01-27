/**
 * Composable para blocos com estrutura "entidade × tempo"
 * Usado por: RE e outros blocos complexos com valores variados por estágio
 *
 * Estrutura:
 * - Cada LINHA = uma entidade (ex: restrição)
 * - Cada COLUNA = um estágio/data
 * - Valores podem ser complexos (objetos)
 */

import { computed } from 'vue'
import { encontrarEstagioPorDataV2, collectUniqueDates } from '../utils/comparison.js'

/**
 * Cria a lógica de comparação para blocos com estrutura entidade × tempo
 *
 * @param {Object} props - Props do componente (dadger1Data, dadger2Data, compareMode)
 * @param {string} blockKey - Chave do bloco no dadger (ex: 'RE')
 * @param {string} entityKey - Campo que identifica a entidade (ex: 'numero_restricao')
 * @param {Function} getEntityValue - Função para extrair valor de um registro
 * @param {Function} compareValues - Função para comparar dois valores (retorna true se diferentes)
 * @returns {Object} Computed properties
 */
export function useEntityTemporalComparison(
  props,
  blockKey,
  entityKey,
  getEntityValue,
  compareValues
) {
  /**
   * Colunas de tempo baseado no modo de comparação
   */
  const colunasTempo = computed(() => {
    const numEstagios1 = props.dadger1Data.info_dadger?.numero_estagios || 0
    const numEstagios2 = props.dadger2Data.info_dadger?.numero_estagios || 0

    if (props.compareMode === 'data') {
      const datasUnicas = collectUniqueDates(props.dadger1Data, props.dadger2Data)

      if (datasUnicas.length > 0) {
        return datasUnicas.map(data => ({
          key: `data_${data}`,
          label: data,
          data: data
        }))
      }
    }

    // Modo ESTAGIO ou fallback
    const maxEstagios = Math.max(numEstagios1, numEstagios2)
    const colunas = []
    for (let i = 1; i <= maxEstagios; i++) {
      colunas.push({
        key: `estagio_${i}`,
        label: `Est ${i}`,
        estagio: i
      })
    }
    return colunas
  })

  /**
   * Dados alinhados por entidade com valores em colunas temporais
   */
  const alignedData = computed(() => {
    const registros1 = props.dadger1Data[blockKey] || []
    const registros2 = props.dadger2Data[blockKey] || []

    // Coletar todas as entidades únicas
    const entidades = new Set()
    registros1.forEach(r => entidades.add(r[entityKey]))
    registros2.forEach(r => entidades.add(r[entityKey]))

    const alinhados = []

    for (const entidadeId of entidades) {
      const regsEntidade1 = registros1.filter(r => r[entityKey] === entidadeId)
      const regsEntidade2 = registros2.filter(r => r[entityKey] === entidadeId)

      const onlyInOne = regsEntidade1.length === 0 || regsEntidade2.length === 0

      // Criar objeto de valores alinhados por coluna temporal
      const valores = {}
      let temDiferenca = false

      for (const col of colunasTempo.value) {
        let valor1 = null
        let valor2 = null
        let sameTemporality = false
        let dataExisteEmAmbos = false

        if (col.data) {
          // Coluna baseada em DATA
          const estagio1 = encontrarEstagioPorDataV2(col.data, props.dadger1Data)
          const estagio2 = encontrarEstagioPorDataV2(col.data, props.dadger2Data)

          // Data existe em ambos os dadgers se ambos têm estágio para essa data
          dataExisteEmAmbos = estagio1 !== null && estagio2 !== null

          const reg1 = estagio1 ? regsEntidade1.find(r => r.estagio === estagio1) : null
          const reg2 = estagio2 ? regsEntidade2.find(r => r.estagio === estagio2) : null

          valor1 = reg1 ? getEntityValue(reg1) : null
          valor2 = reg2 ? getEntityValue(reg2) : null

          // sameTemporality = ambos têm a entidade nessa data
          sameTemporality = reg1 !== null && reg2 !== null
        } else if (col.estagio) {
          // Coluna baseada em ESTÁGIO
          const reg1 = regsEntidade1.find(r => r.estagio === col.estagio)
          const reg2 = regsEntidade2.find(r => r.estagio === col.estagio)

          // Estágio existe em ambos (no modo estágio sempre existe)
          dataExisteEmAmbos = true

          valor1 = reg1 ? getEntityValue(reg1) : null
          valor2 = reg2 ? getEntityValue(reg2) : null

          // sameTemporality = ambos têm a entidade nesse estágio
          sameTemporality = reg1 !== undefined && reg2 !== undefined
        }

        const diff = compareValues(valor1, valor2)

        // Contar como diferença se:
        // 1. Valores diferentes na mesma temporalidade
        // 2. Data existe em ambos mas entidade só em um (highlighted)
        if (diff && sameTemporality) {
          temDiferenca = true
        } else if (dataExisteEmAmbos && !sameTemporality) {
          // Data comum mas entidade só em um dadger
          temDiferenca = true
        }

        valores[col.key] = {
          valor1,
          valor2,
          diff,
          sameTemporality,
          dataExisteEmAmbos
        }
      }

      const row = {
        key: String(entidadeId),
        [entityKey]: entidadeId,
        onlyInOne,
        // Para blocos com colunas temporais, sameTemporality sempre true se existe em pelo menos um dadger
        sameTemporality: true,
        dadger1: regsEntidade1.length > 0 ? regsEntidade1[0] : null,
        dadger2: regsEntidade2.length > 0 ? regsEntidade2[0] : null,
        valores,
        temDiferenca,
        // Campo para compatibilidade com filtro
        // Se onlyInOne, sempre considerar como diferença
        has_diff: onlyInOne || temDiferenca
      }

      // Adicionar valores para permitir sort
      for (const col of colunasTempo.value) {
        row[col.key] = valores[col.key].valor1 ?? valores[col.key].valor2 ?? 0
      }

      alinhados.push(row)
    }

    return alinhados
  })

  return {
    colunasTempo,
    alignedData
  }
}
