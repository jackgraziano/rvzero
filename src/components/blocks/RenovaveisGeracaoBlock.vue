<template>
  <div class="renovaveis-geracao-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name" :class="{ 'has-diff': hasDifferences }">
        GERAÇÃO RENOVÁVEL (Agregada por Submercado/Período/Patamar)
      </h3>
    </div>

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <!-- Tabela Arquivo 1 -->
        <div class="table-side">
          <h4 class="table-title">{{ renovaveis1Name }}</h4>
          <div class="table-container" :ref="el => tableContainer1 = el" @scroll="onScroll1">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('periodo')" class="sortable col-number">Período{{ getSortIcon('periodo') }}</th>
                  <th @click="sortBy('submercado')" class="sortable col-number">Subm{{ getSortIcon('submercado') }}</th>
                  <th @click="sortBy('patamar')" class="sortable col-number">Pat{{ getSortIcon('patamar') }}</th>
                  <th @click="sortBy('geracaoMedia')" class="sortable col-number">Geração (MW){{ getSortIcon('geracaoMedia') }}</th>
                  <th class="col-number">PEEs</th>
                  <th class="col-number">Cenários</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`r1-${row.key}`"
                  :class="{
                    'highlighted': row.onlyInOne,
                    'diff': row.diff_geracaoMedia && !row.onlyInOne
                  }"
                >
                  <td class="col-number">{{ row.ren1?.periodo || '-' }}</td>
                  <td class="col-number">{{ row.ren1?.submercado || '-' }}</td>
                  <td class="col-number">{{ row.ren1?.patamar || '-' }}</td>
                  <td class="col-number">{{ formatNumber(row.ren1?.geracaoMedia) }}</td>
                  <td class="col-number">{{ row.ren1?.numPEEs || '-' }}</td>
                  <td class="col-number">{{ row.ren1?.numCenarios || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabela Arquivo 2 -->
        <div class="table-side">
          <h4 class="table-title">{{ renovaveis2Name }}</h4>
          <div class="table-container" :ref="el => tableContainer2 = el" @scroll="onScroll2">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('periodo')" class="sortable col-number">Período{{ getSortIcon('periodo') }}</th>
                  <th @click="sortBy('submercado')" class="sortable col-number">Subm{{ getSortIcon('submercado') }}</th>
                  <th @click="sortBy('patamar')" class="sortable col-number">Pat{{ getSortIcon('patamar') }}</th>
                  <th @click="sortBy('geracaoMedia')" class="sortable col-number">Geração (MW){{ getSortIcon('geracaoMedia') }}</th>
                  <th class="col-number">PEEs</th>
                  <th class="col-number">Cenários</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`r2-${row.key}`"
                  :class="{
                    'highlighted': row.onlyInOne,
                    'diff': row.diff_geracaoMedia && !row.onlyInOne
                  }"
                >
                  <td class="col-number">{{ row.ren2?.periodo || '-' }}</td>
                  <td class="col-number">{{ row.ren2?.submercado || '-' }}</td>
                  <td class="col-number">{{ row.ren2?.patamar || '-' }}</td>
                  <td class="col-number">{{ formatNumber(row.ren2?.geracaoMedia) }}</td>
                  <td class="col-number">{{ row.ren2?.numPEEs || '-' }}</td>
                  <td class="col-number">{{ row.ren2?.numCenarios || '-' }}</td>
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
import { hasDiff, formatNumber } from '../../utils/comparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'

export default {
  name: 'RenovaveisGeracaoBlock',
  props: {
    renovaveis1Data: { type: Object, required: true },
    renovaveis1Name: { type: String, required: true },
    renovaveis2Data: { type: Object, required: true },
    renovaveis2Name: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    // Computed: dados alinhados
    const alignedData = computed(() => {
      const dados1 = props.renovaveis1Data.geracaoAgregada || []
      const dados2 = props.renovaveis2Data.geracaoAgregada || []

      // Criar mapa de chaves
      const mapaChaves = new Map()

      dados1.forEach(d => {
        const key = `${d.submercado}-${d.periodo}-${d.patamar}`
        mapaChaves.set(key, { ren1: d, ren2: null })
      })

      dados2.forEach(d => {
        const key = `${d.submercado}-${d.periodo}-${d.patamar}`
        if (mapaChaves.has(key)) {
          mapaChaves.get(key).ren2 = d
        } else {
          mapaChaves.set(key, { ren1: null, ren2: d })
        }
      })

      // Converter para array
      const alinhados = []
      for (const [key, { ren1, ren2 }] of mapaChaves) {
        const onlyInOne = !ren1 || !ren2
        const diff_geracaoMedia = hasDiff(ren1?.geracaoMedia, ren2?.geracaoMedia)

        alinhados.push({
          key,
          ren1,
          ren2,
          onlyInOne,
          diff_geracaoMedia
        })
      }

      return alinhados
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

.renovaveis-geracao-block {
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
</style>
