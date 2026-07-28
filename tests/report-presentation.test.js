import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import { compareDadgerBlocks } from '../src/core/comparators/dadger/index.js'
import {
  entityTemporalRowsFromOccurrences,
  recordRowsFromOccurrences,
  stageArrayRowsFromOccurrences,
  temporalColumnsFromOccurrences,
  viRowsFromOccurrences
} from '../src/utils/reportPresentation.js'

test('apresentação CT mantém uma linha especializada por usina e período', () => {
  const [row] = recordRowsFromOccurrences([
    occurrence({
      block: 'CT',
      status: 'changed',
      identity: { codigo_usina: 7 },
      calendar: { date: '07/03/2026', leftIndex: 6, rightIndex: 3 },
      fields: {
        nome_termica: field('UTE NORTE', 'UTE NORTE'),
        subsistema: field(1, 1),
        inflex_pesado: field(100, 120, true),
        disp_pesado: field(300, 300),
        cvu_pesado: field(212.61, 212.61)
      }
    })
  ], { mode: 'data' })

  assert.equal(row.dadger1.display, '07/03/2026')
  assert.equal(row.dadger1.codigo_usina, 7)
  assert.equal(row.dadger1.estagio, 6)
  assert.equal(row.dadger2.estagio, 3)
  assert.equal(row.dadger2.inflex_pesado, 120)
  assert.equal(row.diff_inflex_pesado, true)
  assert.equal(row.diff_disp_pesado, false)
  assert.equal(row.has_diff, true)
})

test('apresentação de arrays preserva todas as colunas e valores zero', () => {
  const occurrences = [
    occurrence({
      block: 'MP',
      status: 'equal',
      identity: { numero_usina: 66, conjunto_itaipu: '50' },
      calendar: { index: 1, leftIndex: 1, rightIndex: 1 },
      fields: { fatores: field(0, 0) }
    }),
    occurrence({
      block: 'MP',
      status: 'changed',
      identity: { numero_usina: 66, conjunto_itaipu: '50' },
      calendar: { index: 2, leftIndex: 2, rightIndex: 2 },
      fields: { fatores: field(1, 2, true) }
    })
  ]
  const columns = temporalColumnsFromOccurrences(occurrences, 'estagio')
  const [row] = stageArrayRowsFromOccurrences(occurrences, columns, {
    entityField: 'numero_usina',
    valueField: 'fatores',
    hasItaipuSet: true
  })

  assert.deepEqual(columns.map(column => column.label), ['Est 1', 'Est 2'])
  assert.equal(row.entityDisplay, '66/50')
  assert.equal(row.valores.estagio_1.valor1, 0)
  assert.equal(row.valores.estagio_1.diff, false)
  assert.equal(row.valores.estagio_2.valor2, 2)
  assert.equal(row.valores.estagio_2.diff, true)
})

test('apresentação ordena colunas de data cronologicamente', () => {
  const occurrences = [
    occurrence({
      block: 'HQ',
      status: 'equal',
      identity: { numero_restricao: 10 },
      calendar: {
        date: '04/07/2026',
        leftIndex: 2,
        rightIndex: 2
      },
      fields: {
        limites: field({ pesado_min: 5 }, { pesado_min: 5 }),
        coeficientes: field([], [])
      }
    }),
    occurrence({
      block: 'HQ',
      status: 'equal',
      identity: { numero_restricao: 10 },
      calendar: {
        date: '27/06/2026',
        leftIndex: 1,
        rightIndex: 1
      },
      fields: {
        limites: field({ pesado_min: 5 }, { pesado_min: 5 }),
        coeficientes: field([], [])
      }
    })
  ]

  assert.deepEqual(
    temporalColumnsFromOccurrences(occurrences, 'data')
      .map(column => column.label),
    ['27/06/2026', '04/07/2026']
  )
})

