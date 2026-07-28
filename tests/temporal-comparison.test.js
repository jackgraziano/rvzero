import test from 'node:test'
import assert from 'node:assert/strict'
import { computed } from 'vue'

import {
  alignByData,
  alignSequences,
  formatRange,
  hasDiff,
  semanticEqual
} from '../src/utils/comparison.js'
import { buildStageCalendar } from '../src/utils/temporal.js'
import { useTemporalComparison } from '../src/composables/useTemporalComparison.js'
import { useEntityTemporalComparison } from '../src/composables/useEntityTemporalComparison.js'
import {
  rowHasDifferences,
  useBlockComparison
} from '../src/composables/useBlockComparison.js'
import { alignRenovaveisGeneration } from '../src/utils/renovaveisComparison.js'
import {
  alignDadgnlGL,
  alignDadgnlTG,
  dadgnlWeekDate
} from '../src/utils/dadgnlComparison.js'

function deck(baseDate, dates, block = []) {
  return {
    info_dadger: {
      data_base: baseDate,
      numero_estagios: Object.keys(dates).length,
      datas_estagios: dates
    },
    TI: block
  }
}

test('calendário usa início semanal e duração real informada pelo DP', () => {
  const dp = []
  for (let stage = 1; stage <= 6; stage += 1) {
    dp.push({
      estagio: stage,
      horas_pesada: stage === 6 ? 100 : 30,
      horas_media: stage === 6 ? 250 : 74,
      horas_leve: stage === 6 ? 250 : 64
    })
  }

  const calendar = buildStageCalendar('31/01/2026', 6, dp)
  assert.deepEqual(calendar[0], {
    numero: 1,
    data_inicio: '31/01/2026',
    data_fim: '06/02/2026',
    duracao_horas: 168,
    horas_consistentes: true
  })
  assert.equal(calendar[5].data_inicio, '07/03/2026')
  assert.equal(calendar[5].data_fim, '31/03/2026')
  assert.equal(calendar[5].duracao_horas, 600)
})

test('modo data alinha estágios diferentes que começam no mesmo dia', () => {
  const first = deck('31/01/2026', {
    1: '31/01/2026',
    2: '07/02/2026',
    3: '14/02/2026',
    4: '21/02/2026',
    5: '28/02/2026',
    6: '07/03/2026'
  })
  const second = deck('21/02/2026', {
    1: '21/02/2026',
    2: '28/02/2026',
    3: '07/03/2026'
  })
  const aligned = alignByData(
    [{ estagio: 6, subsistema: 1, valor: 10 }],
    [{ estagio: 3, subsistema: 1, valor: 11 }],
    first,
    second,
    'subsistema',
    (record1, record2, onlyInOne, sameTemporality, date) => ({
      record1,
      record2,
      onlyInOne,
      sameTemporality,
      date
    })
  )

  assert.deepEqual(aligned, [{
    record1: { estagio: 6, subsistema: 1, valor: 10 },
    record2: { estagio: 3, subsistema: 1, valor: 11 },
    onlyInOne: false,
    sameTemporality: true,
    date: '07/03/2026'
  }])
})

test('renováveis associa PerIni ao calendário do DADGER de cada revisão', () => {
  const first = deck('18/07/2026', {
    1: '18/07/2026',
    2: '25/07/2026',
    3: '01/08/2026'
  })
  const second = deck('25/07/2026', {
    1: '25/07/2026',
    2: '01/08/2026'
  })
  const renewables1 = {
    geracaoAgregada: [
      {
        periodo: 1,
        submercado: 1,
        patamar: 1,
        geracaoMedia: 90,
        numPEEs: 2,
        numCenarios: 3
      },
      {
        periodo: 2,
        submercado: 1,
        patamar: 1,
        geracaoMedia: 100,
        numPEEs: 2,
        numCenarios: 3
      }
    ]
  }
  const renewables2 = {
    geracaoAgregada: [{
      periodo: 1,
      submercado: 1,
      patamar: 1,
      geracaoMedia: 100,
      numPEEs: 2,
      numCenarios: 3
    }]
  }

  const aligned = alignRenovaveisGeneration(
    renewables1,
    renewables2,
    {
      compareMode: 'data',
      dadger1Data: first,
      dadger2Data: second
    }
  )
  const sharedDate = aligned.find(row => row.date === '25/07/2026')
  const exclusiveDate = aligned.find(row => row.date === '18/07/2026')

  assert.equal(sharedDate.ren1.periodo, 2)
  assert.equal(sharedDate.ren2.periodo, 1)
  assert.equal(sharedDate.has_diff, false)
  assert.equal(sharedDate.sameTemporality, true)
  assert.equal(exclusiveDate.onlyInOne, true)
  assert.equal(exclusiveDate.sameTemporality, false)
  assert.equal(exclusiveDate.has_diff, false)
})

