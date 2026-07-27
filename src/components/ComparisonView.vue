<template>
  <div class="comparison-view">
    <header class="comparison-header">
      <div class="result-summary">
        <span class="summary-kicker">
          {{ compareMode === 'data' ? 'Alinhamento temporal' : 'Modo diagnóstico' }}
        </span>
        <h2>{{ alignmentTitle }}</h2>
        <p>{{ alignmentDescription }}</p>
      </div>

      <div class="file-comparison">
        <article
          v-for="(file, index) in comparedFiles"
          :key="file.name"
          class="dadger-info"
        >
          <span>Deck {{ index === 0 ? 'A' : 'B' }}</span>
          <h3 :title="file.name">{{ file.name }}</h3>
          <p>DT {{ file.data.info_dadger.data_base }}</p>
          <p>{{ horizonLabel(file.data) }}</p>
        </article>
      </div>

      <div class="comparison-legend" aria-label="Legenda da comparação">
        <span><i class="legend-diff"></i>Valor alterado</span>
        <span><i class="legend-missing"></i>Presente em um deck</span>
        <span><i class="legend-outside"></i>Fora do horizonte comum</span>
        <strong>
          {{ showOnlyDifferences ? 'Exibindo somente diferenças' : 'Exibindo todos os registros' }}
        </strong>
      </div>
    </header>

    <div class="comparison-content">
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
        :compareMode="compareMode"
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
  computed: {
    comparedFiles() {
      return [
        { name: this.dadger1Name, data: this.dadger1Data },
        { name: this.dadger2Name, data: this.dadger2Data }
      ]
    },
    sharedDates() {
      const secondDates = new Set(
        Object.values(this.dadger2Data.info_dadger?.datas_estagios ?? {})
      )
      return Object.values(this.dadger1Data.info_dadger?.datas_estagios ?? {})
        .filter(date => secondDates.has(date))
    },
    alignmentTitle() {
      if (this.compareMode === 'estagio') {
        return 'Comparação direta pelo número do estágio'
      }
      const count = this.sharedDates.length
      if (count === 0) return 'Os decks não possuem períodos em comum'
      const suffix = count === 1 ? 'período comparável' : 'períodos comparáveis'
      return `${count} ${suffix} no calendário`
    },
    alignmentDescription() {
      if (this.compareMode === 'estagio') {
        return 'Estágios de mesmo número podem representar datas diferentes. Use este modo apenas para diagnóstico.'
      }
      if (this.sharedDates.length === 0) {
        return 'Os registros serão mostrados como fora do horizonte comum e não contarão como diferenças.'
      }
      const first = this.sharedDates[0]
      const last = this.sharedDates.at(-1)
      return first === last
        ? `Período comum em ${first}. Os números dos estágios originais continuam visíveis nos detalhes.`
        : `Período comum de ${first} a ${last}. Estágios equivalentes são alinhados automaticamente.`
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
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 18px 50px rgb(0 0 0 / 16%);
}

.comparison-header {
  display: grid;
  grid-template-columns: minmax(260px, 0.75fr) minmax(500px, 1.25fr);
  gap: 14px 24px;
  padding: 18px;
  background: var(--surface-elevated);
  border-bottom: 1px solid var(--border);
}

.result-summary {
  align-self: center;
}

.summary-kicker,
.dadger-info > span {
  color: var(--accent);
  font: 750 9px/1.2 var(--font-ui);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.result-summary h2 {
  margin: 6px 0;
  color: var(--text);
  font: 700 17px/1.25 var(--font-ui);
}

.result-summary p {
  max-width: 640px;
  margin: 0;
  color: var(--muted);
  font: 500 11px/1.55 var(--font-ui);
}

.file-comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.dadger-info {
  min-width: 0;
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 7px;
}

.dadger-info h3 {
  overflow: hidden;
  margin: 5px 0 7px;
  color: var(--text);
  font: 650 12px/1.3 var(--font-mono);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dadger-info p {
  margin: 2px 0 0;
  color: var(--muted);
  font: 500 10px/1.35 var(--font-ui);
}

.comparison-legend {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 2px;
  color: var(--muted);
  font: 550 10px/1.3 var(--font-ui);
}

.comparison-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.comparison-legend i {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-diff {
  background: var(--warning);
}

.legend-missing {
  background: var(--danger);
}

.legend-outside {
  background: var(--muted);
  opacity: 0.45;
}

.comparison-legend strong {
  margin-left: auto;
  color: var(--text);
  font-weight: 650;
}

.comparison-content {
  padding: 4px;
  background: var(--background);
}

.comparison-content > * {
  overflow: hidden;
  border-radius: 6px;
}

@media (max-width: 900px) {
  .comparison-header {
    grid-template-columns: 1fr;
  }

  .comparison-legend {
    flex-wrap: wrap;
  }

  .comparison-legend strong {
    width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 560px) {
  .file-comparison {
    grid-template-columns: 1fr;
  }
}
</style>
