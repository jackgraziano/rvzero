import { parseStageArray } from './stageArrayParser.js'

export function parseVE(lines, stageCount) {
  return parseStageArray(lines, {
    mnemonic: 'VE',
    valueField: 'volumes',
    stageCount
  })
}
