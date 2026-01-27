# RVZero - Comparador de Dadgers

Sistema de comparação visual de arquivos DADGER para planejamento energético.

## Organização do Código

### Estrutura de Diretórios

```
src/
├── components/
│   ├── blocks/           # Componentes de blocos individuais
│   │   ├── DPBlock.vue   # Demanda por Patamar
│   │   ├── PQBlock.vue   # Pequenas Usinas
│   │   ├── CTBlock.vue   # Usinas Térmicas
│   │   ├── IABlock.vue   # Intercâmbio entre Subsistemas
│   │   ├── UHBlock.vue   # Usinas Hidráulicas (apenas estágio 1)
│   │   ├── TIBlock.vue   # Vazão Desviada
│   │   ├── MPBlock.vue   # Manutenção Programada
│   │   └── FDBlock.vue   # Fatores de Disponibilidade
│   ├── ComparisonView.vue  # Container principal de comparação
│   ├── FileUploader.vue    # Upload de arquivos
│   └── TopBar.vue          # Barra superior com controles
├── utils/
│   ├── parsers/
│   │   ├── index.js      # Orquestrador principal de parsing
│   │   ├── infoParser.js # Parser de informações gerais
│   │   ├── dpParser.js   # Parser do bloco DP
│   │   ├── pqParser.js   # Parser do bloco PQ
│   │   ├── ctParser.js   # Parser do bloco CT
│   │   ├── iaParser.js   # Parser do bloco IA
│   │   ├── uhParser.js   # Parser do bloco UH
│   │   ├── tiParser.js   # Parser do bloco TI
│   │   ├── mpParser.js   # Parser do bloco MP
│   │   └── fdParser.js   # Parser do bloco FD
│   └── comparison.js     # Utilitários de comparação
├── styles/
│   └── block-tables.css  # Estilos compartilhados entre blocos
└── App.vue               # Componente raiz
```

### Fluxo de Dados

1. **Upload**: `FileUploader.vue` → lê arquivos DADGER
2. **Parsing**: `parsers/index.js` → orquestra todos os parsers específicos
3. **Armazenamento**: `App.vue` → mantém estado dos dois dadgers
4. **Visualização**: `ComparisonView.vue` → distribui dados para blocos
5. **Comparação**: Cada bloco compara e destaca diferenças

## Comparação: Data vs Estágio

### Conceitos Fundamentais

#### Datas por Estágio
Cada dadger possui um mapeamento de estágios para datas, armazenado em:
```javascript
dadgerData.info_dadger.datas_estagios = {
  1: "17/01/2026",
  2: "24/01/2026",
  3: "31/01/2026",
  4: "07/02/2026"
}
```

Este mapeamento é calculado a partir da `data_base` somando 7 dias por estágio.

### Modo de Comparação: ESTÁGIO

**Como funciona:**
- Compara estágio 1 com estágio 1, estágio 2 com estágio 2, etc.
- Mesmo que as datas sejam diferentes entre dadgers

**Exemplo:**
```
Dadger1 Estágio 1 = 17/01/2026  ⟷  Dadger2 Estágio 1 = 10/01/2026
Dadger1 Estágio 2 = 24/01/2026  ⟷  Dadger2 Estágio 2 = 17/01/2026
```

**Implementação:**
```javascript
// Comparação direta por índice de estágio
const idx = estagio - 1
valor1 = registros1[idx]
valor2 = registros2[idx]
```

### Modo de Comparação: DATA

**Como funciona:**
- Compara valores que compartilham a **mesma data**, independente do estágio
- Encontra qual estágio tem determinada data em cada dadger
- Compara os valores daqueles estágios

**Exemplo:**
```
Data: 24/01/2026
Dadger1: Estágio 2 tem data 24/01/2026 → valor = 100
Dadger2: Estágio 3 tem data 24/01/2026 → valor = 105
Comparação: 100 vs 105 (diferença detectada)
```

