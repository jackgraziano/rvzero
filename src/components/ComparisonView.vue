<template>
  <div class="comparison-view">
    <div class="comparison-header">
      <div class="dadger-info">
        <h3>{{ dadger1Name }}</h3>
        <p>Data base: {{ dadger1Data.info_dadger.data_base }}</p>
      </div>
      <div class="dadger-info">
        <h3>{{ dadger2Name }}</h3>
        <p>Data base: {{ dadger2Data.info_dadger.data_base }}</p>
      </div>
    </div>

    <div class="comparison-content">
      <!-- Bloco DP -->
      <DPBlock
        v-if="dadger1Data.DP && dadger2Data.DP"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Bloco PQ -->
      <PQBlock
        v-if="dadger1Data.PQ && dadger2Data.PQ"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Bloco CT -->
      <CTBlock
        v-if="dadger1Data.CT && dadger2Data.CT"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Futuros blocos virão aqui -->
      <!-- Exemplo de como adicionar novos blocos:
      <OutroBlock
        v-if="dadger1Data.OUTRO && dadger2Data.OUTRO"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
      />
      -->
    </div>
  </div>
</template>

<script>
import DPBlock from './blocks/DPBlock.vue'
import PQBlock from './blocks/PQBlock.vue'
import CTBlock from './blocks/CTBlock.vue'

export default {
  name: 'ComparisonView',
  components: {
    DPBlock,
    PQBlock,
    CTBlock
  },
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
  }
}
</script>

<style scoped>
.comparison-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  border-radius: 4px;
  overflow: hidden;
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
}

.comparison-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 12px 16px;
  background: #2d2d2d;
  color: #00ff00;
  border-bottom: 1px solid #00ff00;
}

.dadger-info h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.dadger-info p {
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
  font-family: 'Courier New', monospace;
}

.comparison-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
}
</style>
