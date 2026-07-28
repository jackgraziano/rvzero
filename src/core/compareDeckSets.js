import { compareDadgerBlocks } from './comparators/dadger/index.js'
import { compareDadgnlBlocks } from './comparators/dadgnl/index.js'
import { compareRenovaveisBlocks } from './comparators/renovaveis/index.js'
import { createReport } from './contract/report.js'
import { ERROR_CODES, RvzeroCoreError } from './errors.js'
import { parseDeckSet } from './parsers/parseDeckSet.js'
import {
  addBlock,
  summarizeBlocks
} from './report/occurrence.js'
import { summarizeComparablePeriods } from './report/periods.js'

const FILE_TYPE_IDS = ['dadger', 'dadgnl', 'renovaveis']

const DEFAULT_OPTIONS = {
  mode: 'estagio',
  includeEqual: false,
  includeOutsideCommonHorizon: true
}

/**
 * @typedef {Object} CompareDeckSetsOptions
 * @property {'data'|'estagio'} [mode='estagio']
 * @property {boolean} [includeEqual=false]
 * @property {boolean} [includeOutsideCommonHorizon=true]
 */

/**
 * Compara dois conjuntos textuais de arquivos DADGER, DADGNL e renováveis.
 *
 * O núcleo não lê arquivos nem usa APIs de navegador; adaptadores externos
 * devem fornecer somente nome e conteúdo textual.
 *
 * @param {{left: Array<{name: string, content: string}>, right: Array<{name: string, content: string}>}} input
 * @param {CompareDeckSetsOptions} [rawOptions]
 * @returns {object}
 */
export function compareDeckSets(input, rawOptions = {}) {
  const options = normalizeOptions(rawOptions)
  const left = parseDeckSet(input?.left ?? [], 'left')
  const right = parseDeckSet(input?.right ?? [], 'right')

  if (options.mode === 'data' && (!left.dadger || !right.dadger)) {
    throw new RvzeroCoreError({
      code: ERROR_CODES.MISSING_DADGER_FOR_DATE_MODE,
      message: 'A comparação por data exige um DADGER em cada lado.'
    })
  }

  const comparableTypes = FILE_TYPE_IDS.filter(typeId =>
    Boolean(left[typeId] && right[typeId])
  )

  if (comparableTypes.length === 0) {
    throw new RvzeroCoreError({
      code: ERROR_CODES.NO_COMPARABLE_FILE_TYPES,
      message: 'Nenhum tipo de arquivo comparável foi informado nos dois lados.'
    })
  }

  const warnings = buildWarnings(left, right)
  const blocks = {}

  if (left.dadger && right.dadger) {
    addFileTypeBlocks(
      blocks,
      'dadger',
      compareDadgerBlocks(left.dadger.data, right.dadger.data, {
        mode: options.mode,
        options
      })
    )
  }

  if (left.renovaveis && right.renovaveis) {
    addFileTypeBlocks(
      blocks,
      'renovaveis',
      compareRenovaveisBlocks(left.renovaveis.data, right.renovaveis.data, {
        mode: options.mode,
        leftDadger: left.dadger?.data ?? null,
        rightDadger: right.dadger?.data ?? null,
        options
      })
    )
  }

  if (left.dadgnl && right.dadgnl) {
    addFileTypeBlocks(
      blocks,
      'dadgnl',
      compareDadgnlBlocks(left.dadgnl.data, right.dadgnl.data, {
        mode: options.mode,
        leftDadger: left.dadger?.data ?? null,
        rightDadger: right.dadger?.data ?? null,
        options
      })
    )
  }

  return createReport({
    mode: options.mode,
    inputs: {
      left: left.files,
      right: right.files
    },
    blocks,
    summary: summarizeBlocks(
      blocks,
      summarizeComparablePeriods({
        mode: options.mode,
        left,
        right
      })
    ),
    warnings
  })
}

function normalizeOptions(rawOptions) {
  const options = {
    ...DEFAULT_OPTIONS,
    ...rawOptions
  }

  if (!['data', 'estagio'].includes(options.mode)) {
    throw new TypeError("mode deve ser 'data' ou 'estagio'.")
  }

  options.includeEqual = Boolean(options.includeEqual)
  options.includeOutsideCommonHorizon = Boolean(options.includeOutsideCommonHorizon)
  return options
}

function buildWarnings(left, right) {
  const warnings = []

  for (const typeId of FILE_TYPE_IDS) {
    if (Boolean(left[typeId]) === Boolean(right[typeId])) continue
    const side = left[typeId] ? 'left' : 'right'
    const file = left[typeId] ?? right[typeId]
    warnings.push({
      code: 'UNPAIRED_FILE_TYPE',
      message: `Arquivo ${typeId} informado somente em ${side}.`,
      side,
      fileName: file.name,
      fileType: typeId
    })
  }

  return warnings
}

function addFileTypeBlocks(blocks, fileType, fileTypeBlocks) {
  for (const [block, occurrences] of Object.entries(fileTypeBlocks)) {
    addBlock(blocks, fileType, block, occurrences)
  }
}
