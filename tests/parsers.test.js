import test from 'node:test'
import assert from 'node:assert/strict'

import { parseDadger } from '../src/utils/parsers/index.js'
import { parseAC } from '../src/utils/parsers/acParser.js'
import { parseHE } from '../src/utils/parsers/heParser.js'
import { parsePQ } from '../src/utils/parsers/pqParser.js'
import { parseRE } from '../src/utils/parsers/reParser.js'
import { parseUH } from '../src/utils/parsers/uhParser.js'
import { parseRenovaveis } from '../src/utils/parsers/renovaveisParser.js'
import { parseDadgnl } from '../src/utils/parsers/dadgnlParser.js'
import {
  buildCotvolSnapshots,
  cotvolSignature
} from '../src/utils/cotvol.js'
import { detectFileType } from '../src/utils/fileTypeRegistry.js'

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

test('COTVOL preserva coeficientes e alinha a semana relativa ao calendário do deck', () => {
  const cotvol = (plant, coefficient, value, month, week, year = 2026) =>
    fixedLine(80, [
      [0, 'AC'],
      [4, String(plant).padStart(3)],
      [9, 'COTVOL'],
      [23, String(coefficient)],
      [33, String(value).padStart(6)],
      [69, month],
      [74, String(week)],
      [76, String(year)]
    ])
  const calendar4 = [
    { numero: 1, data_inicio: '18/07/2026' },
    { numero: 2, data_inicio: '25/07/2026' },
    { numero: 3, data_inicio: '01/08/2026' }
  ]
  const calendar5 = [
    { numero: 1, data_inicio: '25/07/2026' },
    { numero: 2, data_inicio: '01/08/2026' }
  ]
  const records4 = parseAC([
    cotvol(285, 1, '86.25', 'JUL', 1),
    cotvol(285, 1, '85.20', 'JUL', 2),
    cotvol(285, 1, '83.01', 'AGO', 1),
    cotvol(288, 1, '96.98', 'JUL', 1),
    cotvol(288, 1, '97.00', 'AGO', 1)
  ], calendar4)
  const records5 = parseAC([
    cotvol(285, 1, '85.20', 'JUL', 1),
    cotvol(285, 1, '83.01', 'AGO', 1),
    cotvol(288, 1, '96.98', 'JUL', 1),
    cotvol(288, 1, '97.00', 'AGO', 1)
  ], calendar5)

  assert.deepEqual(
    records4.find(record =>
      record.usina === 285 &&
      record.mes === 'JUL' &&
      record.semana === 2
    ),
    {
      usina: 285,
      mnemonico: 'COTVOL',
      dados: '    1          85.20',
      mes: 'JUL',
      semana: 2,
      ano: 2026,
      linha_original: cotvol(285, 1, '85.20', 'JUL', 2),
      indice_coeficiente: 1,
      valor_coeficiente: 85.2,
      estagio: 2,
      data_inicio: '25/07/2026'
    }
  )

  const snapshots4 = buildCotvolSnapshots(records4, { estagios: calendar4 })
  const snapshots5 = buildCotvolSnapshots(records5, { estagios: calendar5 })
  const snapshot = (snapshots, plant, date) => snapshots.find(record =>
    record.usina === plant && record.data_inicio === date
  )

  assert.equal(
    cotvolSignature(snapshot(snapshots4, 285, '25/07/2026')),
    cotvolSignature(snapshot(snapshots5, 285, '25/07/2026'))
  )
  assert.equal(
    cotvolSignature(snapshot(snapshots4, 285, '01/08/2026')),
    cotvolSignature(snapshot(snapshots5, 285, '01/08/2026'))
  )
  assert.equal(
    cotvolSignature(snapshot(snapshots4, 288, '25/07/2026')),
    cotvolSignature(snapshot(snapshots5, 288, '25/07/2026'))
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

test('DADGNL preserva os quatro blocos e expande alterações TG por semana', () => {
  const parsed = parseDadgnl([
    'TG   86   1   SANTA CRUZ 1     0.0500.0    212.61  0.0500.0    212.61  0.0500.0    212.61',
    'TG   86   1   SANTA CRUZ 3     0.0350.0    212.61  0.0350.0    212.61  0.0350.0    212.61',
    'GS   1   2',
    'GS   2   4',
    'GS   3   5',
    'NL   86   1   2',
    'GL   86   1    1        500.0  15.     500.0  64.     500.0  89. 18072026',
    'GL   86   1    9        350.0            0.0            0.0      12092026'
  ].join('\r\n'))

  assert.equal(parsed.info_dadgnl.numero_semanas, 9)
  assert.equal(parsed.TG.length, 9)
  assert.equal(parsed.TG[1].disp_pesado, 500)
  assert.equal(parsed.TG[2].disp_pesado, 350)
  assert.equal(parsed.TG[8].disp_leve, 350)
  assert.deepEqual(parsed.GS[0], { mes: 1, numero_semanas: 2 })
  assert.deepEqual(parsed.NL[0], {
    codigo_usina: 86,
    subsistema: 1,
    lag: 2
  })
  assert.deepEqual(parsed.GL[1], {
    codigo_usina: 86,
    subsistema: 1,
    semana: 9,
    geracao_pesado: 350,
    duracao_pesado: null,
    geracao_medio: 0,
    duracao_medio: null,
    geracao_leve: 0,
    duracao_leve: null,
    data_inicio: '12/09/2026'
  })
})

test('parser rejeita conteúdo sem registros reconhecidos de DADGNL', () => {
  assert.throws(
    () => parseDadgnl('& arquivo sem blocos'),
    /nenhum registro TG, GS, NL ou GL/
  )
})

test('detecção distingue DADGNL de DADGER', () => {
  assert.equal(detectFileType('dadger.rv4').id, 'dadger')
  assert.equal(detectFileType('DADGNL.RV4').id, 'dadgnl')
  assert.equal(detectFileType('renovaveis.csv').id, 'renovaveis')
})
