import { dadgnlWeekDate } from '../../utils/dadgnlComparison.js'
import { buildViHistoryCalendar } from '../../utils/temporal.js'

const EMPTY_SCOPES = Object.freeze({
  dadger: 0,
  viHistory: 0,
  dadgnl: 0,
  renovaveis: 0
})

export function summarizeComparablePeriods({ mode, left, right }) {
  const leftDadger = left.dadger?.data ?? null
  const rightDadger = right.dadger?.data ?? null
  const scopes = {
    ...EMPTY_SCOPES,
    dadger: comparableDadgerPeriods(leftDadger, rightDadger, mode),
    viHistory: comparableViHistoryPeriods(
      leftDadger,
      rightDadger,
      mode
    ),
    dadgnl: comparableDadgnlPeriods({
      leftDadgnl: left.dadgnl?.data ?? null,
      rightDadgnl: right.dadgnl?.data ?? null,
      leftDadger,
      rightDadger,
      mode
    }),
    renovaveis: comparableRenewablePeriods({
      leftRenewables: left.renovaveis?.data ?? null,
      rightRenewables: right.renovaveis?.data ?? null,
      leftDadger,
      rightDadger,
      mode
    })
  }

  return {
    comparablePeriods: primaryComparablePeriods(left, right, scopes),
    comparablePeriodsByScope: scopes
  }
}

function comparableDadgerPeriods(left, right, mode) {
  if (!left || !right) return 0
  if (mode === 'estagio') {
    return Math.min(stageCount(left), stageCount(right))
  }
  return intersectionSize(stageDates(left), stageDates(right))
}

function comparableViHistoryPeriods(left, right, mode) {
  if (!left || !right) return 0
  const leftCount = maximumViFlowCount(left.VI ?? [])
  const rightCount = maximumViFlowCount(right.VI ?? [])
  if (mode === 'estagio') return Math.min(leftCount, rightCount)

  const leftKeys = buildViHistoryCalendar(
    left.info_dadger,
    leftCount
  ).map(period => period.key).filter(Boolean)
  const rightKeys = buildViHistoryCalendar(
    right.info_dadger,
    rightCount
  ).map(period => period.key).filter(Boolean)
  return intersectionSize(leftKeys, rightKeys)
}

function comparableDadgnlPeriods({
  leftDadgnl,
  rightDadgnl,
  leftDadger,
  rightDadger,
  mode
}) {
  if (!leftDadgnl || !rightDadgnl) return 0
  const leftCount = weekCount(leftDadgnl)
  const rightCount = weekCount(rightDadgnl)
  if (mode === 'estagio') return Math.min(leftCount, rightCount)
  if (!leftDadger || !rightDadger) return 0

  return intersectionSize(
    Array.from(
      { length: leftCount },
      (_, index) => dadgnlWeekDate(index + 1, leftDadger)
    ).filter(Boolean),
    Array.from(
      { length: rightCount },
      (_, index) => dadgnlWeekDate(index + 1, rightDadger)
    ).filter(Boolean)
  )
}

function comparableRenewablePeriods({
  leftRenewables,
  rightRenewables,
  leftDadger,
  rightDadger,
  mode
}) {
  if (!leftRenewables || !rightRenewables) return 0
  const leftPeriods = renewablePeriodIndexes(leftRenewables)
  const rightPeriods = renewablePeriodIndexes(rightRenewables)
  if (mode === 'estagio') {
    return intersectionSize(leftPeriods, rightPeriods)
  }
  if (!leftDadger || !rightDadger) return 0

  const leftDates = leftPeriods.map(index =>
    leftDadger.info_dadger?.datas_estagios?.[index]
  ).filter(Boolean)
  const rightDates = rightPeriods.map(index =>
    rightDadger.info_dadger?.datas_estagios?.[index]
  ).filter(Boolean)
  return intersectionSize(leftDates, rightDates)
}

function primaryComparablePeriods(left, right, scopes) {
  if (left.dadger && right.dadger) return scopes.dadger
  if (left.dadgnl && right.dadgnl) return scopes.dadgnl
  if (left.renovaveis && right.renovaveis) return scopes.renovaveis
  return 0
}

function stageCount(dadger) {
  return Number(dadger.info_dadger?.numero_estagios ?? 0)
}

function stageDates(dadger) {
  return Object.values(
    dadger.info_dadger?.datas_estagios ?? {}
  ).filter(Boolean)
}

function weekCount(dadgnl) {
  return Number(dadgnl.info_dadgnl?.numero_semanas ?? 0)
}

function renewablePeriodIndexes(renewables) {
  return [...new Set(
    (renewables.geracaoAgregada ?? [])
      .map(record => record.periodo)
      .filter(index => index != null)
  )]
}

function maximumViFlowCount(records) {
  return Math.max(
    ...records.map(record => record.vazoes_defluentes?.length ?? 0),
    0
  )
}

function intersectionSize(leftValues, rightValues) {
  const right = new Set(rightValues)
  return new Set(leftValues.filter(value => right.has(value))).size
}
