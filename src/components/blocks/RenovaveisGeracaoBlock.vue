<template>
  <div class="renovaveis-geracao-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      title="GERAÇÃO RENOVÁVEL — SUBMERCADO, PERÍODO E PATAMAR"
      @toggle="toggleCollapsed"
    />

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <!-- Tabela Arquivo 1 -->
        <div class="table-side">
          <h4 class="table-title">{{ renovaveis1Name }}</h4>
          <div class="table-container" :ref="el => tableContainer1 = el" @scroll="onScroll1">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('periodo')" class="sortable col-number" v-sortable-header>Período{{ getSortIcon('periodo') }}</th>
                  <th @click="sortBy('submercado')" class="sortable col-number" v-sortable-header>Subm{{ getSortIcon('submercado') }}</th>
                  <th @click="sortBy('patamar')" class="sortable col-number" v-sortable-header>Pat{{ getSortIcon('patamar') }}</th>
                  <th @click="sortBy('geracaoMedia')" class="sortable col-number" v-sortable-header>Geração (MW){{ getSortIcon('geracaoMedia') }}</th>
                  <th class="col-number">PEEs</th>
                  <th class="col-number">Cenários</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`r1-${row.key}`"
                  :class="{ highlighted: row.onlyInOne }"
                >
                  <td class="col-number">{{ row.ren1?.periodo ?? '-' }}</td>
                  <td class="col-number">{{ row.ren1?.submercado ?? '-' }}</td>
                  <td class="col-number">{{ row.ren1?.patamar ?? '-' }}</td>
                  <td class="col-number" :class="{ diff: row.diff_geracaoMedia && !row.onlyInOne }">
                    {{ formatNumber(row.ren1?.geracaoMedia) }}
                  </td>
                  <td class="col-number" :class="{ diff: row.diff_numPEEs && !row.onlyInOne }">
                    {{ row.ren1?.numPEEs ?? '-' }}
                  </td>
                  <td class="col-number" :class="{ diff: row.diff_numCenarios && !row.onlyInOne }">
                    {{ row.ren1?.numCenarios ?? '-' }}
                  </td>
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
                  <th @click="sortBy('periodo')" class="sortable col-number" v-sortable-header>Período{{ getSortIcon('periodo') }}</th>
                  <th @click="sortBy('submercado')" class="sortable col-number" v-sortable-header>Subm{{ getSortIcon('submercado') }}</th>
                  <th @click="sortBy('patamar')" class="sortable col-number" v-sortable-header>Pat{{ getSortIcon('patamar') }}</th>
                  <th @click="sortBy('geracaoMedia')" class="sortable col-number" v-sortable-header>Geração (MW){{ getSortIcon('geracaoMedia') }}</th>
                  <th class="col-number">PEEs</th>
                  <th class="col-number">Cenários</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`r2-${row.key}`"
                  :class="{ highlighted: row.onlyInOne }"
                >
                  <td class="col-number">{{ row.ren2?.periodo ?? '-' }}</td>
                  <td class="col-number">{{ row.ren2?.submercado ?? '-' }}</td>
                  <td class="col-number">{{ row.ren2?.patamar ?? '-' }}</td>
                  <td class="col-number" :class="{ diff: row.diff_geracaoMedia && !row.onlyInOne }">
                    {{ formatNumber(row.ren2?.geracaoMedia) }}
                  </td>
                  <td class="col-number" :class="{ diff: row.diff_numPEEs && !row.onlyInOne }">
                    {{ row.ren2?.numPEEs ?? '-' }}
                  </td>
                  <td class="col-number" :class="{ diff: row.diff_numCenarios && !row.onlyInOne }">
                    {{ row.ren2?.numCenarios ?? '-' }}
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
        const diff_numPEEs = hasDiff(ren1?.numPEEs, ren2?.numPEEs)
        const diff_numCenarios = hasDiff(ren1?.numCenarios, ren2?.numCenarios)

        alinhados.push({
          key,
          ren1,
          ren2,
          periodo: ren1?.periodo ?? ren2?.periodo,
          submercado: ren1?.submercado ?? ren2?.submercado,
          patamar: ren1?.patamar ?? ren2?.patamar,
          geracaoMedia: ren1?.geracaoMedia ?? ren2?.geracaoMedia,
          onlyInOne,
          diff_geracaoMedia,
          diff_numPEEs,
          diff_numCenarios
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

.renovaveis-geracao-block {
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
</style>
