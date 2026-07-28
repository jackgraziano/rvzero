<template>
  <div class="ia-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      title="BLOCO IA — INTERCÂMBIO ENTRE SUBSISTEMAS"
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
                  <th class="sortable" v-sortable-header @click="sortBy('estagio')">
                    {{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}
                  </th>
                  <th class="sortable" v-sortable-header @click="sortBy('subsistema_de')">
                    De{{ getSortIcon('subsistema_de') }}
                  </th>
                  <th class="sortable" v-sortable-header @click="sortBy('subsistema_para')">
                    Para{{ getSortIcon('subsistema_para') }}
                  </th>
                  <th class="sortable" v-sortable-header @click="sortBy('flag_penalidade')">
                    Flag{{ getSortIcon('flag_penalidade') }}
                  </th>
                  <th v-for="patamar in numberOfLoadLevels" :key="patamar" colspan="2">
                    P{{ patamar }}
                  </th>
                </tr>
                <tr>
                  <th colspan="4"></th>
                  <template v-for="patamar in numberOfLoadLevels" :key="`directions-${patamar}`">
                    <th>→</th>
                    <th>←</th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`${side}-${row.key}`"
                  :class="{
                    faded: row.onlyInOne && !row.sameTemporality,
                    highlighted: row.onlyInOne && row.sameTemporality
                  }"
                >
                  <td>{{ recordFor(row, side)?.display ?? '-' }}</td>
                  <td>{{ recordFor(row, side)?.subsistema_de ?? '-' }}</td>
                  <td>{{ recordFor(row, side)?.subsistema_para ?? '-' }}</td>
                  <td :class="{ diff: row.flagDifference && !row.onlyInOne }">
                    {{ recordFor(row, side)?.flag_penalidade ?? '-' }}
                  </td>
                  <template
                    v-for="(capacity, index) in capacitiesFor(row, side)"
                    :key="`${side}-${row.key}-${index}`"
                  >
                    <td
                      class="col-number"
                      :class="{ diff: row.capacityDifferences[index]?.de_para && !row.onlyInOne }"
                    >
                      {{ formatNumber(capacity?.de_para) }}
                    </td>
                    <td
                      class="col-number"
                      :class="{ diff: row.capacityDifferences[index]?.para_de && !row.onlyInOne }"
                    >
                      {{ formatNumber(capacity?.para_de) }}
                    </td>
                  </template>
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
import {
  alignByData,
  alignByEstagio,
  hasDiff
} from '../../utils/comparison.js'
import { recordRowsFromOccurrences } from '../../utils/reportPresentation.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'

export default {
  name: 'IABlock',
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
    const numberOfLoadLevels = computed(() => Math.max(
      props.dadger1Data.info_dadger?.numero_patamares ?? 0,
      props.dadger2Data.info_dadger?.numero_patamares ?? 0
    ))
    const interchangeKey = record =>
      `${record.subsistema_de}\u0000${record.subsistema_para}`
    const alignedData = computed(() => {
      if (Array.isArray(props.occurrences)) {
        return recordRowsFromOccurrences(props.occurrences, {
          mode: props.compareMode
        }).map(row => {
          const capacities1 = row.dadger1?.capacidades ?? []
          const capacities2 = row.dadger2?.capacidades ?? []
          return {
            ...row,
            capacityDifferences: Array.from(
              { length: numberOfLoadLevels.value },
              (_, index) => ({
                de_para: hasDiff(
                  capacities1[index]?.de_para,
                  capacities2[index]?.de_para
                ),
                para_de: hasDiff(
                  capacities1[index]?.para_de,
                  capacities2[index]?.para_de
                )
              })
            ),
            flagDifference: row.diff_flag_penalidade
          }
        })
      }

      const transform = (
        record1,
        record2,
        onlyInOne,
        sameTemporality,
        time,
        interchange
      ) => {
        const capacities1 = record1?.capacidades ?? []
        const capacities2 = record2?.capacidades ?? []
        const capacityDifferences = Array.from(
          { length: numberOfLoadLevels.value },
          (_, index) => ({
            de_para: hasDiff(capacities1[index]?.de_para, capacities2[index]?.de_para),
            para_de: hasDiff(capacities1[index]?.para_de, capacities2[index]?.para_de)
          })
        )
        const flagDifference = hasDiff(
          record1?.flag_penalidade,
          record2?.flag_penalidade
        )
        const hasValueDifference = flagDifference ||
          capacityDifferences.some(diff => diff.de_para || diff.para_de)
        const display = props.compareMode === 'data' ? time : `Estágio ${time}`

        return {
          key: `${time}-${interchange}`,
          onlyInOne,
          sameTemporality,
          has_diff: sameTemporality && (onlyInOne || hasValueDifference),
          dadger1: record1 ? { ...record1, display } : null,
          dadger2: record2 ? { ...record2, display } : null,
          capacityDifferences,
          flagDifference
        }
      }
      const args = [
        props.dadger1Data.IA ?? [],
        props.dadger2Data.IA ?? []
      ]

      return props.compareMode === 'data'
        ? alignByData(
          ...args,
          props.dadger1Data,
          props.dadger2Data,
          interchangeKey,
          transform
        )
        : alignByEstagio(
          ...args,
          props.dadger1Data.info_dadger,
          props.dadger2Data.info_dadger,
          interchangeKey,
          transform
        )
    })
    const comparison = useBlockComparison(props, alignedData)
    const filteredData = comparison.createFilteredData()
    const setTableContainer = (side, element) => {
      if (side === 1) comparison.tableContainer1.value = element
      else comparison.tableContainer2.value = element
    }
    const recordFor = (row, side) => side === 1 ? row.dadger1 : row.dadger2
    const capacitiesFor = (row, side) => Array.from(
      { length: numberOfLoadLevels.value },
      (_, index) => recordFor(row, side)?.capacidades?.[index] ?? null
    )

    return {
      ...comparison,
      filteredData,
      numberOfLoadLevels,
      setTableContainer,
      recordFor,
      capacitiesFor
    }
  }
}
</script>

<style scoped>

.ia-block {
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