**Implementação:**
```javascript
// 1. Coletar todas as datas únicas
const datasUnicas = collectUniqueDates(dadger1Data, dadger2Data)

// 2. Para cada data, encontrar qual estágio a possui
const estagio1 = encontrarEstagioPorData(data, dadger1Data)
const estagio2 = encontrarEstagioPorData(data, dadger2Data)

// 3. Buscar valores daqueles estágios
const idx1 = estagio1 - 1
const idx2 = estagio2 - 1
valor1 = registros1[idx1]
valor2 = registros2[idx2]
```

### Temporalidade e Formatação

#### 1. Células `faded` (desbotadas)
**Quando aplicar:** Data existe em apenas um dadger

```javascript
sameTemporality = false  // Data não compartilhada
→ Célula fica desbotada (opacidade reduzida)
→ NÃO conta como diferença para filtros
```

**Exemplo Visual:**
```
Data: 17/01/2026
Dadger1: 100 (normal)
Dadger2: -   (faded, sem essa data)
```

#### 2. Células `diff` (diferença)
**Quando aplicar:** Data existe em ambos dadgers E valores são diferentes

```javascript
sameTemporality = true   // Data compartilhada
diff = hasDiff(valor1, valor2)  // Valores diferentes
→ Célula fica amarela (destaque)
→ CONTA como diferença para filtros
```

**Exemplo Visual:**
```
Data: 24/01/2026
Dadger1: 100 (amarelo)
Dadger2: 105 (amarelo)
```

#### 3. Linhas `highlighted` (destacadas)
**Quando aplicar:** Entidade (usina, subsistema) existe em apenas um dadger

```javascript
onlyInOne = true  // Registro não pareado
→ Linha inteira fica vermelha
→ SEMPRE mostrada no filtro "apenas diferenças"
```

## Arquitetura de Composables

### useBlockComparison (Base)
Lógica comum para todos os blocos:
- Collapse/expand
- Sincronização de scroll
- Ordenação de colunas
- Filtragem por diferenças

**Usado por:** Todos os blocos

### useTemporalComparison (Arrays de 24 valores)
Para blocos com array fixo de valores por estágio:
- Estrutura: cada registro tem array[24]
- Alinhamento por entidade + índice de estágio
- Exemplos: TI, MP, FD, VE

**Parâmetros:**
```javascript
useTemporalComparison(
  props,
  'MP',                                    // blockKey
  'fatores',                               // valueField (nome do array)
  r => r.numero_usina,                     // getEntityKey
  (registros, key) => registros.find(...), // findEntity
  customCompare                            // opcional: função de comparação customizada
)
```

### useEntityTemporalComparison (Entidade × Tempo)
Para blocos com estrutura "entidade × tempo":
- Estrutura: cada linha = entidade, cada coluna = estágio/data
- Alinhamento por entidade + busca de registro por estágio
- Suporta valores complexos (objetos)
- Exemplo: RE

**Parâmetros:**
```javascript
useEntityTemporalComparison(
  props,
  'RE',                   // blockKey
  'numero_restricao',     // entityKey (campo que identifica entidade)
  getEntityValue,         // função para extrair valor de um registro
  compareValues           // função para comparar dois valores
)
```

**Retorno:**
```javascript
{
  colunasTempo,  // Array de colunas [{ key, label, data/estagio }]
  alignedData    // Array de rows com { valores: { [colKey]: { valor1, valor2, diff, sameTemporality } } }
}
```

## Tipos de Blocos

### Blocos com Expansão Temporal (DP, PQ, CT, IA)
**Características:**
- Registros podem ter estágios esparsos (ex: estágios 1, 3, 5)
- Parser faz expansão por forward-fill
- Cada linha = (estágio × entidade)
- Usa `alignByEstagio` / `alignByData`

**Chave de agrupamento:** Entidade + Estágio
```javascript
// Exemplo DP
key = `${estagio}-${subsistema}`

// Exemplo CT
key = `${estagio}-${codigo_usina}`
```

### Blocos com Todos os Estágios
**Características:**
- Sempre declaram valores para todos os estágios (array de 24 posições)
- Não precisa expansão
- Exemplos: TI, MP, FD

