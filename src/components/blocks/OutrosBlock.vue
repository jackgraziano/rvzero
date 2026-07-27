<template>
  <div class="outros-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name" :class="{ 'has-diff': hasDifferences }">OUTROS BLOCOS</h3>
    </div>

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
@import '../../styles/block-tables.css';

.outros-block {
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

.mnemonic-section {
  border-bottom: 1px solid #333;
}

.mnemonic-section:last-child {
  border-bottom: none;
}

.mnemonic-title {
  padding: 8px 12px;
  margin: 0;
  background: #2d2d2d;
  color: #00ff00;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  border-bottom: 1px solid #444;
}

.comparison-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: #000;
}

.table-side {
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
}

.table-title {
  padding: 6px 12px;
  background: #2d2d2d;
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  color: #00ff00;
  border-bottom: 1px solid #444;
  font-family: 'Courier New', monospace;
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
  font-family: 'Courier New', monospace;
  font-size: 11px;
  border-bottom: 1px solid #2d2d2d;
  min-height: 24px;
}

.line:hover {
  background: #2d2d2d;
}

.line.highlighted {
  background: rgba(255, 0, 0, 0.15);
  border-left: 3px solid #ff0000;
}

.line.diff {
  background: rgba(255, 255, 0, 0.15);
  border-left: 3px solid #ffff00;
}

.line-number {
  display: inline-block;
  width: 40px;
  color: #666;
  text-align: right;
  margin-right: 12px;
  flex-shrink: 0;
}

.line-content {
  color: #00ff00;
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
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  opacity: 0.6;
}
</style>
