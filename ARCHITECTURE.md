# Arquitetura do RVZero

## Visão Geral

O RVZero é uma aplicação Vue para comparar arquivos dadger, destacando diferenças entre dois arquivos. A arquitetura foi projetada para escalar facilmente com a adição de novos blocos de dados.

## Estrutura de Pastas

```
src/
├── components/
│   ├── blocks/              # Componentes de blocos individuais
│   │   └── DPBlock.vue      # Bloco DP (Demanda por Patamar)
│   ├── ComparisonView.vue   # Orquestrador de blocos
│   ├── DropZone.vue         # Área de upload
│   └── TopBar.vue           # Barra superior
├── utils/
│   ├── parsers/             # Parsers de blocos
│   │   ├── index.js         # Orquestrador de parsers
│   │   ├── infoParser.js    # Parser de informações gerais
│   │   └── dpParser.js      # Parser do bloco DP
│   ├── comparison.js        # Utilitários de comparação
│   └── dadgerParser.js      # Re-exporta parser principal
└── App.vue
```

## Componentes Principais

### 1. ComparisonView (Orquestrador)
**Arquivo:** `src/components/ComparisonView.vue`

**Responsabilidade:** Orquestrar a exibição de todos os blocos de comparação.

**Como funciona:**
- Recebe dados dos dois dadgers
- Renderiza componentes de bloco individuais
- Passa props comuns (dadger1Data, dadger2Data, compareMode)

**Como adicionar um novo bloco:**
```vue
<template>
  <div class="comparison-content">
    <!-- Blocos existentes -->
    <DPBlock ... />

    <!-- Adicionar novo bloco aqui -->
    <NovoBlock
      v-if="dadger1Data.NOVO && dadger2Data.NOVO"
      :dadger1Data="dadger1Data"
      :dadger1Name="dadger1Name"
      :dadger2Data="dadger2Data"
      :dadger2Name="dadger2Name"
      :compareMode="compareMode"
    />
  </div>
</template>

<script>
import NovoBlock from './blocks/NovoBlock.vue'

export default {
  components: {
    DPBlock,
    NovoBlock  // Adicionar aqui
  }
}
</script>
```

### 2. Componentes de Bloco
**Localização:** `src/components/blocks/`

**Padrão:** Cada bloco é um componente Vue independente.

**Props obrigatórias:**
- `dadger1Data` - Dados do primeiro dadger
- `dadger1Name` - Nome do primeiro arquivo
- `dadger2Data` - Dados do segundo dadger
- `dadger2Name` - Nome do segundo arquivo
- `compareMode` - Modo de comparação ('estagio' ou 'data')

**Estrutura recomendada:**
```vue
<template>
  <div class="block">
    <!-- Cabeçalho colapsável -->
    <div class="block-header" @click="toggleCollapsed">
      <span class="block-icon">{{ collapsed ? '▶' : '▼' }}</span>
      <h3 class="block-name">NOME DO BLOCO</h3>
    </div>

    <!-- Conteúdo do bloco -->
    <div v-show="!collapsed" class="block-content">
      <div class="comparison-tables">
        <!-- Duas colunas: dadger1 e dadger2 -->
        <div class="table-side">
          <!-- Tabela do dadger 1 -->
        </div>
        <div class="table-side">
          <!-- Tabela do dadger 2 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { alignByEstagio, alignByData, hasDiff, formatNumber } from '../../utils/comparison.js'

export default {
  props: ['dadger1Data', 'dadger1Name', 'dadger2Data', 'dadger2Name', 'compareMode'],
  data() {
    return {
      collapsed: false,
      isSyncing: false
    }
  },
  computed: {
    alignedData() {
      // Usar funções de comparison.js para alinhar dados
    }
  },
  methods: {
    // Sincronizar scroll entre as duas tabelas
    onScroll1(event) { ... },
    onScroll2(event) { ... }
  }
}
</script>
```

## Sistema de Parsers

### Arquitetura Modular

**Orquestrador:** `src/utils/parsers/index.js`
- Importa todos os parsers de blocos
- Combina resultados em um único objeto JSON
- Calcula informações derivadas (número de estágios, datas)

**Parser de Bloco Individual:** Ex: `src/utils/parsers/dpParser.js`
- Exporta função `parse[BLOCO](lines)`
- Recebe array de linhas do arquivo
- Retorna array de registros do bloco
- Responsável por leitura posicional específica

### Como Adicionar um Novo Parser

