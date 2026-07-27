import test from 'node:test'
import assert from 'node:assert/strict'

import {
  compareDeckSets,
  ERROR_CODES,
  RvzeroCoreError
} from '../../src/core/index.js'

test('compareDeckSets gera relatório versionado com DADGER, DADGNL e renováveis por data', () => {
  const report = compareDeckSets(
    {
      left: [
        { name: 'dadger.rv0', content: dadger('31/01/2026', 6) },
        { name: 'dadgnl.rv0', content: dadgnlGL(86, 6, 350) },
        { name: 'renovaveis.rv0', content: renovaveis(1, 6, 100) }
      ],
      right: [
        { name: 'dadger.rv3', content: dadger('21/02/2026', 3) },
        { name: 'dadgnl.rv3', content: dadgnlGL(86, 3, 0) },
        { name: 'renovaveis.rv3', content: renovaveis(1, 3, 100) }
      ]
    },
    {
      mode: 'data',
      includeEqual: false,
      includeOutsideCommonHorizon: true
    }
  )

  assert.equal(report.schemaVersion, '1')
  assert.equal(report.mode, 'data')
  assert.deepEqual(report.inputs.left.map(file => file.type), [
    'dadger',
    'dadgnl',
    'renovaveis'
  ])

  const gl = report.blocks.dadgnl.GL.find(occurrence =>
    occurrence.calendar.date === '07/03/2026'
  )
  assert.equal(gl.status, 'changed')
  assert.deepEqual(gl.calendar, {
    date: '07/03/2026',
    leftIndex: 6,
    rightIndex: 3,
    leftSourceDate: '01/01/2099',
    rightSourceDate: '01/01/2099'
  })
  assert.equal(gl.fields.geracao_pesado.left, 350)
  assert.equal(gl.fields.geracao_pesado.right, 0)
  assert.equal(gl.fields.geracao_pesado.changed, true)

  const outsideDadger = report.blocks.dadger.DP.find(occurrence =>
    occurrence.calendar.date === '31/01/2026'
  )
  assert.equal(outsideDadger.status, 'outside-common-horizon')
  assert.equal(report.summary.outsideCommonHorizon > 0, true)
})

test('compareDeckSets compara renováveis por índice quando não há DADGER', () => {
  const report = compareDeckSets(
    {
      left: [{ name: 'renovaveis.rv1', content: renovaveis(1, 1, 100) }],
      right: [{ name: 'renovaveis.rv2', content: renovaveis(1, 1, 120) }]
    },
    { mode: 'estagio' }
  )

  const [occurrence] = report.blocks.renovaveis.geracaoAgregada
  assert.equal(occurrence.status, 'changed')
  assert.equal(occurrence.calendar.index, 1)
  assert.equal(occurrence.fields.geracaoMedia.left, 100)
  assert.equal(occurrence.fields.geracaoMedia.right, 120)
})

test('compareDeckSets lança erro estruturado para modo data sem dois DADGERs', () => {
  assert.throws(
    () => compareDeckSets(
      {
        left: [{ name: 'renovaveis.rv1', content: renovaveis(1, 1, 100) }],
        right: [{ name: 'renovaveis.rv2', content: renovaveis(1, 1, 100) }]
      },
      { mode: 'data' }
    ),
    error => {
      assert.equal(error instanceof RvzeroCoreError, true)
      assert.equal(error.code, ERROR_CODES.MISSING_DADGER_FOR_DATE_MODE)
      assert.deepEqual(error.toJSON(), {
        code: ERROR_CODES.MISSING_DADGER_FOR_DATE_MODE,
        message: 'A comparação por data exige um DADGER em cada lado.',
        side: null,
        fileName: null
      })
      return true
    }
  )
})

test('compareDeckSets rejeita tipo duplicado no mesmo lado', () => {
  assert.throws(
    () => compareDeckSets({
      left: [
        { name: 'renovaveis.rv1', content: renovaveis(1, 1, 100) },
        { name: 'renovaveis.rv2', content: renovaveis(1, 1, 100) }
      ],
      right: [{ name: 'renovaveis.rv3', content: renovaveis(1, 1, 100) }]
    }),
    error => {
      assert.equal(error.code, ERROR_CODES.DUPLICATE_FILE_TYPE)
      assert.equal(error.side, 'left')
      assert.equal(error.fileName, 'renovaveis.rv2')
      return true
    }
  )
})

function dadger(baseDate, stageCount) {
  const [day, month, year] = baseDate.split('/')
  const lines = [`DT ${day} ${month} ${year}`]
  for (let stage = 1; stage <= stageCount; stage += 1) {
    lines.push(dpLine(stage, 1, 100 + stage))
  }
  return lines.join('\n')
}

function dpLine(stage, subsystem, carga) {
  const line = fixedLine('DP ', 80)
  put(line, 4, String(stage).padStart(3))
  put(line, 9, String(subsystem).padStart(3))
  put(line, 14, ' 3')
  put(line, 20, decimal(carga, 10))
  put(line, 30, decimal(30, 10))
  put(line, 40, decimal(carga, 10))
  put(line, 50, decimal(74, 10))
  put(line, 60, decimal(carga, 10))
  put(line, 70, decimal(64, 10))
  return line.join('')
}

function dadgnlGL(plant, week, generation) {
  const line = fixedLine('GL ', 80)
  put(line, 4, String(plant).padStart(3))
  put(line, 9, ' 1')
  put(line, 14, String(week).padStart(2))
  put(line, 19, decimal(generation, 10))
  put(line, 29, decimal(15, 5))
  put(line, 34, decimal(generation, 10))
  put(line, 44, decimal(64, 5))
  put(line, 49, decimal(generation, 10))
  put(line, 59, decimal(89, 5))
  put(line, 65, '01012099')
  return line.join('')
}

function renovaveis(pee, period, generation) {
  return [
    `PEE-SUBM;${pee};1`,
    `PEE-GER-PER-PAT-CEN;${pee};${period};${period};1;1;${generation}`
  ].join('\n')
}

function fixedLine(prefix, length) {
  const chars = Array.from({ length }, () => ' ')
  put(chars, 0, prefix)
  return chars
}

function put(chars, start, value) {
  String(value).split('').forEach((char, index) => {
    chars[start + index] = char
  })
}

function decimal(value, width) {
  return String(value).padStart(width)
}
