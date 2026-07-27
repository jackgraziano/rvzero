import {
  collectionAtStage,
  latestAtOrBefore,
  parseDecimalField,
  parseIntegerField
} from './parserUtils.js'

export function parseRestrictionBlock(lines, stageCount, config) {
  const restrictions = []
  let current = null

  for (const line of lines) {
    if (line.startsWith(`${config.header} `)) {
      if (current) restrictions.push(current)
      current = parseHeader(line, config)
      continue
    }

    if (!current) continue

    const child = config.children.find(candidate => line.startsWith(`${candidate.mnemonic} `))
    if (!child) continue

    const parsed = child.parse(line)
    if (parsed) current[child.collection].push(parsed)
  }

  if (current) restrictions.push(current)

  const numberOfStages = stageCount || Math.max(
    ...restrictions.map(restriction => restriction.estagio_final),
    0
  )

  return restrictions.flatMap(restriction =>
    expandRestriction(restriction, numberOfStages, config.children)
  )
}

function parseHeader(line, config) {
  const numero_restricao = parseIntegerField(line.slice(4, config.numberEnd))
  const estagio_inicial = parseIntegerField(line.slice(9, 11))
  const estagio_final = parseIntegerField(line.slice(14, 16))

  if (
    numero_restricao === null ||
    estagio_inicial === null ||
    estagio_final === null
  ) {
    return null
  }

  const restriction = {
    numero_restricao,
    estagio_inicial,
    estagio_final
  }
  for (const child of config.children) restriction[child.collection] = []
  return restriction
}

function expandRestriction(restriction, stageCount, children) {
  const records = []
  const finalStage = Math.min(restriction.estagio_final, stageCount)

  for (let estagio = restriction.estagio_inicial; estagio <= finalStage; estagio += 1) {
    const record = {
      numero_restricao: restriction.numero_restricao,
      estagio,
      estagio_inicial: restriction.estagio_inicial,
      estagio_final: restriction.estagio_final
    }

    for (const child of children) {
      const items = restriction[child.collection]
      record[child.collection] = child.identity
        ? collectionAtStage(items, estagio, child.identity, restriction.estagio_inicial)
        : latestAtOrBefore(items, estagio, restriction.estagio_inicial)
    }
    records.push(record)
  }

  return records
}

export function parsePatamarLimits(line) {
  const estagio = parseIntegerField(line.slice(9, 11))
  if (estagio === null) return null

  return {
    estagio,
    pesado_min: parseDecimalField(line.slice(14, 24)),
    pesado_max: parseDecimalField(line.slice(24, 34)),
    medio_min: parseDecimalField(line.slice(34, 44)),
    medio_max: parseDecimalField(line.slice(44, 54)),
    leve_min: parseDecimalField(line.slice(54, 64)),
    leve_max: parseDecimalField(line.slice(64, 74))
  }
}

export function parseSingleLimits(line) {
  const estagio = parseIntegerField(line.slice(9, 11))
  if (estagio === null) return null

  return {
    estagio,
    limite_inferior: parseDecimalField(line.slice(14, 24)),
    limite_superior: parseDecimalField(line.slice(24, 34))
  }
}

export function parseHydroCoefficient(line) {
  const estagio = parseIntegerField(line.slice(9, 11))
  const numero_usina = parseIntegerField(line.slice(14, 17))
  if (estagio === null || numero_usina === null) return null

  return {
    estagio,
    numero_usina,
    coeficiente: parseDecimalField(line.slice(19, 29)),
    tipo_variavel: line.slice(34, 38).trim() || null
  }
}

export function parseHydroFactor(line) {
  const estagio = parseIntegerField(line.slice(9, 11))
  const numero_usina = parseIntegerField(line.slice(14, 17))
  if (estagio === null || numero_usina === null) return null

  return {
    estagio,
    numero_usina,
    fator: parseDecimalField(line.slice(19, 29)),
    frequencia: parseIntegerField(line.slice(30, 32))
  }
}

export function parseThermalFactor(line) {
  const estagio = parseIntegerField(line.slice(9, 11))
  const numero_usina = parseIntegerField(line.slice(14, 17))
  if (estagio === null || numero_usina === null) return null

  return {
    estagio,
    numero_usina,
    subsistema: parseIntegerField(line.slice(19, 21)),
    fator: parseDecimalField(line.slice(24, 34))
  }
}

export function parseInterchangeFactor(line) {
  const estagio = parseIntegerField(line.slice(9, 11))
  if (estagio === null) return null

  return {
    estagio,
    subsistema_de: line.slice(14, 16).trim(),
    subsistema_para: line.slice(19, 21).trim(),
    fator: parseDecimalField(line.slice(24, 34))
  }
}

export function parseContractFactor(line) {
  const estagio = parseIntegerField(line.slice(9, 11))
  const numero_contrato = parseIntegerField(line.slice(14, 17))
  if (estagio === null || numero_contrato === null) return null

  return {
    estagio,
    numero_contrato,
    submercado: parseIntegerField(line.slice(19, 21)),
    fator: parseDecimalField(line.slice(24, 34))
  }
}