1. **Criar arquivo do parser:**
```javascript
// src/utils/parsers/novoParser.js

export function parseNOVO(lines) {
  const registros = []

  for (const line of lines) {
    if (line.startsWith('NOVO ')) {
      const registro = parseNOVOLine(line)
      if (registro) {
        registros.push(registro)
      }
    }
  }

  return registros
}

function parseNOVOLine(line) {
  // Leitura posicional específica do bloco
  const campo1 = parseInt(line.substring(5, 10).trim())
  const campo2 = parseFloat(line.substring(10, 20).trim())

  return {
    campo1,
    campo2,
    // ... outros campos
  }
}
```

2. **Registrar no orquestrador:**
```javascript
// src/utils/parsers/index.js

import { parseNOVO } from './novoParser.js'

export function parseDadger(fileContent) {
  const result = {
    info_dadger: {},
    DP: [],
    NOVO: []  // Adicionar aqui
  }

  const lines = fileContent.split('\n')

  result.info_dadger = parseInfoDadger(lines)
  result.DP = parseDP(lines)
  result.NOVO = parseNOVO(lines)  // Adicionar aqui

  // ... resto do código

  return result
}
```

## Utilitários de Comparação

**Arquivo:** `src/utils/comparison.js`

Fornece funções reutilizáveis para:
- Alinhar registros por estágio
- Alinhar registros por data
- Detectar diferenças
- Formatar números
- Coletar valores únicos

### Funções Principais

#### `alignByEstagio(registros1, registros2, dadger1Info, dadger2Info, secondaryKey, transformFn)`
Alinha registros pelo número do estágio e uma chave secundária (ex: subsistema).

#### `alignByData(registros1, registros2, dadger1Data, dadger2Data, secondaryKey, transformFn)`
Alinha registros por data (encontra datas em comum) e uma chave secundária.

#### `hasDiff(val1, val2)`
Verifica se dois valores são diferentes (considerando nulls).

#### `formatNumber(value)`
Formata número para exibição (ou '-' se null).

### Exemplo de Uso

```javascript
import { alignByEstagio, alignByData, hasDiff, formatNumber } from '../../utils/comparison.js'

computed: {
  alignedData() {
    const transformFn = (reg1, reg2, onlyInOne, primaryValue, secondaryValue) => {
      return {
        key: `${primaryValue}-${secondaryValue}`,
        onlyInOne,
        dadger1: reg1 ? { /* dados formatados */ } : null,
        dadger2: reg2 ? { /* dados formatados */ } : null,
        diff_campo: hasDiff(reg1?.campo, reg2?.campo)
      }
    }

    if (this.compareMode === 'estagio') {
      return alignByEstagio(
        this.dadger1Data.BLOCO,
        this.dadger2Data.BLOCO,
        this.dadger1Data.info_dadger,
        this.dadger2Data.info_dadger,
        'chave_secundaria',
        transformFn
      )
    } else {
      return alignByData(
        this.dadger1Data.BLOCO,
        this.dadger2Data.BLOCO,
        this.dadger1Data,
        this.dadger2Data,
        'chave_secundaria',
        transformFn
      )
    }
  }
}
```

## Fluxo de Dados

```
1. Usuário faz upload de 2 arquivos
   ↓
2. DropZone lê arquivo e chama parseDadger()
   ↓
3. parseDadger() orquestra parsers individuais
   ↓
4. JSON estruturado é armazenado em App.vue
   ↓
5. ComparisonView renderiza blocos
   ↓
6. Cada bloco usa comparison.js para alinhar dados
   ↓
7. Blocos exibem tabelas com diferenças destacadas
```

## Estilo Visual

**Tema:** Terminal/código com fonte monospace
- Fundo: #1e1e1e, #2d2d2d
- Texto principal: #00ff00 (verde terminal)
- Diferenças: #ffff00 (amarelo) sobre #4a4a00
- Linhas faded (só em um arquivo): opacity 0.3
- Fonte: 'Courier New', monospace

## Checklist para Adicionar um Novo Bloco

- [ ] Criar parser em `src/utils/parsers/[nome]Parser.js`
- [ ] Registrar parser em `src/utils/parsers/index.js`
- [ ] Criar componente em `src/components/blocks/[Nome]Block.vue`
- [ ] Adicionar componente em `ComparisonView.vue`
- [ ] Usar funções de `comparison.js` para alinhar dados
- [ ] Implementar sincronização de scroll entre tabelas
- [ ] Adicionar lógica de colapsar/expandir
- [ ] Destacar diferenças (apenas quando ambos arquivos têm a linha)
- [ ] Aplicar estilo faded para linhas que existem em apenas um arquivo
- [ ] Testar com arquivos de exemplo
