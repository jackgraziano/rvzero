<template>
  <div class="ac-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      title="BLOCO AC — ALTERAÇÃO DE CADASTRO"
      @toggle="toggleCollapsed"
    />

    <div v-show="!collapsed" class="block-content">
      <div v-for="usinaNum in usinasVisiveis" :key="usinaNum" class="usina-section">
        <h4 class="usina-title">Usina {{ usinaNum }}</h4>

        <div class="comparison-tables">
          <!-- Tabela Dadger 1 -->
          <div class="table-side">
            <h5 class="table-title">{{ dadger1Name }}</h5>
            <div class="lines-container">
              <div
                v-for="(alteracao, idx) in comparacoesFiltradas[usinaNum]"
                :key="`d1-${idx}`"
                :class="{
                  'line': true,
                  'faded': !alteracao.sameTemporality,
                  'highlighted': alteracao.onlyInOne && alteracao.sameTemporality,
                  'diff': alteracao.different && alteracao.sameTemporality && !alteracao.onlyInOne
                }"
              >
                <div v-if="alteracao.reg1" class="alteracao-content">
                  <span class="mnemonico">{{ alteracao.reg1.mnemonico }}</span>
                  <span v-if="alteracao.reg1.cotvol" class="cotvol-coefficients">
                    <span
                      v-for="coefficient in alteracao.reg1.coeficientes"
                      :key="coefficient.indice"
                      class="cotvol-coefficient"
                      :title="coefficient.indice === 1 ? 'Termo independente' : `Coeficiente ${coefficient.indice}`"
                    >
                      C{{ coefficient.indice }}
                      <strong>{{ formatCompactNumber(coefficient.valor) }}</strong>
                    </span>
                  </span>
                  <span v-else class="dados">{{ alteracao.reg1.dados }}</span>
                  <span class="periodo" v-if="hasPeriod(alteracao.reg1)">
                    {{ formatPeriodo(alteracao.reg1) }}
                  </span>
                </div>
                <div v-else class="alteracao-content alteracao-empty">-</div>
              </div>
              <div v-if="comparacoesFiltradas[usinaNum].length === 0" class="line empty-line">
                <span>Sem alterações</span>
              </div>
            </div>
          </div>

          <!-- Tabela Dadger 2 -->
          <div class="table-side">
            <h5 class="table-title">{{ dadger2Name }}</h5>
            <div class="lines-container">
              <div
                v-for="(alteracao, idx) in comparacoesFiltradas[usinaNum]"
                :key="`d2-${idx}`"
                :class="{
                  'line': true,
                  'faded': !alteracao.sameTemporality,
                  'highlighted': alteracao.onlyInOne && alteracao.sameTemporality,
                  'diff': alteracao.different && alteracao.sameTemporality && !alteracao.onlyInOne
                }"
              >
                <div v-if="alteracao.reg2" class="alteracao-content">
                  <span class="mnemonico">{{ alteracao.reg2.mnemonico }}</span>
                  <span v-if="alteracao.reg2.cotvol" class="cotvol-coefficients">
                    <span
                      v-for="coefficient in alteracao.reg2.coeficientes"
                      :key="coefficient.indice"
                      class="cotvol-coefficient"
                      :title="coefficient.indice === 1 ? 'Termo independente' : `Coeficiente ${coefficient.indice}`"
                    >
                      C{{ coefficient.indice }}
                      <strong>{{ formatCompactNumber(coefficient.valor) }}</strong>
                    </span>
                  </span>
                  <span v-else class="dados">{{ alteracao.reg2.dados }}</span>
                  <span class="periodo" v-if="hasPeriod(alteracao.reg2)">
                    {{ formatPeriodo(alteracao.reg2) }}
                  </span>
                </div>
                <div v-else class="alteracao-content alteracao-empty">-</div>
              </div>
              <div v-if="comparacoesFiltradas[usinaNum].length === 0" class="line empty-line">
                <span>Sem alterações</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="usinasVisiveis.length === 0" class="empty-message">
        <p>Nenhuma alteração de cadastro encontrada</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { alignSequences } from '../../utils/comparison.js'
import { rowHasDifferences } from '../../composables/useBlockComparison.js'
import {
  buildCotvolSnapshots,
  cotvolSignature
} from '../../utils/cotvol.js'
import { recordRowsFromOccurrences } from '../../utils/reportPresentation.js'
import { formatCompactNumber } from '../../utils/restrictionDisplay.js'

