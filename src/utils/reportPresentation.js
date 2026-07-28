import { parseBrazilianDate } from './temporal.js'

const DIFFERENCE_STATUSES = new Set(['changed', 'only-left', 'only-right'])

export function occurrenceHasSide(occurrence, side) {
  if (occurrence.status === 'only-left') return side === 'left'
  if (occurrence.status === 'only-right') return side === 'right'
  if (occurrence.status === 'equal' || occurrence.status === 'changed') {
    return true
  }

  const indexKey = side === 'left' ? 'leftIndex' : 'rightIndex'
  if (occurrence.calendar?.[indexKey] != null) return true
  return Object.values(occurrence.fields ?? {})
    .some(field => field?.[side] != null)
}

export function recordRowsFromOccurrences(occurrences, {
  mode = 'estagio',
  leftKey = 'dadger1',
  rightKey = 'dadger2',
  identityAliases = {},
  temporalField = 'estagio',
  temporalAbbreviation = 'Estágio',
  includeSourceDate = false
} = {}) {
  return (occurrences ?? []).map((occurrence, occurrenceIndex) => {
    const identity = normalizeIdentity(occurrence.identity, identityAliases)
    const left = occurrenceRecord(occurrence, 'left', {
      identity,
      mode,
      temporalField,
      temporalAbbreviation,
      includeSourceDate
    })
    const right = occurrenceRecord(occurrence, 'right', {
      identity,
      mode,
      temporalField,
      temporalAbbreviation,
      includeSourceDate
    })
    const onlyInOne = !left || !right
    const sameTemporality = occurrence.status !== 'outside-common-horizon'
    const display = temporalDisplay(occurrence, null, {
      mode,
      temporalAbbreviation,
      includeSourceDate: false
    })
    const differences = Object.fromEntries(
      Object.entries(occurrence.fields ?? {}).flatMap(([field, comparison]) => [
        [`diff_${field}`, sameTemporality && Boolean(comparison.changed)],
        [`${field}_diff`, sameTemporality && Boolean(comparison.changed)]
      ])
    )

    return {
      key: occurrenceKey(occurrence, occurrenceIndex),
      occurrence,
      ...identity,
      ...sortableFields(occurrence.fields),
      [leftKey]: left,
      [rightKey]: right,
      display,
      date: occurrence.calendar?.date ?? null,
      temporalOrder: temporalOrder(occurrence.calendar),
      onlyInOne,
      sameTemporality,
      has_diff: DIFFERENCE_STATUSES.has(occurrence.status),
      ...differences
    }
  })
}

export function temporalColumnsFromOccurrences(occurrences, mode = 'estagio') {
  const columns = new Map()

  for (const occurrence of occurrences ?? []) {
    const calendar = occurrence.calendar ?? {}
    const value = mode === 'data'
      ? calendar.date
      : calendar.index ?? calendar.leftIndex ?? calendar.rightIndex
    if (value == null) continue
    const key = mode === 'data' ? `data_${value}` : `estagio_${value}`
    if (!columns.has(key)) {
      columns.set(key, {
        key,
        label: mode === 'data' ? value : `Est ${value}`,
        ...(mode === 'data' ? { data: value } : { estagio: value }),
        order: temporalOrder(calendar)
      })
    }
  }

  return [...columns.values()]
    .sort((first, second) => first.order - second.order)
    .map(({ order, ...column }) => column)
}

