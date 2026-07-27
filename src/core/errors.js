export const ERROR_CODES = Object.freeze({
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  DUPLICATE_FILE_TYPE: 'DUPLICATE_FILE_TYPE',
  INVALID_DADGER: 'INVALID_DADGER',
  INVALID_DADGNL: 'INVALID_DADGNL',
  INVALID_RENOVAVEIS: 'INVALID_RENOVAVEIS',
  MISSING_DADGER_FOR_DATE_MODE: 'MISSING_DADGER_FOR_DATE_MODE',
  NO_COMPARABLE_FILE_TYPES: 'NO_COMPARABLE_FILE_TYPES'
})

export class RvzeroCoreError extends Error {
  constructor({ code, message, side = null, fileName = null, cause = null }) {
    super(message)
    this.name = 'RvzeroCoreError'
    this.code = code
    this.side = side
    this.fileName = fileName
    if (cause) this.cause = cause
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      side: this.side,
      fileName: this.fileName
    }
  }
}

export function publicError(error) {
  if (error instanceof RvzeroCoreError) return error.toJSON()
  return {
    code: error?.code ?? 'UNKNOWN_ERROR',
    message: error?.message ?? String(error),
    side: error?.side ?? null,
    fileName: error?.fileName ?? null
  }
}
