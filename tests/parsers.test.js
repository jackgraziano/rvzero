import test from 'node:test'
import assert from 'node:assert/strict'

import { parseDadger } from '../src/utils/parsers/index.js'
import { parseHE } from '../src/utils/parsers/heParser.js'
import { parsePQ } from '../src/utils/parsers/pqParser.js'
import { parseRE } from '../src/utils/parsers/reParser.js'
import { parseUH } from '../src/utils/parsers/uhParser.js'
import { parseRenovaveis } from '../src/utils/parsers/renovaveisParser.js'

function fixedLine(length, fields) {
  const characters = Array(length).fill(' ')
  for (const [start, value] of fields) {
    String(value).split('').forEach((character, index) => {
      characters[start + index] = character
    })
  }
  return characters.join('').trimEnd()
}

test('parser integrado valida DT/DP e limita arrays ao horizonte do deck', () => {
  const content = [
    'DT  31    1   2026',
    'DP   1    1   3       50536.0      30.0   50538.0      74.0   41997.0      64.0',
    'DP   2    1   3       50536.0      30.0   50538.0      74.0   41997.0      64.0',
    'DP   2   11   3                    30.0                74.0                64.0',
    'MP   1       0    1',
    'RQ   1     100   90',
    'ZZ dado preservado'
  ].join('\r\n')
  const parsed = parseDadger(content)

  assert.equal(parsed.info_dadger.numero_estagios, 2)
  assert.equal(parsed.info_dadger.numero_patamares, 3)
  assert.deepEqual(
    parsed.DP.filter(record => record.estagio === 2).map(record => record.subsistema),
    [1, 11]
  )
  assert.deepEqual(parsed.MP[0].fatores, [0, 1])
  assert.deepEqual(parsed.RQ[0].vazoes_minimas_pct, [100, 90])
  assert.deepEqual(parsed.OUTROS.ZZ, ['ZZ dado preservado'])
  assert.equal(parsed.OUTROS.RQ, undefined)
})

test('parser rejeita deck sem calendário mínimo confiável', () => {
  assert.throws(
    () => parseDadger('DP   1    1   3'),
    /registro DT ausente/
  )
  assert.throws(
    () => parseDadger('DT  31    1   2026'),
    /bloco DP ausente/
  )
})

test('CM é associado por número a todos os estágios HE', () => {
  const lines = [
    'HE  100  2          20.0  1     2340.0 0   0',
    'HE  100  2          20.0  2     2340.0 0   0',
    'HE  100  2          20.0  3     2340.0 0   0',
    'CM  100    1           1'
  ]
  const restrictions = parseHE(lines)

  assert.equal(restrictions.length, 3)
  assert.deepEqual(
    restrictions.map(restriction => restriction.coeficientes),
    [
      [{ numero_restricao: 100, ree: 1, coeficiente: 1 }],
      [{ numero_restricao: 100, ree: 1, coeficiente: 1 }],
      [{ numero_restricao: 100, ree: 1, coeficiente: 1 }]
    ]
  )
  assert.equal(restrictions[0].flag_calculo_prod, 0)
  assert.equal(restrictions[0].flag_trat_nao_atend, 0)
})

test('campos zero de UH e RI não são convertidos em ausência', () => {
  const line = fixedLine(75, [
    [0, 'UH'],
    [4, '001'],
    [9, '01'],
    [14, '       0.0'],
    [24, '       0.0'],
    [39, '0'],
    [44, ' 0'],
    [49, '       0.0'],
    [59, '       0.0'],
    [69, '0'],
    [71, 'NW']
  ])
  const record = parseUH([line])[0]

  assert.equal(record.volume_armazenado_pct, 0)
  assert.equal(record.limite_vertimento, 0)
  assert.equal(record.estagio_producao, 0)
  assert.equal(record.status, 'NW')
})

test('PQ propaga por fonte+subsistema e soma cada patamar separadamente', () => {
  const pq = (source, subsystem, stage, heavy, medium, light) =>
    fixedLine(39, [
      [0, 'PQ'],
      [4, source.padEnd(10)],
      [14, String(subsystem).padStart(2)],
      [19, String(stage).padStart(2)],
      [24, String(heavy).padStart(5)],
      [29, String(medium).padStart(5)],
      [34, String(light).padStart(5)]
    ])
  const records = parsePQ([
    pq('FONTE', 1, 1, 1, 2, 3),
    pq('FONTE', 2, 1, 10, 20, 30),
    pq('OUTRA', 1, 1, 4, 5, 6),
    pq('FONTE', 1, 2, 7, 8, 9)
  ], 2)

  assert.deepEqual(
    records.find(record => record.estagio === 2 && record.subsistema === 1),
    {
      estagio: 2,
      subsistema: 1,
      geracao_pesado: 11,
      geracao_medio: 13,
      geracao_leve: 15
    }
  )
  assert.equal(
    records.find(record => record.estagio === 2 && record.subsistema === 2)
      .geracao_pesado,
    10
  )
})

test('fatores de RE são herdados individualmente e preservam alterações parciais', () => {
  const lines = [
    fixedLine(16, [[0, 'RE'], [4, '0001'], [9, ' 1'], [14, ' 3']]),
    fixedLine(32, [[0, 'FU'], [9, ' 1'], [14, '001'], [19, '       1.0']]),
    fixedLine(32, [[0, 'FU'], [9, ' 1'], [14, '002'], [19, '       2.0']]),
    fixedLine(32, [[0, 'FU'], [9, ' 2'], [14, '001'], [19, '       1.5']])
  ]
  const restrictions = parseRE(lines, 3)

  assert.deepEqual(
    restrictions[1].fatores_uh.map(factor => [factor.numero_usina, factor.fator]),
    [[1, 1.5], [2, 2]]
  )
  assert.deepEqual(
    restrictions[2].fatores_uh.map(factor => [factor.numero_usina, factor.fator]),
    [[1, 1.5], [2, 2]]
  )
})

test('parser de renováveis também preserva valores zero', () => {
  const parsed = parseRenovaveis([
    'PEE-SUBM;0;0',
    'PEE-POT-INST-PER;0;0;0;0',
    'PEE-GER-PER-PAT-CEN;0;0;0;0;0;0'
  ].join('\r\n'))

  assert.equal(parsed['PEE-POT-INST-PER'][0].potInstPEE, 0)
  assert.equal(parsed['PEE-GER-PER-PAT-CEN'][0].gerEolica, 0)
})
