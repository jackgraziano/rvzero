<template>
  <div class="stage-array-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      :title="title"
      @toggle="toggleCollapsed"
    />

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
                  <th class="sortable" @click="sortBy(entityField)" v-sortable-header>
                    {{ entityLabel }}{{ getSortIcon(entityField) }}
                  </th>
                  <th
                    v-for="column in colunasTempo"
                    :key="`${side}-${column.key}`"
                    class="sortable"
                    @click="sortBy(column.key)"
                   v-sortable-header>
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
    hasItaipuSet: { type: Boolean, default: false },
    occurrences: { type: Array, default: null }
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

.stage-array-block {
  margin: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.comparison-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: var(--border);
}

.table-side {
  min-width: 0;
  background: var(--surface);
}

.table-title {
  margin: 0;
  padding: 8px 12px;
  color: var(--accent);
  background: var(--surface-elevated);
  font: 700 11px var(--font-mono);
}

.table-container {
  max-height: 500px;
  overflow: auto;
}
</style>