test('apresentação entidade por tempo distingue ausência comparável de horizonte', () => {
  const occurrences = [
    occurrence({
      block: 'HQ',
      status: 'only-left',
      identity: { numero_restricao: 10 },
      calendar: { index: 1, leftIndex: 1, rightIndex: 1 },
      fields: {
        limites: field({ pesado_min: 5 }, null, true),
        coeficientes: field([], null, true)
      }
    }),
    occurrence({
      block: 'HQ',
      status: 'outside-common-horizon',
      identity: { numero_restricao: 10 },
      calendar: { index: 2, leftIndex: 2 },
      fields: {
        limites: field({ pesado_min: 6 }, null, true),
        coeficientes: field([], null, true)
      }
    })
  ]
  const columns = temporalColumnsFromOccurrences(occurrences, 'estagio')
  const [row] = entityTemporalRowsFromOccurrences(
    occurrences,
    columns,
    'numero_restricao'
  )

  assert.equal(row.valores.estagio_1.dataExisteEmAmbos, true)
  assert.equal(row.valores.estagio_1.sameTemporality, false)
  assert.equal(row.valores.estagio_1.diff, true)
  assert.equal(row.valores.estagio_2.dataExisteEmAmbos, false)
  assert.equal(row.valores.estagio_2.diff, false)
})

test('campos fora do horizonte são esmaecidos sem destaque de diferença', () => {
  const [row] = recordRowsFromOccurrences([
    occurrence({
      block: 'DP',
      status: 'outside-common-horizon',
      identity: { subsistema: 1 },
      calendar: { index: 4, leftIndex: 4 },
      fields: {
        carga_pesada: field(100, null, true)
      }
    })
  ])

  assert.equal(row.onlyInOne, true)
  assert.equal(row.sameTemporality, false)
  assert.equal(row.diff_carga_pesada, false)
  assert.equal(row.has_diff, false)
})

test('apresentação DADGNL preserva índices próprios e data textual de origem', () => {
  const [row] = recordRowsFromOccurrences([
    occurrence({
      block: 'GL',
      status: 'changed',
      identity: { codigoUsina: 86 },
      calendar: {
        date: '29/08/2026',
        leftIndex: 9,
        rightIndex: 6,
        leftSourceDate: '01/09/2026',
        rightSourceDate: '30/08/2026'
      },
      fields: {
        subsistema: field(1, 1),
        geracao_pesado: field(350, 0, true)
      }
    })
  ], {
    mode: 'data',
    identityAliases: { codigoUsina: 'codigo_usina' },
    temporalField: 'semana',
    temporalAbbreviation: 'Sem',
    includeSourceDate: true
  })

  assert.equal(row.dadger1.codigo_usina, 86)
  assert.equal(row.dadger1.semana, 9)
  assert.equal(row.dadger2.semana, 6)
  assert.equal(row.dadger1.data_inicio, '01/09/2026')
  assert.equal(row.dadger2.data_inicio, '30/08/2026')
  assert.equal(row.dadger1.display, '29/08/2026 · Sem 9')
  assert.equal(row.diff_geracao_pesado, true)
})

test('API preserva a data de origem de COTVOL no modo estágio', () => {
  const blocks = compareDadgerBlocks(
    dadgerWithCotvol(1),
    dadgerWithCotvol(2),
    {
      mode: 'estagio',
      options: {
        includeEqual: true,
        includeOutsideCommonHorizon: true
      }
    }
  )

  assert.equal(blocks.AC[0].calendar.leftSourceDate, '31/01/2026')
  assert.equal(blocks.AC[0].calendar.rightSourceDate, '31/01/2026')
})

