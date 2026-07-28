import { hasDiff, semanticEqual } from '../../utils/comparison.js'

export const OCCURRENCE_STATUS = Object.freeze({
  EQUAL: 'equal',
  CHANGED: 'changed',
  ONLY_LEFT: 'only-left',
  ONLY_RIGHT: 'only-right',
  OUTSIDE_COMMON_HORIZON: 'outside-common-horizon'
})

export function makeOccurrence({
  fileType,
  block,
  identity = {},
  calendar = {},
  left = null,
  right = null,
  fieldNames = [],
  ignoredFieldNames = [],
  compareField = defaultCompareField
}) {
  const ignoredFields = new Set(ignoredFieldNames)
  const fields = Object.fromEntries(
    fieldNames.map(field => {
      const leftValue = left?.[field]
      const rightValue = right?.[field]
      return [
        field,
        {
          left: leftValue ?? null,
          right: rightValue ?? null,
          changed: !ignoredFields.has(field) &&
            compareField(leftValue, rightValue, field)
        }
      ]
    })
  )
  const hasChangedField = Object.values(fields).some(field => field.changed)
  const sameTemporality = calendar.sameTemporality !== false
  const status = statusFor({ left, right, sameTemporality, hasChangedField })

  return {
    fileType,
    block,
    status,
    identity,
    calendar: stripInternalCalendar(calendar),
    fields
  }
}

export function statusFor({ left, right, sameTemporality = true, hasChangedField = false }) {
  if (!sameTemporality) return OCCURRENCE_STATUS.OUTSIDE_COMMON_HORIZON
  if (left && !right) return OCCURRENCE_STATUS.ONLY_LEFT
  if (!left && right) return OCCURRENCE_STATUS.ONLY_RIGHT
  if (hasChangedField) return OCCURRENCE_STATUS.CHANGED
  return OCCURRENCE_STATUS.EQUAL
}

export function includeOccurrence(occurrence, options) {
  if (!options.includeEqual && occurrence.status === OCCURRENCE_STATUS.EQUAL) {
    return false
  }
  if (
    !options.includeOutsideCommonHorizon &&
    occurrence.status === OCCURRENCE_STATUS.OUTSIDE_COMMON_HORIZON
  ) {
    return false
  }
  return true
}

export function summarizeBlocks(blocks) {
  const summary = {
    comparablePeriods: 0,
    differences: 0,
    onlyLeft: 0,
    onlyRight: 0,
    outsideCommonHorizon: 0
  }
  const comparablePeriods = new Set()

  for (const occurrence of flattenBlocks(blocks)) {
    if (occurrence.status !== OCCURRENCE_STATUS.OUTSIDE_COMMON_HORIZON) {
      const key = comparablePeriodKey(occurrence.calendar)
      if (key) comparablePeriods.add(key)
    }

    if (occurrence.status === OCCURRENCE_STATUS.CHANGED) {
      summary.differences += 1
    } else if (occurrence.status === OCCURRENCE_STATUS.ONLY_LEFT) {
      summary.onlyLeft += 1
      summary.differences += 1
    } else if (occurrence.status === OCCURRENCE_STATUS.ONLY_RIGHT) {
      summary.onlyRight += 1
      summary.differences += 1
    } else if (occurrence.status === OCCURRENCE_STATUS.OUTSIDE_COMMON_HORIZON) {
      summary.outsideCommonHorizon += 1
    }
  }

  summary.comparablePeriods = comparablePeriods.size
  return summary
}

export function flattenBlocks(blocks) {
  return Object.values(blocks)
    .flatMap(fileTypeBlocks => Object.values(fileTypeBlocks))
    .flat()
}

export function addBlock(blocks, fileType, block, occurrences) {
  if (occurrences.length === 0) return
  if (!blocks[fileType]) blocks[fileType] = {}
  blocks[fileType][block] = occurrences
}

export function sortOccurrences(occurrences) {
  return [...occurrences].sort((first, second) =>
    compareCalendar(first.calendar, second.calendar) ||
    stableString(first.identity).localeCompare(
      stableString(second.identity),
      'pt-BR',
      { numeric: true }
    ) ||
    stableString(first.fields).localeCompare(
      stableString(second.fields),
      'pt-BR',
      { numeric: true }
    )
  )
}

function stripInternalCalendar(calendar) {
  const {
    sameTemporality,
    ...publicCalendar
  } = calendar
  return Object.fromEntries(
    Object.entries(publicCalendar).filter(([, value]) => value != null)
  )
}

function defaultCompareField(leftValue, rightValue) {
  if (leftValue == null && rightValue == null) return false
  if (typeof leftValue === 'object' || typeof rightValue === 'object') {
    return !semanticEqual(leftValue, rightValue)
  }
  return hasDiff(leftValue, rightValue)
}

function comparablePeriodKey(calendar) {
  if (calendar.date) return `data:${calendar.date}`
  if (calendar.index != null) return `index:${calendar.index}`
  if (calendar.leftIndex != null && calendar.leftIndex === calendar.rightIndex) {
    return `index:${calendar.leftIndex}`
  }
  return null
}

function compareCalendar(first, second) {
  if ((first.date ?? null) !== (second.date ?? null)) {
    return String(first.date ?? '').localeCompare(String(second.date ?? ''), 'pt-BR', {
      numeric: true
    })
  }

  return (first.index ?? first.leftIndex ?? 0) - (second.index ?? second.leftIndex ?? 0) ||
    (first.rightIndex ?? 0) - (second.rightIndex ?? 0)
}

function stableString(value) {
  if (value == null) return ''
  if (typeof value !== 'object') return String(value)
  if (Array.isArray(value)) return `[${value.map(stableString).join(',')}]`
  return Object.entries(value)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([key, item]) => `${key}:${stableString(item)}`)
    .join('\u0000')
}
