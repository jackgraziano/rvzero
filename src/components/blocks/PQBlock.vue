<template>
  <div class="pq-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name">BLOCO PQ - PEQUENAS USINAS</h3>
    </div>

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <div class="table-side">
          <h4 class="table-title">{{ dadger1Name }}</h4>
          <div class="table-container" ref="tableContainer1" @scroll="onScroll1">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}</th>
                  <th>Sub</th>
                  <th>Geração Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredData" :key="`d1-${row.key}`" :class="{ 'faded': row.onlyInOne && !row.sameTemporality, 'highlighted': row.onlyInOne && row.sameTemporality }">
                  <td class="col-stage">{{ row.dadger1?.display || '-' }}</td>
                  <td>{{ row.dadger1?.subsistema || '-' }}</td>
                  <td :class="{ 'diff': row.diff_geracao_total && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.geracao_total) }}
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
                <tr>
                  <th>{{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}</th>
                  <th>Sub</th>
                  <th>Geração Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredData" :key="`d2-${row.key}`" :class="{ 'faded': row.onlyInOne && !row.sameTemporality, 'highlighted': row.onlyInOne && row.sameTemporality }">
                  <td class="col-stage">{{ row.dadger2?.display || '-' }}</td>
                  <td>{{ row.dadger2?.subsistema || '-' }}</td>
                  <td :class="{ 'diff': row.diff_geracao_total && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.geracao_total) }}
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
  name: 'PQBlock',
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
      isSyncing: false
    }
  },
  computed: {
    filteredData() {
      const data = this.alignedData

      if (!this.showOnlyDifferences) {
        return data
      }

      // Filtrar apenas linhas com diferenças
      return data.filter(row => {
        // Se a linha é highlighted (subsistema diferente na mesma temporalidade), sempre mostrar
        if (row.onlyInOne && row.sameTemporality) {
          return true
        }

        // Se a linha existe apenas em um arquivo e temporalidade diferente, não mostrar
        if (row.onlyInOne && !row.sameTemporality) {
          return false
        }

        // Se tem alguma diferença no total, mostrar
        return row.diff_geracao_total
      })
    },
    alignedData() {
      const registros1 = this.dadger1Data.PQ
      const registros2 = this.dadger2Data.PQ

      const transformFn = (reg1, reg2, onlyInOne, sameTemporality, primaryValue, subsistema) => {
        const diff_geracao_total = hasDiff(reg1?.geracao_total, reg2?.geracao_total)

        return {
          key: `${primaryValue}-${subsistema}`,
          onlyInOne,
          sameTemporality,
          dadger1: reg1 ? {
            display: this.compareMode === 'estagio' ? `Estágio ${reg1.estagio}` : primaryValue,
            subsistema: reg1.subsistema,
            geracao_total: reg1.geracao_total
          } : null,
          dadger2: reg2 ? {
            display: this.compareMode === 'estagio' ? `Estágio ${reg2.estagio}` : primaryValue,
            subsistema: reg2.subsistema,
            geracao_total: reg2.geracao_total
          } : null,
          diff_geracao_total
        }
      }

      if (this.compareMode === 'estagio') {
        return alignByEstagio(
          registros1,
          registros2,
          this.dadger1Data.info_dadger,
          this.dadger2Data.info_dadger,
          'subsistema',
          transformFn
        )
      } else {
        return alignByData(
          registros1,
          registros2,
          this.dadger1Data,
          this.dadger2Data,
          'subsistema',
          transformFn
        )
      }
    }
  },
  methods: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed
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
.pq-block {
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

.col-number {
  text-align: right;
  font-family: 'Courier New', monospace;
  color: #d4d4d4;
}

.data-table th:nth-child(3) {
  text-align: right;
}
</style>
