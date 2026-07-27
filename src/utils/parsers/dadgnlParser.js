import {
  expandForwardByStage,
  parseDecimalField,
  parseIntegerField
} from './parserUtils.js'
import { formatBrazilianDate, parseBrazilianDate } from '../temporal.js'

export function parseDadgnl(fileContent) {
  const lines = fileContent.split(/\r?\n/)
  const rawTG = lines
    .filter(line => line.startsWith('TG '))
    .map(parseTGLine)
    .filter(Boolean)
  const GS = lines
    .filter(line => line.startsWith('GS '))
    .map(parseGSLine)
    .filter(Boolean)
  const NL = lines
    .filter(line => line.startsWith('NL '))
    .map(parseNLLine)
    .filter(Boolean)
  const GL = lines
    .filter(line => line.startsWith('GL '))
    .map(parseGLLine)
    .filter(Boolean)

  if (rawTG.length === 0 && GS.length === 0 && NL.length === 0 && GL.length === 0) {
    throw new Error('DADGNL inválido: nenhum registro TG, GS, NL ou GL reconhecido')
  }

  const numeroSemanas = Math.max(
    ...GL.map(record => record.semana),
    ...rawTG.map(record => record.estagio),
    0
  )
  const TG = expandForwardByStage(
    rawTG,
    numeroSemanas,
    record => record.codigo_usina
  )

  return {
    info_dadgnl: {
      numero_semanas: numeroSemanas
    },
    TG,
    GS,
    NL,
    GL
  }
}

function parseTGLine(line) {
  const codigo_usina = parseIntegerField(line.slice(4, 7))
  const subsistema = parseIntegerField(line.slice(9, 11))
  const estagio = parseIntegerField(line.slice(24, 26))

  if (codigo_usina === null || subsistema === null || estagio === null) {
    return null
  }

  return {
    codigo_usina,
    subsistema,
    nome_termica: line.slice(14, 24).trim(),
    estagio,
    inflex_pesado: parseDecimalField(line.slice(29, 34)),
    disp_pesado: parseDecimalField(line.slice(34, 39)),
    cvu_pesado: parseDecimalField(line.slice(39, 49)),
    inflex_medio: parseDecimalField(line.slice(49, 54)),
    disp_medio: parseDecimalField(line.slice(54, 59)),
    cvu_medio: parseDecimalField(line.slice(59, 69)),
    inflex_leve: parseDecimalField(line.slice(69, 74)),
    disp_leve: parseDecimalField(line.slice(74, 79)),
    cvu_leve: parseDecimalField(line.slice(79, 89))
  }
}

function parseGSLine(line) {
  const mes = parseIntegerField(line.slice(4, 7))
  const numero_semanas = parseIntegerField(line.slice(8))
  if (mes === null || numero_semanas === null) return null
  return { mes, numero_semanas }
}

function parseNLLine(line) {
  const codigo_usina = parseIntegerField(line.slice(4, 7))
  const subsistema = parseIntegerField(line.slice(9, 11))
  const lag = parseIntegerField(line.slice(14))
  if (codigo_usina === null || subsistema === null || lag === null) return null
  return { codigo_usina, subsistema, lag }
}

function parseGLLine(line) {
  const codigo_usina = parseIntegerField(line.slice(4, 7))
  const subsistema = parseIntegerField(line.slice(9, 11))
  const semana = parseIntegerField(line.slice(14, 16))

  if (codigo_usina === null || subsistema === null || semana === null) {
    return null
  }

  return {
    codigo_usina,
    subsistema,
    semana,
    geracao_pesado: parseDecimalField(line.slice(19, 29)),
    duracao_pesado: parseDecimalField(line.slice(29, 34)),
    geracao_medio: parseDecimalField(line.slice(34, 44)),
    duracao_medio: parseDecimalField(line.slice(44, 49)),
    geracao_leve: parseDecimalField(line.slice(49, 59)),
    duracao_leve: parseDecimalField(line.slice(59, 64)),
    data_inicio: parseCompactDate(line.slice(65, 73))
  }
}

function parseCompactDate(value) {
  const text = String(value ?? '').trim()
  if (!/^\d{8}$/.test(text)) return null

  const formatted = `${text.slice(0, 2)}/${text.slice(2, 4)}/${text.slice(4)}`
  const date = parseBrazilianDate(formatted)
  return date ? formatBrazilianDate(date) : null
}
