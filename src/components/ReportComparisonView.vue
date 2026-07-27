<template>
  <div class="report-comparison">
    <header class="report-header">
      <div>
        <span>Resultado da comparação</span>
        <h2>{{ title }}</h2>
        <p>
          {{ description }}
        </p>
      </div>

      <dl class="summary-grid">
        <div>
          <dt>Diferenças</dt>
          <dd>{{ report.summary.differences }}</dd>
        </div>
        <div>
          <dt>Só A</dt>
          <dd>{{ report.summary.onlyLeft }}</dd>
        </div>
        <div>
          <dt>Só B</dt>
          <dd>{{ report.summary.onlyRight }}</dd>
        </div>
        <div>
          <dt>Fora</dt>
          <dd>{{ report.summary.outsideCommonHorizon }}</dd>
        </div>
      </dl>
    </header>

    <ReportBlock
      v-for="block in visibleBlocks"
      :key="`${block.fileType}:${block.block}`"
      :title="block.title"
      :occurrences="block.occurrences"
    />
  </div>
</template>

<script>
import ReportBlock from './ReportBlock.vue'

const FILE_TYPE_LABELS = {
  dadger: 'DADGER',
  dadgnl: 'DADGNL',
  renovaveis: 'Renováveis'
}

const BLOCK_LABELS = {
  geracaoAgregada: 'Geração agregada'
}

export default {
  name: 'ReportComparisonView',
  components: { ReportBlock },
  props: {
    report: { type: Object, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  computed: {
    title() {
      return this.report.mode === 'data'
        ? 'Alinhamento temporal'
        : 'Comparação por índice'
    },
    description() {
      if (this.report.mode === 'data') {
        return 'Datas comuns são comparadas; períodos exclusivos ficam separados das diferenças comparáveis.'
      }
      return 'Estágios, semanas e períodos são comparados diretamente pelo índice numérico.'
    },
    visibleBlocks() {
      return Object.entries(this.report.blocks)
        .flatMap(([fileType, blocks]) =>
          Object.entries(blocks).map(([block, occurrences]) => ({
            fileType,
            block,
            title: `${FILE_TYPE_LABELS[fileType] ?? fileType} - ${BLOCK_LABELS[block] ?? block}`,
            occurrences
          }))
        )
        .filter(block => block.occurrences.length > 0)
    }
  }
}
</script>

<style scoped>
.report-comparison {
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.report-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  padding: 18px;
  background: var(--surface-elevated);
  border-bottom: 1px solid var(--border);
}

.report-header span {
  color: var(--accent);
  font: 750 9px/1.2 var(--font-ui);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.report-header h2 {
  margin: 6px 0;
  color: var(--text);
  font: 700 18px/1.25 var(--font-ui);
}

.report-header p {
  max-width: 760px;
  margin: 0;
  color: var(--muted);
  font: 500 11px/1.55 var(--font-ui);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(72px, auto));
  gap: 1px;
  margin: 0;
  overflow: hidden;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 7px;
}

.summary-grid div {
  min-width: 0;
  padding: 9px 11px;
  background: var(--surface);
}

.summary-grid dt {
  color: var(--muted);
  font: 700 9px/1.2 var(--font-ui);
  text-transform: uppercase;
}

.summary-grid dd {
  margin: 4px 0 0;
  color: var(--text);
  font: 750 16px/1.2 var(--font-mono);
}

@media (max-width: 900px) {
  .report-header {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
