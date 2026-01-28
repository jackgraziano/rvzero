<template>
  <div class="he-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name" :class="{ 'has-diff': hasDifferences }">BLOCO HE - VMINOP (ENERGIA ARMAZENADA)</h3>
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
                  <th @click="sortBy('numero_restricao')" class="sortable">Nº Restr{{ getSortIcon('numero_restricao') }}</th>
                  <th>Tipo Limite</th>
                  <th class="col-number">Lim Inf</th>
                  <th class="col-number">Penalidade</th>
                  <th>Coeficientes</th>
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
                  <td>{{ row.dadger1?.numero_restricao ?? '-' }}</td>
                  <td>{{ formatTipoLimite(row.dadger1?.tipo_limite) }}</td>
                  <td :class="{ 'diff': row.limite_diff && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.limite_inferior) }}
                  </td>
                  <td :class="{ 'diff': row.penalidade_diff && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.penalidade) }}
                  </td>
                  <td :class="{ 'diff': row.coeficientes_diff && !row.onlyInOne }">
                    <div v-if="row.dadger1?.coeficientes?.length" class="coef-list">
                      <span v-for="(coef, idx) in row.dadger1.coeficientes" :key="idx" class="coef-item">
                        REE{{ coef.ree }}: {{ formatNumber(coef.coeficiente) }}
                      </span>
                    </div>
                    <span v-else>-</span>
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
                  <th @click="sortBy('numero_restricao')" class="sortable">Nº Restr{{ getSortIcon('numero_restricao') }}</th>
                  <th>Tipo Limite</th>
                  <th class="col-number">Lim Inf</th>
                  <th class="col-number">Penalidade</th>
                  <th>Coeficientes</th>
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
                  <td>{{ row.dadger2?.numero_restricao ?? '-' }}</td>
                  <td>{{ formatTipoLimite(row.dadger2?.tipo_limite) }}</td>
                  <td :class="{ 'diff': row.limite_diff && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.limite_inferior) }}
                  </td>
                  <td :class="{ 'diff': row.penalidade_diff && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.penalidade) }}
                  </td>
                  <td :class="{ 'diff': row.coeficientes_diff && !row.onlyInOne }">
                    <div v-if="row.dadger2?.coeficientes?.length" class="coef-list">
                      <span v-for="(coef, idx) in row.dadger2.coeficientes" :key="idx" class="coef-item">
                        REE{{ coef.ree }}: {{ formatNumber(coef.coeficiente) }}
                      </span>
                    </div>
                    <span v-else>-</span>
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
  name: 'HEBlock',
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

    // Função para comparar coeficientes
    const comparaCoeficientes = (coefs1, coefs2) => {
      if (!coefs1 && !coefs2) return false
      if (!coefs1 || !coefs2) return true
      if (coefs1.length !== coefs2.length) return true

      // Comparar cada coeficiente
      for (let i = 0; i < coefs1.length; i++) {
        const c1 = coefs1[i]
        const c2 = coefs2.find(c => c.ree === c1.ree)
        if (!c2 || hasDiff(c1.coeficiente, c2.coeficiente)) {
          return true
        }
      }
      return false
    }

    // Função de transformação para alinhar registros
    const transformFn = (reg1, reg2, onlyInOne, sameTemporality, primaryValue, secondaryValue) => {
      const display = props.compareMode === 'data' ? primaryValue : `Estágio ${primaryValue}`

      return {
        key: `${primaryValue}-${secondaryValue}`,
        estagio: props.compareMode === 'data'
          ? (reg1?.estagio || reg2?.estagio)
          : primaryValue,
        numero_restricao: secondaryValue,
        display,
        dadger1: reg1,
        dadger2: reg2,
        onlyInOne,
        sameTemporality
      }
    }

    // Alinhar dados por estágio ou data
    const alignedData = computed(() => {
      const registros1 = props.dadger1Data.HE || []
      const registros2 = props.dadger2Data.HE || []

      let aligned
      if (props.compareMode === 'data') {
        aligned = alignByData(
          registros1,
          registros2,
          props.dadger1Data,
          props.dadger2Data,
          'numero_restricao',
          transformFn
        )
      } else {
        aligned = alignByEstagio(
          registros1,
          registros2,
          props.dadger1Data,
          props.dadger2Data,
          'numero_restricao',
          transformFn
        )
      }

      // Adicionar campos de diferença
      return aligned.map(row => ({
        ...row,
        limite_diff: hasDiff(row.dadger1?.limite_inferior, row.dadger2?.limite_inferior),
        penalidade_diff: hasDiff(row.dadger1?.penalidade, row.dadger2?.penalidade),
        coeficientes_diff: comparaCoeficientes(row.dadger1?.coeficientes, row.dadger2?.coeficientes)
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
    const filteredData = createFilteredData()

    const formatTipoLimite = (tipo) => {
      if (tipo === null || tipo === undefined) return '-'
      return tipo === 1 ? 'Absoluto' : tipo === 2 ? 'Percentual' : String(tipo)
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
      formatTipoLimite,
      hasDifferences
    }
  }
}
</script>

<style scoped>
@import '../../styles/block-tables.css';

.he-block {
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

.coef-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 10px;
}

.coef-item {
  font-family: 'Courier New', monospace;
  color: #00ccff;
  white-space: nowrap;
}
</style>
