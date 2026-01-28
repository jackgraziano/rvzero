/**
 * Composable para detectar se um bloco tem diferenças
 */
import { computed } from 'vue'

export function useBlockDiff(alignedData) {
  const hasDifferences = computed(() => {
    if (!alignedData.value || alignedData.value.length === 0) {
      return false
    }

    // Verificar se algum registro tem diferença
    return alignedData.value.some(row => {
      // Verificar se existe apenas em um dadger
      if (row.onlyInOne) return true

      // Verificar todos os campos que terminam com '_diff'
      for (const key in row) {
        if (key.endsWith('_diff') && row[key]) {
          return true
        }
      }

      // Verificar campo genérico 'has_diff'
      if (row.has_diff) return true

      // Para blocos com 'temDiferenca'
      if (row.temDiferenca) return true

      return false
    })
  })

  return {
    hasDifferences
  }
}
