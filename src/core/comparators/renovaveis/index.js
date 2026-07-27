import { alignRenovaveisGeneration } from '../../../utils/renovaveisComparison.js'
import {
  includeOccurrence,
  makeOccurrence,
  sortOccurrences
} from '../../report/occurrence.js'

const GENERATION_FIELDS = ['geracaoMedia', 'numPEEs', 'numCenarios']

export function compareRenovaveisBlocks(leftRenovaveis, rightRenovaveis, {
  mode,
  leftDadger = null,
  rightDadger = null,
  options
}) {
  const rows = alignRenovaveisGeneration(leftRenovaveis, rightRenovaveis, {
    compareMode: mode,
    dadger1Data: leftDadger,
    dadger2Data: rightDadger
  })

  return {
    geracaoAgregada: sortOccurrences(rows.map(row => makeOccurrence({
      fileType: 'renovaveis',
      block: 'geracaoAgregada',
      identity: {
        submercado: row.submercado ?? null,
        patamar: row.patamar ?? null
      },
      calendar: {
        date: row.date ?? null,
        index: row.date ? null : row.period,
        leftIndex: row.ren1?.periodo ?? null,
        rightIndex: row.ren2?.periodo ?? null,
        sameTemporality: row.sameTemporality
      },
      left: row.ren1,
      right: row.ren2,
      fieldNames: GENERATION_FIELDS
    })).filter(occurrence =>
      includeOccurrence(occurrence, options)
    ))
  }
}
