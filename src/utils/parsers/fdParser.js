import { parseStageArray } from './stageArrayParser.js'

export function parseFD(lines, stageCount) {
  return parseStageArray(lines, {
    mnemonic: 'FD',
    valueField: 'fatores',
    stageCount,
    supportsItaipuSet: true
  })
}