export function stageArrayRowsFromOccurrences(
  occurrences,
  columns,
  { entityField, valueField, hasItaipuSet = false }
) {
  const groups = groupOccurrences(occurrences, occurrence =>
    stableIdentity(occurrence.identity)
  )

  return [...groups.entries()].map(([key, entityOccurrences]) => {
    const identity = normalizeIdentity(entityOccurrences[0]?.identity)
    const sidePresence = {
      left: entityOccurrences.some(occurrence =>
        occurrenceHasSide(occurrence, 'left')
      ),
      right: entityOccurrences.some(occurrence =>
        occurrenceHasSide(occurrence, 'right')
      )
    }
    const occurrenceByColumn = new Map(entityOccurrences.map(occurrence => [
      calendarColumnKey(occurrence.calendar),
      occurrence
    ]))
    const valores = {}

    for (const column of columns) {
      const occurrence = occurrenceByColumn.get(column.key)
      const field = occurrence?.fields?.[valueField]
      valores[column.key] = {
        valor1: field?.left ?? null,
        valor2: field?.right ?? null,
        diff: occurrence
          ? DIFFERENCE_STATUSES.has(occurrence.status)
          : false,
        sameTemporality: occurrence?.status !== 'outside-common-horizon'
      }
    }

    const entityValue = identity[entityField] ?? null
    const entityDisplay = hasItaipuSet && identity.conjunto_itaipu
      ? `${entityValue}/${identity.conjunto_itaipu}`
      : entityValue
    const hasDifference = entityOccurrences.some(occurrence =>
      DIFFERENCE_STATUSES.has(occurrence.status)
    )
    const row = {
      key,
      ...identity,
      entityDisplay,
      dadger1: sidePresence.left ? { ...identity } : null,
      dadger2: sidePresence.right ? { ...identity } : null,
      onlyInOne: !sidePresence.left || !sidePresence.right,
      sameTemporality: entityOccurrences.some(occurrence =>
        occurrence.status !== 'outside-common-horizon'
      ),
      valores,
      temDiferenca: hasDifference,
      has_diff: hasDifference
    }

    for (const column of columns) {
      row[column.key] =
        valores[column.key].valor1 ?? valores[column.key].valor2 ?? 0
    }
    return row
  })
}

export function entityTemporalRowsFromOccurrences(
  occurrences,
  columns,
  entityKey
) {
  const groups = groupOccurrences(occurrences, occurrence =>
    String(occurrence.identity?.[entityKey] ?? '')
  )

  return [...groups.entries()].map(([key, entityOccurrences]) => {
    const entityId = entityOccurrences[0]?.identity?.[entityKey] ?? null
    const occurrenceByColumn = new Map(entityOccurrences.map(occurrence => [
      calendarColumnKey(occurrence.calendar),
      occurrence
    ]))
    const valores = {}

    for (const column of columns) {
      const occurrence = occurrenceByColumn.get(column.key)
      const left = occurrence
        ? occurrenceRecord(occurrence, 'left', {
            identity: normalizeIdentity(occurrence.identity),
            mode: occurrence.calendar?.date ? 'data' : 'estagio',
            temporalField: 'estagio',
            temporalAbbreviation: 'Estágio',
            includeSourceDate: false
          })
        : null
      const right = occurrence
        ? occurrenceRecord(occurrence, 'right', {
            identity: normalizeIdentity(occurrence.identity),
            mode: occurrence.calendar?.date ? 'data' : 'estagio',
            temporalField: 'estagio',
            temporalAbbreviation: 'Estágio',
            includeSourceDate: false
          })
        : null
      const comparablePeriod = occurrence?.status !== 'outside-common-horizon'
      const bothPresent = left !== null && right !== null
      const bothAbsent = left === null && right === null

      valores[column.key] = {
        occurrence: occurrence ?? null,
        valor1: left,
        valor2: right,
        diff: occurrence
          ? DIFFERENCE_STATUSES.has(occurrence.status)
          : false,
        sameTemporality: bothPresent || bothAbsent,
        dataExisteEmAmbos: comparablePeriod
      }
    }

    const sidePresence = {
      left: entityOccurrences.some(occurrence =>
        occurrenceHasSide(occurrence, 'left')
      ),
      right: entityOccurrences.some(occurrence =>
        occurrenceHasSide(occurrence, 'right')
      )
    }
    const hasDifference = entityOccurrences.some(occurrence =>
      DIFFERENCE_STATUSES.has(occurrence.status)
    )
    const row = {
      key,
      [entityKey]: entityId,
      onlyInOne: !sidePresence.left || !sidePresence.right,
      sameTemporality: entityOccurrences.some(occurrence =>
        occurrence.status !== 'outside-common-horizon'
      ),
      valores,
      temDiferenca: hasDifference,
      has_diff: hasDifference
    }

    for (const column of columns) {
      row[column.key] =
        valores[column.key].valor1 ?? valores[column.key].valor2 ?? 0
    }
    return row
  })
}

