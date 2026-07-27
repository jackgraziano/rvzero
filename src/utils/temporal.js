const BRAZILIAN_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/

export function parseBrazilianDate(value) {
  const match = BRAZILIAN_DATE_PATTERN.exec(value ?? '')
  if (!match) return null

  const [, dayText, monthText, yearText] = match
  const day = Number(dayText)
  const month = Number(monthText)
  const year = Number(yearText)
  const timestamp = Date.UTC(year, month - 1, day)
  const date = new Date(timestamp)

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return date
}

export function formatBrazilianDate(date) {
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

export function addDays(value, days) {
  const date = value instanceof Date ? value : parseBrazilianDate(value)
  if (!date) return null

  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

export function compareBrazilianDates(first, second) {
  const firstDate = parseBrazilianDate(first)
  const secondDate = parseBrazilianDate(second)

  if (!firstDate && !secondDate) return 0
  if (!firstDate) return 1
  if (!secondDate) return -1
  return firstDate.getTime() - secondDate.getTime()
}

export function buildStageCalendar(baseDate, stageCount, dpRecords = []) {
  const initialDate = parseBrazilianDate(baseDate)
  if (!initialDate || !Number.isInteger(stageCount) || stageCount < 1) return []

  const calendar = []

  for (let stage = 1; stage <= stageCount; stage += 1) {
    const startsAt = addDays(initialDate, (stage - 1) * 7)
    const stageRecords = dpRecords.filter(record => record.estagio === stage)
    const durationCandidates = new Set(
      stageRecords
        .map(record => [
          record.horas_pesada,
          record.horas_media,
          record.horas_leve
        ])
        .filter(hours => hours.every(value => value !== null && value !== undefined))
        .map(hours => hours.reduce((total, value) => total + value, 0))
        .filter(hours => hours > 0)
    )
    const durationHours = durationCandidates.size === 1
      ? [...durationCandidates][0]
      : null
    const durationDays = durationHours !== null && durationHours % 24 === 0
      ? durationHours / 24
      : null
    const endsAt = durationDays
      ? addDays(startsAt, durationDays - 1)
      : null

    calendar.push({
      numero: stage,
      data_inicio: formatBrazilianDate(startsAt),
      data_fim: endsAt ? formatBrazilianDate(endsAt) : null,
      duracao_horas: durationHours,
      horas_consistentes: durationCandidates.size === 1
    })
  }

  return calendar
}
