<template>
  <div class="ia-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name">BLOCO IA - INTERCÂMBIO ENTRE SUBSISTEMAS</h3>
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
                  <th rowspan="2" @click="sortBy('subsistema_de')" class="sortable">De{{ getSortIcon('subsistema_de') }}</th>
                  <th rowspan="2" @click="sortBy('subsistema_para')" class="sortable">Para{{ getSortIcon('subsistema_para') }}</th>
                  <th rowspan="2" @click="sortBy('flag_penalidade')" class="sortable">Flag{{ getSortIcon('flag_penalidade') }}</th>
                  <th colspan="2" class="patamar-header patamar-p1">P1</th>
                  <th colspan="2" class="patamar-header patamar-p2">P2</th>
                  <th colspan="2" class="patamar-header patamar-p3">P3</th>
                  <th colspan="2" class="patamar-header patamar-p4">P4</th>
                  <th colspan="2" class="patamar-header patamar-p5">P5</th>
                </tr>
                <tr class="header-row-2">
                  <th @click="sortBy('p1_de_para')" class="sortable col-p1">→{{ getSortIcon('p1_de_para') }}</th>
                  <th @click="sortBy('p1_para_de')" class="sortable col-p1-last">←{{ getSortIcon('p1_para_de') }}</th>
                  <th @click="sortBy('p2_de_para')" class="sortable col-p2">→{{ getSortIcon('p2_de_para') }}</th>
                  <th @click="sortBy('p2_para_de')" class="sortable col-p2-last">←{{ getSortIcon('p2_para_de') }}</th>
                  <th @click="sortBy('p3_de_para')" class="sortable col-p3">→{{ getSortIcon('p3_de_para') }}</th>
                  <th @click="sortBy('p3_para_de')" class="sortable col-p3-last">←{{ getSortIcon('p3_para_de') }}</th>
                  <th @click="sortBy('p4_de_para')" class="sortable col-p4">→{{ getSortIcon('p4_de_para') }}</th>
                  <th @click="sortBy('p4_para_de')" class="sortable col-p4-last">←{{ getSortIcon('p4_para_de') }}</th>
                  <th @click="sortBy('p5_de_para')" class="sortable col-p5">→{{ getSortIcon('p5_de_para') }}</th>
                  <th @click="sortBy('p5_para_de')" class="sortable col-p5-last">←{{ getSortIcon('p5_para_de') }}</th>
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
                  <td>{{ row.dadger1?.subsistema_de || '-' }}</td>
                  <td>{{ row.dadger1?.subsistema_para || '-' }}</td>
                  <td class="col-center">{{ row.dadger1?.flag_penalidade ?? '-' }}</td>
                  <td :class="{ 'diff': row.diff_p1_de_para && !row.onlyInOne }" class="col-number col-p1">
                    {{ formatNumber(row.dadger1?.p1_de_para) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p1_para_de && !row.onlyInOne }" class="col-number col-p1-last">
                    {{ formatNumber(row.dadger1?.p1_para_de) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p2_de_para && !row.onlyInOne }" class="col-number col-p2">
                    {{ formatNumber(row.dadger1?.p2_de_para) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p2_para_de && !row.onlyInOne }" class="col-number col-p2-last">
                    {{ formatNumber(row.dadger1?.p2_para_de) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p3_de_para && !row.onlyInOne }" class="col-number col-p3">
                    {{ formatNumber(row.dadger1?.p3_de_para) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p3_para_de && !row.onlyInOne }" class="col-number col-p3-last">
                    {{ formatNumber(row.dadger1?.p3_para_de) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p4_de_para && !row.onlyInOne }" class="col-number col-p4">
                    {{ formatNumber(row.dadger1?.p4_de_para) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p4_para_de && !row.onlyInOne }" class="col-number col-p4-last">
                    {{ formatNumber(row.dadger1?.p4_para_de) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p5_de_para && !row.onlyInOne }" class="col-number col-p5">
                    {{ formatNumber(row.dadger1?.p5_de_para) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p5_para_de && !row.onlyInOne }" class="col-number col-p5-last">
                    {{ formatNumber(row.dadger1?.p5_para_de) }}
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
                  <th rowspan="2" @click="sortBy('subsistema_de')" class="sortable">De{{ getSortIcon('subsistema_de') }}</th>
                  <th rowspan="2" @click="sortBy('subsistema_para')" class="sortable">Para{{ getSortIcon('subsistema_para') }}</th>
                  <th rowspan="2" @click="sortBy('flag_penalidade')" class="sortable">Flag{{ getSortIcon('flag_penalidade') }}</th>
                  <th colspan="2" class="patamar-header patamar-p1">P1</th>
                  <th colspan="2" class="patamar-header patamar-p2">P2</th>
                  <th colspan="2" class="patamar-header patamar-p3">P3</th>
                  <th colspan="2" class="patamar-header patamar-p4">P4</th>
                  <th colspan="2" class="patamar-header patamar-p5">P5</th>
                </tr>
                <tr class="header-row-2">
                  <th @click="sortBy('p1_de_para')" class="sortable col-p1">→{{ getSortIcon('p1_de_para') }}</th>
                  <th @click="sortBy('p1_para_de')" class="sortable col-p1-last">←{{ getSortIcon('p1_para_de') }}</th>
                  <th @click="sortBy('p2_de_para')" class="sortable col-p2">→{{ getSortIcon('p2_de_para') }}</th>
                  <th @click="sortBy('p2_para_de')" class="sortable col-p2-last">←{{ getSortIcon('p2_para_de') }}</th>
                  <th @click="sortBy('p3_de_para')" class="sortable col-p3">→{{ getSortIcon('p3_de_para') }}</th>
                  <th @click="sortBy('p3_para_de')" class="sortable col-p3-last">←{{ getSortIcon('p3_para_de') }}</th>
                  <th @click="sortBy('p4_de_para')" class="sortable col-p4">→{{ getSortIcon('p4_de_para') }}</th>
                  <th @click="sortBy('p4_para_de')" class="sortable col-p4-last">←{{ getSortIcon('p4_para_de') }}</th>
                  <th @click="sortBy('p5_de_para')" class="sortable col-p5">→{{ getSortIcon('p5_de_para') }}</th>
                  <th @click="sortBy('p5_para_de')" class="sortable col-p5-last">←{{ getSortIcon('p5_para_de') }}</th>
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
                  <td>{{ row.dadger2?.subsistema_de || '-' }}</td>
                  <td>{{ row.dadger2?.subsistema_para || '-' }}</td>
                  <td class="col-center">{{ row.dadger2?.flag_penalidade ?? '-' }}</td>
                  <td :class="{ 'diff': row.diff_p1_de_para && !row.onlyInOne }" class="col-number col-p1">
                    {{ formatNumber(row.dadger2?.p1_de_para) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p1_para_de && !row.onlyInOne }" class="col-number col-p1-last">
                    {{ formatNumber(row.dadger2?.p1_para_de) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p2_de_para && !row.onlyInOne }" class="col-number col-p2">
                    {{ formatNumber(row.dadger2?.p2_de_para) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p2_para_de && !row.onlyInOne }" class="col-number col-p2-last">
                    {{ formatNumber(row.dadger2?.p2_para_de) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p3_de_para && !row.onlyInOne }" class="col-number col-p3">
                    {{ formatNumber(row.dadger2?.p3_de_para) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p3_para_de && !row.onlyInOne }" class="col-number col-p3-last">
                    {{ formatNumber(row.dadger2?.p3_para_de) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p4_de_para && !row.onlyInOne }" class="col-number col-p4">
                    {{ formatNumber(row.dadger2?.p4_de_para) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p4_para_de && !row.onlyInOne }" class="col-number col-p4-last">
                    {{ formatNumber(row.dadger2?.p4_para_de) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p5_de_para && !row.onlyInOne }" class="col-number col-p5">
                    {{ formatNumber(row.dadger2?.p5_de_para) }}
                  </td>
                  <td :class="{ 'diff': row.diff_p5_para_de && !row.onlyInOne }" class="col-number col-p5-last">
                    {{ formatNumber(row.dadger2?.p5_para_de) }}
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
  name: 'IABlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    // Computed: dados alinhados (lógica específica do bloco IA)
    const alignedData = computed(() => {
      const registros1 = props.dadger1Data.IA
      const registros2 = props.dadger2Data.IA

      // Criar função de transformação que usa uma chave composta
      const transformFn = (reg1, reg2, onlyInOne, sameTemporality, primaryValue, intercambio) => {
        return {
          key: `${primaryValue}-${intercambio}`,
          onlyInOne,
          sameTemporality,
          dadger1: reg1 ? {
            display: props.compareMode === 'estagio' ? `Estágio ${reg1.estagio}` : primaryValue,
            subsistema_de: reg1.subsistema_de,
            subsistema_para: reg1.subsistema_para,
            flag_penalidade: reg1.flag_penalidade,
            p1_de_para: reg1.p1_de_para,
            p1_para_de: reg1.p1_para_de,
            p2_de_para: reg1.p2_de_para,
            p2_para_de: reg1.p2_para_de,
            p3_de_para: reg1.p3_de_para,
            p3_para_de: reg1.p3_para_de,
            p4_de_para: reg1.p4_de_para,
            p4_para_de: reg1.p4_para_de,
            p5_de_para: reg1.p5_de_para,
            p5_para_de: reg1.p5_para_de
          } : null,
          dadger2: reg2 ? {
            display: props.compareMode === 'estagio' ? `Estágio ${reg2.estagio}` : primaryValue,
            subsistema_de: reg2.subsistema_de,
            subsistema_para: reg2.subsistema_para,
            flag_penalidade: reg2.flag_penalidade,
            p1_de_para: reg2.p1_de_para,
            p1_para_de: reg2.p1_para_de,
            p2_de_para: reg2.p2_de_para,
            p2_para_de: reg2.p2_para_de,
            p3_de_para: reg2.p3_de_para,
            p3_para_de: reg2.p3_para_de,
            p4_de_para: reg2.p4_de_para,
            p4_para_de: reg2.p4_para_de,
            p5_de_para: reg2.p5_de_para,
            p5_para_de: reg2.p5_para_de
          } : null,
          diff_flag_penalidade: hasDiff(reg1?.flag_penalidade, reg2?.flag_penalidade),
          diff_p1_de_para: hasDiff(reg1?.p1_de_para, reg2?.p1_de_para),
          diff_p1_para_de: hasDiff(reg1?.p1_para_de, reg2?.p1_para_de),
          diff_p2_de_para: hasDiff(reg1?.p2_de_para, reg2?.p2_de_para),
          diff_p2_para_de: hasDiff(reg1?.p2_para_de, reg2?.p2_para_de),
          diff_p3_de_para: hasDiff(reg1?.p3_de_para, reg2?.p3_de_para),
          diff_p3_para_de: hasDiff(reg1?.p3_para_de, reg2?.p3_para_de),
          diff_p4_de_para: hasDiff(reg1?.p4_de_para, reg2?.p4_de_para),
          diff_p4_para_de: hasDiff(reg1?.p4_para_de, reg2?.p4_para_de),
          diff_p5_de_para: hasDiff(reg1?.p5_de_para, reg2?.p5_de_para),
          diff_p5_para_de: hasDiff(reg1?.p5_para_de, reg2?.p5_para_de)
        }
      }

      // Usar função customizada de alinhamento com chave composta
      // Para IA, a chave secundária é a combinação subsistema_de-subsistema_para
      const createCompositeKey = (reg) => `${reg.subsistema_de}-${reg.subsistema_para}`

      // Coletar valores únicos de intercâmbio
      const intercambios = new Set()
      registros1.forEach(r => intercambios.add(createCompositeKey(r)))
      registros2.forEach(r => intercambios.add(createCompositeKey(r)))

      const alinhados = []

      if (props.compareMode === 'estagio') {
        // Coletar estágios únicos
        const estagios = new Set()
        registros1.forEach(r => estagios.add(r.estagio))
        registros2.forEach(r => estagios.add(r.estagio))

        const estagiosArray = Array.from(estagios).sort((a, b) => a - b)
        const estagiosNoDadger1 = new Set(registros1.map(r => r.estagio))
        const estagiosNoDadger2 = new Set(registros2.map(r => r.estagio))

        for (const estagio of estagiosArray) {
          const sameTemporality = estagiosNoDadger1.has(estagio) && estagiosNoDadger2.has(estagio)

          for (const intercambio of intercambios) {
            const reg1 = registros1.find(r => r.estagio === estagio && createCompositeKey(r) === intercambio)
            const reg2 = registros2.find(r => r.estagio === estagio && createCompositeKey(r) === intercambio)

            if (reg1 || reg2) {
              const onlyInOne = !reg1 || !reg2
              alinhados.push(transformFn(reg1, reg2, onlyInOne, sameTemporality, estagio, intercambio))
            }
          }
        }
      } else {
        // Modo por data
        const todasDatas = new Set()
        if (props.dadger1Data.info_dadger?.datas_estagios) {
          Object.values(props.dadger1Data.info_dadger.datas_estagios).forEach(d => todasDatas.add(d))
        }
        if (props.dadger2Data.info_dadger?.datas_estagios) {
          Object.values(props.dadger2Data.info_dadger.datas_estagios).forEach(d => todasDatas.add(d))
        }

        const datasArray = Array.from(todasDatas).sort((a, b) => {
          const [diaA, mesA, anoA] = a.split('/').map(Number)
          const [diaB, mesB, anoB] = b.split('/').map(Number)
          return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB)
        })

        const datasNoDadger1 = new Set(
          props.dadger1Data.info_dadger?.datas_estagios ? Object.values(props.dadger1Data.info_dadger.datas_estagios) : []
        )
        const datasNoDadger2 = new Set(
          props.dadger2Data.info_dadger?.datas_estagios ? Object.values(props.dadger2Data.info_dadger.datas_estagios) : []
        )

        for (const data of datasArray) {
          const sameTemporality = datasNoDadger1.has(data) && datasNoDadger2.has(data)

          // Encontrar estágio correspondente a esta data
          const findEstagioByData = (dadgerData, dataToFind) => {
            if (!dadgerData.info_dadger?.datas_estagios) return null
            for (const [estagio, dataEstagio] of Object.entries(dadgerData.info_dadger.datas_estagios)) {
              if (dataEstagio === dataToFind) return parseInt(estagio)
            }
            return null
          }

          for (const intercambio of intercambios) {
            const estagio1 = findEstagioByData(props.dadger1Data, data)
            const estagio2 = findEstagioByData(props.dadger2Data, data)

            const reg1 = estagio1 ? registros1.find(r => r.estagio === estagio1 && createCompositeKey(r) === intercambio) : null
            const reg2 = estagio2 ? registros2.find(r => r.estagio === estagio2 && createCompositeKey(r) === intercambio) : null

            if (reg1 || reg2) {
              const onlyInOne = !reg1 || !reg2
              alinhados.push(transformFn(reg1, reg2, onlyInOne, sameTemporality, data, intercambio))
            }
          }
        }
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
      formatNumber,
      createFilteredData
    } = useBlockComparison(props, alignedData)

    // Criar filteredData com os campos de diff específicos do bloco IA
    const filteredData = createFilteredData([
      'diff_flag_penalidade',
      'diff_p1_de_para', 'diff_p1_para_de',
      'diff_p2_de_para', 'diff_p2_para_de',
      'diff_p3_de_para', 'diff_p3_para_de',
      'diff_p4_de_para', 'diff_p4_para_de',
      'diff_p5_de_para', 'diff_p5_para_de'
    ])

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
      filteredData
    }
  }
}
</script>

<style scoped>
@import '../../styles/block-tables.css';

.ia-block {
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

.col-center {
  text-align: center;
}

/* Alinhar colunas numéricas à direita */
.data-table th:nth-child(n+5) {
  text-align: right;
}

/* Estilos para patamares P1-P5 */
.patamar-p1 {
  background: #1a2d1a;
  border-right: 2px solid #00ff00;
}

.patamar-p2 {
  background: #1a1a2d;
  border-right: 2px solid #00ff00;
}

.patamar-p3 {
  background: #2d1a1a;
  border-right: 2px solid #00ff00;
}

.patamar-p4 {
  background: #2d2d1a;
  border-right: 2px solid #00ff00;
}

.patamar-p5 {
  background: #1a2d2d;
}

.col-p1-last,
.col-p2-last,
.col-p3-last,
.col-p4-last,
.col-p5-last {
  border-right: 2px solid #00ff00 !important;
}
</style>
