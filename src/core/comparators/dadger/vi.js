import { alignSequences } from '../../../utils/comparison.js'
import {
  buildViHistoryCalendar,
  compareBrazilianDates
} from '../../../utils/temporal.js'
import {
  includeOccurrence,
  makeOccurrence,
  sortOccurrences
} from '../../report/occurrence.js'

export function compareVI(leftDadger, rightDadger, { mode, options }) {
  const records1 = leftDadger?.VI ?? []
  const records2 = rightDadger?.VI ?? []
  const flowCount = Math.max(
    maximumViFlowCount(records1),
    maximumViFlowCount(records2)
  )
  const history1 = buildViHistoryCalendar(
    leftDadger?.info_dadger,
    flowCount
  )
  const history2 = buildViHistoryCalendar(
    rightDadger?.info_dadger,
    flowCount
  )
  const plants = new Set([
    ...records1.map(record => record.numero_usina),
    ...records2.map(record => record.numero_usina)
  ])
  const occurrences = []

  for (const numero_usina of [...plants].sort((first, second) => first - second)) {
    const plantRecords1 = records1.filter(record =>
      record.numero_usina === numero_usina
    )
    const plantRecords2 = records2.filter(record =>
      record.numero_usina === numero_usina
    )

    alignSequences(plantRecords1, plantRecords2, viSignature)
      .forEach(({ left, right }, sequenceIndex) => {
        const identity = { numero_usina, sequenceIndex }
        const durationOccurrence = makeOccurrence({
          fileType: 'dadger',
          block: 'VI',
          identity,
          calendar: { sameTemporality: true },
          left: comparableVIDuration(left),
          right: comparableVIDuration(right),
          fieldNames: ['duracao_horas']
        })
        if (includeOccurrence(durationOccurrence, options)) {
          occurrences.push(durationOccurrence)
        }

        const flowOccurrences = mode === 'data'
          ? compareVIFlowsByDate({
              left,
              right,
              history1,
              history2,
              identity
            })
          : compareVIFlowsByPosition({ left, right, identity })

        occurrences.push(
          ...flowOccurrences.filter(occurrence =>
            includeOccurrence(occurrence, options)
          )
        )
      })
  }

  return sortOccurrences(occurrences)
}

function comparableVIDuration(record) {
  if (!record) return null
  return { duracao_horas: record.duracao_horas }
}

function compareVIFlowsByDate({
  left,
  right,
  history1,
  history2,
  identity
}) {
  const horizon1 = new Map(
    history1.filter(period => period.key).map(period => [period.key, period])
  )
  const horizon2 = new Map(
    history2.filter(period => period.key).map(period => [period.key, period])
  )
  const flows1 = indexVIFlowsByPeriod(left, history1)
  const flows2 = indexVIFlowsByPeriod(right, history2)
  const periodKeys = new Set([...flows1.keys(), ...flows2.keys()])
  const occurrences = [...periodKeys]
    .sort((first, second) => compareViPeriodKeys(
      first,
      second,
      horizon1,
      horizon2
    ))
    .map(key => {
      const leftFlow = flows1.get(key) ?? null
      const rightFlow = flows2.get(key) ?? null
      const period = leftFlow?.period ?? rightFlow?.period
      return makeVIFlowOccurrence({
        identity,
        calendar: {
          date: period?.date ?? null,
          endDate: period?.endDate ?? null,
          granularity: period?.granularity ?? null,
          leftIndex: leftFlow?.position ?? null,
          rightIndex: rightFlow?.position ?? null,
          sameTemporality: horizon1.has(key) && horizon2.has(key)
        },
        leftFlow,
        rightFlow
      })
    })

  occurrences.push(
    ...unknownVIFlowOccurrences(left, history1, identity, 'left'),
    ...unknownVIFlowOccurrences(right, history2, identity, 'right')
  )
  return occurrences
}

function compareVIFlowsByPosition({ left, right, identity }) {
  const flowCount = Math.max(
    left?.vazoes_defluentes?.length ?? 0,
    right?.vazoes_defluentes?.length ?? 0
  )

  return Array.from({ length: flowCount }, (_, index) => {
    const position = index + 1
    const hasLeft = Boolean(left) &&
      index < (left.vazoes_defluentes?.length ?? 0)
    const hasRight = Boolean(right) &&
      index < (right.vazoes_defluentes?.length ?? 0)
    return makeVIFlowOccurrence({
      identity,
      calendar: {
        index: position,
        leftIndex: hasLeft ? position : null,
        rightIndex: hasRight ? position : null,
        sameTemporality: true
      },
      leftFlow: hasLeft
        ? { value: left.vazoes_defluentes[index], position }
        : null,
      rightFlow: hasRight
        ? { value: right.vazoes_defluentes[index], position }
        : null
    })
  })
}

function makeVIFlowOccurrence({
  identity,
  calendar,
  leftFlow,
  rightFlow
}) {
  return makeOccurrence({
    fileType: 'dadger',
    block: 'VI',
    identity,
    calendar,
    left: leftFlow ? { vazao_defluente: leftFlow.value } : null,
    right: rightFlow ? { vazao_defluente: rightFlow.value } : null,
    fieldNames: ['vazao_defluente']
  })
}

function indexVIFlowsByPeriod(record, history) {
  const flows = new Map()
  if (!record) return flows

  record.vazoes_defluentes.forEach((value, index) => {
    const period = history[index]
    if (!period?.key) return
    flows.set(period.key, {
      value,
      position: index + 1,
      period
    })
  })
  return flows
}

function unknownVIFlowOccurrences(record, history, identity, side) {
  if (!record) return []

  return record.vazoes_defluentes.flatMap((value, index) => {
    const period = history[index]
    if (period?.key) return []
    const flow = { value, position: index + 1 }
    return [makeVIFlowOccurrence({
      identity,
      calendar: {
        [`${side}Index`]: flow.position,
        granularity: 'unknown',
        sameTemporality: false
      },
      leftFlow: side === 'left' ? flow : null,
      rightFlow: side === 'right' ? flow : null
    })]
  })
}

function compareViPeriodKeys(first, second, horizon1, horizon2) {
  const firstPeriod = horizon1.get(first) ?? horizon2.get(first)
  const secondPeriod = horizon1.get(second) ?? horizon2.get(second)
  return compareBrazilianDates(firstPeriod?.date, secondPeriod?.date) ||
    first.localeCompare(second, 'pt-BR', { numeric: true })
}

function maximumViFlowCount(records) {
  return Math.max(
    ...records.map(record => record.vazoes_defluentes?.length ?? 0),
    0
  )
}

function viSignature(record) {
  return JSON.stringify([
    record?.duracao_horas ?? null,
    record?.vazoes_defluentes ?? []
  ])
}
