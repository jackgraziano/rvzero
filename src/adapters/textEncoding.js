const UTF8_BOM = [0xef, 0xbb, 0xbf]
const UTF16_LE_BOM = [0xff, 0xfe]
const UTF16_BE_BOM = [0xfe, 0xff]
const WINDOWS_1252_SPECIAL_CHARACTERS = new Map([
  [0x80, '\u20ac'],
  [0x82, '\u201a'],
  [0x83, '\u0192'],
  [0x84, '\u201e'],
  [0x85, '\u2026'],
  [0x86, '\u2020'],
  [0x87, '\u2021'],
  [0x88, '\u02c6'],
  [0x89, '\u2030'],
  [0x8a, '\u0160'],
  [0x8b, '\u2039'],
  [0x8c, '\u0152'],
  [0x8e, '\u017d'],
  [0x91, '\u2018'],
  [0x92, '\u2019'],
  [0x93, '\u201c'],
  [0x94, '\u201d'],
  [0x95, '\u2022'],
  [0x96, '\u2013'],
  [0x97, '\u2014'],
  [0x98, '\u02dc'],
  [0x99, '\u2122'],
  [0x9a, '\u0161'],
  [0x9b, '\u203a'],
  [0x9c, '\u0153'],
  [0x9e, '\u017e'],
  [0x9f, '\u0178']
])

/**
 * Decodifica bytes de arquivos de entrada sem depender de seu tipo.
 *
 * BOMs explícitos são respeitados. Sem BOM, UTF-8 só é aceito quando toda a
 * sequência é válida; arquivos legados usam Windows-1252 como fallback,
 * cobrindo os caracteres imprimíveis usuais de Latin-1.
 *
 * @param {ArrayBuffer|ArrayBufferView} input
 * @returns {string}
 */
export function decodeFileContent(input) {
  const bytes = toUint8Array(input)

  if (startsWith(bytes, UTF8_BOM)) {
    return decode(bytes, 'utf-8')
  }
  if (startsWith(bytes, UTF16_LE_BOM)) {
    return decode(bytes, 'utf-16le')
  }
  if (startsWith(bytes, UTF16_BE_BOM)) {
    return decode(bytes, 'utf-16be')
  }

  try {
    return decode(bytes, 'utf-8')
  } catch {
    return decodeWindows1252(bytes)
  }
}

function toUint8Array(input) {
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input)
  }
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
  }
  throw new TypeError('O conteúdo do arquivo deve ser fornecido como bytes.')
}

function startsWith(bytes, prefix) {
  return bytes.length >= prefix.length &&
    prefix.every((byte, index) => bytes[index] === byte)
}

function decode(bytes, encoding) {
  return new TextDecoder(encoding, { fatal: true }).decode(bytes)
}

function decodeWindows1252(bytes) {
  return Array.from(
    bytes,
    byte => WINDOWS_1252_SPECIAL_CHARACTERS.get(byte) ??
      String.fromCharCode(byte)
  ).join('')
}
