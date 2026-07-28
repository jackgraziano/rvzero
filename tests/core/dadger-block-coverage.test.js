import test from 'node:test'
import assert from 'node:assert/strict'

import { compareDadgerBlocks } from '../../src/core/comparators/dadger/index.js'

const EXPECTED_DADGER_BLOCKS = [
  'AC',
  'CT',
  'DP',
  'FD',
  'HE',
  'HQ',
  'HV',
  'IA',
  'MP',
  'OUTROS',
  'PQ',
  'RE',
  'RI',
  'RQ',
  'TI',
  'UH',
  'VE',
  'VI'
]

test('comparador puro cobre todos os blocos DADGER exibidos pelo site', () => {
  const left = dadgerFixture(100)
  const right = dadgerFixture(101)
  const blocks = compareDadgerBlocks(left, right, {
    mode: 'estagio',
    options: {
      includeEqual: true,
      includeOutsideCommonHorizon: true
    }
  })

  assert.deepEqual(Object.keys(blocks).sort(), EXPECTED_DADGER_BLOCKS)
  assert.equal(blocks.VI[0].fields.duracao_horas.changed, false)
  assert.equal(blocks.VI[0].fields.vazao_defluente_1.changed, true)
  assert.equal(blocks.VI[0].fields.vazao_defluente_2.changed, false)
})

test('VI preserva repetições e compara cada posição da sequência histórica', () => {
  const left = dadgerFixture(100)
  const right = dadgerFixture(100)
  left.VI = [
    {
      numero_usina: 156,
      duracao_horas: 360,
      vazoes_defluentes: [10, 20, 30]
    },
    {
      numero_usina: 156,
      duracao_horas: 168,
      vazoes_defluentes: [40]
    }
  ]
  right.VI = [
    {
      numero_usina: 156,
      duracao_horas: 360,
      vazoes_defluentes: [10, 21]
    },
    {
      numero_usina: 156,
      duracao_horas: 168,
      vazoes_defluentes: [40]
    }
  ]

  const blocks = compareDadgerBlocks(left, right, {
    mode: 'estagio',
    options: {
      includeEqual: true,
      includeOutsideCommonHorizon: true
    }
  })

  assert.equal(blocks.VI.length, 2)
  assert.equal(blocks.VI[0].status, 'changed')
  assert.equal(blocks.VI[0].fields.vazao_defluente_1.changed, false)
  assert.equal(blocks.VI[0].fields.vazao_defluente_2.changed, true)
  assert.equal(blocks.VI[0].fields.vazao_defluente_3.left, 30)
  assert.equal(blocks.VI[0].fields.vazao_defluente_3.right, null)
  assert.equal(blocks.VI[1].status, 'equal')
})

function dadgerFixture(value) {
  return {
    info_dadger: {
      data_base: '31/01/2026',
      numero_estagios: 1,
      datas_estagios: { 1: '31/01/2026' },
      estagios: [{ numero: 1, data_inicio: '31/01/2026' }]
    },
    DP: [{
      estagio: 1,
      subsistema: 1,
      numero_patamares: 3,
      carga_pesada: value,
      horas_pesada: 30,
      carga_media: value,
      horas_media: 74,
      carga_leve: value,
      horas_leve: 64
    }],
    PQ: [{ estagio: 1, subsistema: 1, geracao_pesado: value, geracao_medio: value, geracao_leve: value }],
    CT: [{ estagio: 1, codigo_usina: 1, nome_termica: 'UTE', subsistema: 1, inflex_pesado: value }],
    IA: [{ estagio: 1, subsistema_de: '1', subsistema_para: '2', flag_penalidade: 0, capacidades: [{ de_para: value, para_de: value }] }],
    UH: [{ numero_usina: 1, ree: 1, volume_armazenado_pct: value }],
    TI: [{ numero_usina: 1, vazoes: [value] }],
    MP: [{ numero_usina: 1, conjunto_itaipu: '50', fatores: [value] }],
    FD: [{ numero_usina: 1, conjunto_itaipu: '50', fatores: [value] }],
    VE: [{ numero_usina: 1, volumes: [value] }],
    RQ: [{ numero_ree: 1, vazoes_minimas_pct: [value] }],
    VI: [{
      numero_usina: 156,
      duracao_horas: 360,
      vazoes_defluentes: [value, 0]
    }],
    RE: [{
      numero_restricao: 1,
      estagio: 1,
      estagio_inicial: 1,
      estagio_final: 1,
      limites: { pesado_min: value },
      fatores_uh: [{ numero_usina: 1, frequencia: 1, fator: value }],
      fatores_ut: [],
      fatores_interligacao: [],
      fatores_contrato: []
    }],
    HQ: [{
      numero_restricao: 1,
      estagio: 1,
      estagio_inicial: 1,
      estagio_final: 1,
      limites: { pesado_min: value },
      coeficientes: [{ numero_usina: 1, tipo_variavel: 'QDEF', coeficiente: value }]
    }],
    HV: [{
      numero_restricao: 1,
      estagio: 1,
      estagio_inicial: 1,
      estagio_final: 1,
      limites: { limite_inferior: value },
      coeficientes: [{ numero_usina: 1, tipo_variavel: 'VARM', coeficiente: value }]
    }],
    RI: [{ estagio: 1, usina: 1, subsistema: 1, pesado: { p60_min: value }, medio: {}, leve: {} }],
    HE: [{ estagio: 1, numero_restricao: 1, tipo_limite: 1, coeficientes: [{ ree: 1, coeficiente: value }] }],
    AC: [{ usina: 1, mnemonico: 'TESTE', dados: String(value), mes: null, semana: null, ano: null }],
    OUTROS: { ZZ: [`ZZ ${value}`] }
  }
}
