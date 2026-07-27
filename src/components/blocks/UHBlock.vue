<template>
  <div class="uh-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      title="BLOCO UH — USINAS HIDRÁULICAS"
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
                  <th @click="sortBy('numero_usina')" class="sortable" v-sortable-header>Nº Usina{{ getSortIcon('numero_usina') }}</th>
                  <th @click="sortBy('ree')" class="sortable" v-sortable-header>REE{{ getSortIcon('ree') }}</th>
                  <th @click="sortBy('volume_armazenado_pct')" class="sortable" v-sortable-header>Vol. Arm. (%){{ getSortIcon('volume_armazenado_pct') }}</th>
                  <th @click="sortBy('vazao_defluente_min')" class="sortable" v-sortable-header>Vaz. Def. Min{{ getSortIcon('vazao_defluente_min') }}</th>
                  <th @click="sortBy('chave_evaporacao')" class="sortable" v-sortable-header>Evap{{ getSortIcon('chave_evaporacao') }}</th>
                  <th @click="sortBy('estagio_producao')" class="sortable" v-sortable-header>Est. Prod{{ getSortIcon('estagio_producao') }}</th>
                  <th @click="sortBy('volume_morto')" class="sortable" v-sortable-header>Vol. Morto{{ getSortIcon('volume_morto') }}</th>
                  <th @click="sortBy('limite_vertimento')" class="sortable" v-sortable-header>Lim. Vert.{{ getSortIcon('limite_vertimento') }}</th>
                  <th @click="sortBy('chave_balanco_patamar')" class="sortable" v-sortable-header>Bal. Pat{{ getSortIcon('chave_balanco_patamar') }}</th>
                  <th @click="sortBy('status')" class="sortable" v-sortable-header>Status{{ getSortIcon('status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d1-${row.key}`"
                  :class="{
                    faded: !row.sameTemporality,
                    highlighted: row.onlyInOne && row.sameTemporality
                  }"
                >
                  <td class="col-usina">{{ row.dadger1?.numero_usina ?? '-' }}</td>
                  <td :class="{ diff: row.diff_ree && !row.onlyInOne }">{{ row.dadger1?.ree ?? '-' }}</td>
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
                  <td :class="{ diff: row.diff_status && !row.onlyInOne }">{{ row.dadger1?.status ?? '-' }}</td>
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
                  <th @click="sortBy('numero_usina')" class="sortable" v-sortable-header>Nº Usina{{ getSortIcon('numero_usina') }}</th>
                  <th @click="sortBy('ree')" class="sortable" v-sortable-header>REE{{ getSortIcon('ree') }}</th>
                  <th @click="sortBy('volume_armazenado_pct')" class="sortable" v-sortable-header>Vol. Arm. (%){{ getSortIcon('volume_armazenado_pct') }}</th>
                  <th @click="sortBy('vazao_defluente_min')" class="sortable" v-sortable-header>Vaz. Def. Min{{ getSortIcon('vazao_defluente_min') }}</th>
                  <th @click="sortBy('chave_evaporacao')" class="sortable" v-sortable-header>Evap{{ getSortIcon('chave_evaporacao') }}</th>
                  <th @click="sortBy('estagio_producao')" class="sortable" v-sortable-header>Est. Prod{{ getSortIcon('estagio_producao') }}</th>
                  <th @click="sortBy('volume_morto')" class="sortable" v-sortable-header>Vol. Morto{{ getSortIcon('volume_morto') }}</th>
                  <th @click="sortBy('limite_vertimento')" class="sortable" v-sortable-header>Lim. Vert.{{ getSortIcon('limite_vertimento') }}</th>
                  <th @click="sortBy('chave_balanco_patamar')" class="sortable" v-sortable-header>Bal. Pat{{ getSortIcon('chave_balanco_patamar') }}</th>
                  <th @click="sortBy('status')" class="sortable" v-sortable-header>Status{{ getSortIcon('status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in filteredData"
                  :key="`d2-${row.key}`"
                  :class="{
                    faded: !row.sameTemporality,
                    highlighted: row.onlyInOne && row.sameTemporality
                  }"
                >
                  <td class="col-usina">{{ row.dadger2?.numero_usina ?? '-' }}</td>
                  <td :class="{ diff: row.diff_ree && !row.onlyInOne }">{{ row.dadger2?.ree ?? '-' }}</td>
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
                  <td :class="{ diff: row.diff_status && !row.onlyInOne }">{{ row.dadger2?.status ?? '-' }}</td>
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
import { hasDiff, formatNumber, formatNumberScientific } from '../../utils/comparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'

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
    // Computed: dados alinhados (lógica específica do bloco UH)
    const alignedData = computed(() => {
      const registros1 = props.dadger1Data.UH || []
      const registros2 = props.dadger2Data.UH || []
      const sameTemporality = props.compareMode !== 'data' ||
        props.dadger1Data.info_dadger?.data_base ===
          props.dadger2Data.info_dadger?.data_base

      // Coletar todos os números de usina únicos
      const usinas = new Set()
      registros1.forEach(r => usinas.add(r.numero_usina))
      registros2.forEach(r => usinas.add(r.numero_usina))

      const alinhados = []

      for (const numero_usina of usinas) {
        const reg1 = registros1.find(r => r.numero_usina === numero_usina)
        const reg2 = registros2.find(r => r.numero_usina === numero_usina)

        const onlyInOne = !reg1 || !reg2
        const compare = (first, second) => sameTemporality && hasDiff(first, second)
        const differences = {
          diff_ree: compare(reg1?.ree, reg2?.ree),
          diff_volume_armazenado_pct: compare(reg1?.volume_armazenado_pct, reg2?.volume_armazenado_pct),
          diff_vazao_defluente_min: compare(reg1?.vazao_defluente_min, reg2?.vazao_defluente_min),
          diff_chave_evaporacao: compare(reg1?.chave_evaporacao, reg2?.chave_evaporacao),
          diff_estagio_producao: compare(reg1?.estagio_producao, reg2?.estagio_producao),
          diff_volume_morto: compare(reg1?.volume_morto, reg2?.volume_morto),
          diff_limite_vertimento: compare(reg1?.limite_vertimento, reg2?.limite_vertimento),
          diff_chave_balanco_patamar: compare(reg1?.chave_balanco_patamar, reg2?.chave_balanco_patamar),
          diff_status: compare(reg1?.status, reg2?.status)
        }

        alinhados.push({
          key: numero_usina,
          onlyInOne,
          sameTemporality,
          has_diff: sameTemporality && (
            onlyInOne || Object.values(differences).some(Boolean)
          ),
          dadger1: reg1 || null,
          dadger2: reg2 || null,
          ...differences
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
      formatNumberScientific,
      filteredData,
      hasDifferences
    }
  }
}
</script>

<style scoped>

.uh-block {
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

.col-usina {
  font-weight: 700;
  color: var(--accent);
}

.col-center {
  text-align: center;
}

/* Alinhar colunas numéricas à direita */
.data-table th:nth-child(n+3) {
  text-align: right;
}
</style>
