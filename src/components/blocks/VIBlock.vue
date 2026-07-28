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
                <tr>
                  <th
                    class="sortable col-usina"
                    @click="sortBy('numero_usina')"
                    v-sortable-header
                  >
                    Usina{{ getSortIcon('numero_usina') }}
                  </th>
                  <th>Tempo de viagem</th>
                  <th>Vazões defluentes anteriores (m³/s)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`${side}-${row.key}`"
                  :class="{ highlighted: row.onlyInOne }"
                >
                  <td class="plant-code">
                    {{ recordFor(row, side)?.numero_usina ?? row.numero_usina }}
                  </td>
                  <td
                    class="duration-cell"
                    :class="{ diff: row.duracao_diff && !row.onlyInOne }"
                  >
                    <template v-if="recordFor(row, side)">
                      <strong>{{ formatHours(recordFor(row, side).duracao_horas) }}</strong>
                      <small>{{ formatDays(recordFor(row, side).duracao_horas) }}</small>
                    </template>
                    <span v-else>—</span>
                  </td>
                  <td class="history-cell">
                    <div v-if="row.flows.length" class="flow-list">
                      <span
                        v-for="flow in row.flows"
                        :key="flow.key"
                        class="flow-value"
                        :class="{
                          diff: flow.diff && flow.sameTemporality && !row.onlyInOne,
                          faded: !flow.sameTemporality
                        }"
                      >
                        <small>{{ flowLabel(flow, side) }}</small>
                        <strong>{{ formatFlow(flowValue(flow, side)) }}</strong>
                      </span>
                    </div>
                    <span v-else>—</span>
                  </td>
                </tr>
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
    const flowValue = (flow, side) => side === 1 ? flow.valor1 : flow.valor2

    return {
      ...comparison,
      filteredData,
      setTableContainer,
      recordFor,
      flowValue,
      flowLabel,
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

function flowLabel(flow, side) {
  const position = side === 1 ? flow.position1 : flow.position2
  const period = formatHistoricalPeriod(flow.date, flow.endDate)
  if (period && position != null) return `${period} · QDEF ${position}`
  if (period) return period
  if (position != null) return `QDEF ${position} · período sem calendário`
  return 'Período sem calendário'
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

.duration-cell strong,
.duration-cell small {
  display: block;
}

.duration-cell small {
  margin-top: 2px;
  color: var(--muted);
  font: 500 9px/1.3 var(--font-ui);
}

.history-cell {
  min-width: 280px;
}

.flow-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.flow-value {
  min-width: 58px;
  display: inline-grid;
  gap: 2px;
  padding: 4px 6px;
  color: var(--text);
  background: var(--chip);
  border: 1px solid var(--border);
  border-radius: 5px;
}

.flow-value small {
  color: var(--muted);
  font: 650 8px/1.2 var(--font-ui);
}

.flow-value strong {
  font: 700 10px/1.2 var(--font-mono);
}

.flow-value.diff {
  color: var(--warning);
  background: color-mix(in srgb, var(--warning) 12%, var(--chip));
  border-color: color-mix(in srgb, var(--warning) 50%, var(--border));
}

.flow-value.faded {
  opacity: 0.38;
}

@media (max-width: 900px) {
  .history-cell {
    min-width: 220px;
  }
}
</style>