**Estrutura de dados:**
```javascript
{
  numero_usina: 119,
  fatores: [0.8, 0.9, 1.0, ...] // 24 valores
}
```

### Blocos de Estágio Único (UH)
**Características:**
- Só existem para estágio 1
- Não têm dimensão temporal
- Usa `alignByEstagio` / `alignByData`

**Comparação:**
```javascript
// Sempre compara estágio 1 vs estágio 1
// Sem conceito de temporalidade
```

### Blocos Entidade × Tempo (RE)
**Características:**
- Estrutura matricial: linhas = entidades, colunas = estágios/datas
- Valores complexos por célula (objetos com múltiplos campos)
- Expansão de estágios no parser
- Usa `useEntityTemporalComparison`

**Estrutura de dados:**
```javascript
// Parser retorna array de registros expandidos
[
  { numero_restricao: 21, estagio: 1, limites: {...}, fatores_uh: [...] },
  { numero_restricao: 21, estagio: 2, limites: {...}, fatores_uh: [...] },
  { numero_restricao: 21, estagio: 3, limites: {...}, fatores_uh: [...] },
  { numero_restricao: 25, estagio: 1, limites: {...}, fatores_ut: [...] },
  ...
]

// Componente agrupa por numero_restricao e distribui em colunas
```

**Vantagens:**
- Alinhamento visual perfeito
- Comparação temporal clara
- Suporte a valores complexos (limites + fatores)
- Reutilizável para outros blocos similares

## Reutilização de Componentes

### Composable: `useBlockComparison.js`
Lógica compartilhada entre blocos:
- Estado de collapse/expand
- Ordenação de colunas
- Sincronização de scroll
- Filtragem de dados

**Blocos que usam:** DP, PQ, CT, IA

### Estilos Compartilhados: `block-tables.css`
Classes CSS reutilizadas:
```css
.faded          → Opacidade reduzida (datas não compartilhadas)
.highlighted    → Fundo vermelho (entidades em apenas um dadger)
.diff           → Fundo amarelo (valores diferentes)
.col-number     → Alinhamento à direita
.col-stage      → Formatação de estágio/data
```

### Utilitários de Comparação: `comparison.js`

#### `hasDiff(val1, val2)`
Verifica se dois valores são diferentes, tratando `null` corretamente.

#### `formatNumber(value)`
Formata números com 1-3 casas decimais em pt-BR.

#### `collectUniqueDates(dadger1Data, dadger2Data)`
Coleta todas as datas únicas dos dois dadgers, ordenadas cronologicamente.

#### `encontrarEstagioPorData(data, dadgerData)`
Retorna qual estágio possui determinada data.

#### `alignByEstagio(registros1, registros2, ...)`
Alinha registros de dois dadgers por número de estágio.

#### `alignByData(registros1, registros2, ...)`
Alinha registros de dois dadgers por data correspondente.

## Padrões de Implementação

### Criando um Novo Bloco

1. **Parser** (`src/utils/parsers/nomeParser.js`):
```javascript
export function parseNOME(lines, numeroEstagios) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('NOME ')) {
      // Parse campos por posição
      const campo1 = parseInt(line.substring(4, 7).trim())
      // ...
      registros.push({ campo1, ... })
    }
  }

  // Se necessário, fazer expansão
  return expandirRegistros(registros, numeroEstagios)
}
```

2. **Componente** (`src/components/blocks/NOMEBlock.vue`):
```vue
<script>
import { ref, computed } from 'vue'
import { hasDiff, formatNumber } from '../../utils/comparison.js'

export default {
  name: 'NOMEBlock',
  props: {
    dadger1Data: { type: Object, required: true },
    dadger1Name: { type: String, required: true },
    dadger2Data: { type: Object, required: true },
    dadger2Name: { type: String, required: true },
    compareMode: { type: String, required: true },
    showOnlyDifferences: { type: Boolean, required: true }
  },
  setup(props) {
    // Implementar lógica de alinhamento e comparação
  }
}
</script>
```

