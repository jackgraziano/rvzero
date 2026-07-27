/**
 * COTVOL descreve os cinco coeficientes do polinômio cota-volume. Registros
 * temporais alteram o cadastro a partir do período indicado e continuam
 * válidos até uma nova alteração do mesmo coeficiente.
 */
export function buildCotvolSnapshots(records, infoDadger = {}) {
  const cotvolRecords = records.filter(record =>
    record.mnemonico === 'COTVOL' &&
    Number.isInteger(record.indice_coeficiente)
  )
  const recordsByPlant = groupBy(cotvolRecords, record => record.usina)
  const stageCalendar = infoDadger.estagios ?? []
  const snapshots = []

  for (const [plant, plantRecords] of recordsByPlant) {
    const temporalRecords = plantRecords.filter(record => record.estagio !== null)
    const staticRecords = plantRecords.filter(record => record.estagio === null)

    if (temporalRecords.length === 0) {
      snapshots.push(createSnapshot(plant, staticRecords))
      continue
    }

    const active = new Map()
    applyRecords(active, staticRecords)

    for (const stage of stageCalendar) {
      applyRecords(
        active,
        temporalRecords.filter(record => record.estagio === stage.numero)
      )
      if (active.size === 0) continue

      snapshots.push(createSnapshot(plant, [...active.values()], stage))
    }
  }

  return snapshots
}

export function cotvolSignature(record) {
  return (record?.coeficientes ?? [])
    .map(coefficient =>
      `${coefficient.indice}\u0000${coefficient.valor ?? ''}`
    )
    .join('\u0001')
}

function createSnapshot(plant, records, stage = null) {
  const coefficients = [...records]
    .sort((first, second) =>
      first.indice_coeficiente - second.indice_coeficiente
    )
    .map(record => ({
      indice: record.indice_coeficiente,
      valor: record.valor_coeficiente
    }))

  return {
    usina: plant,
    mnemonico: 'COTVOL',
    cotvol: true,
    coeficientes: coefficients,
    estagio: stage?.numero ?? null,
    data_inicio: stage?.data_inicio ?? null
  }
}

function applyRecords(active, records) {
  for (const record of records) {
    // Em alterações sucessivas do mesmo coeficiente, a última linha é a
    // configuração efetiva a partir daquele período.
    active.set(record.indice_coeficiente, record)
  }
}

function groupBy(records, getKey) {
  const groups = new Map()
  for (const record of records) {
    const key = getKey(record)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(record)
  }
  return groups
}
