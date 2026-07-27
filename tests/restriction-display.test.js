import test from 'node:test'
import assert from 'node:assert/strict'

import {
  formatCompactNumber,
  groupRestrictionCoefficients,
  groupRestrictionFactors
} from '../src/utils/restrictionDisplay.js'

test('agrupa fatores de RE por tipo, contexto e fator', () => {
  const groups = groupRestrictionFactors({
    fatores_uh: [267, 272, 275, 314].map(numero_usina => ({
      numero_usina,
      fator: 1,
      frequencia: null
    })),
    fatores_ut: [21, 36, 46, 70, 73, 116, 176, 212, 239].map(numero_usina => ({
      numero_usina,
      subsistema: 4,
      fator: 1
    })),
    fatores_interligacao: [],
    fatores_contrato: []
  })

  assert.deepEqual(groups, [
    {
      code: 'FU',
      label: 'Fatores de usinas hidráulicas',
      context: null,
      factor: 1,
      items: ['267', '272', '275', '314']
    },
    {
      code: 'FT',
      label: 'Fatores de usinas térmicas',
      context: 'Subsistema 4',
      factor: 1,
      items: ['21', '36', '46', '70', '73', '116', '176', '212', '239']
    }
  ])
})

test('agrupa coeficientes de HQ e HV sem expor nomes internos de campos', () => {
  const groups = groupRestrictionCoefficients([
    { numero_usina: 43, coeficiente: -1.5, tipo_variavel: 'VARM' },
    { numero_usina: 34, coeficiente: 1, tipo_variavel: 'VARM' },
    { numero_usina: 35, coeficiente: 1, tipo_variavel: 'VARM' }
  ])

  assert.deepEqual(groups, [
    { variable: 'VARM', coefficient: -1.5, plants: ['43'] },
    { variable: 'VARM', coefficient: 1, plants: ['34', '35'] }
  ])
})

test('não mistura fatores ou contextos diferentes e preserva zero', () => {
  const groups = groupRestrictionFactors({
    fatores_uh: [],
    fatores_ut: [
      { numero_usina: 2, subsistema: 1, fator: 0 },
      { numero_usina: 1, subsistema: 1, fator: 0 },
      { numero_usina: 3, subsistema: 2, fator: -0.5 }
    ],
    fatores_interligacao: [
      { subsistema_de: 'SE', subsistema_para: 'N', fator: 1 }
    ],
    fatores_contrato: []
  })

  assert.deepEqual(groups.map(group => ({
    code: group.code,
    context: group.context,
    factor: group.factor,
    items: group.items
  })), [
    { code: 'FT', context: 'Subsistema 1', factor: 0, items: ['1', '2'] },
    { code: 'FT', context: 'Subsistema 2', factor: -0.5, items: ['3'] },
    { code: 'FI', context: null, factor: 1, items: ['SE → N'] }
  ])
  assert.equal(formatCompactNumber(0), '0')
  assert.equal(formatCompactNumber(1.25), '1,25')
  assert.equal(formatCompactNumber(null), '–')
})
