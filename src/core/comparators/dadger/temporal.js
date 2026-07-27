import {
  alignByData,
  alignByEstagio,
  collectUniqueDates,
  encontrarEstagioPorData
} from '../../../utils/comparison.js'
import {
  includeOccurrence,
  makeOccurrence,
  sortOccurrences
} from '../../report/occurrence.js'

export function compareTemporalRecordBlock({
  block,
  leftDadger,
  rightDadger,
  mode,
  secondaryKey,
  identity,
  fields,
  options
}) {
  const records1 = leftDadger?.[block] ?? []
  const records2 = rightDadger?.[block] ?? []
  const transform = (left, right, _onlyInOne, sameTemporality, temporality, secondaryValue) => {
    const calendar = calendarFor(mode, temporality, left, right, sameTemporality)
    return makeOccurrence({
      fileType: 'dadger',
      block,
      identity: identity(left ?? right, secondaryValue),
      calendar,
      left,
      right,
      fieldNames: fields
    })
  }

  const rows = mode === 'data'
    ? alignByData(records1, records2, leftDadger, rightDadger, secondaryKey, transform)
    : alignByEstagio(
      records1,
      records2,
      leftDadger?.info_dadger,
      rightDadger?.info_dadger,
      secondaryKey,
      transform
    )

  return sortOccurrences(rows.filter(row => includeOccurrence(row, options)))
}

export function compareStageArrayBlock({
  block,
  valueField,
  entityField,
  includeItaipuSet = false,
  leftDadger,
  rightDadger,
  mode,
  options
}) {
  const records1 = leftDadger?.[block] ?? []
  const records2 = rightDadger?.[block] ?? []
  const entities = new Set([
    ...records1.map(stageArrayEntityKey(entityField, includeItaipuSet)),
    ...records2.map(stageArrayEntityKey(entityField, includeItaipuSet))
  ])
  const columns = mode === 'data'
    ? collectUniqueDates(leftDadger, rightDadger).map(date => ({
      date,
      leftIndex: encontrarEstagioPorData(date, leftDadger),
      rightIndex: encontrarEstagioPorData(date, rightDadger)
    }))
    : buildStageColumns(leftDadger, rightDadger)
  const occurrences = []

  for (const entityKey of [...entities].sort(compareValues)) {
    const left = records1.find(record =>
      stageArrayEntityKey(entityField, includeItaipuSet)(record) === entityKey
    ) ?? null
    const right = records2.find(record =>
      stageArrayEntityKey(entityField, includeItaipuSet)(record) === entityKey
    ) ?? null
    const source = left ?? right
    const identity = { [entityField]: source?.[entityField] ?? null }
    if (includeItaipuSet) identity.conjunto_itaipu = source?.conjunto_itaipu ?? null

    for (const column of columns) {
      const leftIndex = column.leftIndex
      const rightIndex = column.rightIndex
      const valueLeft = leftIndex == null ? null : left?.[valueField]?.[leftIndex - 1] ?? null
      const valueRight = rightIndex == null ? null : right?.[valueField]?.[rightIndex - 1] ?? null
      const occurrence = makeOccurrence({
        fileType: 'dadger',
        block,
        identity,
        calendar: {
          date: column.date ?? null,
          index: column.index ?? null,
          leftIndex,
          rightIndex,
          sameTemporality: leftIndex != null && rightIndex != null
        },
        left: valueLeft == null ? null : { [valueField]: valueLeft },
        right: valueRight == null ? null : { [valueField]: valueRight },
        fieldNames: [valueField]
      })
      if (includeOccurrence(occurrence, options)) occurrences.push(occurrence)
    }
  }

  return sortOccurrences(occurrences)
}

export function calendarFor(mode, temporality, left, right, sameTemporality) {
  if (mode === 'data') {
    return {
      date: temporality,
      leftIndex: left?.estagio ?? null,
      rightIndex: right?.estagio ?? null,
      sameTemporality
    }
  }

  return {
    index: temporality,
    leftIndex: left?.estagio ?? null,
    rightIndex: right?.estagio ?? null,
    sameTemporality
  }
}

function buildStageColumns(leftDadger, rightDadger) {
  const count1 = leftDadger?.info_dadger?.numero_estagios ?? 0
  const count2 = rightDadger?.info_dadger?.numero_estagios ?? 0
  return Array.from({ length: Math.max(count1, count2) }, (_, index) => {
    const stage = index + 1
    return {
      index: stage,
      leftIndex: stage <= count1 ? stage : null,
      rightIndex: stage <= count2 ? stage : null
    }
  })
}

function stageArrayEntityKey(entityField, includeItaipuSet) {
  return record => includeItaipuSet
    ? `${record[entityField]}\u0000${record.conjunto_itaipu ?? ''}`
    : String(record[entityField])
}

function compareValues(first, second) {
  return String(first).localeCompare(String(second), 'pt-BR', { numeric: true })
}
