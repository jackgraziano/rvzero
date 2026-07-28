import test from 'node:test'
import assert from 'node:assert/strict'

import {
  decodeFileContent,
  readBrowserFile
} from '../src/adapters/index.js'
import { parseRenovaveis } from '../src/utils/parsers/renovaveisParser.js'

test('decodeFileContent preserva UTF-8 válido', () => {
  const text = 'Usina São José — geração 🌬️'
  const bytes = new TextEncoder().encode(text)

  assert.equal(decodeFileContent(bytes), text)
})

test('decodeFileContent usa Windows-1252 para arquivos Latin-1', () => {
  const bytes = Uint8Array.from([
    ...ascii('Usina S'),
    0xe3,
    ...ascii('o Jos'),
    0xe9,
    ...ascii(' '),
    0x93,
    ...ascii('Norte'),
    0x94
  ])

  assert.equal(decodeFileContent(bytes), 'Usina São José “Norte”')
})

test('decodeFileContent respeita o intervalo de uma view de bytes', () => {
  const storage = Uint8Array.from([
    0,
    ...ascii('Gera'),
    0xe7,
    0xe3,
    ...ascii('o'),
    0
  ])
  const content = storage.subarray(1, storage.length - 1)

  assert.equal(decodeFileContent(content), 'Geração')
})

test('decodeFileContent reconhece BOMs UTF-8 e UTF-16', () => {
  assert.equal(
    decodeFileContent(Uint8Array.from([
      0xef, 0xbb, 0xbf, ...ascii('DADGER')
    ])),
    'DADGER'
  )
  assert.equal(
    decodeFileContent(Uint8Array.from([
      0xff, 0xfe, 0x44, 0x00, 0x50, 0x00
    ])),
    'DP'
  )
  assert.equal(
    decodeFileContent(Uint8Array.from([
      0xfe, 0xff, 0x00, 0x47, 0x00, 0x4c
    ])),
    'GL'
  )
})

test('adaptador do navegador decodifica renováveis Latin-1 antes do parser', async () => {
  const source = [
    'PEE-CAD;1;Parque São José',
    'PEE-SUBM;1;1',
    'PEE-GER-PER-PAT-CEN;1;1;1;1;1;100'
  ].join('\n')
  const bytes = latin1(source)
  const file = {
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  }

  const content = await readBrowserFile(file)
  const parsed = parseRenovaveis(content)

  assert.equal(parsed['PEE-CAD'][0].nomePEE, 'Parque São José')
  assert.equal(parsed.geracaoAgregada[0].geracaoMedia, 100)
})

test('decodeFileContent rejeita entrada que não contém bytes', () => {
  assert.throws(
    () => decodeFileContent('DADGER'),
    /conteúdo do arquivo deve ser fornecido como bytes/i
  )
})

function ascii(value) {
  return [...value].map(character => character.charCodeAt(0))
}

function latin1(value) {
  return Uint8Array.from(
    [...value].map(character => character.charCodeAt(0))
  )
}
