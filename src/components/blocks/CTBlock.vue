<template>
  <div class="ct-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name">BLOCO CT - USINAS TÉRMICAS</h3>
    </div>

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <div class="table-side">
          <h4 class="table-title">{{ dadger1Name }}</h4>
          <div class="table-container" ref="tableContainer1" @scroll="onScroll1">
            <table class="data-table">
              <thead>
                <tr class="header-row-1">
                  <th rowspan="2" @click="sortBy('estagio')" class="sortable">{{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}</th>
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
                <tr v-for="row in filteredData" :key="`d1-${row.key}`" :class="{ 'faded': row.onlyInOne && !row.sameTemporality, 'highlighted': row.onlyInOne && row.sameTemporality }">
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

        <div class="table-side">
          <h4 class="table-title">{{ dadger2Name }}</h4>
          <div class="table-container" ref="tableContainer2" @scroll="onScroll2">
            <table class="data-table">
              <thead>
                <tr class="header-row-1">
                  <th rowspan="2" @click="sortBy('estagio')" class="sortable">{{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}</th>
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
                <tr v-for="row in filteredData" :key="`d2-${row.key}`" :class="{ 'faded': row.onlyInOne && !row.sameTemporality, 'highlighted': row.onlyInOne && row.sameTemporality }">
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
import { alignByEstagio, alignByData, hasDiff, formatNumber } from '../../utils/comparison.js'

export default {
  name: 'CTBlock',
  props: {
    dadger1Data: {
      type: Object,
      required: true
    },
    dadger1Name: {
      type: String,
      required: true
    },
    dadger2Data: {
      type: Object,
      required: true
    },
    dadger2Name: {
      type: String,
      required: true
    },
    compareMode: {
      type: String,
      required: true
    },
    showOnlyDifferences: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      collapsed: true,
      isSyncing: false,
      sortColumn: null,
      sortDirection: 'asc' // 'asc' ou 'desc'
    }
  },
  computed: {
    filteredData() {
      const data = this.sortedData

      if (!this.showOnlyDifferences) {
        return data
      }

      // Filtrar apenas linhas com diferenças
      return data.filter(row => {
        // Se a linha é highlighted (usina diferente na mesma temporalidade), sempre mostrar
        if (row.onlyInOne && row.sameTemporality) {
          return true
        }

        // Se a linha existe apenas em um arquivo e temporalidade diferente, não mostrar
        if (row.onlyInOne && !row.sameTemporality) {
          return false
        }

        // Se tem alguma diferença nos campos, mostrar
        return row.diff_disp_pesado ||
               row.diff_inflex_pesado ||
               row.diff_cvu_pesado ||
               row.diff_disp_medio ||
               row.diff_inflex_medio ||
               row.diff_cvu_medio ||
               row.diff_disp_leve ||
               row.diff_inflex_leve ||
               row.diff_cvu_leve
      })
    },
    sortedData() {
      const data = this.alignedData

      if (!this.sortColumn) {
        return data
      }

      return [...data].sort((a, b) => {
        let valA, valB

        // Determinar valores de comparação baseado na coluna
        switch (this.sortColumn) {
          case 'estagio':
            valA = a.dadger1?.display || a.dadger2?.display || ''
            valB = b.dadger1?.display || b.dadger2?.display || ''
            break
          case 'codigo_usina':
            valA = a.dadger1?.codigo_usina || a.dadger2?.codigo_usina || 0
            valB = b.dadger1?.codigo_usina || b.dadger2?.codigo_usina || 0
            break
          case 'nome_termica':
            valA = (a.dadger1?.nome_termica || a.dadger2?.nome_termica || '').toLowerCase()
            valB = (b.dadger1?.nome_termica || b.dadger2?.nome_termica || '').toLowerCase()
            break
          case 'subsistema':
            valA = a.dadger1?.subsistema || a.dadger2?.subsistema || 0
            valB = b.dadger1?.subsistema || b.dadger2?.subsistema || 0
            break
          default:
            // Para colunas numéricas (disp_pesado, cvu_medio, etc)
            valA = a.dadger1?.[this.sortColumn] ?? a.dadger2?.[this.sortColumn] ?? 0
            valB = b.dadger1?.[this.sortColumn] ?? b.dadger2?.[this.sortColumn] ?? 0
        }

        // Comparar
        let comparison = 0
        if (valA > valB) comparison = 1
        else if (valA < valB) comparison = -1

        return this.sortDirection === 'asc' ? comparison : -comparison
      })
    },
    alignedData() {
      const registros1 = this.dadger1Data.CT
      const registros2 = this.dadger2Data.CT

      const transformFn = (reg1, reg2, onlyInOne, sameTemporality, primaryValue, codigo_usina) => {
        const diff_disp_pesado = hasDiff(reg1?.disp_pesado, reg2?.disp_pesado)
        const diff_inflex_pesado = hasDiff(reg1?.inflex_pesado, reg2?.inflex_pesado)
        const diff_cvu_pesado = hasDiff(reg1?.cvu_pesado, reg2?.cvu_pesado)

        const diff_disp_medio = hasDiff(reg1?.disp_medio, reg2?.disp_medio)
        const diff_inflex_medio = hasDiff(reg1?.inflex_medio, reg2?.inflex_medio)
        const diff_cvu_medio = hasDiff(reg1?.cvu_medio, reg2?.cvu_medio)

        const diff_disp_leve = hasDiff(reg1?.disp_leve, reg2?.disp_leve)
        const diff_inflex_leve = hasDiff(reg1?.inflex_leve, reg2?.inflex_leve)
        const diff_cvu_leve = hasDiff(reg1?.cvu_leve, reg2?.cvu_leve)

        return {
          key: `${primaryValue}-${codigo_usina}`,
          onlyInOne,
          sameTemporality,
          dadger1: reg1 ? {
            display: this.compareMode === 'estagio' ? `Estágio ${reg1.estagio}` : primaryValue,
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
            display: this.compareMode === 'estagio' ? `Estágio ${reg2.estagio}` : primaryValue,
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
          diff_disp_pesado,
          diff_inflex_pesado,
          diff_cvu_pesado,
          diff_disp_medio,
          diff_inflex_medio,
          diff_cvu_medio,
          diff_disp_leve,
          diff_inflex_leve,
          diff_cvu_leve
        }
      }

      if (this.compareMode === 'estagio') {
        return alignByEstagio(
          registros1,
          registros2,
          this.dadger1Data.info_dadger,
          this.dadger2Data.info_dadger,
          'codigo_usina',
          transformFn
        )
      } else {
        return alignByData(
          registros1,
          registros2,
          this.dadger1Data,
          this.dadger2Data,
          'codigo_usina',
          transformFn
        )
      }
    }
  },
  methods: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },
    sortBy(column) {
      if (this.sortColumn === column) {
        // Alternar direção se já está ordenando por esta coluna
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        // Nova coluna, ordenar ascendente
        this.sortColumn = column
        this.sortDirection = 'asc'
      }
    },
    getSortIcon(column) {
      if (this.sortColumn !== column) {
        return ''
      }
      return this.sortDirection === 'asc' ? ' ▲' : ' ▼'
    },
    onScroll1(event) {
      if (this.isSyncing) return

      this.isSyncing = true
      const scrollTop = event.target.scrollTop
      this.$refs.tableContainer2.scrollTop = scrollTop
      this.$nextTick(() => {
        this.isSyncing = false
      })
    },
    onScroll2(event) {
      if (this.isSyncing) return

      this.isSyncing = true
      const scrollTop = event.target.scrollTop
      this.$refs.tableContainer1.scrollTop = scrollTop
      this.$nextTick(() => {
        this.isSyncing = false
      })
    },
    formatNumber
  }
}
</script>