3. **Registrar** em `parsers/index.js`:
```javascript
import { parseNOME } from './nomeParser.js'
result.NOME = parseNOME(lines, numeroEstagios)
```

4. **Adicionar** em `ComparisonView.vue`:
```vue
<NOMEBlock
  v-if="dadger1Data.NOME && dadger2Data.NOME"
  :dadger1Data="dadger1Data"
  :dadger1Name="dadger1Name"
  :dadger2Data="dadger2Data"
  :dadger2Name="dadger2Name"
  :compareMode="compareMode"
  :showOnlyDifferences="showOnlyDifferences"
/>
```

## Caso de Estudo: Bloco RE (Restrições Elétricas)

O bloco RE é um exemplo completo de bloco complexo com estrutura "entidade × tempo". Esta seção documenta sua implementação para servir como referência para blocos similares.

### Estrutura do Bloco RE

O bloco RE é composto por **múltiplos mnemonicos**:

```
RE   21   1    4           <- Cabeçalho da restrição
LU   21   1    55.00 ...   <- Limites por patamar
LU   21   3    55.00 ...   <- Limites para outro estágio
FU   21   1    21    1.0   <- Fator usina hidráulica
FT   21   1    10    0.5   <- Fator usina térmica
FI   21   1    SE   NE ...  <- Fator interligação
FE   21   1    5     0.2   <- Fator contrato
```

**Características:**
- Cada restrição agrupa múltiplos registros (RE + LU + FU + FT + FI + FE)
- Estágios podem ser esparsos (ex: LU para estágios 1 e 3, mas não 2)
- Valores complexos (limites + fatores)
- Expansão necessária por forward-fill

### Passo 1: Parser (`reParser.js`)

O parser deve:
1. Agrupar registros por restrição
2. Parse de cada mnemônico
3. Expandir estágios faltantes

```javascript
export function parseRE(lines, numeroEstagios) {
  const restricoes = []
  let restricaoAtual = null

  for (const line of lines) {
    if (line.startsWith('RE ')) {
      // Salvar restrição anterior se existir
      if (restricaoAtual) {
        restricoes.push(restricaoAtual)
      }

      // Iniciar nova restrição
      const numero = parseInt(line.substring(4, 8).trim())
      const estagioInicial = parseInt(line.substring(9, 11).trim())
      const estagioFinal = parseInt(line.substring(14, 16).trim())

      restricaoAtual = {
        numero_restricao: numero,
        estagio_inicial: estagioInicial,
        estagio_final: estagioFinal,
        limites: [],
        fatores_uh: [],
        fatores_ut: [],
        fatores_interligacao: [],
        fatores_contrato: []
      }
    } else if (line.startsWith('LU ') && restricaoAtual) {
      const limite = parseLULine(line)
      if (limite) restricaoAtual.limites.push(limite)
    } else if (line.startsWith('FU ') && restricaoAtual) {
      const fator = parseFULine(line)
      if (fator) restricaoAtual.fatores_uh.push(fator)
    }
    // ... FT, FI, FE similares
  }

  // Salvar última restrição
  if (restricaoAtual) {
    restricoes.push(restricaoAtual)
  }

  // IMPORTANTE: Expandir estágios
  return expandirRestricoes(restricoes, numeroEstagios)
}

function expandirRestricoes(restricoes, numeroEstagios) {
  const expandidos = []

  for (const restricao of restricoes) {
    // Criar mapas por estágio
    const limitePorEstagio = criarMapaEstagio(restricao.limites)
    const fatoresUhPorEstagio = criarMapaEstagioArray(restricao.fatores_uh)
    // ... outros fatores

    // Expandir cada estágio de estagio_inicial até estagio_final
    for (let estagio = restricao.estagio_inicial; estagio <= restricao.estagio_final; estagio++) {
      const limites = buscarOuHerdar(limitePorEstagio, estagio, restricao.estagio_inicial)
      const fatores_uh = buscarOuHerdarArray(fatoresUhPorEstagio, estagio, restricao.estagio_inicial)

      // Criar registro expandido
      expandidos.push({
        numero_restricao: restricao.numero_restricao,
        estagio,
        limites,
        fatores_uh,
        fatores_ut,
        fatores_interligacao,
        fatores_contrato
      })
    }
  }

  return expandidos
}

// Buscar valor no mapa ou herdar do estágio anterior (forward-fill)
function buscarOuHerdar(mapa, estagio, estagioInicial) {
  if (mapa[estagio]) return mapa[estagio]

  // Buscar último estágio anterior
  for (let e = estagio - 1; e >= estagioInicial; e--) {
    if (mapa[e]) return mapa[e]
  }

  return null
}
```

