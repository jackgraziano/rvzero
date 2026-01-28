<template>
  <div class="ac-block">
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name">BLOCO AC - ALTERAÇÃO DE CADASTRO</h3>
    </div>

    <div v-show="!collapsed" class="block-content">
      <div v-for="usinaNum in usinasVisiveis" :key="usinaNum" class="usina-section">
        <h4 class="usina-title">Usina {{ usinaNum }}</h4>

        <div class="comparison-tables">
          <!-- Tabela Dadger 1 -->
          <div class="table-side">
            <h5 class="table-title">{{ dadger1Name }}</h5>
            <div class="lines-container">
              <div
                v-for="(alteracao, idx) in comparacoesPorUsina[usinaNum]"
                :key="`d1-${idx}`"
                :class="{
                  'line': true,
                  'highlighted': alteracao.onlyInOne,
                  'diff': alteracao.different && !alteracao.onlyInOne
                }"
              >
                <div v-if="alteracao.reg1" class="alteracao-content">
                  <span class="mnemonico">{{ alteracao.reg1.mnemonico }}</span>
                  <span class="dados">{{ alteracao.reg1.dados }}</span>
                  <span class="periodo" v-if="alteracao.reg1.mes || alteracao.reg1.ano">
                    {{ formatPeriodo(alteracao.reg1) }}
                  </span>
                </div>
                <div v-else class="alteracao-content alteracao-empty">-</div>
              </div>
              <div v-if="comparacoesPorUsina[usinaNum].length === 0" class="line empty-line">
                <span>Sem alterações</span>
              </div>
            </div>
          </div>

          <!-- Tabela Dadger 2 -->
          <div class="table-side">
            <h5 class="table-title">{{ dadger2Name }}</h5>
            <div class="lines-container">
              <div
                v-for="(alteracao, idx) in comparacoesPorUsina[usinaNum]"
                :key="`d2-${idx}`"
                :class="{
                  'line': true,
                  'highlighted': alteracao.onlyInOne,
                  'diff': alteracao.different && !alteracao.onlyInOne
                }"
              >
                <div v-if="alteracao.reg2" class="alteracao-content">
                  <span class="mnemonico">{{ alteracao.reg2.mnemonico }}</span>
                  <span class="dados">{{ alteracao.reg2.dados }}</span>
                  <span class="periodo" v-if="alteracao.reg2.mes || alteracao.reg2.ano">
                    {{ formatPeriodo(alteracao.reg2) }}
                  </span>
                </div>
                <div v-else class="alteracao-content alteracao-empty">-</div>
              </div>
              <div v-if="comparacoesPorUsina[usinaNum].length === 0" class="line empty-line">
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

export default {
  name: 'ACBlock',
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

    // Comparações agrupadas por usina
    const comparacoesPorUsina = computed(() => {
      const result = {}

      const registros1 = props.dadger1Data.AC || []
      const registros2 = props.dadger2Data.AC || []

      // Coletar todas as usinas
      const usinas = new Set()
      registros1.forEach(r => usinas.add(r.usina))
      registros2.forEach(r => usinas.add(r.usina))

      for (const usina of usinas) {
        const regsUsina1 = registros1.filter(r => r.usina === usina)
        const regsUsina2 = registros2.filter(r => r.usina === usina)

        // Criar chave composta para cada alteração
        const chavesMap = new Map()

        regsUsina1.forEach(r => {
          const chave = criarChave(r)
          if (!chavesMap.has(chave)) {
            chavesMap.set(chave, { reg1: r, reg2: null })
          } else {
            chavesMap.get(chave).reg1 = r
          }
        })

        regsUsina2.forEach(r => {
          const chave = criarChave(r)
          if (!chavesMap.has(chave)) {
            chavesMap.set(chave, { reg1: null, reg2: r })
          } else {
            chavesMap.get(chave).reg2 = r
          }
        })

        // Converter para array e adicionar flags
        const comparacoes = []
        for (const [chave, { reg1, reg2 }] of chavesMap) {
          const onlyInOne = (reg1 && !reg2) || (!reg1 && reg2)
          const different = reg1 && reg2 && !compararAlteracoes(reg1, reg2)

          comparacoes.push({
            chave,
            reg1,
            reg2,
            onlyInOne,
            different
          })
        }

        result[usina] = comparacoes
      }

      return result
    })

    // Criar chave única para cada alteração (usina + mnemônico + período)
    const criarChave = (reg) => {
      const periodo = `${reg.mes || ''}-${reg.semana || ''}-${reg.ano || ''}`
      return `${reg.mnemonico}-${periodo}`
    }

    // Comparar duas alterações
    const compararAlteracoes = (reg1, reg2) => {
      // Comparar dados sem espaços finais
      const dados1 = reg1.dados.trimEnd()
      const dados2 = reg2.dados.trimEnd()
      return dados1 === dados2
    }

    // Usinas que devem ser mostradas
    const usinasVisiveis = computed(() => {
      const visiveis = []

      for (const [usinaStr, comparacoes] of Object.entries(comparacoesPorUsina.value)) {
        const usina = parseInt(usinaStr)

        // Se não tem dados, não mostrar
        if (comparacoes.length === 0) {
          continue
        }

        // Se filtro está ativo, só mostrar se tem diferenças
        if (props.showOnlyDifferences) {
          const temDiferenca = comparacoes.some(c => c.onlyInOne || c.different)
          if (!temDiferenca) {
            continue
          }
        }

        visiveis.push(usina)
      }

      return visiveis.sort((a, b) => a - b)
    })

    const formatPeriodo = (reg) => {
      const partes = []
      if (reg.mes) partes.push(reg.mes)
      if (reg.semana) partes.push(`S${reg.semana}`)
      if (reg.ano) partes.push(reg.ano)
      return partes.length > 0 ? `[${partes.join(' ')}]` : ''
    }

    return {
      collapsed,
      toggleCollapsed,
      comparacoesPorUsina,
      usinasVisiveis,
      formatPeriodo
    }
  }
}
</script>

<style scoped>
.ac-block {
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

.usina-section {
  border-bottom: 1px solid #333;
}

.usina-section:last-child {
  border-bottom: none;
}

.usina-title {
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
  max-height: 400px;
  overflow-y: auto;
}

.line {
  display: flex;
  padding: 6px 8px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  border-bottom: 1px solid #2d2d2d;
  min-height: 32px;
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
  color: #00ccff;
  font-weight: 700;
  min-width: 80px;
}

.dados {
  color: #00ff00;
  flex: 1;
  font-family: 'Courier New', monospace;
}

.periodo {
  color: #ffaa00;
  font-size: 10px;
  white-space: nowrap;
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
