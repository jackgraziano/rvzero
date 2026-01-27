# Plano de Refatoração - RVZero

## Problema
- **1.944 linhas de código duplicado** entre TI, MP, FD, VE (486 linhas × 4 blocos)
- Inconsistência: alguns blocos usam composable, outros não
- Helpers temporais duplicados em múltiplos arquivos

## Solução Proposta

### 1. Criar Composable `useTemporalComparison`

**Arquivo:** `src/composables/useTemporalComparison.js`

**Responsabilidades:**
- `encontrarEstagioPorData()`
- `collectUniqueDates()`
- `colunasTempo` computed
- Lógica de alinhamento por data/estágio
- Comparação com `sameTemporality`

**Benefícios:**
- Reduzir ~400 linhas por bloco
- Centralizar lógica temporal
- Facilitar manutenção

### 2. Mover Helpers para `comparison.js`

**Funções a mover:**
```javascript
// De: blocos individuais
// Para: src/utils/comparison.js

export function encontrarEstagioPorData(data, dadgerData) { ... }
export function collectUniqueDates(dadger1Data, dadger2Data) { ... }
```

### 3. Refatorar Blocos TI, MP, FD, VE

**Antes (462 linhas):**
```javascript
setup(props) {
  // 100 linhas de state management duplicado
  const collapsed = ref(true)
  const sortColumn = ref(null)
  // ...

  // 162 linhas de helpers duplicados
  const encontrarEstagioPorData = () => { ... }
  const collectUniqueDates = () => { ... }
  const colunasTempo = computed(() => { ... })

  // 200 linhas de lógica de alinhamento
  const alignedData = computed(() => { ... })
}
```

**Depois (180 linhas):**
```javascript
import { useBlockComparison } from '../../composables/useBlockComparison.js'
import { useTemporalComparison } from '../../composables/useTemporalComparison.js'

setup(props) {
  // Lógica específica do bloco (50 linhas)
  const alignedData = computed(() => {
    // Apenas lógica de busca de dados
    const registros1 = props.dadger1Data.TI || []
    const registros2 = props.dadger2Data.TI || []
    return alignByTemporalKey(registros1, registros2, 'numero_usina', 'vazoes')
  })

  // Reutilizar composables (2 linhas)
  const baseComparison = useBlockComparison(props, alignedData)
  const temporalComparison = useTemporalComparison(props)

  return { ...baseComparison, ...temporalComparison }
}
```

**Redução:** 462 → 180 linhas (**61% menos código**)

### 4. Refatorar CT e IA

Também devem usar `useBlockComparison` para consistência.

### 5. Criar Factory Function (Opcional)

Para blocos muito similares (TI, MP, FD, VE):

```javascript
// src/utils/blockFactory.js
export function createTemporalBlock(config) {
  return {
    name: config.name,
    props: standardProps,
    setup(props) {
      const alignedData = computed(() =>
        alignByTemporalKey(
          props.dadger1Data[config.blockKey],
          props.dadger2Data[config.blockKey],
          config.keyField,
          config.valueField,
          config.compoundKey
        )
      )
      return useTemporalBlockLogic(props, alignedData, config)
    }
  }
}

// Uso:
export default createTemporalBlock({
  name: 'TIBlock',
  blockKey: 'TI',
  title: 'BLOCO TI - VAZÃO DESVIADA',
  keyField: 'numero_usina',
  valueField: 'vazoes'
})
```

## Impacto Estimado

### Antes da Refatoração
```
TIBlock.vue: 454 linhas
MPBlock.vue: 462 linhas
FDBlock.vue: 462 linhas
VEBlock.vue: 443 linhas
Total: 1.821 linhas
```

### Depois da Refatoração
```
useTemporalComparison.js: 200 linhas (novo)
TIBlock.vue: 180 linhas (-274)
MPBlock.vue: 200 linhas (-262, tem campo extra)
FDBlock.vue: 200 linhas (-262, tem campo extra)
VEBlock.vue: 180 linhas (-263)
Total: 960 linhas
```

**Economia:** 861 linhas (**47% redução**)

## Priorização

### Alta Prioridade
1. ✅ Mover helpers para `comparison.js`
2. ✅ Criar `useTemporalComparison`
3. ✅ Refatorar VE e TI (mais simples)

### Média Prioridade
4. ✅ Refatorar MP e FD
5. ⬜ Refatorar CT e IA para usar composable

### Baixa Prioridade
6. ⬜ Avaliar factory pattern
7. ✅ Remover BaseBlock.vue se não for usado

## Compatibilidade

✅ Todas refatorações são **backward compatible**
✅ Não afeta parsers
✅ Não afeta lógica de negócio
✅ Apenas reorganização de código

## Quando Refatorar?

**Agora:**
- Se planeja adicionar mais blocos temporais (VM, VI, etc)
- Se precisa modificar lógica de comparação por data

**Depois:**
- Se o código atual está funcionando e não há novos blocos planejados
- Se prefere estabilidade a otimização
