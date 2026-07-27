<template>
  <div class="pq-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      title="BLOCO PQ — PEQUENAS USINAS"
      @toggle="toggleCollapsed"
    />

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <!-- Tabela Dadger 1 -->
        <div class="table-side">
          <h4 class="table-title">{{ dadger1Name }}</h4>
          <div class="table-container" :ref="el => tableContainer1 = el" @scroll="onScroll1">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('estagio')" class="sortable" v-sortable-header>
                    {{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}
                  </th>
                  <th @click="sortBy('subsistema')" class="sortable" v-sortable-header>Sub{{ getSortIcon('subsistema') }}</th>
                  <th v-for="field in generationFields" :key="field.key" class="sortable" @click="sortBy(field.key)" v-sortable-header>
                    {{ field.label }}{{ getSortIcon(field.key) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d1-${row.key}`"
                  :class="{
                    'faded': row.onlyInOne && !row.sameTemporality,
                    'highlighted': row.onlyInOne && row.sameTemporality
                  }"
                >
                  <td class="col-stage">{{ row.dadger1?.display ?? '-' }}</td>
                  <td>{{ row.dadger1?.subsistema ?? '-' }}</td>
                  <td
                    v-for="field in generationFields"
                    :key="`d1-${row.key}-${field.key}`"
                    :class="{ diff: row[`diff_${field.key}`] && !row.onlyInOne }"
                    class="col-number"
                  >
                    {{ formatNumber(row.dadger1?.[field.key]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabela Dadger 2 -->
        <div class="table-side">
          <h4 class="table-title">{{ dadger2Name }}</h4>
          <div class="table-container" :ref="el => tableContainer2 = el" @scroll="onScroll2">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('estagio')" class="sortable" v-sortable-header>
                    {{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}
                  </th>
                  <th @click="sortBy('subsistema')" class="sortable" v-sortable-header>Sub{{ getSortIcon('subsistema') }}</th>
                  <th v-for="field in generationFields" :key="field.key" class="sortable" @click="sortBy(field.key)" v-sortable-header>
                    {{ field.label }}{{ getSortIcon(field.key) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d2-${row.key}`"
                  :class="{
                    'faded': row.onlyInOne && !row.sameTemporality,
                    'highlighted': row.onlyInOne && row.sameTemporality
                  }"
                >
                  <td class="col-stage">{{ row.dadger2?.display ?? '-' }}</td>
                  <td>{{ row.dadger2?.subsistema ?? '-' }}</td>
                  <td
                    v-for="field in generationFields"
                    :key="`d2-${row.key}-${field.key}`"
                    :class="{ diff: row[`diff_${field.key}`] && !row.onlyInOne }"
                    class="col-number"
                  >
                    {{ formatNumber(row.dadger2?.[field.key]) }}
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
import { alignByEstagio, alignByData, hasDiff } from '../../utils/comparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'

export default {
  name: 'PQBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    const generationFields = [
      { key: 'geracao_pesado', label: 'Pesada' },
      { key: 'geracao_medio', label: 'Média' },
      { key: 'geracao_leve', label: 'Leve' }
    ]
    // Computed: dados alinhados (lógica específica do bloco PQ)
    const alignedData = computed(() => {
      const registros1 = props.dadger1Data.PQ
      const registros2 = props.dadger2Data.PQ

      const transformFn = (reg1, reg2, onlyInOne, sameTemporality, primaryValue, subsistema) => {
        return {
          key: `${primaryValue}-${subsistema}`,
          onlyInOne,
          sameTemporality,
          dadger1: reg1 ? {
            display: props.compareMode === 'estagio' ? `Estágio ${reg1.estagio}` : primaryValue,
            subsistema: reg1.subsistema,
            geracao_pesado: reg1.geracao_pesado,
            geracao_medio: reg1.geracao_medio,
            geracao_leve: reg1.geracao_leve
          } : null,
          dadger2: reg2 ? {
            display: props.compareMode === 'estagio' ? `Estágio ${reg2.estagio}` : primaryValue,
            subsistema: reg2.subsistema,
            geracao_pesado: reg2.geracao_pesado,
            geracao_medio: reg2.geracao_medio,
            geracao_leve: reg2.geracao_leve
          } : null,
          diff_geracao_pesado: hasDiff(reg1?.geracao_pesado, reg2?.geracao_pesado),
          diff_geracao_medio: hasDiff(reg1?.geracao_medio, reg2?.geracao_medio),
          diff_geracao_leve: hasDiff(reg1?.geracao_leve, reg2?.geracao_leve)
        }
      }

      if (props.compareMode === 'estagio') {
        return alignByEstagio(
          registros1,
          registros2,
          props.dadger1Data.info_dadger,
          props.dadger2Data.info_dadger,
          'subsistema',
          transformFn
        )
      } else {
        return alignByData(
          registros1,
          registros2,
          props.dadger1Data,
          props.dadger2Data,
          'subsistema',
          transformFn
        )
      }
    })

    // Usar composable para lógica comum
    const {
      collapsed,
      tableContainer1,
      tableContainer2,
      toggleCollapsed,
      sortBy,
      getSortIcon,
      onScroll1,
      onScroll2,
      formatNumber,
      createFilteredData,
      hasDifferences
    } = useBlockComparison(props, alignedData)

    // Criar filteredData com os campos de diff específicos do bloco PQ
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
      generationFields,
      filteredData,
      hasDifferences
    }
  }
}
</script>

<style scoped>

.pq-block {
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

/* Alinhar coluna numérica à direita */
.data-table th:nth-child(3) {
  text-align: right;
}
</style>
