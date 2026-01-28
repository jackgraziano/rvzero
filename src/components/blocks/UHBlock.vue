<template>
  <div class="uh-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name" :class="{ 'has-diff': hasDifferences }">BLOCO UH - USINAS HIDRÁULICAS</h3>
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
                  <th @click="sortBy('ree')" class="sortable">REE{{ getSortIcon('ree') }}</th>
                  <th @click="sortBy('volume_armazenado_pct')" class="sortable">Vol. Arm. (%){{ getSortIcon('volume_armazenado_pct') }}</th>
                  <th @click="sortBy('vazao_defluente_min')" class="sortable">Vaz. Def. Min{{ getSortIcon('vazao_defluente_min') }}</th>
                  <th @click="sortBy('chave_evaporacao')" class="sortable">Evap{{ getSortIcon('chave_evaporacao') }}</th>
                  <th @click="sortBy('estagio_producao')" class="sortable">Est. Prod{{ getSortIcon('estagio_producao') }}</th>
                  <th @click="sortBy('volume_morto')" class="sortable">Vol. Morto{{ getSortIcon('volume_morto') }}</th>
                  <th @click="sortBy('limite_vertimento')" class="sortable">Lim. Vert.{{ getSortIcon('limite_vertimento') }}</th>
                  <th @click="sortBy('chave_balanco_patamar')" class="sortable">Bal. Pat{{ getSortIcon('chave_balanco_patamar') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d1-${row.key}`"
                  :class="{ 'highlighted': row.onlyInOne }"
                >
                  <td class="col-usina">{{ row.dadger1?.numero_usina || '-' }}</td>
                  <td>{{ row.dadger1?.ree || '-' }}</td>
                  <td :class="{ 'diff': row.diff_volume_armazenado_pct && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.volume_armazenado_pct) }}
                  </td>
                  <td :class="{ 'diff': row.diff_vazao_defluente_min && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.vazao_defluente_min) }}
                  </td>
                  <td class="col-center" :class="{ 'diff': row.diff_chave_evaporacao && !row.onlyInOne }">
                    {{ row.dadger1?.chave_evaporacao ?? '-' }}
                  </td>
                  <td class="col-center" :class="{ 'diff': row.diff_estagio_producao && !row.onlyInOne }">
                    {{ row.dadger1?.estagio_producao ?? '-' }}
                  </td>
                  <td :class="{ 'diff': row.diff_volume_morto && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.volume_morto) }}
                  </td>
                  <td :class="{ 'diff': row.diff_limite_vertimento && !row.onlyInOne }" class="col-number">
                    {{ formatNumberScientific(row.dadger1?.limite_vertimento) }}
                  </td>
                  <td class="col-center" :class="{ 'diff': row.diff_chave_balanco_patamar && !row.onlyInOne }">
                    {{ row.dadger1?.chave_balanco_patamar ?? '-' }}
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
                  <th @click="sortBy('ree')" class="sortable">REE{{ getSortIcon('ree') }}</th>
                  <th @click="sortBy('volume_armazenado_pct')" class="sortable">Vol. Arm. (%){{ getSortIcon('volume_armazenado_pct') }}</th>
                  <th @click="sortBy('vazao_defluente_min')" class="sortable">Vaz. Def. Min{{ getSortIcon('vazao_defluente_min') }}</th>
                  <th @click="sortBy('chave_evaporacao')" class="sortable">Evap{{ getSortIcon('chave_evaporacao') }}</th>
                  <th @click="sortBy('estagio_producao')" class="sortable">Est. Prod{{ getSortIcon('estagio_producao') }}</th>
                  <th @click="sortBy('volume_morto')" class="sortable">Vol. Morto{{ getSortIcon('volume_morto') }}</th>
                  <th @click="sortBy('limite_vertimento')" class="sortable">Lim. Vert.{{ getSortIcon('limite_vertimento') }}</th>
                  <th @click="sortBy('chave_balanco_patamar')" class="sortable">Bal. Pat{{ getSortIcon('chave_balanco_patamar') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d2-${row.key}`"
                  :class="{ 'highlighted': row.onlyInOne }"
                >
                  <td class="col-usina">{{ row.dadger2?.numero_usina || '-' }}</td>
                  <td>{{ row.dadger2?.ree || '-' }}</td>
                  <td :class="{ 'diff': row.diff_volume_armazenado_pct && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.volume_armazenado_pct) }}
                  </td>
                  <td :class="{ 'diff': row.diff_vazao_defluente_min && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.vazao_defluente_min) }}
                  </td>
                  <td class="col-center" :class="{ 'diff': row.diff_chave_evaporacao && !row.onlyInOne }">
                    {{ row.dadger2?.chave_evaporacao ?? '-' }}
                  </td>
                  <td class="col-center" :class="{ 'diff': row.diff_estagio_producao && !row.onlyInOne }">
                    {{ row.dadger2?.estagio_producao ?? '-' }}
                  </td>
                  <td :class="{ 'diff': row.diff_volume_morto && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.volume_morto) }}
                  </td>
                  <td :class="{ 'diff': row.diff_limite_vertimento && !row.onlyInOne }" class="col-number">
                    {{ formatNumberScientific(row.dadger2?.limite_vertimento) }}
                  </td>
                  <td class="col-center" :class="{ 'diff': row.diff_chave_balanco_patamar && !row.onlyInOne }">
                    {{ row.dadger2?.chave_balanco_patamar ?? '-' }}
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
import { ref, computed } from 'vue'
import { hasDiff, formatNumber } from '../../utils/comparison.js'

export default {
  name: 'UHBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    const collapsed = ref(true)
    const isSyncing = ref(false)
    const sortColumn = ref(null)
    const sortDirection = ref('asc')
    const tableContainer1 = ref(null)
    const tableContainer2 = ref(null)

    const toggleCollapsed = () => {
      collapsed.value = !collapsed.value
    }

    const sortBy = (column) => {
      if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortColumn.value = column
        sortDirection.value = 'asc'
      }
    }

    const getSortIcon = (column) => {
      if (sortColumn.value !== column) return ''
      return sortDirection.value === 'asc' ? ' ▲' : ' ▼'
    }

    const onScroll1 = (event) => {
      if (isSyncing.value) return
      isSyncing.value = true
      const scrollTop = event.target.scrollTop
      if (tableContainer2.value) {
        tableContainer2.value.scrollTop = scrollTop
      }
      setTimeout(() => {
        isSyncing.value = false
      }, 0)
    }

    const onScroll2 = (event) => {
      if (isSyncing.value) return
      isSyncing.value = true
      const scrollTop = event.target.scrollTop
      if (tableContainer1.value) {
        tableContainer1.value.scrollTop = scrollTop
      }
      setTimeout(() => {
        isSyncing.value = false
      }, 0)
    }

    const formatNumberScientific = (value) => {
      if (value === null || value === undefined) return '-'
      if (value >= 1.0e20) return '∞'
      return formatNumber(value)
    }

    // Computed: dados alinhados (lógica específica do bloco UH)
    const alignedData = computed(() => {
      const registros1 = props.dadger1Data.UH || []
      const registros2 = props.dadger2Data.UH || []

      // Coletar todos os números de usina únicos
      const usinas = new Set()
      registros1.forEach(r => usinas.add(r.numero_usina))
      registros2.forEach(r => usinas.add(r.numero_usina))

      const alinhados = []

      for (const numero_usina of usinas) {
        const reg1 = registros1.find(r => r.numero_usina === numero_usina)
        const reg2 = registros2.find(r => r.numero_usina === numero_usina)

        const onlyInOne = !reg1 || !reg2

        alinhados.push({
          key: numero_usina,
          onlyInOne,
          dadger1: reg1 || null,
          dadger2: reg2 || null,
          diff_volume_armazenado_pct: hasDiff(reg1?.volume_armazenado_pct, reg2?.volume_armazenado_pct),
          diff_vazao_defluente_min: hasDiff(reg1?.vazao_defluente_min, reg2?.vazao_defluente_min),
          diff_chave_evaporacao: hasDiff(reg1?.chave_evaporacao, reg2?.chave_evaporacao),
          diff_estagio_producao: hasDiff(reg1?.estagio_producao, reg2?.estagio_producao),
          diff_volume_morto: hasDiff(reg1?.volume_morto, reg2?.volume_morto),
          diff_limite_vertimento: hasDiff(reg1?.limite_vertimento, reg2?.limite_vertimento),
          diff_chave_balanco_patamar: hasDiff(reg1?.chave_balanco_patamar, reg2?.chave_balanco_patamar)
        })
      }

      return alinhados
    })

    // Computed: dados ordenados
    const sortedData = computed(() => {
      const data = alignedData.value

      if (!sortColumn.value) {
        return data
      }

      return [...data].sort((a, b) => {
        let valA = a.dadger1?.[sortColumn.value] ?? a.dadger2?.[sortColumn.value] ?? 0
        let valB = b.dadger1?.[sortColumn.value] ?? b.dadger2?.[sortColumn.value] ?? 0

        let comparison = 0
        if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.toLowerCase().localeCompare(valB.toLowerCase())
        } else {
          if (valA > valB) comparison = 1
          else if (valA < valB) comparison = -1
        }

        return sortDirection.value === 'asc' ? comparison : -comparison
      })
    })

    // Computed: dados filtrados
    const filteredData = computed(() => {
      const data = sortedData.value

      if (!props.showOnlyDifferences) {
        return data
      }

      return data.filter(row => {
        // Sempre mostrar usinas que existem apenas em um dadger
        if (row.onlyInOne) {
          return true
        }

        // Mostrar se tem alguma diferença
        return row.diff_volume_armazenado_pct ||
               row.diff_vazao_defluente_min ||
               row.diff_chave_evaporacao ||
               row.diff_estagio_producao ||
               row.diff_volume_morto ||
               row.diff_limite_vertimento ||
               row.diff_chave_balanco_patamar
      })
    })

    // Detectar se há diferenças no bloco
    const hasDifferences = computed(() => {
      if (!alignedData.value || alignedData.value.length === 0) {
        return false
      }

      return alignedData.value.some(row => {
        // UH não tem temporalidade (sempre estágio 1), então onlyInOne sempre conta
        if (row.onlyInOne) return true
        return row.diff_volume_armazenado_pct ||
               row.diff_vazao_defluente_min ||
               row.diff_chave_evaporacao ||
               row.diff_estagio_producao ||
               row.diff_volume_morto ||
               row.diff_limite_vertimento ||
               row.diff_chave_balanco_patamar
      })
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
      formatNumberScientific,
      filteredData,
      hasDifferences
    }
  }
}
</script>

<style scoped>
@import '../../styles/block-tables.css';

.uh-block {
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

.col-center {
  text-align: center;
}

/* Alinhar colunas numéricas à direita */
.data-table th:nth-child(n+3) {
  text-align: right;
}
</style>
