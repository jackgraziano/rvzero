import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { compareDeckSets } from '../../src/core/index.js'

const schema = JSON.parse(
  readFileSync(new URL('../../src/core/contract/report.schema.json', import.meta.url))
)

test('schema público descreve os campos obrigatórios do relatório', () => {
  assert.equal(schema.properties.schemaVersion.const, '2')
  assert.equal(schema.properties.coreVersion.const, '1.1.0')
  assert.deepEqual(schema.required, [
    'schemaVersion',
    'coreVersion',
    'mode',
    'inputs',
    'summary',
    'blocks',
    'warnings'
  ])
  assert.deepEqual(schema.$defs.occurrence.properties.status.enum, [
    'equal',
    'changed',
    'only-left',
    'only-right',
    'outside-common-horizon'
  ])
})

test('relatório sintético satisfaz o contrato estrutural sem campos de apresentação', () => {
  const report = compareDeckSets(
    {
      left: [{ name: 'renovaveis.rv1', content: renovaveis(100) }],
      right: [{ name: 'renovaveis.rv2', content: renovaveis(110) }]
    },
    { mode: 'estagio' }
  )

  assert.equal(report.schemaVersion, schema.properties.schemaVersion.const)
  assert.equal(report.coreVersion, schema.properties.coreVersion.const)
  assert.equal(schema.properties.mode.enum.includes(report.mode), true)
  assert.deepEqual(Object.keys(report).sort(), schema.required.sort())

  const occurrence = report.blocks.renovaveis.geracaoAgregada[0]
  assert.equal('dadger1' in occurrence, false)
  assert.equal('dadger2' in occurrence, false)
  assert.equal('display' in occurrence, false)
  assert.equal('diff_geracaoMedia' in occurrence, false)
  assert.equal(occurrence.status, 'changed')
  assert.deepEqual(validateReportAgainstSchema(report), [])
})

function renovaveis(generation) {
  return [
    'PEE-SUBM;1;1',
    `PEE-GER-PER-PAT-CEN;1;1;1;1;1;${generation}`
  ].join('\n')
}

function validateReportAgainstSchema(report) {
  const errors = []
  const statusValues = new Set(schema.$defs.occurrence.properties.status.enum)
  const fileTypeValues = new Set(schema.$defs.inputFiles.items.properties.type.enum)

  for (const key of schema.required) {
    if (!(key in report)) errors.push(`missing:${key}`)
  }
  if (report.schemaVersion !== schema.properties.schemaVersion.const) {
    errors.push('schemaVersion')
  }
  if (report.coreVersion !== schema.properties.coreVersion.const) {
    errors.push('coreVersion')
  }
  if (!schema.properties.mode.enum.includes(report.mode)) errors.push('mode')

  for (const side of ['left', 'right']) {
    if (!Array.isArray(report.inputs?.[side])) errors.push(`inputs:${side}`)
    for (const file of report.inputs?.[side] ?? []) {
      if (typeof file.name !== 'string') errors.push(`inputs:${side}:name`)
      if (!fileTypeValues.has(file.type)) errors.push(`inputs:${side}:type`)
    }
  }

  for (const key of schema.properties.summary.required) {
    if (key === 'comparablePeriodsByScope') continue
    if (!Number.isInteger(report.summary?.[key]) || report.summary[key] < 0) {
      errors.push(`summary:${key}`)
    }
  }
  const periodScopes =
    schema.properties.summary.properties.comparablePeriodsByScope
  for (const key of periodScopes.required) {
    if (!Number.isInteger(report.summary?.comparablePeriodsByScope?.[key])) {
      errors.push(`summary:comparablePeriodsByScope:${key}`)
    }
  }

  for (const [fileType, blocks] of Object.entries(report.blocks)) {
    for (const [block, occurrences] of Object.entries(blocks)) {
      if (!Array.isArray(occurrences)) errors.push(`blocks:${fileType}:${block}`)
      for (const occurrence of occurrences) {
        if (!fileTypeValues.has(occurrence.fileType)) errors.push('occurrence:fileType')
        if (typeof occurrence.block !== 'string') errors.push('occurrence:block')
        if (!statusValues.has(occurrence.status)) errors.push('occurrence:status')
        if (typeof occurrence.identity !== 'object') errors.push('occurrence:identity')
        if (typeof occurrence.calendar !== 'object') errors.push('occurrence:calendar')
        for (const field of Object.values(occurrence.fields)) {
          if (typeof field.changed !== 'boolean') errors.push('occurrence:field')
          if (!('left' in field) || !('right' in field)) errors.push('occurrence:field-side')
        }
      }
    }
  }

  return errors
}
