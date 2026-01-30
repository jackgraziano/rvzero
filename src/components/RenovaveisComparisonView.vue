<template>
  <div class="renovaveis-comparison">
    <h2 class="main-title">Comparação de Renováveis</h2>

    <RenovaveisGeracaoBlock
      :renovaveis1Data="renovaveis1Data"
      :renovaveis1Name="renovaveis1Name"
      :renovaveis2Data="renovaveis2Data"
      :renovaveis2Name="renovaveis2Name"
      :showOnlyDifferences="showOnlyDifferences"
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
    showOnlyDifferences: { type: Boolean, required: true }
  }
}
</script>

<style scoped>
.renovaveis-comparison {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background: #0a0a0a;
}

.main-title {
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #1e1e1e;
  border: 2px solid #00ff00;
  border-radius: 4px;
}
</style>
