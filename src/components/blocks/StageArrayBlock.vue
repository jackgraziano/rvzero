<template>
  <div class="stage-array-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name" :class="{ 'has-diff': hasDifferences }">{{ title }}</h3>
    </div>

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <div v-for="side in [1, 2]" :key="side" class="table-side">
          <h4 class="table-title">{{ side === 1 ? dadger1Name : dadger2Name }}</h4>
          <div
            :ref="element => setTableContainer(side, element)"
            class="table-container"
            @scroll="side === 1 ? onScroll1($event) : onScroll2($event)"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th class="sortable" @click="sortBy(entityField)">
                    {{ entityLabel }}{{ getSortIcon(entityField) }}
                  </th>
                  <th
                    v-for="column in colunasTempo"
                    :key="`${side}-${column.key}`"
                    class="sortable"
                    @click="sortBy(column.key)"
                  >
                    {{ column.label }}{{ getSortIcon(column.key) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`${side}-${row.key}`"
                >
                  <td :class="{ highlighted: row.onlyInOne }">{{ row.entityDisplay }}</td>
                  <td
                    v-for="column in colunasTempo"
                    :key="`${side}-value-${column.key}`"
                    class="col-number"
                    :class="{
                      diff: row.valores[column.key]?.diff &&
                        row.valores[column.key]?.sameTemporality &&
                        !row.onlyInOne,
                      highlighted: row.onlyInOne &&
                        row.valores[column.key]?.sameTemporality,
                      faded: !row.valores[column.key]?.sameTemporality
                    }"
                  >
                    {{ formatNumber(
                      side === 1
                        ? row.valores[column.key]?.valor1
                        : row.valores[column.key]?.valor2
                    ) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { formatNumber } from '../../utils/comparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'
import { useTemporalComparison } from '../../composables/useTemporalComparison.js'

export default {
  name: 'StageArrayBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true },
    blockKey: { type: String, required: true },
    valueField: { type: String, required: true },
    entityField: { type: String, required: true },
    entityLabel: { type: String, required: true },
    title: { type: String, required: true },
    hasItaipuSet: { type: Boolean, default: false }
  },
  setup(props) {
    const getEntityKey = record => props.hasItaipuSet
      ? `${record[props.entityField]}\u0000${record.conjunto_itaipu ?? ''}`
      : record[props.entityField]
    const findEntity = (records, key) =>
      records.find(record => getEntityKey(record) === key)
    const { colunasTempo, alignedData } = useTemporalComparison(
      props,
      props.blockKey,
      props.valueField,
      getEntityKey,
      findEntity
    )
    const displayData = computed(() => alignedData.value.map(row => {
      const record = row.dadger1 ?? row.dadger2
      const value = record?.[props.entityField] ?? '-'
      return {
        ...row,
        [props.entityField]: value,
        entityDisplay: props.hasItaipuSet && record?.conjunto_itaipu
          ? `${value}/${record.conjunto_itaipu}`
          : value
      }
    }))
    const comparison = useBlockComparison(props, displayData)
    const filteredData = comparison.createFilteredData()
    const setTableContainer = (side, element) => {
      if (side === 1) comparison.tableContainer1.value = element
      else comparison.tableContainer2.value = element
    }

    return {
      ...comparison,
      colunasTempo,
      filteredData,
      formatNumber,
      setTableContainer
    }
  }
}
</script>

<style scoped>
@import '../../styles/block-tables.css';

.stage-array-block {
  margin: 8px;
  border: 1px solid #00ff00;
  background: #1e1e1e;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #2d2d2d;
  cursor: pointer;
  border-bottom: 1px solid #00ff00;
}

.block-icon,
.block-name {
  color: #00ff00;
  font-family: 'Courier New', monospace;
}

.block-name {
  margin: 0;
  font-size: 13px;
}

.comparison-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: #fff;
}

.table-side {
  min-width: 0;
  background: #1e1e1e;
}

.table-title {
  margin: 0;
  padding: 8px 12px;
  color: #00ff00;
  background: #2d2d2d;
  font: 700 11px 'Courier New', monospace;
}

.table-container {
  max-height: 500px;
  overflow: auto;
}
</style>
