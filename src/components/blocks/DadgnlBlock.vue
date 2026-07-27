<template>
  <div class="dadgnl-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      :title="title"
      @toggle="toggleCollapsed"
    />

    <div v-show="!collapsed" class="block-content">
      <div v-if="filteredData.length" class="comparison-tables">
        <div
          v-for="side in sides"
          :key="side.key"
          class="table-side"
        >
          <h4 class="table-title">{{ side.name }}</h4>
          <div
            class="table-container"
            :ref="element => setTableContainer(side.index, element)"
            @scroll="side.index === 1 ? onScroll1($event) : onScroll2($event)"
          >
            <table class="data-table">
              <thead>
                <tr v-if="hasColumnGroups" class="header-row-1">
                  <template
                    v-for="header in columnHeaders"
                    :key="header.key"
                  >
                    <th
                      v-if="header.type === 'single'"
                      rowspan="2"
                      class="sortable"
                      :class="header.column.headerClass"
                      v-sortable-header
                      @click="sortBy(header.column.sortKey ?? header.column.key)"
                    >
                      {{ header.column.label }}{{ getSortIcon(header.column.sortKey ?? header.column.key) }}
                    </th>
                    <th
                      v-else
                      :colspan="header.columns.length"
                      class="patamar-header"
                      :class="header.className"
                    >
                      {{ header.label }}
                    </th>
                  </template>
                </tr>
                <tr v-if="hasColumnGroups" class="header-row-2">
                  <th
                    v-for="column in groupedColumns"
                    :key="column.key"
                    class="sortable"
                    :class="column.headerClass"
                    v-sortable-header
                    @click="sortBy(column.sortKey ?? column.key)"
                  >
                    {{ column.label }}{{ getSortIcon(column.sortKey ?? column.key) }}
                  </th>
                </tr>
                <tr v-else>
                  <th
                    v-for="column in columns"
                    :key="column.key"
                    class="sortable"
                    :class="column.headerClass"
                    v-sortable-header
                    @click="sortBy(column.sortKey ?? column.key)"
                  >
                    {{ column.label }}{{ getSortIcon(column.sortKey ?? column.key) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`${side.key}-${row.key}`"
                  :class="{
                    highlighted: row.onlyInOne && row.sameTemporality,
                    faded: !row.sameTemporality
                  }"
                >
                  <td
                    v-for="column in columns"
                    :key="column.key"
                    :class="[
                      column.cellClass,
                      {
                        diff: isDifferent(row, column.key)
                      }
                    ]"
                  >
                    {{ formatCell(row[side.key], column) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p v-else class="block-empty">
        {{ showOnlyDifferences
          ? 'Nenhuma diferença comparável neste bloco.'
          : 'Nenhum registro válido neste bloco.' }}
      </p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { formatNumber } from '../../utils/comparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'

export default {
  name: 'DadgnlBlock',
  props: {
    title: { type: String, required: true },
    dadgnl1Name: { type: String, required: true },
    dadgnl2Name: { type: String, required: true },
    rows: { type: Array, required: true },
    columns: { type: Array, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    const alignedData = computed(() => props.rows)
    const {
      collapsed,
      tableContainer1,
      tableContainer2,
      toggleCollapsed,
      sortBy,
      getSortIcon,
      onScroll1,
      onScroll2,
      createFilteredData,
      hasDifferences
    } = useBlockComparison(props, alignedData)
    const filteredData = createFilteredData()
    const sides = computed(() => [
      { key: 'dadger1', index: 1, name: props.dadgnl1Name },
      { key: 'dadger2', index: 2, name: props.dadgnl2Name }
    ])
    const groupedColumns = computed(() =>
      props.columns.filter(column => column.group)
    )
    const hasColumnGroups = computed(() => groupedColumns.value.length > 0)
    const columnHeaders = computed(() => buildColumnHeaders(props.columns))

    const setTableContainer = (index, element) => {
      if (index === 1) tableContainer1.value = element
      else tableContainer2.value = element
    }
    const isDifferent = (row, key) =>
      row.sameTemporality &&
      !row.onlyInOne &&
      Boolean(row[`diff_${key}`])
    const formatCell = (record, column) => {
      const value = record?.[column.key]
      if (value == null) return '-'
      if (column.format === 'number') return formatNumber(value)
      if (column.format === 'month') {
        return value === 1 ? 'M' : `M+${value - 1}`
      }
      return value
    }

    return {
      collapsed,
      toggleCollapsed,
      sortBy,
      getSortIcon,
      onScroll1,
      onScroll2,
      filteredData,
      hasDifferences,
      sides,
      groupedColumns,
      hasColumnGroups,
      columnHeaders,
      setTableContainer,
      isDifferent,
      formatCell
    }
  }
}

function buildColumnHeaders(columns) {
  const headers = []

  columns.forEach(column => {
    if (!column.group) {
      headers.push({
        type: 'single',
        key: `single-${column.key}`,
        column
      })
      return
    }

    const last = headers.at(-1)
    if (last?.type === 'group' && last.label === column.group) {
      last.columns.push(column)
      return
    }

    headers.push({
      type: 'group',
      key: `group-${column.group}`,
      label: column.group,
      className: column.groupClass,
      columns: [column]
    })
  })

  return headers
}
</script>

<style scoped>
.dadgnl-block {
  margin: 8px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.data-table td {
  white-space: nowrap;
}

.data-table td.col-stage {
  min-width: 120px;
}
</style>
