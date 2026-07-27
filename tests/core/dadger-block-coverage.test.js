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
  'VE'
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
