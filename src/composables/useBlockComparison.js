import { ref, computed } from 'vue'
import { formatNumber } from '../utils/comparison.js'

/**
 * Verifica se uma row tem diferenças reais (não faded)
 * Fonte única de verdade para detectar diferenças
 */
function rowHasDifferences(row) {
  // Se é onlyInOne (existe apenas em um dadger)
  if (row.onlyInOne) {
    // Apenas contar como diferença se também sameTemporality (highlighted)
    // Se não sameTemporality, é faded e não conta
    return row.sameTemporality === true
  }

  // Para rows que existem em ambos dadgers, verificar diferenças de valores

  // Verificar campos terminados em _diff
  for (const key in row) {
    if (key.endsWith('_diff') && row[key]) {
      return true
    }
  }

  // Verificar outros campos de diferença
  if (row.has_diff) return true
  if (row.temDiferenca) return true

  return false
}

/**
 * Composable para lógica comum de blocos de comparação
 * Encapsula: collapse, scroll sync, sorting, filtering
 */
export function useBlockComparison(props, alignedDataComputed) {
  // Estado reativo
  const collapsed = ref(true)
  const isSyncing = ref(false)
  const sortColumn = ref(null)
  const sortDirection = ref('asc')

  // Detectar se há diferenças no bloco (usando função única de verdade)
  const hasDifferences = computed(() => {
    if (!alignedDataComputed.value || alignedDataComputed.value.length === 0) {
      return false
    }
    return alignedDataComputed.value.some(rowHasDifferences)
  })

  // Refs para containers de scroll
  const tableContainer1 = ref(null)
  const tableContainer2 = ref(null)

  // Métodos de controle
  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value
  }

  const sortBy = (column) => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
  }

  const getSortIcon = (column) => {
    if (sortColumn.value !== column) return ''
    return sortDirection.value === 'asc' ? ' ▲' : ' ▼'
  }

  // Sincronização de scroll
  const onScroll1 = (event) => {
    if (isSyncing.value) return
    isSyncing.value = true
    const scrollTop = event.target.scrollTop
    if (tableContainer2.value) {
      tableContainer2.value.scrollTop = scrollTop
    }
    setTimeout(() => {
      isSyncing.value = false
    }, 0)
  }

  const onScroll2 = (event) => {
    if (isSyncing.value) return
    isSyncing.value = true
    const scrollTop = event.target.scrollTop
    if (tableContainer1.value) {
      tableContainer1.value.scrollTop = scrollTop
    }
    setTimeout(() => {
      isSyncing.value = false
    }, 0)
  }

  // Computed: dados ordenados
  const sortedData = computed(() => {
    const data = alignedDataComputed.value

    // Se não há coluna de sort definida, tentar ordenar por numero_restricao se existir
    if (!sortColumn.value) {
      // Verificar se os dados têm numero_restricao
      if (data.length > 0 && 'numero_restricao' in data[0]) {
        return [...data].sort((a, b) => a.numero_restricao - b.numero_restricao)
      }
      return data
    }

    return [...data].sort((a, b) => {
      let valA, valB

      // Valores para comparação
      switch (sortColumn.value) {
        case 'estagio':
          valA = a.dadger1?.display || a.dadger2?.display || ''
          valB = b.dadger1?.display || b.dadger2?.display || ''
          break
        default:
          // Para outras colunas, tentar pegar o valor:
          // 1. Diretamente da row (ex: numero_restricao)
          // 2. De dadger1/dadger2
          // 3. Default 0
          valA = a[sortColumn.value] ?? a.dadger1?.[sortColumn.value] ?? a.dadger2?.[sortColumn.value] ?? 0
          valB = b[sortColumn.value] ?? b.dadger1?.[sortColumn.value] ?? b.dadger2?.[sortColumn.value] ?? 0
      }

      // Comparar strings vs números
      let comparison = 0
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.toLowerCase().localeCompare(valB.toLowerCase())
      } else {
        if (valA > valB) comparison = 1
        else if (valA < valB) comparison = -1
      }

      return sortDirection.value === 'asc' ? comparison : -comparison
    })
  })

  // Computed: dados filtrados (usa função única de verdade)
  const createFilteredData = () => {
    return computed(() => {
      const data = sortedData.value

      if (!props.showOnlyDifferences) {
        return data
      }

      // Usar função única de verdade para filtrar
      return data.filter(rowHasDifferences)
    })
  }

  return {
    // Estado
    collapsed,
    isSyncing,
    sortColumn,
    sortDirection,
    tableContainer1,
    tableContainer2,

    // Métodos
    toggleCollapsed,
    sortBy,
    getSortIcon,
    onScroll1,
    onScroll2,
    formatNumber,

    // Computeds
    sortedData,
    createFilteredData,
    hasDifferences
  }
}
