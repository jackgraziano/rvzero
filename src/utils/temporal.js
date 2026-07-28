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

/**
 * Associa os valores históricos do registro VI ao calendário do próprio deck.
 *
 * Em estudos semanais, QDEFn representa a semana iniciada n semanas antes de
 * DT. Quando o primeiro estágio é mensal, apenas QDEF1 possui calendário
 * definido: ele representa o mês imediatamente anterior ao início do estudo.
 * Entradas adicionais são preservadas sem uma temporalidade inventada.
 */
export function buildViHistoryCalendar(infoDadger, flowCount) {
  const count = Number.isInteger(flowCount) && flowCount > 0 ? flowCount : 0
  const baseDate = parseBrazilianDate(infoDadger?.data_base)
  if (!baseDate || count === 0) return []

  const firstStage = (infoDadger?.estagios ?? [])
    .find(stage => stage.numero === 1)
  const firstStageIsMonthly =
    firstStage?.duracao_horas != null &&
    firstStage.duracao_horas > 7 * 24 &&
    firstStage.duracao_horas % 24 === 0

  if (firstStageIsMonthly) {
    const previousMonthStart = new Date(Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth() - 1,
      1
    ))
    const previousMonthEnd = new Date(Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      0
    ))

    return Array.from({ length: count }, (_, index) => {
      const position = index + 1
      if (position !== 1) {
        return {
          position,
          key: null,
          date: null,
          endDate: null,
          granularity: null
        }
      }

      const date = formatBrazilianDate(previousMonthStart)
      return {
        position,
        key: `month:${date}`,
        date,
        endDate: formatBrazilianDate(previousMonthEnd),
        granularity: 'month'
      }
    })
  }

  return Array.from({ length: count }, (_, index) => {
    const position = index + 1
    const startsAt = addDays(baseDate, -7 * position)
    const endsAt = addDays(startsAt, 6)
    const date = formatBrazilianDate(startsAt)
    return {
      position,
      key: `week:${date}`,
      date,
      endDate: formatBrazilianDate(endsAt),
      granularity: 'week'
    }
  })
}
