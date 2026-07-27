import {
  parseContractFactor,
  parseHydroFactor,
  parseInterchangeFactor,
  parsePatamarLimits,
  parseRestrictionBlock,
  parseThermalFactor
} from './restrictionParser.js'

const RE_CONFIG = {
  header: 'RE',
  numberEnd: 8,
  children: [
    { mnemonic: 'LU', collection: 'limites', parse: parsePatamarLimits },
    {
      mnemonic: 'FU',
      collection: 'fatores_uh',
      parse: parseHydroFactor,
      identity: item => `${item.numero_usina}\u0000${item.frequencia}`
    },
    {
      mnemonic: 'FT',
      collection: 'fatores_ut',
      parse: parseThermalFactor,
      identity: item => `${item.numero_usina}\u0000${item.subsistema}`
    },
    {
      mnemonic: 'FI',
      collection: 'fatores_interligacao',
      parse: parseInterchangeFactor,
      identity: item => `${item.subsistema_de}\u0000${item.subsistema_para}`
    },
    {
      mnemonic: 'FE',
      collection: 'fatores_contrato',
      parse: parseContractFactor,
      identity: item => `${item.numero_contrato}\u0000${item.submercado}`
    }
  ]
}

export function parseRE(lines, stageCount) {
  return parseRestrictionBlock(lines, stageCount, RE_CONFIG)
}
