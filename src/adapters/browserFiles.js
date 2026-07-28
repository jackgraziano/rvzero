import { decodeFileContent } from './textEncoding.js'

export async function readBrowserFile(file) {
  let bytes
  try {
    bytes = await file.arrayBuffer()
  } catch {
    throw new Error('não foi possível ler o arquivo; selecione-o novamente')
  }
  return decodeFileContent(bytes)
}
