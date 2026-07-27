import {
  parseHydroCoefficient,
  parsePatamarLimits,
  parseRestrictionBlock
} from './restrictionParser.js'

const HQ_CONFIG = {
  header: 'HQ',
  numberEnd: 7,
  children: [
    { mnemonic: 'LQ', collection: 'limites', parse: parsePatamarLimits },
    {
      mnemonic: 'CQ',
      collection: 'coeficientes',
      parse: parseHydroCoefficient,
      identity: item => `${item.numero_usina}\u0000${item.tipo_variavel}`
    }
  ]
}

export function parseHQ(lines, stageCount) {
  return parseRestrictionBlock(lines, stageCount, HQ_CONFIG)
}
