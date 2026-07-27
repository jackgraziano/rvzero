import { parseStageArray } from './stageArrayParser.js'

export function parseTI(lines, stageCount) {
  return parseStageArray(lines, {
    mnemonic: 'TI',
    valueField: 'vazoes',
    stageCount
  })
}
