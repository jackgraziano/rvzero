<template>
  <div class="comparison-view">
    <div class="comparison-header">
      <div class="dadger-info">
        <h3>{{ dadger1Name }}</h3>
        <p>DT: {{ dadger1Data.info_dadger.data_base }}</p>
        <p>{{ horizonLabel(dadger1Data) }}</p>
      </div>
      <div class="dadger-info">
        <h3>{{ dadger2Name }}</h3>
        <p>DT: {{ dadger2Data.info_dadger.data_base }}</p>
        <p>{{ horizonLabel(dadger2Data) }}</p>
      </div>
    </div>

    <div class="comparison-content">
      <!-- Bloco UH -->
      <UHBlock
        v-if="hasBlockData('UH')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Bloco CT -->
      <CTBlock
        v-if="hasBlockData('CT')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Bloco DP -->
      <DPBlock
        v-if="hasBlockData('DP')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Bloco PQ -->
      <PQBlock
        v-if="hasBlockData('PQ')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Bloco RI -->
      <RIBlock
        v-if="hasBlockData('RI')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Bloco IA -->
      <IABlock
        v-if="hasBlockData('IA')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <StageArrayBlock
        v-if="hasBlockData('MP')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
        blockKey="MP"
        valueField="fatores"
        entityField="numero_usina"
        entityLabel="Nº Usina"
        title="BLOCO MP - MANUTENÇÃO PROGRAMADA"
        hasItaipuSet
      />

      <StageArrayBlock
        v-if="hasBlockData('FD')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
        blockKey="FD"
        valueField="fatores"
        entityField="numero_usina"
        entityLabel="Nº Usina"
        title="BLOCO FD - FATORES DE DISPONIBILIDADE"
        hasItaipuSet
      />

      <StageArrayBlock
        v-if="hasBlockData('VE')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
        blockKey="VE"
        valueField="volumes"
        entityField="numero_usina"
        entityLabel="Nº Usina"
        title="BLOCO VE - VOLUME DE ESPERA"
      />

      <!-- Bloco RE -->
      <REBlock
        v-if="hasBlockData('RE')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Bloco AC -->
      <ACBlock
        v-if="hasBlockData('AC')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <StageArrayBlock
        v-if="hasBlockData('TI')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
        blockKey="TI"
        valueField="vazoes"
        entityField="numero_usina"
        entityLabel="Nº Usina"
        title="BLOCO TI - VAZÃO DESVIADA"
      />

      <!-- Bloco HV -->
      <HVBlock
        v-if="hasBlockData('HV')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Bloco HQ -->
      <HQBlock
        v-if="hasBlockData('HQ')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <!-- Bloco HE -->
      <HEBlock
        v-if="hasBlockData('HE')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
      />

      <StageArrayBlock
        v-if="hasBlockData('RQ')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
        blockKey="RQ"
        valueField="vazoes_minimas_pct"
        entityField="numero_ree"
        entityLabel="Nº REE"
        title="BLOCO RQ - VAZÃO DEFLUENTE MÍNIMA (%)"
      />

      <OutrosBlock
        v-if="hasBlockData('OUTROS')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
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
import IABlock from './blocks/IABlock.vue'
import UHBlock from './blocks/UHBlock.vue'
import StageArrayBlock from './blocks/StageArrayBlock.vue'
import REBlock from './blocks/REBlock.vue'
import HQBlock from './blocks/HQBlock.vue'
import HVBlock from './blocks/HVBlock.vue'
import RIBlock from './blocks/RIBlock.vue'
import HEBlock from './blocks/HEBlock.vue'
import ACBlock from './blocks/ACBlock.vue'
import OutrosBlock from './blocks/OutrosBlock.vue'

export default {
  name: 'ComparisonView',
  components: {
    DPBlock,
    PQBlock,
    CTBlock,
    IABlock,
    UHBlock,
    StageArrayBlock,
    REBlock,
    HQBlock,
    HVBlock,
    RIBlock,
    HEBlock,
    ACBlock,
    OutrosBlock
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
  },
  methods: {
    hasBlockData(blockKey) {
      return [this.dadger1Data[blockKey], this.dadger2Data[blockKey]]
        .some(value => Array.isArray(value)
          ? value.length > 0
          : value && Object.values(value).some(lines => lines.length > 0))
    },
    horizonLabel(dadgerData) {
      const stages = dadgerData.info_dadger?.estagios ?? []
      if (stages.length === 0) return 'Horizonte indisponível'

      const first = stages[0]
      const last = stages.at(-1)
      return `Horizonte: ${first.data_inicio} → ${last.data_fim ?? last.data_inicio} · ${stages.length} estágios`
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
