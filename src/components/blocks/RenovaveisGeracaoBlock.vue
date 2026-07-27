<template>
  <div class="renovaveis-geracao-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      :title="blockTitle"
      @toggle="toggleCollapsed"
    />

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <!-- Tabela Arquivo 1 -->
        <div class="table-side">
          <h4 class="table-title">{{ renovaveis1Name }}</h4>
          <div class="table-container" :ref="el => tableContainer1 = el" @scroll="onScroll1">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('timeOrder')" class="sortable col-number" v-sortable-header>{{ temporalColumnLabel }}{{ getSortIcon('timeOrder') }}</th>
                  <th @click="sortBy('submercado')" class="sortable col-number" v-sortable-header>Subm{{ getSortIcon('submercado') }}</th>
                  <th @click="sortBy('patamar')" class="sortable col-number" v-sortable-header>Pat{{ getSortIcon('patamar') }}</th>
                  <th @click="sortBy('geracaoMedia')" class="sortable col-number" v-sortable-header>Geração (MW){{ getSortIcon('geracaoMedia') }}</th>
                  <th class="col-number">PEEs</th>
                  <th class="col-number">Cenários</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`r1-${row.key}`"
                  :class="{
                    highlighted: row.onlyInOne && row.sameTemporality,
                    faded: !row.sameTemporality
                  }"
                >
                  <td class="col-number temporal-cell">
                    <strong>{{ row.periodLabel }}</strong>
                    <span v-if="compareMode === 'data' && row.ren1">
                      PerIni {{ row.ren1.periodo }}
                    </span>
                  </td>
                  <td class="col-number">{{ row.ren1?.submercado ?? '-' }}</td>
                  <td class="col-number">{{ row.ren1?.patamar ?? '-' }}</td>
                  <td class="col-number" :class="{ diff: row.diff_geracaoMedia && !row.onlyInOne && row.sameTemporality }">
                    {{ formatNumber(row.ren1?.geracaoMedia) }}
                  </td>
                  <td class="col-number" :class="{ diff: row.diff_numPEEs && !row.onlyInOne && row.sameTemporality }">
                    {{ row.ren1?.numPEEs ?? '-' }}
                  </td>
                  <td class="col-number" :class="{ diff: row.diff_numCenarios && !row.onlyInOne && row.sameTemporality }">
                    {{ row.ren1?.numCenarios ?? '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabela Arquivo 2 -->
        <div class="table-side">
          <h4 class="table-title">{{ renovaveis2Name }}</h4>
          <div class="table-container" :ref="el => tableContainer2 = el" @scroll="onScroll2">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('timeOrder')" class="sortable col-number" v-sortable-header>{{ temporalColumnLabel }}{{ getSortIcon('timeOrder') }}</th>
                  <th @click="sortBy('submercado')" class="sortable col-number" v-sortable-header>Subm{{ getSortIcon('submercado') }}</th>
                  <th @click="sortBy('patamar')" class="sortable col-number" v-sortable-header>Pat{{ getSortIcon('patamar') }}</th>
                  <th @click="sortBy('geracaoMedia')" class="sortable col-number" v-sortable-header>Geração (MW){{ getSortIcon('geracaoMedia') }}</th>
                  <th class="col-number">PEEs</th>
                  <th class="col-number">Cenários</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`r2-${row.key}`"
                  :class="{
                    highlighted: row.onlyInOne && row.sameTemporality,
                    faded: !row.sameTemporality
                  }"
                >
                  <td class="col-number temporal-cell">
                    <strong>{{ row.periodLabel }}</strong>
                    <span v-if="compareMode === 'data' && row.ren2">
                      PerIni {{ row.ren2.periodo }}
                    </span>
                  </td>
                  <td class="col-number">{{ row.ren2?.submercado ?? '-' }}</td>
                  <td class="col-number">{{ row.ren2?.patamar ?? '-' }}</td>
                  <td class="col-number" :class="{ diff: row.diff_geracaoMedia && !row.onlyInOne && row.sameTemporality }">
                    {{ formatNumber(row.ren2?.geracaoMedia) }}
                  </td>
                  <td class="col-number" :class="{ diff: row.diff_numPEEs && !row.onlyInOne && row.sameTemporality }">
                    {{ row.ren2?.numPEEs ?? '-' }}
                  </td>
                  <td class="col-number" :class="{ diff: row.diff_numCenarios && !row.onlyInOne && row.sameTemporality }">
                    {{ row.ren2?.numCenarios ?? '-' }}
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
import { alignRenovaveisGeneration } from '../../utils/renovaveisComparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'

export default {
  name: 'RenovaveisGeracaoBlock',
  props: {
    renovaveis1Data: { type: Object, required: true },
    renovaveis1Name: { type: String, required: true },
    renovaveis2Data: { type: Object, required: true },
    renovaveis2Name: { type: String, required: true },
    dadger1Data: { type: Object, default: null },
    dadger2Data: { type: Object, default: null },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    const alignedData = computed(() => alignRenovaveisGeneration(
      props.renovaveis1Data,
      props.renovaveis2Data,
      {
        compareMode: props.compareMode,
        dadger1Data: props.dadger1Data,
        dadger2Data: props.dadger2Data
      }
    ))
    const temporalColumnLabel = computed(
      () => props.compareMode === 'data' ? 'Data / PerIni' : 'Período'
    )
    const blockTitle = computed(
      () => props.compareMode === 'data'
        ? 'GERAÇÃO RENOVÁVEL — SUBMERCADO, DATA E PATAMAR'
        : 'GERAÇÃO RENOVÁVEL — SUBMERCADO, PERÍODO E PATAMAR'
    )

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

    return {
      collapsed,
      tableContainer1,
      tableContainer2,
      toggleCollapsed,
      sortBy,
      getSortIcon,
      onScroll1,
      onScroll2,
      formatNumber,
      filteredData,
      hasDifferences,
      temporalColumnLabel,
      blockTitle
    }
  }
}
</script>

<style scoped>

.renovaveis-geracao-block {
  margin: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.block-content {
  background: var(--surface);
}

.comparison-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: var(--border);
  overflow: hidden;
}

.table-side {
  background: var(--surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-title {
  padding: 8px 12px;
  background: var(--surface-elevated);
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
}

.table-container {
  max-height: 500px;
  overflow: auto;
  background: var(--surface);
}

.temporal-cell strong,
.temporal-cell span {
  display: block;
  white-space: nowrap;
}

.temporal-cell span {
  margin-top: 2px;
  color: var(--muted);
  font-size: 9px;
}
</style>
