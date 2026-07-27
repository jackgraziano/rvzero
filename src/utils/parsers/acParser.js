import { parseBrazilianDate } from '../temporal.js'
import { parseDecimalField, parseIntegerField } from './parserUtils.js'

const MONTH_NUMBERS = new Map([
  ['JAN', 1],
  ['FEV', 2],
  ['MAR', 3],
  ['ABR', 4],
  ['MAI', 5],
  ['JUN', 6],
  ['JUL', 7],
  ['AGO', 8],
  ['SET', 9],
  ['OUT', 10],
  ['NOV', 11],
  ['DEZ', 12]
])

/**
 * Parser do bloco AC (Alteração de Cadastro)
 * Cada linha AC modifica parâmetros de uma usina usando diferentes mnemônicos
 * Formato: AC <usina> <mnemônico> <dados> [mês] [semana] [ano]
 */

export function parseAC(lines, stageCalendar = []) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('AC ')) {
      const usina = parseIntegerField(line.slice(4, 7))
      const mnemonico = line.slice(9, 15).trim()

      // Dados começam na posição 19 (campo 4)
      const dados = line.slice(19, 69).trimEnd()

      // Mês (70-72), semana (75), ano (77-80)
      const mes = line.slice(69, 72).trim()
      const semana = parseIntegerField(line.slice(74, 75))
      const ano = parseIntegerField(line.slice(76, 80))

      if (usina !== null && mnemonico) {
        const registro = {
          usina,
          mnemonico,
          dados,
          mes: mes || null,
          semana,
          ano,
          linha_original: line
        }

        if (mnemonico === 'COTVOL') {
          registro.indice_coeficiente = parseIntegerField(line.slice(19, 29))
          registro.valor_coeficiente = parseDecimalField(line.slice(29, 69))
        }

        const stage = findACStage(registro, stageCalendar)
        registro.estagio = stage?.numero ?? null
        registro.data_inicio = stage?.data_inicio ?? null
        registros.push(registro)
      }
    }
  }

  return registros
}

/**
 * O número da semana de AC é relativo às ocorrências daquele mês dentro do
 * horizonte do deck. Assim, JUL/S2 em uma revisão pode representar a mesma
 * data que JUL/S1 na revisão seguinte.
 */
function findACStage(record, stageCalendar) {
  const month = MONTH_NUMBERS.get(record.mes)
  if (!month || record.semana === null) return null

  const matchingStages = stageCalendar.filter(stage => {
    const date = parseBrazilianDate(stage.data_inicio)
    return date &&
      date.getUTCMonth() + 1 === month &&
      (record.ano === null || date.getUTCFullYear() === record.ano)
  })

  return matchingStages[record.semana - 1] ?? null
}