<style scoped>
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

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  font-family: 'Courier New', monospace;
}

.data-table thead {
  position: sticky;
  top: 0;
  background: #2d2d2d;
  z-index: 1;
}

.data-table th {
  padding: 6px 8px;
  text-align: left;
  font-weight: 700;
  color: #00ff00;
  border-bottom: 1px solid #00ff00;
  font-size: 10px;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.data-table th.sortable:hover {
  background: #3d3d3d;
}

.data-table td {
  padding: 4px 8px;
  border-bottom: 1px solid #3d3d3d;
  color: #d4d4d4;
}

.data-table tbody tr:hover {
  background: #2d2d2d;
}

.data-table tbody tr.faded {
  opacity: 0.3;
}

.data-table tbody tr.faded:hover {
  opacity: 0.5;
}

.data-table tbody tr.highlighted {
  background: #2d0a0a;
  color: #ff4444;
}

.data-table tbody tr.highlighted td {
  color: #ff4444;
  font-weight: 700;
}

.data-table tbody tr.highlighted:hover {
  background: #3d1515;
}

.data-table td.diff {
  background: #4a4a00;
  color: #ffff00;
  font-weight: 700;
}

.col-stage {
  font-weight: 700;
  color: #00ff00;
}

.col-name {
  font-family: 'Courier New', monospace;
  color: #d4d4d4;
  white-space: nowrap;
}

.col-number {
  text-align: right;
  font-family: 'Courier New', monospace;
  color: #d4d4d4;
}

/* Alinhar colunas numéricas à direita */
.data-table th:nth-child(n+5) {
  text-align: right;
}

/* Estilos para headers de patamar */
.patamar-header {
  text-align: center !important;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 8px 4px;
}

.patamar-pesado {
  background: #1a2d1a;
  border-right: 2px solid #00ff00;
}

.patamar-medio {
  background: #1a1a2d;
  border-right: 2px solid #00ff00;
}

.patamar-leve {
  background: #2d1a1a;
}

/* Segunda linha de headers */
.header-row-2 th {
  font-size: 9px;
  padding: 4px 4px;
}

/* Bordas separando patamares */
.col-pesado-last {
  border-right: 2px solid #00ff00 !important;
}

.col-medio-last {
  border-right: 2px solid #00ff00 !important;
}
</style>