export default {
  name: 'ACBlock',
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
    const collapsed = ref(true)

    const toggleCollapsed = () => {
      collapsed.value = !collapsed.value
    }

    const normalizedRecords = (dadgerData) => [
      ...buildCotvolSnapshots(
        dadgerData.AC ?? [],
        dadgerData.info_dadger
      ),
      ...(dadgerData.AC ?? []).filter(record => record.mnemonico !== 'COTVOL')
    ]

    // Comparações agrupadas por usina
    const comparacoesPorUsina = computed(() => {
      if (Array.isArray(props.occurrences)) {
        const rows = recordRowsFromOccurrences(props.occurrences, {
          mode: props.compareMode,
          includeSourceDate: true
        })
        const result = {}
        for (const row of rows) {
          if (!result[row.usina]) result[row.usina] = []
          result[row.usina].push({
            chave: row.key,
            reg1: normalizeOccurrenceRecord(row.dadger1, row),
            reg2: normalizeOccurrenceRecord(row.dadger2, row),
            onlyInOne: row.onlyInOne,
            different: row.occurrence.status === 'changed',
            sameTemporality: row.sameTemporality,
            has_diff: row.has_diff
          })
        }
        return result
      }

      const result = {}

      const registros1 = normalizedRecords(props.dadger1Data)
      const registros2 = normalizedRecords(props.dadger2Data)

      // Coletar todas as usinas
      const usinas = new Set()
      registros1.forEach(r => usinas.add(r.usina))
      registros2.forEach(r => usinas.add(r.usina))

      for (const usina of usinas) {
        const regsUsina1 = registros1.filter(r => r.usina === usina)
        const regsUsina2 = registros2.filter(r => r.usina === usina)

        const keys = new Set([
          ...regsUsina1.map(criarChave),
          ...regsUsina2.map(criarChave)
        ])
        const comparacoes = []
        for (const chave of keys) {
          const group1 = regsUsina1.filter(record => criarChave(record) === chave)
          const group2 = regsUsina2.filter(record => criarChave(record) === chave)
          const pairs = alignSequences(
            group1,
            group2,
            comparableValue
          )

          pairs.forEach(({ left: reg1, right: reg2 }, index) => {
            const sameTemporality = recordsShareHorizon(reg1, reg2)
            const onlyInOne = !reg1 || !reg2
            const different = Boolean(
              reg1 && reg2 && !compararAlteracoes(reg1, reg2)
            )
            comparacoes.push({
              chave: `${chave}-${index}`,
              reg1,
              reg2,
              onlyInOne,
              different,
              sameTemporality,
              has_diff: sameTemporality && (onlyInOne || different)
            })
          })
        }

        result[usina] = comparacoes
      }

      return result
    })

    // Criar chave única para cada alteração (usina + mnemônico + período)
    const criarChave = (reg) => {
      if (reg.cotvol) {
        if (reg.estagio === null) return 'COTVOL-estatico'
        const period = props.compareMode === 'data'
          ? reg.data_inicio
          : `estagio-${reg.estagio}`
        return `COTVOL-${period}`
      }

      const periodo = `${reg.mes || ''}-${reg.semana || ''}-${reg.ano || ''}`
      return `${reg.mnemonico}-${periodo}`
    }

    const comparableValue = (record) => record.cotvol
      ? cotvolSignature(record)
      : record.dados.trimEnd()

    // Comparar duas alterações
    const compararAlteracoes = (reg1, reg2) => {
      return comparableValue(reg1) === comparableValue(reg2)
    }

    const recordsShareHorizon = (reg1, reg2) => {
      const record = reg1 ?? reg2
      if (!record?.cotvol || record.estagio === null) return true

      if (props.compareMode === 'data') {
        const dates1 = Object.values(
          props.dadger1Data.info_dadger?.datas_estagios ?? {}
        )
        const dates2 = Object.values(
          props.dadger2Data.info_dadger?.datas_estagios ?? {}
        )
        return dates1.includes(record.data_inicio) &&
          dates2.includes(record.data_inicio)
      }

      return record.estagio <=
        (props.dadger1Data.info_dadger?.numero_estagios ?? 0) &&
        record.estagio <=
        (props.dadger2Data.info_dadger?.numero_estagios ?? 0)
    }

    // Comparações filtradas (filtra linhas individuais quando filtro ativo)
    const comparacoesFiltradas = computed(() => {
      const result = {}

      for (const [usina, comparacoes] of Object.entries(comparacoesPorUsina.value)) {
        if (props.showOnlyDifferences) {
          // Filtrar apenas linhas com diferenças
          result[usina] = comparacoes.filter(rowHasDifferences)
        } else {
          // Mostrar todas as linhas
          result[usina] = comparacoes
        }
      }

      return result
    })

    // Usinas que devem ser mostradas
    const usinasVisiveis = computed(() => {
      const visiveis = []

      for (const [usinaStr, comparacoes] of Object.entries(comparacoesFiltradas.value)) {
        const usina = parseInt(usinaStr)

        // Se não tem dados (após filtro), não mostrar
        if (comparacoes.length === 0) {
          continue
        }

        visiveis.push(usina)
      }

      return visiveis.sort((a, b) => a - b)
    })

    // Verificar se há diferenças no bloco
    const hasDifferences = computed(() => {
      for (const comparacoes of Object.values(comparacoesPorUsina.value)) {
        if (comparacoes.some(rowHasDifferences)) {
          return true
        }
      }
      return false
    })

    const formatPeriodo = (reg) => {
      if (reg.cotvol && reg.data_inicio) {
        return props.compareMode === 'data'
          ? `[${reg.data_inicio} · Estágio ${reg.estagio}]`
          : `[Estágio ${reg.estagio} · ${reg.data_inicio}]`
      }

      const partes = []
      if (reg.mes) partes.push(reg.mes)
      if (reg.semana) partes.push(`S${reg.semana}`)
      if (reg.ano) partes.push(reg.ano)
      return partes.length > 0 ? `[${partes.join(' ')}]` : ''
    }

    const hasPeriod = (record) => Boolean(
      record.data_inicio || record.mes || record.ano
    )

    return {
      collapsed,
      toggleCollapsed,
      comparacoesFiltradas,
      usinasVisiveis,
      formatPeriodo,
      formatCompactNumber,
      hasDifferences,
      hasPeriod
    }

    function normalizeOccurrenceRecord(record, row) {
      if (!record) return null
      const cotvol = record.mnemonico === 'COTVOL'
      return {
        ...record,
        cotvol,
        data_inicio: row.occurrence.calendar?.date ?? null
      }
    }
  }
}
</script>

