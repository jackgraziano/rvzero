import { computed } from 'vue'
import {
  collectUniqueDates,
  encontrarEstagioPorData
} from '../utils/comparison.js'

export function useEntityTemporalComparison(
  props,
  blockKey,
  entityKey,
  getEntityValue,
  compareValues
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
    const entities = new Set([
      ...records1.map(record => record[entityKey]),
      ...records2.map(record => record[entityKey])
    ])

    return [...entities].map(entityId => {
      const entityRecords1 = records1.filter(record => record[entityKey] === entityId)
      const entityRecords2 = records2.filter(record => record[entityKey] === entityId)
      const map1 = new Map(entityRecords1.map(record => [record.estagio, record]))
      const map2 = new Map(entityRecords2.map(record => [record.estagio, record]))
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
        const dataExisteEmAmbos = stage1 !== null && stage2 !== null
        const record1 = stage1 === null ? null : map1.get(stage1) ?? null
        const record2 = stage2 === null ? null : map2.get(stage2) ?? null
        const sameTemporality = record1 !== null && record2 !== null
        const value1 = record1 ? getEntityValue(record1) : null
        const value2 = record2 ? getEntityValue(record2) : null
        const diff = compareValues(value1, value2)

        if (dataExisteEmAmbos) {
          hasCommonHorizon = true
          if (!sameTemporality || diff) hasComparableDifference = true
        }
        values[column.key] = {
          valor1: value1,
          valor2: value2,
          diff,
          sameTemporality,
          dataExisteEmAmbos
        }
      }

      const entityOnlyInOne = entityRecords1.length === 0 || entityRecords2.length === 0
      const row = {
        key: String(entityId),
        [entityKey]: entityId,
        onlyInOne: entityOnlyInOne && hasCommonHorizon,
        sameTemporality: hasCommonHorizon,
        dadger1: entityRecords1[0] ?? null,
        dadger2: entityRecords2[0] ?? null,
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
