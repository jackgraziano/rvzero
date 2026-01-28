<template>
  <div class="ct-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name" :class="{ 'has-diff': hasDifferences }">BLOCO CT - USINAS TÉRMICAS</h3>
    </div>

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <!-- Tabela Dadger 1 -->
        <div class="table-side">
          <h4 class="table-title">{{ dadger1Name }}</h4>
          <div class="table-container" :ref="el => tableContainer1 = el" @scroll="onScroll1">
            <table class="data-table">
              <thead>
                <tr class="header-row-1">
                  <th rowspan="2" @click="sortBy('estagio')" class="sortable">
                    {{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}
                  </th>
                  <th rowspan="2" @click="sortBy('codigo_usina')" class="sortable">Cód{{ getSortIcon('codigo_usina') }}</th>
                  <th rowspan="2" @click="sortBy('nome_termica')" class="sortable">Nome{{ getSortIcon('nome_termica') }}</th>
                  <th rowspan="2" @click="sortBy('subsistema')" class="sortable">Sub{{ getSortIcon('subsistema') }}</th>
                  <th colspan="3" class="patamar-header patamar-pesado">Pesado</th>
                  <th colspan="3" class="patamar-header patamar-medio">Médio</th>
                  <th colspan="3" class="patamar-header patamar-leve">Leve</th>
                </tr>
                <tr class="header-row-2">
                  <th @click="sortBy('disp_pesado')" class="sortable col-pesado">Disp{{ getSortIcon('disp_pesado') }}</th>
                  <th @click="sortBy('inflex_pesado')" class="sortable col-pesado">Inflx{{ getSortIcon('inflex_pesado') }}</th>
                  <th @click="sortBy('cvu_pesado')" class="sortable col-pesado-last">CVU{{ getSortIcon('cvu_pesado') }}</th>
                  <th @click="sortBy('disp_medio')" class="sortable col-medio">Disp{{ getSortIcon('disp_medio') }}</th>
                  <th @click="sortBy('inflex_medio')" class="sortable col-medio">Inflx{{ getSortIcon('inflex_medio') }}</th>
                  <th @click="sortBy('cvu_medio')" class="sortable col-medio-last">CVU{{ getSortIcon('cvu_medio') }}</th>
                  <th @click="sortBy('disp_leve')" class="sortable col-leve">Disp{{ getSortIcon('disp_leve') }}</th>
                  <th @click="sortBy('inflex_leve')" class="sortable col-leve">Inflx{{ getSortIcon('inflex_leve') }}</th>
                  <th @click="sortBy('cvu_leve')" class="sortable col-leve-last">CVU{{ getSortIcon('cvu_leve') }}</th>
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
                  <td>{{ row.dadger1?.codigo_usina || '-' }}</td>
                  <td class="col-name">{{ row.dadger1?.nome_termica || '-' }}</td>
                  <td>{{ row.dadger1?.subsistema || '-' }}</td>
                  <td :class="{ 'diff': row.diff_disp_pesado && !row.onlyInOne }" class="col-number col-pesado">
                    {{ formatNumber(row.dadger1?.disp_pesado) }}
                  </td>
                  <td :class="{ 'diff': row.diff_inflex_pesado && !row.onlyInOne }" class="col-number col-pesado">
                    {{ formatNumber(row.dadger1?.inflex_pesado) }}
                  </td>
                  <td :class="{ 'diff': row.diff_cvu_pesado && !row.onlyInOne }" class="col-number col-pesado-last">
                    {{ formatNumber(row.dadger1?.cvu_pesado) }}
                  </td>
                  <td :class="{ 'diff': row.diff_disp_medio && !row.onlyInOne }" class="col-number col-medio">
                    {{ formatNumber(row.dadger1?.disp_medio) }}
                  </td>
                  <td :class="{ 'diff': row.diff_inflex_medio && !row.onlyInOne }" class="col-number col-medio">
                    {{ formatNumber(row.dadger1?.inflex_medio) }}
                  </td>
                  <td :class="{ 'diff': row.diff_cvu_medio && !row.onlyInOne }" class="col-number col-medio-last">
                    {{ formatNumber(row.dadger1?.cvu_medio) }}
                  </td>
                  <td :class="{ 'diff': row.diff_disp_leve && !row.onlyInOne }" class="col-number col-leve">
                    {{ formatNumber(row.dadger1?.disp_leve) }}
                  </td>
                  <td :class="{ 'diff': row.diff_inflex_leve && !row.onlyInOne }" class="col-number col-leve">
                    {{ formatNumber(row.dadger1?.inflex_leve) }}
                  </td>
                  <td :class="{ 'diff': row.diff_cvu_leve && !row.onlyInOne }" class="col-number col-leve-last">
                    {{ formatNumber(row.dadger1?.cvu_leve) }}
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
                <tr class="header-row-1">
                  <th rowspan="2" @click="sortBy('estagio')" class="sortable">
                    {{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}
                  </th>
                  <th rowspan="2" @click="sortBy('codigo_usina')" class="sortable">Cód{{ getSortIcon('codigo_usina') }}</th>
                  <th rowspan="2" @click="sortBy('nome_termica')" class="sortable">Nome{{ getSortIcon('nome_termica') }}</th>
                  <th rowspan="2" @click="sortBy('subsistema')" class="sortable">Sub{{ getSortIcon('subsistema') }}</th>
                  <th colspan="3" class="patamar-header patamar-pesado">Pesado</th>
                  <th colspan="3" class="patamar-header patamar-medio">Médio</th>
                  <th colspan="3" class="patamar-header patamar-leve">Leve</th>
                </tr>
                <tr class="header-row-2">
                  <th @click="sortBy('disp_pesado')" class="sortable col-pesado">Disp{{ getSortIcon('disp_pesado') }}</th>
                  <th @click="sortBy('inflex_pesado')" class="sortable col-pesado">Inflx{{ getSortIcon('inflex_pesado') }}</th>
                  <th @click="sortBy('cvu_pesado')" class="sortable col-pesado-last">CVU{{ getSortIcon('cvu_pesado') }}</th>
                  <th @click="sortBy('disp_medio')" class="sortable col-medio">Disp{{ getSortIcon('disp_medio') }}</th>
                  <th @click="sortBy('inflex_medio')" class="sortable col-medio">Inflx{{ getSortIcon('inflex_medio') }}</th>
                  <th @click="sortBy('cvu_medio')" class="sortable col-medio-last">CVU{{ getSortIcon('cvu_medio') }}</th>
                  <th @click="sortBy('disp_leve')" class="sortable col-leve">Disp{{ getSortIcon('disp_leve') }}</th>
                  <th @click="sortBy('inflex_leve')" class="sortable col-leve">Inflx{{ getSortIcon('inflex_leve') }}</th>
                  <th @click="sortBy('cvu_leve')" class="sortable col-leve-last">CVU{{ getSortIcon('cvu_leve') }}</th>
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
                  <td>{{ row.dadger2?.codigo_usina || '-' }}</td>
                  <td class="col-name">{{ row.dadger2?.nome_termica || '-' }}</td>
                  <td>{{ row.dadger2?.subsistema || '-' }}</td>
                  <td :class="{ 'diff': row.diff_disp_pesado && !row.onlyInOne }" class="col-number col-pesado">
                    {{ formatNumber(row.dadger2?.disp_pesado) }}
                  </td>
                  <td :class="{ 'diff': row.diff_inflex_pesado && !row.onlyInOne }" class="col-number col-pesado">
                    {{ formatNumber(row.dadger2?.inflex_pesado) }}
                  </td>
                  <td :class="{ 'diff': row.diff_cvu_pesado && !row.onlyInOne }" class="col-number col-pesado-last">
                    {{ formatNumber(row.dadger2?.cvu_pesado) }}
                  </td>
                  <td :class="{ 'diff': row.diff_disp_medio && !row.onlyInOne }" class="col-number col-medio">
                    {{ formatNumber(row.dadger2?.disp_medio) }}
                  </td>
                  <td :class="{ 'diff': row.diff_inflex_medio && !row.onlyInOne }" class="col-number col-medio">
                    {{ formatNumber(row.dadger2?.inflex_medio) }}
                  </td>
                  <td :class="{ 'diff': row.diff_cvu_medio && !row.onlyInOne }" class="col-number col-medio-last">
                    {{ formatNumber(row.dadger2?.cvu_medio) }}
                  </td>
                  <td :class="{ 'diff': row.diff_disp_leve && !row.onlyInOne }" class="col-number col-leve">
                    {{ formatNumber(row.dadger2?.disp_leve) }}
                  </td>
                  <td :class="{ 'diff': row.diff_inflex_leve && !row.onlyInOne }" class="col-number col-leve">
                    {{ formatNumber(row.dadger2?.inflex_leve) }}
                  </td>
                  <td :class="{ 'diff': row.diff_cvu_leve && !row.onlyInOne }" class="col-number col-leve-last">
                    {{ formatNumber(row.dadger2?.cvu_leve) }}
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
  name: 'CTBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    // Computed: dados alinhados (lógica específica do bloco CT)
    const alignedData = computed(() => {
      const registros1 = props.dadger1Data.CT
      const registros2 = props.dadger2Data.CT

      const transformFn = (reg1, reg2, onlyInOne, sameTemporality, primaryValue, codigo_usina) => {
        return {
          key: `${primaryValue}-${codigo_usina}`,
          onlyInOne,
          sameTemporality,
          dadger1: reg1 ? {
            display: props.compareMode === 'estagio' ? `Estágio ${reg1.estagio}` : primaryValue,
            codigo_usina: reg1.codigo_usina,
            nome_termica: reg1.nome_termica,
            subsistema: reg1.subsistema,
            disp_pesado: reg1.disp_pesado,
            inflex_pesado: reg1.inflex_pesado,
            cvu_pesado: reg1.cvu_pesado,
            disp_medio: reg1.disp_medio,
            inflex_medio: reg1.inflex_medio,
            cvu_medio: reg1.cvu_medio,
            disp_leve: reg1.disp_leve,
            inflex_leve: reg1.inflex_leve,
            cvu_leve: reg1.cvu_leve
          } : null,
          dadger2: reg2 ? {
            display: props.compareMode === 'estagio' ? `Estágio ${reg2.estagio}` : primaryValue,
            codigo_usina: reg2.codigo_usina,
            nome_termica: reg2.nome_termica,
            subsistema: reg2.subsistema,
            disp_pesado: reg2.disp_pesado,
            inflex_pesado: reg2.inflex_pesado,
            cvu_pesado: reg2.cvu_pesado,
            disp_medio: reg2.disp_medio,
            inflex_medio: reg2.inflex_medio,
            cvu_medio: reg2.cvu_medio,
            disp_leve: reg2.disp_leve,
            inflex_leve: reg2.inflex_leve,
            cvu_leve: reg2.cvu_leve
          } : null,
          diff_disp_pesado: hasDiff(reg1?.disp_pesado, reg2?.disp_pesado),
          diff_inflex_pesado: hasDiff(reg1?.inflex_pesado, reg2?.inflex_pesado),
          diff_cvu_pesado: hasDiff(reg1?.cvu_pesado, reg2?.cvu_pesado),
          diff_disp_medio: hasDiff(reg1?.disp_medio, reg2?.disp_medio),
          diff_inflex_medio: hasDiff(reg1?.inflex_medio, reg2?.inflex_medio),
          diff_cvu_medio: hasDiff(reg1?.cvu_medio, reg2?.cvu_medio),
          diff_disp_leve: hasDiff(reg1?.disp_leve, reg2?.disp_leve),
          diff_inflex_leve: hasDiff(reg1?.inflex_leve, reg2?.inflex_leve),
          diff_cvu_leve: hasDiff(reg1?.cvu_leve, reg2?.cvu_leve)
        }
      }

      if (props.compareMode === 'estagio') {
        return alignByEstagio(
          registros1,
          registros2,
          props.dadger1Data.info_dadger,
          props.dadger2Data.info_dadger,
          'codigo_usina',
          transformFn
        )
      } else {
        return alignByData(
          registros1,
          registros2,
          props.dadger1Data,
          props.dadger2Data,
          'codigo_usina',
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

    // Criar filteredData
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
      filteredData,
      hasDifferences
    }
  }
}
</script>

<style scoped>
@import '../../styles/block-tables.css';

.ct-block {
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
.data-table th:nth-child(n+5) {
  text-align: right;
}
</style>
