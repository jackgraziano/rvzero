<template>
  <div class="renovaveis-comparison">
    <header class="renewables-header">
      <span>Resultado da comparação</span>
      <h2>Geração renovável</h2>
      <p>
        <template v-if="compareMode === 'data'">
          Cada PerIni foi associado à data do estágio correspondente no DADGER
          do mesmo deck.
        </template>
        <template v-else>
          Comparação direta pelo número do período informado em cada arquivo.
        </template>
        {{ showOnlyDifferences ? 'Somente diferenças estão visíveis.' : 'Todos os registros estão visíveis.' }}
      </p>
    </header>

    <RenovaveisGeracaoBlock
      :renovaveis1-data="renovaveis1Data"
      :renovaveis1-name="renovaveis1Name"
      :renovaveis2-data="renovaveis2Data"
      :renovaveis2-name="renovaveis2Name"
      :dadger1-data="dadger1Data"
      :dadger2-data="dadger2Data"
      :compare-mode="compareMode"
      :show-only-differences="showOnlyDifferences"
    />
  </div>
</template>

<script>
import RenovaveisGeracaoBlock from './blocks/RenovaveisGeracaoBlock.vue'

export default {
  name: 'RenovaveisComparisonView',
  components: {
    RenovaveisGeracaoBlock
  },
  props: {
    renovaveis1Data: { type: Object, required: true },
    renovaveis1Name: { type: String, required: true },
    renovaveis2Data: { type: Object, required: true },
    renovaveis2Name: { type: String, required: true },
    dadger1Data: { type: Object, default: null },
    dadger2Data: { type: Object, default: null },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  }
}
</script>

<style scoped>
.renovaveis-comparison {
  overflow: hidden;
  padding: 4px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.renewables-header {
  padding: 18px;
  background: var(--surface-elevated);
  border-bottom: 1px solid var(--border);
}

.renewables-header span {
  color: var(--accent);
  font: 750 9px/1.2 var(--font-ui);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.renewables-header h2 {
  margin: 6px 0 4px;
  color: var(--text);
  font: 700 18px/1.25 var(--font-ui);
}

.renewables-header p {
  margin: 0;
  color: var(--muted);
  font: 500 11px/1.5 var(--font-ui);
}
</style>
