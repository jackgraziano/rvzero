import { detectFileType } from '../../utils/fileTypeRegistry.js'
import { ERROR_CODES, RvzeroCoreError } from '../errors.js'

const PARSER_ERROR_BY_TYPE = {
  dadger: ERROR_CODES.INVALID_DADGER,
  dadgnl: ERROR_CODES.INVALID_DADGNL,
  renovaveis: ERROR_CODES.INVALID_RENOVAVEIS
}

/**
 * @typedef {Object} DeckInputFile
 * @property {string} name
 * @property {string} content
 */

/**
 * Parseia um conjunto textual sem depender de File, filesystem ou DOM.
 *
 * @param {DeckInputFile[]} files
 * @param {'left'|'right'} side
 * @returns {object}
 */
export function parseDeckSet(files, side = 'deck') {
  if (!Array.isArray(files)) {
    throw new RvzeroCoreError({
      code: ERROR_CODES.UNSUPPORTED_FILE_TYPE,
      message: `O lado ${side} deve ser uma lista de arquivos.`,
      side
    })
  }

  const parsed = {
    side,
    files: [],
    dadger: null,
    dadgnl: null,
    renovaveis: null
  }

  for (const file of files) {
    const fileName = file?.name
    const content = file?.content

    if (typeof fileName !== 'string' || typeof content !== 'string') {
      throw new RvzeroCoreError({
        code: ERROR_CODES.UNSUPPORTED_FILE_TYPE,
        message: `Cada arquivo do lado ${side} deve ter name e content textuais.`,
        side,
        fileName: typeof fileName === 'string' ? fileName : null
      })
    }

    const type = detectFileType(fileName)
    if (!type) {
      throw new RvzeroCoreError({
        code: ERROR_CODES.UNSUPPORTED_FILE_TYPE,
        message: `Tipo de arquivo não suportado: ${fileName}`,
        side,
        fileName
      })
    }

    if (parsed[type.id]) {
      throw new RvzeroCoreError({
        code: ERROR_CODES.DUPLICATE_FILE_TYPE,
        message: `Mais de um arquivo ${type.name} informado no lado ${side}.`,
        side,
        fileName
      })
    }

    let data
    try {
      data = type.parser(content)
    } catch (error) {
      throw new RvzeroCoreError({
        code: PARSER_ERROR_BY_TYPE[type.id],
        message: error?.message ?? `Arquivo ${type.name} inválido.`,
        side,
        fileName,
        cause: error
      })
    }

    const info = { name: fileName, type: type.id, data }
    parsed[type.id] = info
    parsed.files.push({ name: fileName, type: type.id })
  }

  parsed.files.sort((first, second) =>
    first.type.localeCompare(second.type) ||
    first.name.localeCompare(second.name, 'pt-BR', { numeric: true })
  )

  return parsed
}