**Resultado do parser:**
```javascript
[
  { numero_restricao: 21, estagio: 1, limites: {...}, fatores_uh: [...] },
  { numero_restricao: 21, estagio: 2, limites: {...}, fatores_uh: [...] },  // <- expandido
  { numero_restricao: 21, estagio: 3, limites: {...}, fatores_uh: [...] },
  { numero_restricao: 21, estagio: 4, limites: {...}, fatores_uh: [...] },
]
```

### Passo 2: Componente (`REBlock.vue`)

O componente usa o composable `useEntityTemporalComparison`:

```vue
<script>
import { formatNumber } from '../../utils/comparison.js'
import { useBlockComparison } from '../../composables/useBlockComparison.js'
import { useEntityTemporalComparison } from '../../composables/useEntityTemporalComparison.js'

export default {
  name: 'REBlock',
  props: { /* props padrão */ },
  setup(props) {
    // 1. Função para extrair valor de um registro
    const getEntityValue = (registro) => {
      if (!registro) return null
      return {
        limites: registro.limites,
        fatores_uh: registro.fatores_uh,
        fatores_ut: registro.fatores_ut,
        fatores_interligacao: registro.fatores_interligacao,
        fatores_contrato: registro.fatores_contrato
      }
    }

    // 2. Função para comparar dois valores
    const compareValues = (val1, val2) => {
      if (!val1 && !val2) return false
      if (!val1 || !val2) return true

      // Comparar limites campo a campo
      const lim1 = val1.limites
      const lim2 = val2.limites
      if (lim1 && lim2) {
        const campos = ['pesado_min', 'pesado_max', 'medio_min', 'medio_max', 'leve_min', 'leve_max']
        for (const campo of campos) {
          if (lim1[campo] !== lim2[campo]) return true
        }
      } else if (lim1 || lim2) {
        return true
      }

      // Comparar quantidade de fatores
      if ((val1.fatores_uh?.length || 0) !== (val2.fatores_uh?.length || 0)) return true
      // ... comparar outros fatores

      return false
    }

    // 3. Usar composable
    const { colunasTempo, alignedData } = useEntityTemporalComparison(
      props,
      'RE',                  // blockKey
      'numero_restricao',    // entityKey
      getEntityValue,
      compareValues
    )

    // 4. Lógica comum (collapse, scroll, sort, filter)
    const {
      collapsed,
      tableContainer1,
      tableContainer2,
      toggleCollapsed,
      sortBy,
      getSortIcon,
      onScroll1,
      onScroll2,
      createFilteredData
    } = useBlockComparison(props, alignedData)

    const filteredData = createFilteredData(['has_diff'])

    return { collapsed, colunasTempo, filteredData, /* ... */ }
  }
}
</script>
```

### Passo 3: Template

**Estrutura:**
- Cada LINHA = uma restrição
- Cada COLUNA = um estágio/data
- Classes CSS para formatação

