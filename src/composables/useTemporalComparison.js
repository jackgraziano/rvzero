import { computed } from 'vue'
import {
  collectUniqueDates,
  encontrarEstagioPorData,
  hasDiff
} from '../utils/comparison.js'

export function useTemporalComparison(
  props,
  blockKey,
  valueField,
  getEntityKey,
  findEntity
) {
  const colunasTempo = computed(() => {
    if (props.compareMode === 'data') {
      return collectUniqueDates(props.dadger1Data, props.dadger2Data)
        .map(data => ({ key: `data_${data}`, label: data, data }))
    }

    const maximum = Math.max(
      props.dadger1Data.info_dadger?.numero_estagios ?? 0,
      props.dadger2Data.info_dadger?.numero_estagios ?? 0
    )
    return Array.from({ length: maximum }, (_, index) => ({
      key: `estagio_${index + 1}`,
      label: `Est ${index + 1}`,
      estagio: index + 1
    }))
  })

  const alignedData = computed(() => {
    const records1 = props.dadger1Data[blockKey] ?? []
    const records2 = props.dadger2Data[blockKey] ?? []
    const keys = new Set([
      ...records1.map(getEntityKey),
      ...records2.map(getEntityKey)
    ])

    return [...keys].map(entityKey => {
      const record1 = findEntity(records1, entityKey) ?? null
      const record2 = findEntity(records2, entityKey) ?? null
      const values = {}
      let hasComparableDifference = false
      let hasCommonHorizon = false

      for (const column of colunasTempo.value) {
        const stage1 = column.data
          ? encontrarEstagioPorData(column.data, props.dadger1Data)
          : column.estagio <= (props.dadger1Data.info_dadger?.numero_estagios ?? 0)
            ? column.estagio
            : null
        const stage2 = column.data
          ? encontrarEstagioPorData(column.data, props.dadger2Data)
          : column.estagio <= (props.dadger2Data.info_dadger?.numero_estagios ?? 0)
            ? column.estagio
            : null
        const sameTemporality = stage1 !== null && stage2 !== null
        const value1 = stage1 === null ? null : record1?.[valueField]?.[stage1 - 1] ?? null
        const value2 = stage2 === null ? null : record2?.[valueField]?.[stage2 - 1] ?? null
        const diff = hasDiff(value1, value2)

        if (sameTemporality) {
          hasCommonHorizon = true
          if (diff) hasComparableDifference = true
        }
        values[column.key] = {
          valor1: value1,
          valor2: value2,
          diff,
          sameTemporality
        }
      }

      const entityOnlyInOne = !record1 || !record2
      const row = {
        key: String(entityKey),
        onlyInOne: entityOnlyInOne && hasCommonHorizon,
        sameTemporality: hasCommonHorizon,
        dadger1: record1,
        dadger2: record2,
        valores: values,
        temDiferenca: hasComparableDifference,
        has_diff: hasComparableDifference
      }

      for (const column of colunasTempo.value) {
        row[column.key] = values[column.key].valor1 ?? values[column.key].valor2 ?? 0
      }
      return row
    })
  })

  return { colunasTempo, alignedData }
}