test('renováveis sem DADGER compara diretamente pelo número do período', () => {
  const first = {
    geracaoAgregada: [{
      periodo: 1,
      submercado: 2,
      patamar: 1,
      geracaoMedia: 100,
      numPEEs: 1,
      numCenarios: 1
    }]
  }
  const second = {
    geracaoAgregada: [{
      periodo: 1,
      submercado: 2,
      patamar: 1,
      geracaoMedia: 110,
      numPEEs: 1,
      numCenarios: 1
    }]
  }

  const [aligned] = alignRenovaveisGeneration(first, second, {
    compareMode: 'estagio'
  })

  assert.equal(aligned.period, 1)
  assert.equal(aligned.sameTemporality, true)
  assert.equal(aligned.diff_geracaoMedia, true)
  assert.equal(aligned.has_diff, true)
})

test('DADGNL usa o DT do DADGER e não a data textual do GL para alinhar semanas', () => {
  const firstDadger = deck('18/07/2026', {
    1: '18/07/2026',
    2: '25/07/2026',
    3: '01/08/2026'
  })
  const secondDadger = deck('25/07/2026', {
    1: '25/07/2026',
    2: '01/08/2026'
  })
  const first = {
    info_dadgnl: { numero_semanas: 9 },
    GL: [{
      codigo_usina: 86,
      subsistema: 1,
      semana: 2,
      geracao_pesado: 500,
      duracao_pesado: 15,
      geracao_medio: 500,
      duracao_medio: 64,
      geracao_leve: 500,
      duracao_leve: 89,
      data_inicio: '31/12/2099'
    }]
  }
  const second = {
    info_dadgnl: { numero_semanas: 9 },
    GL: [{
      codigo_usina: 86,
      subsistema: 1,
      semana: 1,
      geracao_pesado: 500,
      duracao_pesado: 15,
      geracao_medio: 500,
      duracao_medio: 64,
      geracao_leve: 500,
      duracao_leve: 89,
      data_inicio: '01/01/1900'
    }]
  }

  const [aligned] = alignDadgnlGL(first, second, {
    compareMode: 'data',
    dadger1Data: firstDadger,
    dadger2Data: secondDadger
  })

  assert.equal(dadgnlWeekDate(2, firstDadger), '25/07/2026')
  assert.equal(aligned.date, '25/07/2026')
  assert.equal(aligned.dadger1.semana, 2)
  assert.equal(aligned.dadger2.semana, 1)
  assert.equal(aligned.has_diff, false)
})

test('calendário DADGNL extrapola nove semanas a partir do DT', () => {
  const firstDadger = deck('18/07/2026', {
    1: '18/07/2026',
    2: '25/07/2026',
    3: '01/08/2026'
  })
  const secondDadger = deck('25/07/2026', {
    1: '25/07/2026',
    2: '01/08/2026'
  })
  const thermal = (estagio, availability) => ({
    codigo_usina: 86,
    subsistema: 1,
    nome_termica: 'SANTA CRUZ',
    estagio,
    inflex_pesado: 0,
    disp_pesado: availability,
    cvu_pesado: 212.61,
    inflex_medio: 0,
    disp_medio: availability,
    cvu_medio: 212.61,
    inflex_leve: 0,
    disp_leve: availability,
    cvu_leve: 212.61
  })
  const first = {
    info_dadgnl: { numero_semanas: 9 },
    TG: [thermal(9, 350)]
  }
  const second = {
    info_dadgnl: { numero_semanas: 9 },
    TG: [thermal(8, 350)]
  }

  const [aligned] = alignDadgnlTG(first, second, {
    compareMode: 'data',
    dadger1Data: firstDadger,
    dadger2Data: secondDadger
  })

  assert.equal(aligned.date, '12/09/2026')
  assert.equal(aligned.sameTemporality, true)
  assert.equal(aligned.has_diff, false)
})

test('arrays temporais só contam diferenças no horizonte comparável', () => {
  const first = deck('31/01/2026', {
    1: '31/01/2026',
    2: '07/02/2026',
    3: '14/02/2026',
    4: '21/02/2026',
    5: '28/02/2026',
    6: '07/03/2026'
  }, [{ numero_usina: 1, vazoes: [1, 2, 3, 4, 5, 6] }])
  const second = deck('21/02/2026', {
    1: '21/02/2026',
    2: '28/02/2026',
    3: '07/03/2026'
  }, [{ numero_usina: 1, vazoes: [4, 5, 7] }])
  const props = {
    dadger1Data: first,
    dadger2Data: second,
    compareMode: 'data'
  }
  const { alignedData } = useTemporalComparison(
    props,
    'TI',
    'vazoes',
    record => record.numero_usina,
    (records, key) => records.find(record => record.numero_usina === key)
  )

  assert.equal(alignedData.value[0].has_diff, true)
  assert.equal(
    alignedData.value[0].valores['data_31/01/2026'].sameTemporality,
    false
  )
  assert.equal(
    alignedData.value[0].valores['data_07/03/2026'].diff,
    true
  )
})