test('apresentação VI reúne duração e semanas alinhadas sem destacar exclusivas', () => {
  const [row] = viRowsFromOccurrences([
    occurrence({
      block: 'VI',
      status: 'equal',
      identity: { numero_usina: 156, sequenceIndex: 0 },
      calendar: {},
      fields: {
        duracao_horas: field(360, 360)
      }
    }),
    occurrence({
      block: 'VI',
      status: 'changed',
      identity: { numero_usina: 156, sequenceIndex: 0 },
      calendar: {
        date: '14/02/2026',
        endDate: '20/02/2026',
        leftIndex: 1,
        rightIndex: 2
      },
      fields: {
        vazao_defluente: field(311, 346, true)
      }
    }),
    occurrence({
      block: 'VI',
      status: 'equal',
      identity: { numero_usina: 156, sequenceIndex: 0 },
      calendar: {
        date: '07/02/2026',
        endDate: '13/02/2026',
        leftIndex: 2,
        rightIndex: 3
      },
      fields: {
        vazao_defluente: field(449, 449)
      }
    }),
    occurrence({
      block: 'VI',
      status: 'outside-common-horizon',
      identity: { numero_usina: 156, sequenceIndex: 0 },
      calendar: {
        date: '17/01/2026',
        endDate: '23/01/2026',
        leftIndex: 5
      },
      fields: {
        vazao_defluente: field(210, null, true)
      }
    })
  ], 'data')

  assert.equal(row.dadger1.duracao_horas, 360)
  assert.equal(row.dadger2.duracao_horas, 360)
  assert.equal(row.duracao_diff, false)
  assert.equal(row.onlyInOne, false)
  assert.equal(row.has_diff, true)
  assert.deepEqual(
    row.flows.map(flow => flow.date),
    ['14/02/2026', '07/02/2026', '17/01/2026']
  )
  assert.equal(row.flows[0].position1, 1)
  assert.equal(row.flows[0].position2, 2)
  assert.equal(row.flows[1].diff, false)
  assert.equal(row.flows[2].sameTemporality, false)
})

test('App usa layouts especializados alimentados pelos blocos do relatório', async () => {
  const [source, tableStyles, dropZone] = await Promise.all([
    readFile(new URL('../src/App.vue', import.meta.url), 'utf8'),
    readFile(
      new URL('../src/styles/block-tables.css', import.meta.url),
      'utf8'
    ),
    readFile(new URL('../src/components/DropZone.vue', import.meta.url), 'utf8')
  ])

  assert.match(source, /<ComparisonView/)
  assert.match(source, /<RenovaveisComparisonView/)
  assert.match(source, /<DadgnlComparisonView/)
  assert.doesNotMatch(source, /:deck-title=/)
  assert.match(source, /class="comparison-deck-title"/)
  assert.doesNotMatch(dropZone, /deck-title-card|deckTitle/)
  assert.match(source, /:occurrences="coreReport\?\.blocks\?\.dadger/)
  assert.doesNotMatch(source, /<ReportComparisonView/)
  assert.match(
    tableStyles,
    /@media \(max-width: 900px\)[\s\S]*?\.comparison-tables\s*\{[\s\S]*?grid-template-columns:\s*1fr !important/
  )

  const comparisonView = await readFile(
    new URL('../src/components/ComparisonView.vue', import.meta.url),
    'utf8'
  )
  assert.match(comparisonView, /<VIBlock/)
  assert.match(comparisonView, /:compareMode="compareMode"/)
  assert.doesNotMatch(
    comparisonView,
    /comparison-header|Alinhamento temporal|comparison-legend/
  )

  const viBlock = await readFile(
    new URL('../src/components/blocks/VIBlock.vue', import.meta.url),
    'utf8'
  )
  assert.match(viBlock, /colspan="2" class="history-header"/)
  assert.match(viBlock, /v-for="\(flow, flowIndex\) in tableFlows\(row\)"/)
  assert.match(viBlock, /flowPeriod\(flow, side, compareMode\)/)
  assert.match(viBlock, /faded: flow && !flow\.sameTemporality/)
})

function occurrence({
  block,
  status,
  identity,
  calendar,
  fields
}) {
  return {
    fileType: 'dadger',
    block,
    status,
    identity,
    calendar,
    fields
  }
}

function field(left, right, changed = false) {
  return { left, right, changed }
}

function dadgerWithCotvol(value) {
  return {
    info_dadger: {
      data_base: '31/01/2026',
      numero_estagios: 1,
      datas_estagios: { 1: '31/01/2026' },
      estagios: [{ numero: 1, data_inicio: '31/01/2026' }]
    },
    AC: [{
      usina: 1,
      mnemonico: 'COTVOL',
      indice_coeficiente: 1,
      valor_coeficiente: value,
      estagio: 1
    }],
    OUTROS: {}
  }
}