<style scoped>

.ac-block {
  margin: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.block-content {
  background: var(--surface);
}

.usina-section {
  border-bottom: 1px solid var(--border);
}

.usina-section:last-child {
  border-bottom: none;
}

.usina-title {
  padding: 8px 12px;
  margin: 0;
  background: var(--surface-elevated);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-mono);
  border-bottom: 1px solid var(--border);
}

.comparison-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: var(--background);
}

.table-side {
  background: var(--surface);
  display: flex;
  flex-direction: column;
}

.table-title {
  padding: 6px 12px;
  background: var(--surface-elevated);
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  color: var(--accent);
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
}

.lines-container {
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;
}

.line {
  display: flex;
  padding: 6px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  border-bottom: 1px solid var(--surface-elevated);
  min-height: 32px;
}

.line:hover {
  background: var(--surface-elevated);
}

.line.highlighted {
  background: rgba(255, 0, 0, 0.15);
  border-left: 3px solid var(--danger);
}

.line.diff {
  background: rgba(255, 255, 0, 0.15);
  border-left: 3px solid var(--warning);
}

.line.faded {
  opacity: 0.42;
}

.alteracao-content {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.alteracao-empty {
  opacity: 0.3;
}

.mnemonico {
  color: var(--accent-strong);
  font-weight: 700;
  min-width: 80px;
}

.dados {
  color: var(--accent);
  flex: 1;
  font-family: var(--font-mono);
}

.cotvol-coefficients {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 5px;
}

.cotvol-coefficient {
  display: inline-flex;
  gap: 5px;
  align-items: baseline;
  padding: 2px 6px;
  color: var(--muted);
  background: var(--chip);
  border: 1px solid var(--border);
  border-radius: 4px;
}

.cotvol-coefficient strong {
  color: var(--text);
  font-weight: 600;
}

.periodo {
  color: var(--warning);
  font-size: 10px;
  white-space: nowrap;
}

.empty-line {
  opacity: 0.5;
}

.empty-message {
  padding: 40px;
  text-align: center;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 12px;
  opacity: 0.6;
}
</style>
