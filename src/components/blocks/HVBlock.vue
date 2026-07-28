<template>
  <div class="hv-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      title="BLOCO HV — RESTRIÇÕES DE ARMAZENAMENTO"
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
                  <th @click="sortBy('numero_restricao')" class="sortable" v-sortable-header>Nº Restr{{ getSortIcon('numero_restricao') }}</th>
                  <th
                    v-for="col in colunasTempo"
                    :key="`col1-${col.key}`"
                    @click="sortBy(col.key)"
                    class="sortable col-temporal"
                   v-sortable-header>
                    {{ col.label }}{{ getSortIcon(col.key) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d1-${row.key}`"
                >
                  <td class="col-restricao" :class="{ highlighted: row.onlyInOne }">{{ row.numero_restricao }}</td>
                  <td
                    v-for="col in colunasTempo"
                    :key="`v1-${col.key}`"
                    :class="{
                      'diff': row.valores[col.key]?.diff && row.valores[col.key]?.sameTemporality && !row.onlyInOne,
                      'highlighted': row.valores[col.key]?.dataExisteEmAmbos && !row.valores[col.key]?.sameTemporality,
                      'faded': !row.valores[col.key]?.dataExisteEmAmbos
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
                        <RestrictionCoefficients :coefficients="row.valores[col.key].valor1.coeficientes" />
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
                  <th @click="sortBy('numero_restricao')" class="sortable" v-sortable-header>Nº Restr{{ getSortIcon('numero_restricao') }}</th>
                  <th
                    v-for="col in colunasTempo"
                    :key="`col2-${col.key}`"
                    @click="sortBy(col.key)"
                    class="sortable col-temporal"
                   v-sortable-header>
                    {{ col.label }}{{ getSortIcon(col.key) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d2-${row.key}`"
                >
                  <td class="col-restricao" :class="{ highlighted: row.onlyInOne }">{{ row.numero_restricao }}</td>
                  <td
                    v-for="col in colunasTempo"
                    :key="`v2-${col.key}`"
                    :class="{
                      'diff': row.valores[col.key]?.diff && row.valores[col.key]?.sameTemporality && !row.onlyInOne,
                      'highlighted': row.valores[col.key]?.dataExisteEmAmbos && !row.valores[col.key]?.sameTemporality,
                      'faded': !row.valores[col.key]?.dataExisteEmAmbos
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
                        <RestrictionCoefficients :coefficients="row.valores[col.key].valor2.coeficientes" />
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
import { formatLimite, semanticEqual } from '../../utils/comparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'
import { useEntityTemporalComparison } from '../../composables/useEntityTemporalComparison.js'
import RestrictionCoefficients from '../RestrictionCoefficients.vue'

export default {
  name: 'HVBlock',
  components: { RestrictionCoefficients },
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
    // Função para extrair valor completo da restrição
    const getEntityValue = (registro) => {
      if (!registro) return null
      return {
        limites: registro.limites,
        coeficientes: registro.coeficientes
      }
    }

    // Função para comparar restrições completas
    const compareValues = (val1, val2) => !semanticEqual(val1, val2)

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
      createFilteredData,
      hasDifferences
    } = useBlockComparison(props, alignedData)

    // Criar filteredData com campo de diferença
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
      formatLimite,
      colunasTempo,
      filteredData,
      hasDifferences
    }
  }
}
</script>

<style scoped>

.hv-block {
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

.col-restricao {
  font-weight: 700;
  color: var(--accent);
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
  color: var(--accent);
}

.limite-row {
  font-family: var(--font-mono);
  color: var(--muted);
  height: 14px;
}

.coeficientes-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 20px;
}

</style>
