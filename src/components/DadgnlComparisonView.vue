<template>
  <div class="dadgnl-comparison">
    <header class="dadgnl-header">
      <span>Resultado da comparação</span>
      <h2>Térmicas a GNL</h2>
      <p>
        <template v-if="compareMode === 'data'">
          As semanas foram calculadas a partir do DT do DADGER correspondente;
          o calendário do DADGNL é extrapolado por todo o seu horizonte.
        </template>
        <template v-else>
          Comparação direta pelo número do estágio ou da semana do DADGNL.
        </template>
        {{ showOnlyDifferences ? 'Somente diferenças estão visíveis.' : 'Todos os registros estão visíveis.' }}
      </p>
      <div class="dadgnl-legend" aria-label="Legenda da comparação">
        <span><i class="legend-diff"></i>Valor alterado</span>
        <span><i class="legend-missing"></i>Presente em um arquivo</span>
        <span><i class="legend-outside"></i>Fora do horizonte comum</span>
      </div>
    </header>

    <DadgnlBlock
      title="BLOCO TG — TÉRMICAS A GNL"
      :dadgnl1-name="dadgnl1Name"
      :dadgnl2-name="dadgnl2Name"
      :rows="tgRows"
      :columns="tgColumns"
      :show-only-differences="showOnlyDifferences"
    />
    <DadgnlBlock
      title="BLOCO GS — NÚMERO DE SEMANAS"
      :dadgnl1-name="dadgnl1Name"
      :dadgnl2-name="dadgnl2Name"
      :rows="gsRows"
      :columns="gsColumns"
      :show-only-differences="showOnlyDifferences"
    />
    <DadgnlBlock
      title="BLOCO NL — LAG DE ANTECIPAÇÃO"
      :dadgnl1-name="dadgnl1Name"
      :dadgnl2-name="dadgnl2Name"
      :rows="nlRows"
      :columns="nlColumns"
      :show-only-differences="showOnlyDifferences"
    />
    <DadgnlBlock
      title="BLOCO GL — GERAÇÕES GNL JÁ COMANDADAS"
      :dadgnl1-name="dadgnl1Name"
      :dadgnl2-name="dadgnl2Name"
      :rows="glRows"
      :columns="glColumns"
      :show-only-differences="showOnlyDifferences"
    />
  </div>
</template>

<script>
import DadgnlBlock from './blocks/DadgnlBlock.vue'
import {
  alignDadgnlGL,
  alignDadgnlGS,
  alignDadgnlNL,
  alignDadgnlTG
} from '../utils/dadgnlComparison.js'

const identityColumns = [
  { key: 'codigo_usina', label: 'Cód' },
  { key: 'subsistema', label: 'Sub' }
]

const thermalColumns = [
  { key: 'inflex_pesado', label: 'Infl', group: 'Pesado', groupClass: 'patamar-pesado', format: 'number', cellClass: 'col-number' },
  { key: 'disp_pesado', label: 'Disp', group: 'Pesado', groupClass: 'patamar-pesado', format: 'number', cellClass: 'col-number' },
  { key: 'cvu_pesado', label: 'CVU', group: 'Pesado', groupClass: 'patamar-pesado', format: 'number', cellClass: 'col-number col-pesado-last' },
  { key: 'inflex_medio', label: 'Infl', group: 'Médio', groupClass: 'patamar-medio', format: 'number', cellClass: 'col-number' },
  { key: 'disp_medio', label: 'Disp', group: 'Médio', groupClass: 'patamar-medio', format: 'number', cellClass: 'col-number' },
  { key: 'cvu_medio', label: 'CVU', group: 'Médio', groupClass: 'patamar-medio', format: 'number', cellClass: 'col-number col-medio-last' },
  { key: 'inflex_leve', label: 'Infl', group: 'Leve', groupClass: 'patamar-leve', format: 'number', cellClass: 'col-number' },
  { key: 'disp_leve', label: 'Disp', group: 'Leve', groupClass: 'patamar-leve', format: 'number', cellClass: 'col-number' },
  { key: 'cvu_leve', label: 'CVU', group: 'Leve', groupClass: 'patamar-leve', format: 'number', cellClass: 'col-number' }
]

