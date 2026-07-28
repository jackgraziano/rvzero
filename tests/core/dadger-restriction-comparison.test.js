import test from 'node:test'
import assert from 'node:assert/strict'

import { compareDadgerBlocks } from '../../src/core/comparators/dadger/index.js'

const OPTIONS = {
  includeEqual: true,
  includeOutsideCommonHorizon: true
}

test('HQ, HV e RE ignoram índices de estágio ao comparar a mesma data', () => {
  const left = deck('13/06/2026', {
    1: '13/06/2026',
    2: '20/06/2026',
    3: '27/06/2026'
  })
  const right = deck('20/06/2026', {
    1: '20/06/2026',
    2: '27/06/2026'
  })

  left.HQ = restrictionSnapshots('HQ', [1, 2, 3], {
    initialStage: 1,
    finalStage: 3,
    sourceStage: 2
  })
  right.HQ = restrictionSnapshots('HQ', [1, 2], {
    initialStage: 1,
    finalStage: 2,
    sourceStage: 1
  })
  left.HV = restrictionSnapshots('HV', [1, 2, 3], {
    initialStage: 1,
    finalStage: 3,
    sourceStage: 2
  })
  right.HV = restrictionSnapshots('HV', [1, 2], {
    initialStage: 1,
    finalStage: 2,
    sourceStage: 1
  })
  left.RE = restrictionSnapshots('RE', [1, 2, 3], {
    initialStage: 1,
    finalStage: 3,
    sourceStage: 2
  })
  right.RE = restrictionSnapshots('RE', [1, 2], {
    initialStage: 1,
    finalStage: 2,
    sourceStage: 1
  })

  const blocks = compareDadgerBlocks(left, right, {
    mode: 'data',
    options: OPTIONS
  })

  for (const block of ['HQ', 'HV', 'RE']) {
    const shared = blocks[block].filter(occurrence =>
      occurrence.calendar.date !== '13/06/2026'
    )

    assert.deepEqual(
      shared.map(occurrence => occurrence.status),
      ['equal', 'equal'],
      `${block} não deve tratar índices diferentes como conteúdo alterado`
    )
    assert.equal(shared[0].fields.estagio_inicial.left, 1)
    assert.equal(shared[0].fields.estagio_final.left, 3)
    assert.equal(shared[0].fields.estagio_final.right, 2)
    assert.equal(shared[0].fields.estagio_inicial.changed, false)
    assert.equal(shared[0].fields.estagio_final.changed, false)
    assert.equal(
      Object.values(shared[0].fields).some(field => field.changed),
      false
    )
  }
})

test('restrições continuam detectando mudança no conteúdo de limites e fatores', () => {
  const left = deck('20/06/2026', { 1: '20/06/2026' })
  const right = deck('20/06/2026', { 1: '20/06/2026' })

  left.HQ = restrictionSnapshots('HQ', [1], {
    initialStage: 1,
    finalStage: 1,
    sourceStage: 1
  })
  right.HQ = restrictionSnapshots('HQ', [1], {
    initialStage: 1,
    finalStage: 1,
    sourceStage: 1,
    value: 2
  })
  left.RE = restrictionSnapshots('RE', [1], {
    initialStage: 1,
    finalStage: 1,
    sourceStage: 1
  })
  right.RE = restrictionSnapshots('RE', [1], {
    initialStage: 1,
    finalStage: 1,
    sourceStage: 1,
    value: 2
  })

  const blocks = compareDadgerBlocks(left, right, {
    mode: 'data',
    options: OPTIONS
  })

  assert.equal(blocks.HQ[0].status, 'changed')
  assert.equal(blocks.HQ[0].fields.coeficientes.changed, true)
  assert.equal(blocks.RE[0].status, 'changed')
  assert.equal(blocks.RE[0].fields.fatores_uh.changed, true)
})

function deck(baseDate, dates) {
  return {
    info_dadger: {
      data_base: baseDate,
      numero_estagios: Object.keys(dates).length,
      datas_estagios: dates
    }
  }
}

function restrictionSnapshots(block, stages, {
  initialStage,
  finalStage,
  sourceStage,
  value = 1
}) {
  return stages.map(estagio => {
    const common = {
      numero_restricao: 10,
      estagio,
      estagio_inicial: initialStage,
      estagio_final: finalStage
    }

    if (block === 'HQ') {
      return {
        ...common,
        limites: {
          estagio: sourceStage,
          pesado_min: 100,
          pesado_max: null,
          medio_min: 100,
          medio_max: null,
          leve_min: 100,
          leve_max: null
        },
        coeficientes: [{
          estagio: sourceStage,
          numero_usina: 18,
          coeficiente: value,
          tipo_variavel: 'QDEF'
        }]
      }
    }

    if (block === 'HV') {
      return {
        ...common,
        limites: {
          estagio: sourceStage,
          limite_inferior: 782.89,
          limite_superior: null
        },
        coeficientes: [{
          estagio: sourceStage,
          numero_usina: 18,
          coeficiente: value,
          tipo_variavel: 'VARM'
        }]
      }
    }

    return {
      ...common,
      limites: {
        estagio: sourceStage,
        pesado_min: 100,
        pesado_max: null,
        medio_min: 100,
        medio_max: null,
        leve_min: 100,
        leve_max: null
      },
      fatores_uh: [{
        estagio: sourceStage,
        numero_usina: 18,
        fator: value,
        frequencia: 1
      }],
      fatores_ut: [],
      fatores_interligacao: [],
      fatores_contrato: []
    }
  })
}
