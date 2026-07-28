<template>
  <section class="vi-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      title="BLOCO VI — TEMPO DE VIAGEM DA ÁGUA"
      @toggle="toggleCollapsed"
    />

    <div v-show="!collapsed" class="block-content">
      <div v-if="filteredData.length === 0" class="block-empty">
        Nenhuma diferença neste bloco.
      </div>

      <div v-else class="comparison-tables">
        <div v-for="side in [1, 2]" :key="side" class="table-side">
          <h4 class="table-title">{{ side === 1 ? dadger1Name : dadger2Name }}</h4>
          <div
            :ref="element => setTableContainer(side, element)"
            class="table-container"
            @scroll="side === 1 ? onScroll1($event) : onScroll2($event)"
          >
            <table class="data-table">
              <thead>
                <tr class="header-row-1">
                  <th
                    rowspan="2"
                    class="sortable col-usina"
                    @click="sortBy('numero_usina')"
                    v-sortable-header
                  >
                    Usina{{ getSortIcon('numero_usina') }}
                  </th>
                  <th rowspan="2" class="col-duration">Tempo de viagem</th>
                  <th colspan="2" class="history-header">
                    Vazões defluentes anteriores (m³/s)
                  </th>
                </tr>
                <tr class="header-row-2">
                  <th class="col-date">
                    {{ compareMode === 'data' ? 'Data' : 'Posição' }}
                  </th>
                  <th class="col-flow">Vazão</th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="row in filteredData"
                  :key="`${side}-${row.key}`"
                >
                  <tr
                    v-for="(flow, flowIndex) in tableFlows(row)"
                    :key="`${side}-${row.key}-${flow?.key ?? 'sem-vazao'}`"
                    :class="{
                      highlighted: row.onlyInOne,
                      'entity-start': flowIndex === 0
                    }"
                  >
                    <td
                      v-if="flowIndex === 0"
                      :rowspan="tableFlows(row).length"
                      class="plant-code entity-cell"
                    >
                      {{ recordFor(row, side)?.numero_usina ?? row.numero_usina }}
                    </td>
                    <td
                      v-if="flowIndex === 0"
                      :rowspan="tableFlows(row).length"
                      class="duration-cell entity-cell"
                      :class="{ diff: row.duracao_diff && !row.onlyInOne }"
                    >
                      <template v-if="recordFor(row, side)">
                        <strong>{{ formatHours(recordFor(row, side).duracao_horas) }}</strong>
                        <small>{{ formatDays(recordFor(row, side).duracao_horas) }}</small>
                      </template>
                      <span v-else>—</span>
                    </td>
                    <td
                      class="history-date"
                      :class="{ faded: flow && !flow.sameTemporality }"
                    >
                      <strong>{{ flowPeriod(flow, side, compareMode) }}</strong>
                      <small v-if="flowSource(flow, side, compareMode)">
                        {{ flowSource(flow, side, compareMode) }}
                      </small>
                    </td>
                    <td
                      class="history-flow"
                      :class="{
                        diff: flow?.diff &&
                          flow.sameTemporality &&
                          !row.onlyInOne,
                        faded: flow && !flow.sameTemporality
                      }"
                    >
                      {{ formatFlow(flowValue(flow, side)) }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useBlockComparison } from '../../composables/useBlockComparison.js'
import {
  viRowsFromOccurrences
} from '../../utils/reportPresentation.js'

export default {
  name: 'VIBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true },
    occurrences: { type: Array, default: () => [] }
  },
  setup(props) {
    const alignedData = computed(() =>
      viRowsFromOccurrences(props.occurrences, props.compareMode)
    )
    const comparison = useBlockComparison(props, alignedData)
    const filteredData = comparison.createFilteredData()
    const setTableContainer = (side, element) => {
      if (side === 1) comparison.tableContainer1.value = element
      else comparison.tableContainer2.value = element
    }
    const recordFor = (row, side) => side === 1 ? row.dadger1 : row.dadger2
    const flowValue = (flow, side) =>
      side === 1 ? flow?.valor1 : flow?.valor2
    const tableFlows = row => row.flows.length > 0 ? row.flows : [null]

    return {
      ...comparison,
      filteredData,
      setTableContainer,
      recordFor,
      flowValue,
      tableFlows,
      flowPeriod,
      flowSource,
      formatHours,
      formatDays,
      formatFlow
    }
  }
}

function formatHours(value) {
  return value == null ? '—' : `${value.toLocaleString('pt-BR')} h`
}

function formatDays(value) {
  if (value == null) return ''
  const days = value / 24
  const label = days === 1 ? 'dia' : 'dias'
  return `${days.toLocaleString('pt-BR', {
    maximumFractionDigits: 2
  })} ${label}`
}

function formatFlow(value) {
  return value == null ? '—' : value.toLocaleString('pt-BR')
}

function flowPeriod(flow, side, mode) {
  if (!flow) return '—'
  const position = side === 1 ? flow.position1 : flow.position2
  if (mode === 'data') {
    return formatHistoricalPeriod(flow.date, flow.endDate) || '—'
  }
  if (position != null) return `QDEF ${position}`
  return 'Período sem calendário'
}

function flowSource(flow, side, mode) {
  if (!flow || mode !== 'data') return ''
  const position = side === 1 ? flow.position1 : flow.position2
  return position == null ? '' : `Origem: QDEF ${position}`
}

function formatHistoricalPeriod(start, end) {
  if (!start) return ''
  if (!end || end === start) return start

  const startParts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(start)
  const endParts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(end)
  if (
    startParts &&
    endParts &&
    startParts[2] === endParts[2] &&
    startParts[3] === endParts[3]
  ) {
    return `${startParts[1]}–${endParts[1]}/${endParts[2]}/${endParts[3]}`
  }
  return `${start}–${end}`
}
</script>

<style scoped>
.vi-block {
  margin: 8px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
}

.table-container {
  max-height: min(58vh, 560px);
}

.data-table {
  table-layout: fixed;
}

.col-usina,
.plant-code {
  width: 78px;
}

.plant-code {
  color: var(--accent);
  font-weight: 750;
}

.duration-cell {
  width: 126px;
}

.history-header {
  text-align: center !important;
}

.duration-cell strong,
.duration-cell small,
.history-date strong,
.history-date small {
  display: block;
}

.duration-cell small,
.history-date small {
  margin-top: 2px;
  color: var(--muted);
  font: 500 9px/1.3 var(--font-ui);
}

.history-date strong {
  font-weight: 650;
}

.col-duration,
.duration-cell {
  width: 126px;
}

.col-date,
.history-date {
  width: 174px;
}

.col-flow,
.history-flow {
  width: 82px;
  text-align: right !important;
}

.history-flow {
  font-weight: 700;
}

.entity-cell {
  vertical-align: top;
}

.data-table tbody tr.entity-start:not(:first-child) td {
  border-top: 2px solid var(--border);
}

@media (max-width: 900px) {
  .col-date,
  .history-date {
    width: 160px;
  }
}
</style>
