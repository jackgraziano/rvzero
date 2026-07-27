<template>
  <div class="outros-block">
    <ComparisonBlockHeader
      :collapsed="collapsed"
      :has-differences="hasDifferences"
      title="OUTROS BLOCOS"
      @toggle="toggleCollapsed"
    />

    <div v-show="!collapsed" class="block-content">
      <div v-for="mnem in mnemonicosVisiveis" :key="mnem" class="mnemonic-section">
        <h4 class="mnemonic-title">{{ mnem }}</h4>

        <div class="comparison-tables">
          <!-- Tabela Dadger 1 -->
          <div class="table-side">
            <h5 class="table-title">{{ dadger1Name }}</h5>
            <div class="lines-container">
              <div
                v-for="(lineData, idx) in comparacoes[mnem]"
                :key="`d1-${idx}`"
                :class="{
                  'line': true,
                  'highlighted': lineData.onlyInOne,
                  'diff': lineData.different && !lineData.onlyInOne
                }"
              >
                <span class="line-number">{{ idx + 1 }}</span>
                <span class="line-content">{{ lineData.linha1 || '' }}</span>
              </div>
              <div v-if="comparacoes[mnem].length === 0" class="line empty-line">
                <span class="line-content">Sem dados</span>
              </div>
            </div>
          </div>

          <!-- Tabela Dadger 2 -->
          <div class="table-side">
            <h5 class="table-title">{{ dadger2Name }}</h5>
            <div class="lines-container">
              <div
                v-for="(lineData, idx) in comparacoes[mnem]"
                :key="`d2-${idx}`"
                :class="{
                  'line': true,
                  'highlighted': lineData.onlyInOne,
                  'diff': lineData.different && !lineData.onlyInOne
                }"
              >
                <span class="line-number">{{ idx + 1 }}</span>
                <span class="line-content">{{ lineData.linha2 || '' }}</span>
              </div>
              <div v-if="comparacoes[mnem].length === 0" class="line empty-line">
                <span class="line-content">Sem dados</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="mnemonicosVisiveis.length === 0" class="empty-message">
        <p>Nenhum dado encontrado nos outros blocos</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { alignSequences } from '../../utils/comparison.js'

export default {
  name: 'OutrosBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    const collapsed = ref(true)

    const toggleCollapsed = () => {
      collapsed.value = !collapsed.value
    }

    const mnemonicos = computed(() => [...new Set([
      ...Object.keys(props.dadger1Data.OUTROS ?? {}),
      ...Object.keys(props.dadger2Data.OUTROS ?? {})
    ])].sort())

    // Comparações linha a linha para cada mnemônico
    const comparacoes = computed(() => {
      const result = {}

      const outros1 = props.dadger1Data.OUTROS || {}
      const outros2 = props.dadger2Data.OUTROS || {}

      for (const mnem of mnemonicos.value) {
        const linhas1 = outros1[mnem] || []
        const linhas2 = outros2[mnem] || []
        result[mnem] = alignSequences(linhas1, linhas2, line => line.trimEnd())
          .map(({ left: linha1, right: linha2 }) => ({
            linha1,
            linha2,
            onlyInOne: !linha1 || !linha2,
            different: Boolean(
              linha1 && linha2 && linha1.trimEnd() !== linha2.trimEnd()
            )
          }))
      }

      return result
    })

    // Comparações filtradas (filtra linhas individuais quando filtro ativo)
    const comparacoesFiltradas = computed(() => {
      const result = {}

      for (const mnem of mnemonicos.value) {
        const comp = comparacoes.value[mnem]

        if (props.showOnlyDifferences) {
          // Filtrar apenas linhas com diferenças
          result[mnem] = comp.filter(c => c.onlyInOne || c.different)
        } else {
          // Mostrar todas as linhas
          result[mnem] = comp
        }
      }

      return result
    })

    // Mnemônicos que devem ser mostrados
    const mnemonicosVisiveis = computed(() => {
      return mnemonicos.value.filter(
        mnemonic => comparacoesFiltradas.value[mnemonic].length > 0
      )
    })

    // Verificar se há diferenças no bloco
    const hasDifferences = computed(() => {
      for (const mnem of mnemonicos.value) {
        const comp = comparacoes.value[mnem]
        // OUTROS não tem temporalidade, então onlyInOne sempre conta
        if (comp.some(c => c.onlyInOne || c.different)) {
          return true
        }
      }
      return false
    })

    return {
      collapsed,
      toggleCollapsed,
      comparacoes: comparacoesFiltradas,
      mnemonicosVisiveis,
      hasDifferences
    }
  }
}
</script>

<style scoped>

.outros-block {
  margin: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.block-content {
  background: var(--surface);
}

.mnemonic-section {
  border-bottom: 1px solid var(--border);
}

.mnemonic-section:last-child {
  border-bottom: none;
}

.mnemonic-title {
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
  max-height: 300px;
  overflow-y: auto;
}

.line {
  display: flex;
  padding: 4px 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  border-bottom: 1px solid var(--surface-elevated);
  min-height: 24px;
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

.line-number {
  display: inline-block;
  width: 40px;
  color: var(--muted);
  text-align: right;
  margin-right: 12px;
  flex-shrink: 0;
}

.line-content {
  color: var(--accent);
  white-space: pre;
  overflow-x: auto;
  flex: 1;
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
