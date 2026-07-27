export function parseIntegerField(value) {
  const text = String(value ?? '').trim()
  if (text === '') return null

  const parsed = Number.parseInt(text, 10)
  return Number.isNaN(parsed) ? null : parsed
}

export function parseDecimalField(value) {
  const text = String(value ?? '').trim()
  if (text === '') return null

  const parsed = Number.parseFloat(text.replace(',', '.'))
  return Number.isNaN(parsed) ? null : parsed
}

export function parseFixedWidthNumbers(line, start, width, count) {
  const values = []

  for (let index = 0; index < count; index += 1) {
    const fieldStart = start + index * width
    values.push(parseDecimalField(line.slice(fieldStart, fieldStart + width)))
  }

  return values
}

export function groupBy(records, getKey) {
  const groups = new Map()

  for (const record of records) {
    const key = getKey(record)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(record)
  }

  return groups
}

export function expandForwardByStage(records, stageCount, getGroupKey) {
  const expanded = []

  for (const group of groupBy(records, getGroupKey).values()) {
    const byStage = new Map(group.map(record => [record.estagio, record]))
    let current = null

    for (let stage = 1; stage <= stageCount; stage += 1) {
      if (byStage.has(stage)) current = byStage.get(stage)
      if (current) expanded.push({ ...current, estagio: stage })
    }
  }

  return expanded
}

export function latestAtOrBefore(items, stage, minimumStage = 1) {
  for (let candidate = stage; candidate >= minimumStage; candidate -= 1) {
    const found = items.find(item => item.estagio === candidate)
    if (found) return found
  }

  return null
}

export function collectionAtStage(items, stage, getIdentity, minimumStage = 1) {
  const identities = new Set(items.map(getIdentity))
  const active = []

  for (const identity of identities) {
    const history = items.filter(item => getIdentity(item) === identity)
    const item = latestAtOrBefore(history, stage, minimumStage)
    if (item) active.push(item)
  }

  return active
}