const generationColumns = [
  { key: 'geracao_pesado', label: 'Geração', group: 'Pesado', groupClass: 'patamar-pesado', format: 'number', cellClass: 'col-number' },
  { key: 'duracao_pesado', label: 'Horas', group: 'Pesado', groupClass: 'patamar-pesado', format: 'number', cellClass: 'col-number col-pesado-last' },
  { key: 'geracao_medio', label: 'Geração', group: 'Médio', groupClass: 'patamar-medio', format: 'number', cellClass: 'col-number' },
  { key: 'duracao_medio', label: 'Horas', group: 'Médio', groupClass: 'patamar-medio', format: 'number', cellClass: 'col-number col-medio-last' },
  { key: 'geracao_leve', label: 'Geração', group: 'Leve', groupClass: 'patamar-leve', format: 'number', cellClass: 'col-number' },
  { key: 'duracao_leve', label: 'Horas', group: 'Leve', groupClass: 'patamar-leve', format: 'number', cellClass: 'col-number' }
]

export default {
  name: 'DadgnlComparisonView',
  components: {
    DadgnlBlock
  },
  props: {
    dadgnl1Data: { type: Object, required: true },
    dadgnl1Name: { type: String, required: true },
    dadgnl2Data: { type: Object, required: true },
    dadgnl2Name: { type: String, required: true },
    dadger1Data: { type: Object, default: null },
    dadger2Data: { type: Object, default: null },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  computed: {
    temporalColumn() {
      return {
        key: 'display',
        sortKey: 'temporalOrder',
        label: this.compareMode === 'data' ? 'Data / índice' : 'Índice',
        cellClass: 'col-stage'
      }
    },
    tgColumns() {
      return [
        this.temporalColumn,
        ...identityColumns,
        { key: 'nome_termica', label: 'Nome', cellClass: 'col-name' },
        ...thermalColumns
      ]
    },
    gsColumns() {
      return [
        { key: 'mes', label: 'Mês', format: 'month' },
        { key: 'numero_semanas', label: 'Semanas' }
      ]
    },
    nlColumns() {
      return [
        ...identityColumns,
        { key: 'lag', label: 'Lag (meses)' }
      ]
    },
    glColumns() {
      return [
        this.temporalColumn,
        ...identityColumns,
        ...generationColumns
      ]
    },
    comparisonOptions() {
      return {
        compareMode: this.compareMode,
        dadger1Data: this.dadger1Data,
        dadger2Data: this.dadger2Data
      }
    },
    tgRows() {
      return alignDadgnlTG(
        this.dadgnl1Data,
        this.dadgnl2Data,
        this.comparisonOptions
      )
    },
    gsRows() {
      return alignDadgnlGS(this.dadgnl1Data, this.dadgnl2Data)
    },
    nlRows() {
      return alignDadgnlNL(this.dadgnl1Data, this.dadgnl2Data)
    },
    glRows() {
      return alignDadgnlGL(
        this.dadgnl1Data,
        this.dadgnl2Data,
        this.comparisonOptions
      )
    }
  }
}
</script>

<style scoped>
.dadgnl-comparison {
  overflow: hidden;
  padding: 4px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.dadgnl-header {
  padding: 18px;
  background: var(--surface-elevated);
  border-bottom: 1px solid var(--border);
}

.dadgnl-header > span {
  color: var(--accent);
  font: 750 9px/1.2 var(--font-ui);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.dadgnl-header h2 {
  margin: 6px 0 4px;
  color: var(--text);
  font: 700 18px/1.25 var(--font-ui);
}

.dadgnl-header p {
  margin: 0;
  color: var(--muted);
  font: 500 11px/1.5 var(--font-ui);
}

.dadgnl-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
  color: var(--muted);
  font: 550 10px/1.3 var(--font-ui);
}

.dadgnl-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.dadgnl-legend i {
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
</style>
