import test from 'node:test'
import assert from 'node:assert/strict'

import {
  alignByData,
  alignSequences,
  hasDiff,
  semanticEqual
} from '../src/utils/comparison.js'
import { buildStageCalendar } from '../src/utils/temporal.js'
import { useTemporalComparison } from '../src/composables/useTemporalComparison.js'
import { rowHasDifferences } from '../src/composables/useBlockComparison.js'

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

test('comparação trata null e undefined como ausentes equivalentes', () => {
  assert.equal(hasDiff(null, undefined), false)
  assert.equal(hasDiff(0, null), true)
  assert.equal(hasDiff(0, 0), false)
})

test('registro estático presente em apenas um arquivo é diferença', () => {
  assert.equal(rowHasDifferences({ onlyInOne: true }), true)
  assert.equal(
    rowHasDifferences({ onlyInOne: true, sameTemporality: false }),
    false
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
