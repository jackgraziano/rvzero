<template>
  <div class="mp-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name">BLOCO MP - MANUTENÇÃO PROGRAMADA</h3>
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
                  <th @click="sortBy('conjunto_itaipu')" class="sortable">Conj{{ getSortIcon('conjunto_itaipu') }}</th>
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
                  <td class="col-center">{{ row.dadger1?.conjunto_itaipu || '-' }}</td>
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
                  <th @click="sortBy('conjunto_itaipu')" class="sortable">Conj{{ getSortIcon('conjunto_itaipu') }}</th>
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
                  <td class="col-center">{{ row.dadger2?.conjunto_itaipu || '-' }}</td>
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
import { ref, computed } from 'vue'
import { hasDiff, formatNumber } from '../../utils/comparison.js'

export default {
  name: 'MPBlock',
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

    // Helper: encontrar estágio por data
    const encontrarEstagioPorData = (data, dadgerData) => {
      if (!dadgerData.info_dadger?.datas_estagios) return null

      const datasEstagios = dadgerData.info_dadger.datas_estagios
      for (const [estagio, dataEstagio] of Object.entries(datasEstagios)) {
        if (dataEstagio === data) {
          return parseInt(estagio)
        }
      }
      return null
    }

    // Helper: coletar datas únicas
    const collectUniqueDates = () => {
      const datas = new Set()

      const datas1 = props.dadger1Data.info_dadger?.datas_estagios || {}
      const datas2 = props.dadger2Data.info_dadger?.datas_estagios || {}

      Object.values(datas1).forEach(d => datas.add(d))
      Object.values(datas2).forEach(d => datas.add(d))

      return Array.from(datas).sort((a, b) => {
        const [diaA, mesA, anoA] = a.split('/').map(Number)
        const [diaB, mesB, anoB] = b.split('/').map(Number)
        return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB)
      })
    }

    // Computed: colunas de tempo baseado no modo de comparação
    const colunasTempo = computed(() => {
      const numEstagios1 = props.dadger1Data.info_dadger?.numero_estagios || 0
      const numEstagios2 = props.dadger2Data.info_dadger?.numero_estagios || 0

      if (props.compareMode === 'data') {
        const datasUnicas = collectUniqueDates()

        if (datasUnicas.length > 0) {
          return datasUnicas.map(data => ({
            key: `data_${data}`,
            label: data,
            data: data
          }))
        }
      }

      // Modo ESTAGIO ou fallback
      const maxEstagios = Math.max(numEstagios1, numEstagios2)
      const colunas = []
      for (let i = 1; i <= maxEstagios; i++) {
        colunas.push({
          key: `estagio_${i}`,
          label: `Est ${i}`,
          estagio: i
        })
      }
      return colunas
    })

    // Computed: dados alinhados
    const alignedData = computed(() => {
      const registros1 = props.dadger1Data.MP || []
      const registros2 = props.dadger2Data.MP || []

      // Coletar todas as combinações únicas de usina + conjunto
      const chaves = new Set()
      registros1.forEach(r => chaves.add(`${r.numero_usina}-${r.conjunto_itaipu || ''}`))
      registros2.forEach(r => chaves.add(`${r.numero_usina}-${r.conjunto_itaipu || ''}`))

      const alinhados = []

      for (const chave of chaves) {
        const [numero_usina, conjunto_itaipu] = chave.split('-')
        const num = parseInt(numero_usina)
        const conj = conjunto_itaipu || null

        const reg1 = registros1.find(r =>
          r.numero_usina === num && (r.conjunto_itaipu || '') === (conj || '')
        )
        const reg2 = registros2.find(r =>
          r.numero_usina === num && (r.conjunto_itaipu || '') === (conj || '')
        )

        const onlyInOne = !reg1 || !reg2

        // Criar objeto de valores alinhados por coluna temporal
        const valores = {}
        let temDiferenca = false

        for (const col of colunasTempo.value) {
          let valor1 = null
          let valor2 = null
          let sameTemporality = false

          if (col.data) {
            // Coluna baseada em DATA
            const estagio1 = encontrarEstagioPorData(col.data, props.dadger1Data)
            const estagio2 = encontrarEstagioPorData(col.data, props.dadger2Data)

            const idx1 = estagio1 ? estagio1 - 1 : -1
            const idx2 = estagio2 ? estagio2 - 1 : -1

            valor1 = idx1 >= 0 ? reg1?.fatores[idx1] ?? null : null
            valor2 = idx2 >= 0 ? reg2?.fatores[idx2] ?? null : null

            sameTemporality = idx1 >= 0 && idx2 >= 0
          } else if (col.estagio) {
            // Coluna baseada em ESTÁGIO
            const idx = col.estagio - 1
            valor1 = reg1?.fatores[idx] ?? null
            valor2 = reg2?.fatores[idx] ?? null

            const temEstagio1 = reg1 && idx < (reg1.fatores?.length || 0)
            const temEstagio2 = reg2 && idx < (reg2.fatores?.length || 0)
            sameTemporality = temEstagio1 && temEstagio2
          }

          const diff = hasDiff(valor1, valor2)
          if (diff && sameTemporality) temDiferenca = true

          valores[col.key] = {
            valor1,
            valor2,
            diff,
            sameTemporality
          }
        }

        const row = {
          key: chave,
          numero_usina: num,
          conjunto_itaipu: conj,
          onlyInOne,
          dadger1: reg1,
          dadger2: reg2,
          valores,
          temDiferenca
        }

        // Adicionar valores para permitir sort
        for (const col of colunasTempo.value) {
          row[col.key] = valores[col.key].valor1 ?? valores[col.key].valor2 ?? 0
        }

        alinhados.push(row)
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
        let valA = a[sortColumn.value] ?? 0
        let valB = b[sortColumn.value] ?? 0

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
        if (row.onlyInOne) {
          return true
        }
        return row.temDiferenca
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
      colunasTempo,
      filteredData
    }
  }
}
</script>

<style scoped>
@import '../../styles/block-tables.css';

.mp-block {
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
