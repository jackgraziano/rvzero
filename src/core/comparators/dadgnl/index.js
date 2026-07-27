import {
  alignDadgnlGL,
  alignDadgnlGS,
  alignDadgnlNL,
  alignDadgnlTG
} from '../../../utils/dadgnlComparison.js'
import {
  includeOccurrence,
  makeOccurrence,
  sortOccurrences
} from '../../report/occurrence.js'

const TG_FIELDS = [
  'nome_termica',
  'subsistema',
  'inflex_pesado',
  'disp_pesado',
  'cvu_pesado',
  'inflex_medio',
  'disp_medio',
  'cvu_medio',
  'inflex_leve',
  'disp_leve',
  'cvu_leve'
]

const GL_FIELDS = [
  'subsistema',
  'geracao_pesado',
  'duracao_pesado',
  'geracao_medio',
  'duracao_medio',
  'geracao_leve',
  'duracao_leve'
]

export function compareDadgnlBlocks(leftDadgnl, rightDadgnl, {
  mode,
  leftDadger = null,
  rightDadger = null,
  options
}) {
  return {
    TG: convertTemporalRows(
      'TG',
      alignDadgnlTG(leftDadgnl, rightDadgnl, {
        compareMode: mode,
        dadger1Data: leftDadger,
        dadger2Data: rightDadger
      }),
      'estagio',
      TG_FIELDS,
      options
    ),
    GS: convertStaticRows(
      'GS',
      alignDadgnlGS(leftDadgnl, rightDadgnl),
      row => ({ mes: row.dadger1?.mes ?? row.dadger2?.mes ?? null }),
      ['numero_semanas'],
      options
    ),
    NL: convertStaticRows(
      'NL',
      alignDadgnlNL(leftDadgnl, rightDadgnl),
      row => ({ codigo_usina: row.dadger1?.codigo_usina ?? row.dadger2?.codigo_usina ?? null }),
      ['subsistema', 'lag'],
      options
    ),
    GL: convertTemporalRows(
      'GL',
      alignDadgnlGL(leftDadgnl, rightDadgnl, {
        compareMode: mode,
        dadger1Data: leftDadger,
        dadger2Data: rightDadger
      }),
      'semana',
      GL_FIELDS,
      options
    )
  }
}

function convertTemporalRows(block, rows, temporalField, fields, options) {
  const occurrences = rows.map(row => {
    const left = row.dadger1
    const right = row.dadger2
    return makeOccurrence({
      fileType: 'dadgnl',
      block,
      identity: { codigoUsina: left?.codigo_usina ?? right?.codigo_usina ?? null },
      calendar: {
        date: row.date ?? null,
        index: row.date ? null : row.temporalOrder,
        leftIndex: left?.[temporalField] ?? null,
        rightIndex: right?.[temporalField] ?? null,
        leftSourceDate: left?.data_inicio ?? null,
        rightSourceDate: right?.data_inicio ?? null,
        sameTemporality: row.sameTemporality
      },
      left,
      right,
      fieldNames: fields
    })
  })

  return sortOccurrences(occurrences.filter(occurrence =>
    includeOccurrence(occurrence, options)
  ))
}

function convertStaticRows(block, rows, identity, fields, options) {
  const occurrences = rows.map(row => makeOccurrence({
    fileType: 'dadgnl',
    block,
    identity: identity(row),
    calendar: { sameTemporality: true },
    left: row.dadger1,
    right: row.dadger2,
    fieldNames: fields
  }))

  return sortOccurrences(occurrences.filter(occurrence =>
    includeOccurrence(occurrence, options)
  ))
}
