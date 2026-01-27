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

## Tipos de Blocos

### Blocos com Expansão Temporal
**Características:**
- Registros podem ter estágios esparsos (ex: estágios 1, 3, 5)
- Parser faz expansão por forward-fill
- Exemplos: DP, PQ, CT, IA

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

### Blocos de Estágio Único
**Características:**
- Só existem para estágio 1
- Não têm dimensão temporal
- Exemplo: UH

**Comparação:**
```javascript
// Sempre compara estágio 1 vs estágio 1
// Sem conceito de temporalidade
```

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