```vue
<template>
  <div class="re-block">
    <!-- Header com collapse -->
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3>BLOCO RE - RESTRIÇÕES ELÉTRICAS</h3>
    </div>

    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <!-- Tabela Dadger 1 -->
        <div class="table-side">
          <h4>{{ dadger1Name }}</h4>
          <div class="table-container" :ref="el => tableContainer1 = el" @scroll="onScroll1">
            <table>
              <thead>
                <tr>
                  <th @click="sortBy('numero_restricao')">Nº Restr{{ getSortIcon('numero_restricao') }}</th>
                  <th v-for="col in colunasTempo" @click="sortBy(col.key)">
                    {{ col.label }}{{ getSortIcon(col.key) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredData" :class="{ 'highlighted': row.onlyInOne }">
                  <td>{{ row.numero_restricao }}</td>
                  <td v-for="col in colunasTempo"
                      :class="{
                        'diff': row.valores[col.key]?.diff && row.valores[col.key]?.sameTemporality,
                        'highlighted': row.valores[col.key]?.dataExisteEmAmbos && !row.valores[col.key]?.sameTemporality,
                        'faded': !row.valores[col.key]?.dataExisteEmAmbos && !row.valores[col.key]?.sameTemporality
                      }">
                    <!-- Exibir valores se existirem -->
                    <div v-if="row.valores[col.key]?.valor1">
                      <!-- Renderizar limites e fatores -->
                    </div>
                    <!-- Placeholder vazio para manter altura -->
                    <div v-else class="restricao-empty">
                      <div class="limites-section">
                        <strong>Limites:</strong>
                        <div class="limite-row">-</div>
                        <div class="limite-row">-</div>
                        <div class="limite-row">-</div>
                      </div>
                      <div class="fatores-section"><span>-</span></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabela Dadger 2 (idêntica) -->
      </div>
    </div>
  </div>
</template>
```

**IMPORTANTE - Placeholder vazio:**
Para manter alinhamento vertical, quando não há valor, exibir estrutura vazia com mesma altura:
```vue
<div v-else class="restricao-empty">
  <!-- Mesma estrutura mas com "-" -->
</div>
```

### Passo 4: CSS

```css
/* Altura mínima fixa para evitar desalinhamento */
.restricao-details {
  min-height: 85px;
  display: flex;
  flex-direction: column;
}

.limites-section {
  min-height: 60px;
}

.limite-row {
  height: 14px;
}

.fatores-section {
  min-height: 20px;
}

.restricao-empty {
  opacity: 0.3;
}
```

### Como Criar um Bloco Similar

Para criar um novo bloco com estrutura "entidade × tempo":

1. **Parser**: Agrupar registros por entidade e expandir estágios
2. **getEntityValue**: Extrair campos relevantes do registro
3. **compareValues**: Comparar os campos extraídos
4. **Template**:
   - Renderizar valor quando existir
   - Renderizar placeholder vazio quando não existir
5. **CSS**: Garantir alturas mínimas fixas

**Exemplo - Bloco AC (Acordos):**
```javascript
// Parser retorna
[
  { codigo_acordo: 5, estagio: 1, dados_acordo: {...} },
  { codigo_acordo: 5, estagio: 2, dados_acordo: {...} },
]

// Componente
const { colunasTempo, alignedData } = useEntityTemporalComparison(
  props,
  'AC',
  'codigo_acordo',
  r => r.dados_acordo,
  (v1, v2) => JSON.stringify(v1) !== JSON.stringify(v2)
)
```

## Boas Práticas

### Parsing
- Sempre tratar valores em branco como `null`, não como `0`
- Usar `substring()` com posições exatas do formato DADGER
- Adicionar tratamento de erro com `try/catch`

### Comparação
- Diferenciar `sameTemporality` (temporalidade compartilhada) de `diff` (valores diferentes)
- Apenas `diff && sameTemporality` conta como diferença para filtros
- `onlyInOne` sempre deve ser mostrado no filtro

### Performance
- Usar `computed()` para cálculos derivados
- Evitar processamento pesado no template
- Sincronização de scroll deve usar `isSyncing` para evitar loops

### UI/UX
- Todas as colunas devem ser sortable
- Scroll das duas tabelas deve ser sincronizado
- Formatação consistente: `faded`, `diff`, `highlighted`
- Valores numéricos alinhados à direita
