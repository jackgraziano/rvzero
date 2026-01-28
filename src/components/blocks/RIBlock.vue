<template>
  <div class="ri-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name" :class="{ 'has-diff': hasDifferences }">BLOCO RI - RESTRIÇÕES DE ITAIPU</h3>
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
                  <th @click="sortBy('estagio')" class="sortable col-stage">{{ colunaTempo }}{{ getSortIcon('estagio') }}</th>
                  <th @click="sortBy('usina')" class="sortable">Usina{{ getSortIcon('usina') }}</th>
                  <th @click="sortBy('subsistema')" class="sortable">Subsist{{ getSortIcon('subsistema') }}</th>
                  <th class="col-values">Pesado</th>
                  <th class="col-values">Médio</th>
                  <th class="col-values">Leve</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d1-${row.key}`"
                  :class="{
                    'highlighted': row.onlyInOne && row.sameTemporality,
                    'faded': row.onlyInOne && !row.sameTemporality
                  }"
                >
                  <td class="col-stage">{{ row.display }}</td>
                  <td>{{ row.dadger1?.usina ?? '-' }}</td>
                  <td>{{ row.dadger1?.subsistema ?? '-' }}</td>
                  <td :class="{ 'diff': row.pesado_diff && !row.onlyInOne }" class="col-values">
                    <div v-if="row.dadger1?.pesado" class="patamar-values">
                      <div class="value-line">60Hz: {{ formatRange(row.dadger1.pesado.p60_min, row.dadger1.pesado.p60_max) }}</div>
                      <div class="value-line">50Hz: {{ formatRange(row.dadger1.pesado.p50_min, row.dadger1.pesado.p50_max) }}</div>
                      <div class="value-line">Ande: {{ formatNumber(row.dadger1.pesado.carga_ande) }}</div>
                    </div>
                    <div v-else class="patamar-values patamar-empty">
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
                    </div>
                  </td>
                  <td :class="{ 'diff': row.medio_diff && !row.onlyInOne }" class="col-values">
                    <div v-if="row.dadger1?.medio" class="patamar-values">
                      <div class="value-line">60Hz: {{ formatRange(row.dadger1.medio.p60_min, row.dadger1.medio.p60_max) }}</div>
                      <div class="value-line">50Hz: {{ formatRange(row.dadger1.medio.p50_min, row.dadger1.medio.p50_max) }}</div>
                      <div class="value-line">Ande: {{ formatNumber(row.dadger1.medio.carga_ande) }}</div>
                    </div>
                    <div v-else class="patamar-values patamar-empty">
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
                    </div>
                  </td>
                  <td :class="{ 'diff': row.leve_diff && !row.onlyInOne }" class="col-values">
                    <div v-if="row.dadger1?.leve" class="patamar-values">
                      <div class="value-line">60Hz: {{ formatRange(row.dadger1.leve.p60_min, row.dadger1.leve.p60_max) }}</div>
                      <div class="value-line">50Hz: {{ formatRange(row.dadger1.leve.p50_min, row.dadger1.leve.p50_max) }}</div>
                      <div class="value-line">Ande: {{ formatNumber(row.dadger1.leve.carga_ande) }}</div>
                    </div>
                    <div v-else class="patamar-values patamar-empty">
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
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
                  <th @click="sortBy('estagio')" class="sortable col-stage">{{ colunaTempo }}{{ getSortIcon('estagio') }}</th>
                  <th @click="sortBy('usina')" class="sortable">Usina{{ getSortIcon('usina') }}</th>
                  <th @click="sortBy('subsistema')" class="sortable">Subsist{{ getSortIcon('subsistema') }}</th>
                  <th class="col-values">Pesado</th>
                  <th class="col-values">Médio</th>
                  <th class="col-values">Leve</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d2-${row.key}`"
                  :class="{
                    'highlighted': row.onlyInOne && row.sameTemporality,
                    'faded': row.onlyInOne && !row.sameTemporality
                  }"
                >
                  <td class="col-stage">{{ row.display }}</td>
                  <td>{{ row.dadger2?.usina ?? '-' }}</td>
                  <td>{{ row.dadger2?.subsistema ?? '-' }}</td>
                  <td :class="{ 'diff': row.pesado_diff && !row.onlyInOne }" class="col-values">
                    <div v-if="row.dadger2?.pesado" class="patamar-values">
                      <div class="value-line">60Hz: {{ formatRange(row.dadger2.pesado.p60_min, row.dadger2.pesado.p60_max) }}</div>
                      <div class="value-line">50Hz: {{ formatRange(row.dadger2.pesado.p50_min, row.dadger2.pesado.p50_max) }}</div>
                      <div class="value-line">Ande: {{ formatNumber(row.dadger2.pesado.carga_ande) }}</div>
                    </div>
                    <div v-else class="patamar-values patamar-empty">
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
                    </div>
                  </td>
                  <td :class="{ 'diff': row.medio_diff && !row.onlyInOne }" class="col-values">
                    <div v-if="row.dadger2?.medio" class="patamar-values">
                      <div class="value-line">60Hz: {{ formatRange(row.dadger2.medio.p60_min, row.dadger2.medio.p60_max) }}</div>
                      <div class="value-line">50Hz: {{ formatRange(row.dadger2.medio.p50_min, row.dadger2.medio.p50_max) }}</div>
                      <div class="value-line">Ande: {{ formatNumber(row.dadger2.medio.carga_ande) }}</div>
                    </div>
                    <div v-else class="patamar-values patamar-empty">
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
                    </div>
                  </td>
                  <td :class="{ 'diff': row.leve_diff && !row.onlyInOne }" class="col-values">
                    <div v-if="row.dadger2?.leve" class="patamar-values">
                      <div class="value-line">60Hz: {{ formatRange(row.dadger2.leve.p60_min, row.dadger2.leve.p60_max) }}</div>
                      <div class="value-line">50Hz: {{ formatRange(row.dadger2.leve.p50_min, row.dadger2.leve.p50_max) }}</div>
                      <div class="value-line">Ande: {{ formatNumber(row.dadger2.leve.carga_ande) }}</div>
                    </div>
                    <div v-else class="patamar-values patamar-empty">
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
                      <div class="value-line">-</div>
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
import { computed } from 'vue'
import { hasDiff, formatNumber, alignByEstagio, alignByData } from '../../utils/comparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'