export function occurrenceRecord(occurrence, side, {
  identity = normalizeIdentity(occurrence.identity),
  mode = 'estagio',
  temporalField = 'estagio',
  temporalAbbreviation = 'Estágio',
  includeSourceDate = false
} = {}) {
  if (!occurrenceHasSide(occurrence, side)) return null

  const record = {
    ...identity,
    ...Object.fromEntries(
      Object.entries(occurrence.fields ?? {})
        .map(([field, comparison]) => [field, comparison?.[side] ?? null])
    )
  }
  const indexKey = side === 'left' ? 'leftIndex' : 'rightIndex'
  const index = occurrence.calendar?.[indexKey] ??
    occurrence.calendar?.index ??
    null
  if (temporalField && index != null) record[temporalField] = index
  if (includeSourceDate) {
    const sourceDateKey =
      side === 'left' ? 'leftSourceDate' : 'rightSourceDate'
    record.data_inicio = occurrence.calendar?.[sourceDateKey] ?? null
  }
  record.display = temporalDisplay(occurrence, side, {
    mode,
    temporalAbbreviation,
    includeSourceDate
  })
  return record
}

function temporalDisplay(occurrence, side, {
  mode,
  temporalAbbreviation,
  includeSourceDate
}) {
  const calendar = occurrence.calendar ?? {}
  const indexKey = side === 'right' ? 'rightIndex' : 'leftIndex'
  const index = calendar[indexKey] ?? calendar.index ?? null

  if (mode === 'data') {
    if (!calendar.date) {
      return index == null ? '-' : `${temporalAbbreviation} ${index}`
    }
    return includeSourceDate && index != null
      ? `${calendar.date} · ${temporalAbbreviation} ${index}`
      : calendar.date
  }

  if (index == null) return '-'
  const sourceDateKey = side === 'right' ? 'rightSourceDate' : 'leftSourceDate'
  const sourceDate = includeSourceDate ? calendar[sourceDateKey] : null
  return sourceDate
    ? `${temporalAbbreviation} ${index} · ${sourceDate}`
    : `${temporalAbbreviation} ${index}`
}

function normalizeIdentity(identity = {}, aliases = {}) {
  return Object.fromEntries(
    Object.entries(identity ?? {})
      .map(([key, value]) => [aliases[key] ?? key, value])
  )
}

function sortableFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([field, comparison]) => [
        field,
        comparison?.left ?? comparison?.right ?? null
      ])
  )
}

function temporalOrder(calendar = {}) {
  if (calendar.date) {
    return parseBrazilianDate(calendar.date)?.getTime() ??
      Number.MAX_SAFE_INTEGER
  }
  return Number(
    calendar.index ?? calendar.leftIndex ?? calendar.rightIndex ??
    Number.MAX_SAFE_INTEGER
  )
}

function calendarColumnKey(calendar = {}) {
  if (calendar.date) return `data_${calendar.date}`
  const index = calendar.index ?? calendar.leftIndex ?? calendar.rightIndex
  return `estagio_${index}`
}

function occurrenceKey(occurrence, occurrenceIndex) {
  return [
    calendarColumnKey(occurrence.calendar),
    stableIdentity(occurrence.identity),
    occurrenceIndex
  ].join(':')
}

function groupOccurrences(occurrences = [], getKey) {
  const groups = new Map()
  for (const occurrence of occurrences) {
    const key = getKey(occurrence)
    const group = groups.get(key) ?? []
    group.push(occurrence)
    groups.set(key, group)
  }
  return groups
}

function stableIdentity(identity = {}) {
  return Object.entries(identity ?? {})
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([key, value]) => `${key}:${value ?? ''}`)
    .join('\u0000')
}
