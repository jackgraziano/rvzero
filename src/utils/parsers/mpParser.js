import { parseStageArray } from './stageArrayParser.js'

export function parseMP(lines, stageCount) {
  return parseStageArray(lines, {
    mnemonic: 'MP',
    valueField: 'fatores',
    stageCount,
    supportsItaipuSet: true
  })
}
