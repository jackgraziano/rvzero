<template>
  <div class="comparison-view">
    <div class="comparison-content">
      <UHBlock
        v-if="hasBlockData('UH')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
        :occurrences="blockOccurrences('UH')"
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
        :occurrences="blockOccurrences('CT')"
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
        :occurrences="blockOccurrences('DP')"
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
        :occurrences="blockOccurrences('PQ')"
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
        :occurrences="blockOccurrences('RI')"
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
        :occurrences="blockOccurrences('IA')"
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
        :occurrences="blockOccurrences('MP')"
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
        :occurrences="blockOccurrences('FD')"
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
        :occurrences="blockOccurrences('VE')"
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
        :occurrences="blockOccurrences('RE')"
      />

      <!-- Bloco AC -->
      <ACBlock
        v-if="hasBlockData('AC')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
        :occurrences="blockOccurrences('AC')"
      />

      <VIBlock
        v-if="hasBlockData('VI')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :compareMode="compareMode"
        :showOnlyDifferences="showOnlyDifferences"
        :occurrences="blockOccurrences('VI')"
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
        :occurrences="blockOccurrences('TI')"
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
        :occurrences="blockOccurrences('HV')"
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
        :occurrences="blockOccurrences('HQ')"
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
        :occurrences="blockOccurrences('HE')"
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
        :occurrences="blockOccurrences('RQ')"
      />

      <OutrosBlock
        v-if="hasBlockData('OUTROS')"
        :dadger1Data="dadger1Data"
        :dadger1Name="dadger1Name"
        :dadger2Data="dadger2Data"
        :dadger2Name="dadger2Name"
        :showOnlyDifferences="showOnlyDifferences"
        :occurrences="blockOccurrences('OUTROS')"
      />

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
import VIBlock from './blocks/VIBlock.vue'
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
    VIBlock,
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
    },
    occurrences: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    blockOccurrences(blockKey) {
      return this.occurrences[blockKey] ?? []
    },
    hasBlockData(blockKey) {
      return [this.dadger1Data[blockKey], this.dadger2Data[blockKey]]
        .some(value => Array.isArray(value)
          ? value.length > 0
          : value && Object.values(value).some(lines => lines.length > 0))
    }
  }
}
</script>

<style scoped>
.comparison-view {
  width: 100%;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 18px 50px rgb(0 0 0 / 16%);
}

.comparison-content {
  padding: 4px;
  background: var(--background);
}

.comparison-content > * {
  overflow: hidden;
  border-radius: 6px;
}

</style>
