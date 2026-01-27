/**
 * Composable para lógica de comparação temporal (blocos com 24 estágios)
 * Usado por: TI, MP, FD, VE e outros blocos temporais
 */

import { computed } from 'vue'
import { encontrarEstagioPorDataV2, collectUniqueDates, hasDiff } from '../utils/comparison.js'

/**
 * Cria a lógica de comparação temporal para blocos com array de valores por estágio
 *
 * @param {Object} props - Props do componente (dadger1Data, dadger2Data, compareMode, etc)
 * @param {string} blockKey - Chave do bloco no dadger (ex: 'TI', 'MP', 'FD', 'VE')
 * @param {string} valueField - Nome do campo que contém o array de valores (ex: 'vazoes', 'fatores', 'volumes')
 * @param {Function} getEntityKey - Função para extrair chave única da entidade (ex: r => r.numero_usina)
 * @param {Function} findEntity - Função para encontrar entidade por chave (ex: (registros, key) => registros.find(r => r.numero_usina === key))
 * @returns {Object} Computed properties para uso no componente
 */
export function useTemporalComparison(props, blockKey, valueField, getEntityKey, findEntity) {
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
   * Dados alinhados por entidade e temporalidade
   */
  const alignedData = computed(() => {
    const registros1 = props.dadger1Data[blockKey] || []
    const registros2 = props.dadger2Data[blockKey] || []

    // Coletar todas as chaves únicas
    const chaves = new Set()
    registros1.forEach(r => chaves.add(getEntityKey(r)))
    registros2.forEach(r => chaves.add(getEntityKey(r)))

    const alinhados = []

    for (const chave of chaves) {
      const reg1 = findEntity(registros1, chave)
      const reg2 = findEntity(registros2, chave)

      const onlyInOne = !reg1 || !reg2

      // Criar objeto de valores alinhados por coluna temporal
      const valores = {}
      let temDiferenca = false

      for (const col of colunasTempo.value) {
        let valor1 = null
        let valor2 = null
        let sameTemporality = false

        if (col.data) {
          // Coluna baseada em DATA
          const estagio1 = encontrarEstagioPorDataV2(col.data, props.dadger1Data)
          const estagio2 = encontrarEstagioPorDataV2(col.data, props.dadger2Data)

          const idx1 = estagio1 ? estagio1 - 1 : -1
          const idx2 = estagio2 ? estagio2 - 1 : -1

          valor1 = idx1 >= 0 ? reg1?.[valueField]?.[idx1] ?? null : null
          valor2 = idx2 >= 0 ? reg2?.[valueField]?.[idx2] ?? null : null

          sameTemporality = idx1 >= 0 && idx2 >= 0
        } else if (col.estagio) {
          // Coluna baseada em ESTÁGIO
          const idx = col.estagio - 1
          valor1 = reg1?.[valueField]?.[idx] ?? null
          valor2 = reg2?.[valueField]?.[idx] ?? null

          const temEstagio1 = reg1 && idx < (reg1[valueField]?.length || 0)
          const temEstagio2 = reg2 && idx < (reg2[valueField]?.length || 0)
          sameTemporality = temEstagio1 && temEstagio2
        }

        const diff = hasDiff(valor1, valor2)
        if (diff && sameTemporality) temDiferenca = true

        valores[col.key] = {
          valor1,
          valor2,
          diff,
          sameTemporality
        }
      }

      const row = {
        key: typeof chave === 'string' ? chave : String(chave),
        onlyInOne,
        dadger1: reg1,
        dadger2: reg2,
        valores,
        temDiferenca
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