test('entidade temporal ausente nos dois decks não é marcada como diferença', () => {
  const first = deck('18/07/2026', {
    1: '18/07/2026',
    2: '25/07/2026',
    3: '01/08/2026'
  })
  const second = deck('25/07/2026', {
    1: '25/07/2026',
    2: '01/08/2026'
  })
  first.HV = [
    { numero_restricao: 20, estagio: 1, limite: 1571.91 },
    { numero_restricao: 20, estagio: 2, limite: 1571.91 }
  ]
  second.HV = [
    { numero_restricao: 20, estagio: 1, limite: 1571.91 }
  ]

  const { alignedData } = useEntityTemporalComparison(
    {
      dadger1Data: first,
      dadger2Data: second,
      compareMode: 'data'
    },
    'HV',
    'numero_restricao',
    record => record.limite,
    (left, right) => left !== right
  )
  const restriction = alignedData.value[0]

  assert.equal(restriction.has_diff, false)
  assert.deepEqual(restriction.valores['data_01/08/2026'], {
    valor1: null,
    valor2: null,
    diff: false,
    sameTemporality: true,
    dataExisteEmAmbos: true
  })
})

test('comparação trata null e undefined como ausentes equivalentes', () => {
  assert.equal(hasDiff(null, undefined), false)
  assert.equal(hasDiff(0, null), true)
  assert.equal(hasDiff(0, 0), false)
})

test('intervalos exibem limites unilaterais sem placeholders ambíguos', () => {
  assert.equal(formatRange(null, 200), '≤ 200,0')
  assert.equal(formatRange(50, null), '≥ 50,0')
  assert.equal(formatRange(50, 200), '50,0 – 200,0')
  assert.equal(formatRange(null, null), '-')
})

test('registro estático presente em apenas um arquivo é diferença', () => {
  assert.equal(rowHasDifferences({ onlyInOne: true }), true)
  assert.equal(
    rowHasDifferences({ onlyInOne: true, sameTemporality: false }),
    false
  )
})

test('ordenação aceita valores estruturados de restrições', () => {
  const comparison = useBlockComparison(
    { showOnlyDifferences: false },
    computed(() => [
      { key: 'second', period: { limite: 20, fatores: [1] } },
      { key: 'first', period: { limite: 10, fatores: [1] } }
    ])
  )

  comparison.sortBy('period')
  assert.deepEqual(
    comparison.sortedData.value.map(row => row.key),
    ['first', 'second']
  )
})

test('ordenação pelo cabeçalho temporal usa a data, não o texto exibido', () => {
  const comparison = useBlockComparison(
    { showOnlyDifferences: false },
    computed(() => [
      {
        key: 'july',
        temporalOrder: Date.UTC(2026, 6, 4),
        dadger1: { display: '04/07/2026' }
      },
      {
        key: 'june',
        temporalOrder: Date.UTC(2026, 5, 27),
        dadger1: { display: '27/06/2026' }
      }
    ])
  )

  comparison.sortBy('estagio')
  assert.deepEqual(
    comparison.sortedData.value.map(row => row.key),
    ['june', 'july']
  )
})

test('comparação semântica verifica valores, ignora estágio e ordem de coleções', () => {
  const first = [
    { estagio: 6, numero_usina: 2, fator: 0.5 },
    { estagio: 6, numero_usina: 1, fator: 1 }
  ]
  const same = [
    { estagio: 3, numero_usina: 1, fator: 1 },
    { estagio: 3, numero_usina: 2, fator: 0.5 }
  ]
  const changed = [
    { estagio: 3, numero_usina: 1, fator: 1 },
    { estagio: 3, numero_usina: 2, fator: 0.6 }
  ]

  assert.equal(semanticEqual(first, same), true)
  assert.equal(semanticEqual(first, changed), false)
})

test('alinhamento de linhas não desloca o restante após inserção', () => {
  assert.deepEqual(
    alignSequences(['A', 'B', 'C'], ['A', 'X', 'B', 'C']),
    [
      { left: 'A', right: 'A' },
      { left: null, right: 'X' },
      { left: 'B', right: 'B' },
      { left: 'C', right: 'C' }
    ]
  )
})
