const UTF8_BOM = [0xef, 0xbb, 0xbf]
const UTF16_LE_BOM = [0xff, 0xfe]
const UTF16_BE_BOM = [0xfe, 0xff]

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
    return decode(bytes, 'windows-1252')
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
