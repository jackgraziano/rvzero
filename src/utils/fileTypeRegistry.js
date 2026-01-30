/**
 * Sistema de registro e detecção de tipos de arquivo
 * Centraliza a lógica de identificação e parsing de diferentes tipos
 */

import { parseDadger } from './parsers/index.js'
import { parseRenovaveis } from './parsers/renovaveisParser.js'

/**
 * Configuração de tipos de arquivo suportados
 */
export const FILE_TYPES = {
  DADGER: {
    id: 'dadger',
    name: 'DADGER',
    description: 'Arquivo de dados gerais',
    pattern: /^dadger/i,
    parser: parseDadger,
    icon: '📊'
  },
  RENOVAVEIS: {
    id: 'renovaveis',
    name: 'RENOVÁVEIS',
    description: 'Arquivo de fontes renováveis',
    pattern: /^renovaveis/i,
    parser: parseRenovaveis,
    icon: '🌱'
  }
}

/**
 * Detecta o tipo de arquivo baseado no nome
 * @param {string} fileName - Nome do arquivo
 * @returns {object|null} Configuração do tipo ou null se não reconhecido
 */
export function detectFileType(fileName) {
  for (const type of Object.values(FILE_TYPES)) {
    if (type.pattern.test(fileName)) {
      return type
    }
  }
  return null
}

/**
 * Valida se um nome de arquivo é suportado
 * @param {string} fileName - Nome do arquivo
 * @returns {boolean} true se suportado
 */
export function isFileSupported(fileName) {
  return detectFileType(fileName) !== null
}

/**
 * Retorna lista de tipos suportados
 * @returns {Array} Array de configurações de tipos
 */
export function getSupportedTypes() {
  return Object.values(FILE_TYPES)
}

/**
 * Parseia um arquivo baseado em seu tipo
 * @param {string} fileName - Nome do arquivo
 * @param {string} content - Conteúdo do arquivo
 * @returns {object} Dados parseados
 * @throws {Error} Se tipo não suportado ou parser não implementado
 */
export function parseFile(fileName, content) {
  const fileType = detectFileType(fileName)

  if (!fileType) {
    throw new Error(`Tipo de arquivo não suportado: ${fileName}`)
  }

  if (!fileType.parser) {
    throw new Error(`Parser não implementado para: ${fileType.name}`)
  }

  return fileType.parser(content)
}
