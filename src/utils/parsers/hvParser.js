import {
  parseHydroCoefficient,
  parseRestrictionBlock,
  parseSingleLimits
} from './restrictionParser.js'

const HV_CONFIG = {
  header: 'HV',
  numberEnd: 7,
  children: [
    { mnemonic: 'LV', collection: 'limites', parse: parseSingleLimits },
    {
      mnemonic: 'CV',
      collection: 'coeficientes',
      parse: parseHydroCoefficient,
      identity: item => `${item.numero_usina}\u0000${item.tipo_variavel}`
    }
  ]
}

export function parseHV(lines, stageCount) {
  return parseRestrictionBlock(lines, stageCount, HV_CONFIG)
}
