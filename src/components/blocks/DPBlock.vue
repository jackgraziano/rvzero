<template>
  <div class="dp-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name" :class="{ 'has-diff': hasDifferences }">BLOCO DP - DEMANDA POR PATAMAR</h3>
    </div>

    <div v-show="!collapsed" class="block-content">
      <!-- Debug invisível para forçar execução do computed -->
      <span style="display:none">{{ debugFilteredData }}</span>
      <div class="comparison-tables">
        <!-- Tabela Dadger 1 -->
        <div class="table-side">
          <h4 class="table-title">{{ dadger1Name }}</h4>
          <div class="table-container" :ref="el => tableContainer1 = el" @scroll="onScroll1">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('estagio')" class="sortable">
                    {{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}
                  </th>
                  <th @click="sortBy('subsistema')" class="sortable">Sub{{ getSortIcon('subsistema') }}</th>
                  <th @click="sortBy('carga_pesada')" class="sortable">Pesada{{ getSortIcon('carga_pesada') }}</th>
                  <th @click="sortBy('carga_media')" class="sortable">Média{{ getSortIcon('carga_media') }}</th>
                  <th @click="sortBy('carga_leve')" class="sortable">Leve{{ getSortIcon('carga_leve') }}</th>
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
                  <td class="col-stage">{{ row.dadger1?.display || '-' }}</td>
                  <td>{{ row.dadger1?.subsistema || '-' }}</td>
                  <td :class="{ 'diff': row.diff_pesada && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.carga_pesada) }}
                  </td>
                  <td :class="{ 'diff': row.diff_media && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.carga_media) }}
                  </td>
                  <td :class="{ 'diff': row.diff_leve && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.carga_leve) }}
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
                  <th @click="sortBy('estagio')" class="sortable">
                    {{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}
                  </th>
                  <th @click="sortBy('subsistema')" class="sortable">Sub{{ getSortIcon('subsistema') }}</th>
                  <th @click="sortBy('carga_pesada')" class="sortable">Pesada{{ getSortIcon('carga_pesada') }}</th>
                  <th @click="sortBy('carga_media')" class="sortable">Média{{ getSortIcon('carga_media') }}</th>
                  <th @click="sortBy('carga_leve')" class="sortable">Leve{{ getSortIcon('carga_leve') }}</th>
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
                  <td class="col-stage">{{ row.dadger2?.display || '-' }}</td>
                  <td>{{ row.dadger2?.subsistema || '-' }}</td>
                  <td :class="{ 'diff': row.diff_pesada && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.carga_pesada) }}
                  </td>
                  <td :class="{ 'diff': row.diff_media && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.carga_media) }}
                  </td>
                  <td :class="{ 'diff': row.diff_leve && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.carga_leve) }}
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
  name: 'DPBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    // Computed: dados alinhados (lógica específica do bloco DP)
    const alignedData = computed(() => {
      const registros1 = props.dadger1Data.DP
      const registros2 = props.dadger2Data.DP

      console.log('[DP alignedData] Computing with:', {
        registros1_count: registros1?.length || 0,
        registros2_count: registros2?.length || 0,
        compareMode: props.compareMode
      })

      const transformFn = (reg1, reg2, onlyInOne, sameTemporality, primaryValue, subsistema) => {
        const diff_pesada = hasDiff(reg1?.carga_pesada, reg2?.carga_pesada)
        const diff_media = hasDiff(reg1?.carga_media, reg2?.carga_media)
        const diff_leve = hasDiff(reg1?.carga_leve, reg2?.carga_leve)

        const row = {
          blockType: 'DP',  // Identificador
          key: `${primaryValue}-${subsistema}`,
          onlyInOne,
          sameTemporality,
          dadger1: reg1 ? {
            display: props.compareMode === 'estagio' ? `Estágio ${reg1.estagio}` : primaryValue,
            subsistema: reg1.subsistema,
            carga_pesada: reg1.carga_pesada,
            carga_media: reg1.carga_media,
            carga_leve: reg1.carga_leve
          } : null,
          dadger2: reg2 ? {
            display: props.compareMode === 'estagio' ? `Estágio ${reg2.estagio}` : primaryValue,
            subsistema: reg2.subsistema,
            carga_pesada: reg2.carga_pesada,
            carga_media: reg2.carga_media,
            carga_leve: reg2.carga_leve
          } : null,
          diff_pesada,
          diff_media,
          diff_leve
        }

        // Log apenas rows com diferença
        if ((diff_pesada || diff_media || diff_leve) && !onlyInOne) {
          console.log('[DP transformFn] Row with diff (both exist):', {
            key: row.key,
            diff_pesada,
            diff_media,
            diff_leve,
            carga1: reg1?.carga_pesada,
            carga2: reg2?.carga_pesada
          })
        }

        return row
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

    // Criar filteredData com os campos de diff específicos do bloco DP
    const filteredData = createFilteredData()

    // Debug: monitorar mudanças no filteredData
    const debugFilteredData = computed(() => {
      console.log('[DP filteredData] Count:', filteredData.value.length, 'showOnlyDifferences:', props.showOnlyDifferences)
      if (filteredData.value.length > 0 && filteredData.value.length <= 5) {
        console.log('[DP filteredData] Rows:', filteredData.value)
      }
    })

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
      filteredData,
      hasDifferences,
      debugFilteredData
    }
  }
}
</script>

<style scoped>
@import '../../styles/block-tables.css';

.dp-block {
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

/* Alinhar colunas numéricas à direita */
.data-table th:nth-child(n+3) {
  text-align: right;
}
</style>
