<template>
  <div class="hv-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name">BLOCO HV - RESTRIÇÕES DE ARMAZENAMENTO</h3>
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
                  <th @click="sortBy('numero_restricao')" class="sortable">Nº Restr{{ getSortIcon('numero_restricao') }}</th>
                  <th
                    v-for="col in colunasTempo"
                    :key="`col1-${col.key}`"
                    @click="sortBy(col.key)"
                    class="sortable col-temporal"
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
                  <td class="col-restricao">{{ row.numero_restricao }}</td>
                  <td
                    v-for="col in colunasTempo"
                    :key="`v1-${col.key}`"
                    :class="{
                      'diff': row.valores[col.key]?.diff && row.valores[col.key]?.sameTemporality && !row.onlyInOne,
                      'highlighted': row.valores[col.key]?.dataExisteEmAmbos && !row.valores[col.key]?.sameTemporality,
                      'faded': !row.valores[col.key]?.dataExisteEmAmbos && !row.valores[col.key]?.sameTemporality && !row.onlyInOne
                    }"
                    class="col-temporal"
                  >
                    <div v-if="row.valores[col.key]?.valor1" class="restricao-details">
                      <div class="limites-section" v-if="row.valores[col.key].valor1.limites">
                        <strong>Limites (hm³):</strong>
                        <div class="limite-row">Inf: {{ formatLimite(row.valores[col.key].valor1.limites.limite_inferior) }}</div>
                        <div class="limite-row">Sup: {{ formatLimite(row.valores[col.key].valor1.limites.limite_superior) }}</div>
                      </div>
                      <div class="coeficientes-section">
                        <div v-if="row.valores[col.key].valor1.coeficientes?.length" class="coef-count">Coef: {{ row.valores[col.key].valor1.coeficientes.length }}</div>
                      </div>
                    </div>
                    <div v-else class="restricao-details restricao-empty">
                      <div class="limites-section">
                        <strong>Limites (hm³):</strong>
                        <div class="limite-row">-</div>
                        <div class="limite-row">-</div>
                      </div>
                      <div class="coeficientes-section">
                        <span>-</span>
                      </div>
                    </div>
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
                  <th @click="sortBy('numero_restricao')" class="sortable">Nº Restr{{ getSortIcon('numero_restricao') }}</th>
                  <th
                    v-for="col in colunasTempo"
                    :key="`col2-${col.key}`"
                    @click="sortBy(col.key)"
                    class="sortable col-temporal"
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
                  <td class="col-restricao">{{ row.numero_restricao }}</td>
                  <td
                    v-for="col in colunasTempo"
                    :key="`v2-${col.key}`"
                    :class="{
                      'diff': row.valores[col.key]?.diff && row.valores[col.key]?.sameTemporality && !row.onlyInOne,
                      'highlighted': row.valores[col.key]?.dataExisteEmAmbos && !row.valores[col.key]?.sameTemporality,
                      'faded': !row.valores[col.key]?.dataExisteEmAmbos && !row.valores[col.key]?.sameTemporality && !row.onlyInOne
                    }"
                    class="col-temporal"
                  >
                    <div v-if="row.valores[col.key]?.valor2" class="restricao-details">
                      <div class="limites-section" v-if="row.valores[col.key].valor2.limites">
                        <strong>Limites (hm³):</strong>
                        <div class="limite-row">Inf: {{ formatLimite(row.valores[col.key].valor2.limites.limite_inferior) }}</div>
                        <div class="limite-row">Sup: {{ formatLimite(row.valores[col.key].valor2.limites.limite_superior) }}</div>
                      </div>
                      <div class="coeficientes-section">
                        <div v-if="row.valores[col.key].valor2.coeficientes?.length" class="coef-count">Coef: {{ row.valores[col.key].valor2.coeficientes.length }}</div>
                      </div>
                    </div>
                    <div v-else class="restricao-details restricao-empty">
                      <div class="limites-section">
                        <strong>Limites (hm³):</strong>
                        <div class="limite-row">-</div>
                        <div class="limite-row">-</div>
                      </div>
                      <div class="coeficientes-section">
                        <span>-</span>
                      </div>
                    </div>
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
import { formatNumber } from '../../utils/comparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'
import { useEntityTemporalComparison } from '../../composables/useEntityTemporalComparison.js'

export default {
  name: 'HVBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    // Função para extrair valor completo da restrição
    const getEntityValue = (registro) => {
      if (!registro) return null
      return {
        limites: registro.limites,
        coeficientes: registro.coeficientes
      }
    }

    // Função para comparar restrições completas
    const compareValues = (val1, val2) => {
      if (!val1 && !val2) return false
      if (!val1 || !val2) return true

      // Comparar limites
      const lim1 = val1.limites
      const lim2 = val2.limites

      if (lim1 && lim2) {
        if (lim1.limite_inferior !== lim2.limite_inferior) return true
        if (lim1.limite_superior !== lim2.limite_superior) return true
      } else if (lim1 || lim2) {
        return true
      }

      // Comparar quantidade de coeficientes
      if ((val1.coeficientes?.length || 0) !== (val2.coeficientes?.length || 0)) return true

      return false
    }

    // Usar composable de comparação entidade × tempo
    const { colunasTempo, alignedData } = useEntityTemporalComparison(
      props,
      'HV',                  // blockKey
      'numero_restricao',    // entityKey
      getEntityValue,        // função para extrair valor
      compareValues          // função para comparar valores
    )

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
      createFilteredData
    } = useBlockComparison(props, alignedData)

    // Criar filteredData com campo de diferença
    const filteredData = createFilteredData(['has_diff'])

    const formatLimite = (value) => {
      if (value === null || value === undefined) return '-'
      return formatNumber(value)
    }

    return {
      collapsed,
      tableContainer1,
      tableContainer2,
      toggleCollapsed,
      sortBy,
      getSortIcon,
      onScroll1,
      onScroll2,
      formatLimite,
      colunasTempo,
      filteredData
    }
  }
}
</script>

<style scoped>
@import '../../styles/block-tables.css';

.hv-block {
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

.col-restricao {
  font-weight: 700;
  color: #00ff00;
  min-width: 80px;
}

.col-temporal {
  min-width: 120px;
  max-width: 180px;
}

.restricao-details {
  font-size: 10px;
  line-height: 1.4;
  min-height: 65px;
  display: flex;
  flex-direction: column;
}

.restricao-empty {
  opacity: 0.3;
}

.limites-section {
  margin-bottom: 4px;
  min-height: 42px;
}

.limites-section strong {
  display: block;
  margin-bottom: 2px;
  color: #00ff00;
}

.limite-row {
  font-family: 'Courier New', monospace;
  color: #cccccc;
  height: 14px;
}

.coeficientes-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 20px;
}

.coef-count {
  font-family: 'Courier New', monospace;
  color: #00ccff;
  font-size: 9px;
}
</style>
