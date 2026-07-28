<template>
  <div class="dp-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      title="BLOCO DP — DEMANDA POR PATAMAR"
      @toggle="toggleCollapsed"
    />

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <!-- Tabela Dadger 1 -->
        <div class="table-side">
          <h4 class="table-title">{{ dadger1Name }}</h4>
          <div class="table-container" :ref="el => tableContainer1 = el" @scroll="onScroll1">
            <table class="data-table">
              <thead>
                <tr>
                  <th @click="sortBy('estagio')" class="sortable" v-sortable-header>
                    {{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}
                  </th>
                  <th @click="sortBy('subsistema')" class="sortable" v-sortable-header>Sub{{ getSortIcon('subsistema') }}</th>
                  <th @click="sortBy('numero_patamares')" class="sortable" v-sortable-header>Pat{{ getSortIcon('numero_patamares') }}</th>
                  <th @click="sortBy('carga_pesada')" class="sortable" v-sortable-header>Pesada{{ getSortIcon('carga_pesada') }}</th>
                  <th @click="sortBy('horas_pesada')" class="sortable" v-sortable-header>h Pes.{{ getSortIcon('horas_pesada') }}</th>
                  <th @click="sortBy('carga_media')" class="sortable" v-sortable-header>Média{{ getSortIcon('carga_media') }}</th>
                  <th @click="sortBy('horas_media')" class="sortable" v-sortable-header>h Méd.{{ getSortIcon('horas_media') }}</th>
                  <th @click="sortBy('carga_leve')" class="sortable" v-sortable-header>Leve{{ getSortIcon('carga_leve') }}</th>
                  <th @click="sortBy('horas_leve')" class="sortable" v-sortable-header>h Lev.{{ getSortIcon('horas_leve') }}</th>
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
                  <td class="col-stage">{{ row.dadger1?.display ?? '-' }}</td>
                  <td>{{ row.dadger1?.subsistema ?? '-' }}</td>
                  <td :class="{ diff: row.diff_numero_patamares && !row.onlyInOne }">{{ row.dadger1?.numero_patamares ?? '-' }}</td>
                  <td :class="{ 'diff': row.diff_pesada && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.carga_pesada) }}
                  </td>
                  <td :class="{ diff: row.diff_horas_pesada && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.horas_pesada) }}
                  </td>
                  <td :class="{ 'diff': row.diff_media && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.carga_media) }}
                  </td>
                  <td :class="{ diff: row.diff_horas_media && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.horas_media) }}
                  </td>
                  <td :class="{ 'diff': row.diff_leve && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.carga_leve) }}
                  </td>
                  <td :class="{ diff: row.diff_horas_leve && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger1?.horas_leve) }}
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
                  <th @click="sortBy('estagio')" class="sortable" v-sortable-header>
                    {{ compareMode === 'estagio' ? 'Estágio' : 'Data' }}{{ getSortIcon('estagio') }}
                  </th>
                  <th @click="sortBy('subsistema')" class="sortable" v-sortable-header>Sub{{ getSortIcon('subsistema') }}</th>
                  <th @click="sortBy('numero_patamares')" class="sortable" v-sortable-header>Pat{{ getSortIcon('numero_patamares') }}</th>
                  <th @click="sortBy('carga_pesada')" class="sortable" v-sortable-header>Pesada{{ getSortIcon('carga_pesada') }}</th>
                  <th @click="sortBy('horas_pesada')" class="sortable" v-sortable-header>h Pes.{{ getSortIcon('horas_pesada') }}</th>
                  <th @click="sortBy('carga_media')" class="sortable" v-sortable-header>Média{{ getSortIcon('carga_media') }}</th>
                  <th @click="sortBy('horas_media')" class="sortable" v-sortable-header>h Méd.{{ getSortIcon('horas_media') }}</th>
                  <th @click="sortBy('carga_leve')" class="sortable" v-sortable-header>Leve{{ getSortIcon('carga_leve') }}</th>
                  <th @click="sortBy('horas_leve')" class="sortable" v-sortable-header>h Lev.{{ getSortIcon('horas_leve') }}</th>
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
                  <td class="col-stage">{{ row.dadger2?.display ?? '-' }}</td>
                  <td>{{ row.dadger2?.subsistema ?? '-' }}</td>
                  <td :class="{ diff: row.diff_numero_patamares && !row.onlyInOne }">{{ row.dadger2?.numero_patamares ?? '-' }}</td>
                  <td :class="{ 'diff': row.diff_pesada && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.carga_pesada) }}
                  </td>
                  <td :class="{ diff: row.diff_horas_pesada && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.horas_pesada) }}
                  </td>
                  <td :class="{ 'diff': row.diff_media && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.carga_media) }}
                  </td>
                  <td :class="{ diff: row.diff_horas_media && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.horas_media) }}
                  </td>
                  <td :class="{ 'diff': row.diff_leve && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.carga_leve) }}
                  </td>
                  <td :class="{ diff: row.diff_horas_leve && !row.onlyInOne }" class="col-number">
                    {{ formatNumber(row.dadger2?.horas_leve) }}
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
import { recordRowsFromOccurrences } from '../../utils/reportPresentation.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'

export default {
  name: 'DPBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true },
    occurrences: { type: Array, default: null }
  },
  setup(props) {
    // Computed: dados alinhados (lógica específica do bloco DP)
    const alignedData = computed(() => {
      if (Array.isArray(props.occurrences)) {
        return recordRowsFromOccurrences(props.occurrences, {
          mode: props.compareMode
        }).map(row => ({
          ...row,
          diff_pesada: row.diff_carga_pesada,
          diff_media: row.diff_carga_media,
          diff_leve: row.diff_carga_leve
        }))
      }

      const registros1 = props.dadger1Data.DP
      const registros2 = props.dadger2Data.DP

      const transformFn = (reg1, reg2, onlyInOne, sameTemporality, primaryValue, subsistema) => {
        const diff_pesada = hasDiff(reg1?.carga_pesada, reg2?.carga_pesada)
        const diff_media = hasDiff(reg1?.carga_media, reg2?.carga_media)
        const diff_leve = hasDiff(reg1?.carga_leve, reg2?.carga_leve)
        const diff_numero_patamares = hasDiff(
          reg1?.numero_patamares,
          reg2?.numero_patamares
        )
        const diff_horas_pesada = hasDiff(reg1?.horas_pesada, reg2?.horas_pesada)
        const diff_horas_media = hasDiff(reg1?.horas_media, reg2?.horas_media)
        const diff_horas_leve = hasDiff(reg1?.horas_leve, reg2?.horas_leve)

        const row = {
          blockType: 'DP',  // Identificador
          key: `${primaryValue}-${subsistema}`,
          onlyInOne,
          sameTemporality,
          dadger1: reg1 ? {
            display: props.compareMode === 'estagio' ? `Estágio ${reg1.estagio}` : primaryValue,
            subsistema: reg1.subsistema,
            numero_patamares: reg1.numero_patamares,
            carga_pesada: reg1.carga_pesada,
            horas_pesada: reg1.horas_pesada,
            carga_media: reg1.carga_media,
            horas_media: reg1.horas_media,
            carga_leve: reg1.carga_leve,
            horas_leve: reg1.horas_leve
          } : null,
          dadger2: reg2 ? {
            display: props.compareMode === 'estagio' ? `Estágio ${reg2.estagio}` : primaryValue,
            subsistema: reg2.subsistema,
            numero_patamares: reg2.numero_patamares,
            carga_pesada: reg2.carga_pesada,
            horas_pesada: reg2.horas_pesada,
            carga_media: reg2.carga_media,
            horas_media: reg2.horas_media,
            carga_leve: reg2.carga_leve,
            horas_leve: reg2.horas_leve
          } : null,
          diff_pesada,
          diff_media,
          diff_leve,
          diff_numero_patamares,
          diff_horas_pesada,
          diff_horas_media,
          diff_horas_leve
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

.dp-block {
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

/* Alinhar colunas numéricas à direita */
.data-table th:nth-child(n+3) {
  text-align: right;
}
</style>