export default {
  name: 'RIBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    // Coluna de tempo baseada no modo de comparação
    const colunaTempo = computed(() => {
      return props.compareMode === 'data' ? 'Data' : 'Estágio'
    })

    // Função para comparar um patamar
    const comparaPatamar = (p1, p2) => {
      if (!p1 && !p2) return false
      if (!p1 || !p2) return true
      return hasDiff(p1.p60_min, p2.p60_min) ||
             hasDiff(p1.p60_max, p2.p60_max) ||
             hasDiff(p1.p50_min, p2.p50_min) ||
             hasDiff(p1.p50_max, p2.p50_max) ||
             hasDiff(p1.carga_ande, p2.carga_ande)
    }

    // Função de transformação para alinhar registros
    const transformFn = (reg1, reg2, onlyInOne, sameTemporality, primaryValue, secondaryValue) => {
      const display = props.compareMode === 'data' ? primaryValue : `Estágio ${primaryValue}`

      return {
        key: `${primaryValue}-${secondaryValue}`,
        estagio: props.compareMode === 'data'
          ? (reg1?.estagio || reg2?.estagio)
          : primaryValue,
        display,
        dadger1: reg1,
        dadger2: reg2,
        onlyInOne,
        sameTemporality
      }
    }

    // Alinhar dados por estágio ou data
    const alignedData = computed(() => {
      const registros1 = props.dadger1Data.RI || []
      const registros2 = props.dadger2Data.RI || []

      let aligned
      if (props.compareMode === 'data') {
        aligned = alignByData(
          registros1,
          registros2,
          props.dadger1Data,
          props.dadger2Data,
          'usina',  // secondaryKey - agrupa por usina (sempre Itaipu, mas necessário)
          transformFn
        )
      } else {
        aligned = alignByEstagio(
          registros1,
          registros2,
          props.dadger1Data,
          props.dadger2Data,
          'usina',  // secondaryKey - agrupa por usina
          transformFn
        )
      }

      // Adicionar campos de diferença por patamar
      return aligned.map(row => ({
        ...row,
        pesado_diff: comparaPatamar(row.dadger1?.pesado, row.dadger2?.pesado),
        medio_diff: comparaPatamar(row.dadger1?.medio, row.dadger2?.medio),
        leve_diff: comparaPatamar(row.dadger1?.leve, row.dadger2?.leve)
      }))
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
      createFilteredData,
      hasDifferences
    } = useBlockComparison(props, alignedData)

    // Criar filteredData com campos de diferença
    const filteredData = createFilteredData(['pesado_diff', 'medio_diff', 'leve_diff'])

    const formatRange = (min, max) => {
      if (min === null && max === null) return '-'
      const minStr = min !== null ? formatNumber(min) : '-'
      const maxStr = max !== null ? formatNumber(max) : '-'
      return `${minStr} - ${maxStr}`
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
      colunaTempo,
      filteredData,
      formatNumber,
      formatRange,
      hasDifferences
    }
  }
}
</script>

<style scoped>
@import '../../styles/block-tables.css';

.ri-block {
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

.col-stage {
  min-width: 100px;
}

.col-values {
  min-width: 150px;
  font-size: 10px;
  padding: 4px 8px;
}

.patamar-values {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.patamar-empty {
  opacity: 0.3;
}

.value-line {
  font-family: 'Courier New', monospace;
  color: #cccccc;
  white-space: nowrap;
}
</style>
