<template>
  <div class="ti-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name" :class="{ 'has-diff': hasDifferences }">BLOCO TI - VAZÃO DESVIADA</h3>
    </div>

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <!-- Tabela Dadger 1 -->
        <div class="table-side">
          <h4 class="table-title">{{ dadger1Name }}</h4>
          <div class="table-container" :ref="el => tableContainer1 = el" @scroll="onScroll1">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('numero_usina')" class="sortable">Nº Usina{{ getSortIcon('numero_usina') }}</th>
                  <th
                    v-for="col in colunasTempo"
                    :key="`col1-${col.key}`"
                    @click="sortBy(col.key)"
                    class="sortable"
                  >
                    {{ col.label }}{{ getSortIcon(col.key) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d1-${row.key}`"
                  :class="{ 'highlighted': row.onlyInOne }"
                >
                  <td class="col-usina">{{ row.numero_usina }}</td>
                  <td
                    v-for="col in colunasTempo"
                    :key="`v1-${col.key}`"
                    :class="{
                      'diff': row.valores[col.key]?.diff && row.valores[col.key]?.sameTemporality && !row.onlyInOne,
                      'faded': !row.valores[col.key]?.sameTemporality && !row.onlyInOne
                    }"
                    class="col-number"
                  >
                    {{ formatNumber(row.valores[col.key]?.valor1) }}
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
                  <th @click="sortBy('numero_usina')" class="sortable">Nº Usina{{ getSortIcon('numero_usina') }}</th>
                  <th
                    v-for="col in colunasTempo"
                    :key="`col2-${col.key}`"
                    @click="sortBy(col.key)"
                    class="sortable"
                  >
                    {{ col.label }}{{ getSortIcon(col.key) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d2-${row.key}`"
                  :class="{ 'highlighted': row.onlyInOne }"
                >
                  <td class="col-usina">{{ row.numero_usina }}</td>
                  <td
                    v-for="col in colunasTempo"
                    :key="`v2-${col.key}`"
                    :class="{
                      'diff': row.valores[col.key]?.diff && row.valores[col.key]?.sameTemporality && !row.onlyInOne,
                      'faded': !row.valores[col.key]?.sameTemporality && !row.onlyInOne
                    }"
                    class="col-number"
                  >
                    {{ formatNumber(row.valores[col.key]?.valor2) }}
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
  name: 'TIBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    // Usar composable de comparação temporal
    const { colunasTempo, alignedData } = useTemporalComparison(
      props,
      'TI',  // blockKey
      'vazoes',  // valueField
      r => r.numero_usina,  // getEntityKey
      (registros, key) => registros.find(r => r.numero_usina === key)  // findEntity
    )

    // Adicionar numero_usina a cada row para exibição
    const alignedDataWithUsina = computed(() => {
      return alignedData.value.map(row => ({
        ...row,
        numero_usina: row.dadger1?.numero_usina || row.dadger2?.numero_usina
      }))
    })

    // Usar composable de comparação base (collapse, sort, scroll, filter)
    const {
      collapsed,
      tableContainer1,
      tableContainer2,
      toggleCollapsed,
      sortBy,
      getSortIcon,
      onScroll1,
      onScroll2,
      sortedData,
      createFilteredData,
      hasDifferences
    } = useBlockComparison(props, alignedDataWithUsina)

    // Criar dados filtrados
    const filteredData = createFilteredData([])

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
      colunasTempo,
      filteredData,
      hasDifferences
    }
  }
}
</script>

<style scoped>
@import '../../styles/block-tables.css';

.ti-block {
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
  user-select: none;
  border-bottom: 1px solid #00ff00;
}

.block-header:hover {
  background: #3d3d3d;
}

.block-icon {
  color: #00ff00;
  font-size: 12px;
  font-family: monospace;
}

.block-name {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.block-content {
  background: #1e1e1e;
}

.comparison-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: #ffffff;
  overflow: hidden;
}

.table-side {
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-title {
  padding: 8px 12px;
  background: #2d2d2d;
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #00ff00;
  border-bottom: 1px solid #00ff00;
  font-family: 'Courier New', monospace;
}

.table-container {
  max-height: 500px;
  overflow: auto;
  background: #1e1e1e;
}

.col-usina {
  font-weight: 700;
  color: #00ff00;
}

/* Alinhar colunas numéricas à direita */
.data-table th:nth-child(n+2) {
  text-align: right;
}
</style>
