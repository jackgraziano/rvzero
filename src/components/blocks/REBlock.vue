<template>
  <section class="re-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      title="BLOCO RE — RESTRIÇÕES ELÉTRICAS"
      @toggle="toggleCollapsed"
    />

    <div v-show="!collapsed" class="block-content">
      <div v-if="filteredData.length === 0" class="block-empty">
        Nenhuma diferença comparável neste bloco.
      </div>

      <div v-else class="comparison-tables restriction-comparison">
        <div v-for="side in [1, 2]" :key="side" class="table-side">
          <h4 class="table-title">{{ side === 1 ? dadger1Name : dadger2Name }}</h4>
          <div
            :ref="element => setTableContainer(side, element)"
            class="table-container"
            @scroll="side === 1 ? onScroll1($event) : onScroll2($event)"
          >
            <table class="data-table restriction-table">
              <thead>
                <tr>
                  <th class="sortable col-restricao" @click="sortBy('numero_restricao')" v-sortable-header>
                    Restrição{{ getSortIcon('numero_restricao') }}
                  </th>
                  <th class="sortable col-periodo" @click="sortBy('timeOrder')" v-sortable-header>
                    {{ compareMode === 'data' ? 'Período' : 'Estágio' }}{{ getSortIcon('timeOrder') }}
                  </th>
                  <th class="col-limites">Limites (MW)</th>
                  <th class="col-fatores">Composição</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`${side}-${row.key}`"
                  :class="{
                    faded: !row.sameTemporality,
                    highlighted: row.onlyInOne && row.sameTemporality
                  }"
                >
                  <td class="restriction-id">RE {{ row.numero_restricao }}</td>
                  <td class="period-cell">
                    <strong>{{ row.timeLabel }}</strong>
                    <span v-if="compareMode === 'data' && recordFor(row, side)">
                      Estágio {{ recordFor(row, side).estagio }}
                    </span>
                  </td>
                  <td
                    class="limits-cell"
                    :class="{ diff: row.limitsDiff && !row.onlyInOne }"
                  >
                    <div v-if="recordFor(row, side)?.limites" class="limits-grid">
                      <template v-for="level in loadLevels" :key="level.key">
                        <span class="level-label" :title="level.label">{{ level.short }}</span>
                        <span>{{ formatRange(
                          recordFor(row, side).limites[`${level.key}_min`],
                          recordFor(row, side).limites[`${level.key}_max`]
                        ) }}</span>
                      </template>
                    </div>
                    <span v-else class="empty-value">—</span>
                  </td>
                  <td
                    class="factors-cell"
                    :class="{ diff: row.factorsDiff && !row.onlyInOne }"
                  >
                    <RestrictionFactors :restriction="recordFor(row, side)" />
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
import RestrictionFactors from '../RestrictionFactors.vue'
import {
  formatRange,
  semanticEqual
} from '../../utils/comparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'
import { useEntityTemporalComparison } from '../../composables/useEntityTemporalComparison.js'

const FACTOR_FIELDS = [
  'fatores_uh',
  'fatores_ut',
  'fatores_interligacao',
  'fatores_contrato'
]

export default {
  name: 'REBlock',
  components: { RestrictionFactors },
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true },
    occurrences: { type: Array, default: null }
  },
  setup(props) {
    const getEntityValue = record => record
      ? {
          estagio: record.estagio,
          limites: record.limites,
          ...Object.fromEntries(FACTOR_FIELDS.map(field => [field, record[field]]))
        }
      : null

    const { colunasTempo, alignedData } = useEntityTemporalComparison(
      props,
      'RE',
      'numero_restricao',
      getEntityValue,
      (first, second) => !semanticEqual(first, second)
    )

    const displayData = computed(() => alignedData.value.flatMap(entity =>
      colunasTempo.value.flatMap((column, timeOrder) => {
        const temporal = entity.valores[column.key]
        const first = temporal?.valor1 ?? null
        const second = temporal?.valor2 ?? null
        if (!first && !second) return []

        const onlyInOne = !first || !second
        const reportFields = temporal.occurrence?.fields
        const limitsDiff = reportFields
          ? Boolean(reportFields.limites?.changed)
          : Boolean(
              first && second && !semanticEqual(first.limites, second.limites)
            )
        const factorsDiff = reportFields
          ? FACTOR_FIELDS.some(field => reportFields[field]?.changed)
          : Boolean(first && second && FACTOR_FIELDS.some(
              field => !semanticEqual(first[field], second[field])
            ))
        const sameTemporality = temporal.dataExisteEmAmbos

        return [{
          key: `${entity.numero_restricao}-${column.key}`,
          numero_restricao: entity.numero_restricao,
          timeLabel: column.label,
          timeOrder,
          dadger1: first,
          dadger2: second,
          limitsDiff,
          factorsDiff,
          onlyInOne,
          sameTemporality,
          has_diff: sameTemporality && (onlyInOne || limitsDiff || factorsDiff)
        }]
      })
    ))

    const comparison = useBlockComparison(props, displayData)
    const filteredData = comparison.createFilteredData()
    const setTableContainer = (side, element) => {
      if (side === 1) comparison.tableContainer1.value = element
      else comparison.tableContainer2.value = element
    }
    const recordFor = (row, side) => side === 1 ? row.dadger1 : row.dadger2
    const loadLevels = [
      { key: 'pesado', short: 'P', label: 'Patamar pesado' },
      { key: 'medio', short: 'M', label: 'Patamar médio' },
      { key: 'leve', short: 'L', label: 'Patamar leve' }
    ]

    return {
      ...comparison,
      filteredData,
      formatRange,
      loadLevels,
      recordFor,
      setTableContainer
    }
  }
}
</script>

<style scoped>

.re-block {
  margin: 8px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.restriction-comparison {
  grid-template-columns: repeat(2, minmax(560px, 1fr));
}

.restriction-table {
  table-layout: auto;
}

.restriction-table th {
  vertical-align: middle;
}

.restriction-table td {
  vertical-align: top;
}

.col-restricao,
.restriction-id {
  width: 86px;
  min-width: 86px;
}

.restriction-id {
  color: var(--accent);
  font-weight: 750;
  white-space: nowrap;
}

.col-periodo,
.period-cell {
  width: 108px;
  min-width: 108px;
}

.period-cell strong,
.period-cell span {
  display: block;
}

.period-cell strong {
  color: var(--text);
  font: 650 10px/1.35 var(--font-mono);
  white-space: nowrap;
}

.period-cell span {
  margin-top: 3px;
  color: var(--muted);
  font: 500 9px/1.3 var(--font-ui);
}

.col-limites,
.limits-cell {
  width: 150px;
  min-width: 150px;
}

.limits-grid {
  display: grid;
  grid-template-columns: 18px minmax(104px, 1fr);
  gap: 3px 7px;
  align-items: baseline;
  white-space: nowrap;
}

.level-label {
  color: var(--muted);
  font: 700 9px/1.4 var(--font-ui);
}

.limits-grid span:not(.level-label) {
  color: var(--text);
  font: 500 10px/1.4 var(--font-mono);
}

.col-fatores,
.factors-cell {
  min-width: 250px;
}

.table-container {
  max-height: min(64vh, 680px);
}

.empty-value {
  color: var(--muted);
}
</style>
