const GROUP_DEFINITIONS = [
  {
    collection: 'fatores_uh',
    code: 'FU',
    label: 'Fatores de usinas hidráulicas',
    itemLabel: item => item.numero_usina,
    context: item => item.frequencia == null
      ? null
      : `${formatCompactNumber(item.frequencia)} Hz`
  },
  {
    collection: 'fatores_ut',
    code: 'FT',
    label: 'Fatores de usinas térmicas',
    itemLabel: item => item.numero_usina,
    context: item => item.subsistema == null
      ? null
      : `Subsistema ${item.subsistema}`
  },
  {
    collection: 'fatores_interligacao',
    code: 'FI',
    label: 'Fatores de intercâmbio',
    itemLabel: item => `${item.subsistema_de ?? '–'} → ${item.subsistema_para ?? '–'}`,
    context: () => null
  },
  {
    collection: 'fatores_contrato',
    code: 'FE',
    label: 'Fatores de contratos',
    itemLabel: item => item.numero_contrato,
    context: item => item.submercado == null
      ? null
      : `Submercado ${item.submercado}`
  }
]

export function formatCompactNumber(value) {
  if (value == null) return '–'
  if (typeof value !== 'number') return String(value)
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}

export function groupRestrictionFactors(restriction) {
  if (!restriction) return []

  return GROUP_DEFINITIONS.flatMap(definition => {
    const groups = new Map()

    for (const item of restriction[definition.collection] ?? []) {
      const context = definition.context(item)
      const key = `${context ?? ''}\u0000${item.fator ?? ''}`

      if (!groups.has(key)) {
        groups.set(key, {
          code: definition.code,
          label: definition.label,
          context,
          factor: item.fator,
          items: []
        })
      }

      groups.get(key).items.push(String(definition.itemLabel(item) ?? '–'))
    }

    return [...groups.values()]
      .map(group => ({
        ...group,
        items: group.items.sort((first, second) =>
          first.localeCompare(second, 'pt-BR', { numeric: true })
        )
      }))
      .sort((first, second) =>
        String(first.context ?? '').localeCompare(
          String(second.context ?? ''),
          'pt-BR',
          { numeric: true }
        ) ||
        compareNullableNumbers(first.factor, second.factor)
      )
  })
}

export function groupRestrictionCoefficients(coefficients = []) {
  const groups = new Map()

  for (const coefficient of coefficients) {
    const variable = coefficient.tipo_variavel ?? 'Coeficiente'
    const key = `${variable}\u0000${coefficient.coeficiente ?? ''}`
    if (!groups.has(key)) {
      groups.set(key, {
        variable,
        coefficient: coefficient.coeficiente,
        plants: []
      })
    }
    groups.get(key).plants.push(String(coefficient.numero_usina ?? '–'))
  }

  return [...groups.values()]
    .map(group => ({
      ...group,
      plants: group.plants.sort((first, second) =>
        first.localeCompare(second, 'pt-BR', { numeric: true })
      )
    }))
    .sort((first, second) =>
      first.variable.localeCompare(second.variable, 'pt-BR') ||
      compareNullableNumbers(first.coefficient, second.coefficient)
    )
}

function compareNullableNumbers(first, second) {
  if (first == null && second == null) return 0
  if (first == null) return 1
  if (second == null) return -1
  return first - second
}
