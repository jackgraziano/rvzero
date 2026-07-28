# RVZero

[![Deploy to GitHub Pages](https://github.com/jackgraziano/rvzero/actions/workflows/deploy.yml/badge.svg)](https://github.com/jackgraziano/rvzero/actions/workflows/deploy.yml)

Comparador aberto de arquivos DADGER, DADGNL e renováveis do DECOMP, executado
inteiramente no navegador.

**Aplicação:** [rv0.com.br](https://rv0.com.br/)

O RVZero lê dois conjuntos de arquivos, interpreta seus registros e destaca as
alterações lado a lado. Seu principal cuidado é alinhar os dados pelo período
correto do calendário, em vez de assumir que estágios ou períodos com o mesmo
número representam a mesma semana.

## Por que comparar pela data?

Revisões diferentes normalmente começam em datas diferentes. Por isso, o
estágio 3 de um deck pode representar um período diferente do estágio 3 de
outro.

Exemplo:

```text
RV0 — DT 31/01/2026
  estágio 6 → 07/03/2026

RV3 — DT 21/02/2026
  estágio 3 → 07/03/2026
```

Para comparar o mesmo período, o RVZero alinha o estágio 6 do RV0 ao estágio 3
do RV3. O modo por estágio continua disponível como ferramenta de diagnóstico.

O último estágio também recebe tratamento especial: ele pode representar o
restante de um mês e durar mais de sete dias. Sua duração é derivada das horas
dos patamares do bloco `DP`.

## Funcionalidades

- Comparação por data de início ou por número do estágio.
- Destaque de valores alterados e registros presentes em apenas um arquivo.
- Períodos fora do horizonte compartilhado são exibidos sem serem classificados
  como diferenças.
- Filtro para mostrar apenas diferenças reais.
- Tabelas sincronizadas, ordenáveis e organizadas por bloco.
- Fatores e coeficientes extensos são agrupados por tipo e contexto para evitar
  a exibição de objetos internos como texto corrido.
- Suporte a campos opcionais, valores zero e registros repetidos.
- Leitura resiliente de UTF-8, UTF-16 com BOM e arquivos Latin-1/Windows-1252.
- Detecção dinâmica de blocos simples ainda sem parser estruturado.
- Upload simultâneo de DADGER, DADGNL e `renovaveis.*` por deck.
- Comparação de DADGNL por estágio/semana e de renováveis por `PerIni` quando
  usados isoladamente.
- Associação de `PerIni` à data do estágio correspondente quando cada lado
  também possui um DADGER.
- Associação das semanas do DADGNL ao calendário extrapolado a partir do `DT`
  do DADGER do mesmo lado.
- Processamento local: os arquivos são lidos pelo navegador e não são enviados
  para um servidor.

## Blocos DADGER

| Bloco | Tratamento |
| --- | --- |
| `TE` | Título do deck exibido nos cartões dos conjuntos; não participa da comparação |
| `DP` | Cargas, horas e patamares por estágio e subsistema |
| `PQ` | Pequena geração agregada separadamente em Pesada, Média e Leve |
| `CT` | Usinas térmicas e seus valores por patamar |
| `IA` | Limites de intercâmbio por direção e patamar |
| `UH` | Condições iniciais das usinas hidráulicas |
| `TI` | Vazões desviadas por estágio |
| `MP` | Manutenção programada, incluindo conjuntos 50/60 de Itaipu |
| `FD` | Fatores de disponibilidade, incluindo conjuntos 50/60 de Itaipu |
| `VE` | Volumes de espera por estágio |
| `RQ` | Vazão defluente mínima percentual por estágio |
| `RE` | Restrições elétricas `RE/LU/FU/FT/FI/FE` |
| `HQ` | Restrições de vazão `HQ/LQ/CQ` |
| `HV` | Restrições de armazenamento `HV/LV/CV` |
| `RI` | Restrições de Itaipu |
| `HE` | Restrições de energia armazenada e coeficientes `CM` |
| `AC` | Alterações cadastrais, inclusive ocorrências repetidas |
| `VI` | Tempo de viagem e sequência histórica de vazões defluentes por usina |
| `OUTROS` | Registros ativos de duas letras sem parser estruturado |

`VI` é histórico, e não um horizonte futuro. Em um estudo semanal, `QDEFn`
corresponde à semana iniciada em `DT - n × 7 dias`; no modo Data, os valores
são alinhados por essas datas e semanas exclusivas ficam esmaecidas. No modo
Estágio, a posição `QDEF1`, `QDEF2`, etc. é comparada diretamente para
diagnóstico. O tempo de viagem é uma configuração estática da usina e continua
comparável mesmo quando não há semanas históricas comuns.

## Blocos DADGNL

| Bloco | Tratamento |
| --- | --- |
| `TG` | Cadastro e parâmetros por patamar, com vigência propagada por estágio |
| `GS` | Número de semanas de cada mês relativo |
| `NL` | Lag de antecipação por usina |
| `GL` | Geração e duração por usina, semana e patamar |

No modo Data, o índice temporal de `TG` e `GL` é convertido em data usando o
`DT` do DADGER correspondente. A data impressa no `GL` é preservada pelo
parser, mas não é usada como âncora de alinhamento.

## Como usar

1. Abra o RVZero.
2. Em cada lado, arraste um DADGER, DADGNL, arquivo de renováveis ou qualquer
   combinação desses tipos.
3. Sem os dois DADGERs, compare DADGNL e renováveis diretamente pelo índice.
4. Com um DADGER em cada lado, escolha a comparação por **Data** ou
   **Estágio**. No modo Data, `PerIni` e as semanas do DADGNL usam o calendário
   ancorado pelo DADGER do mesmo lado.
5. Expanda os blocos que deseja analisar.
6. Ative ou desative **Mostrar apenas diferenças** conforme necessário.

DADGERs sem `DT` ou sem registros `DP` válidos são rejeitados para evitar
comparações temporais silenciosamente incorretas.

## Uso programático

O mesmo núcleo usado pelo site pode ser importado em Node.js ou em aplicações
web. O núcleo recebe nomes e conteúdos textuais; leitura de arquivos locais,
uploads do navegador, ZIPs ou rede deve ser feita por um adaptador externo.
Para fontes em bytes, `decodeFileContent` aplica a mesma detecção de encoding
usada pelo site:

```js
import { readFile } from 'node:fs/promises'

import { decodeFileContent } from 'rvzero/adapters'
import { compareDeckSets } from 'rvzero/core'

const dadgerRv1 = decodeFileContent(await readFile('./dadger.rv1'))

const report = compareDeckSets(
  {
    left: [
      { name: 'dadger.rv1', content: dadgerRv1 },
      { name: 'dadgnl.rv1', content: dadgnlRv1 },
      { name: 'renovaveis.rv1', content: renovaveisRv1 }
    ],
    right: [
      { name: 'dadger.rv4', content: dadgerRv4 },
      { name: 'dadgnl.rv4', content: dadgnlRv4 },
      { name: 'renovaveis.rv4', content: renovaveisRv4 }
    ]
  },
  {
    mode: 'data',
    includeEqual: false,
    includeOutsideCommonHorizon: true
  }
)
```

Opções:

| Opção | Valores | Padrão |
| --- | --- | --- |
| `mode` | `data` ou `estagio` | `estagio` |
| `includeEqual` | `boolean` | `false` |
| `includeOutsideCommonHorizon` | `boolean` | `true` |

No modo `data`, é obrigatório haver um DADGER válido em cada lado. Sem os dois
DADGERs, DADGNL e renováveis continuam comparáveis em `estagio`, usando
semana, estágio ou `PerIni` diretamente.

### Contrato de saída

O relatório possui contrato versionado em
[`src/core/contract/report.schema.json`](src/core/contract/report.schema.json).

```json
{
  "schemaVersion": "1",
  "mode": "data",
  "inputs": {
    "left": [],
    "right": []
  },
  "summary": {
    "comparablePeriods": 0,
    "differences": 0,
    "onlyLeft": 0,
    "onlyRight": 0,
    "outsideCommonHorizon": 0
  },
  "blocks": {},
  "warnings": []
}
```

Cada ocorrência usa um estado semântico estável:

| Estado | Significado |
| --- | --- |
| `equal` | Conteúdo equivalente no período comparável |
| `changed` | Campos alterados no período comparável |
| `only-left` | Registro presente somente no lado esquerdo |
| `only-right` | Registro presente somente no lado direito |
| `outside-common-horizon` | Período exclusivo de um horizonte, sem contar como diferença |

Exemplo de ocorrência:

```json
{
  "fileType": "dadgnl",
  "block": "GL",
  "status": "changed",
  "identity": {
    "codigoUsina": 86
  },
  "calendar": {
    "date": "29/08/2026",
    "leftIndex": 9,
    "rightIndex": 6
  },
  "fields": {
    "geracao_pesado": {
      "left": 350,
      "right": 0,
      "changed": true
    }
  }
}
```

Erros públicos usam códigos estáveis e podem ser serializados com
`publicError(error)`. Códigos atuais:

```text
UNSUPPORTED_FILE_TYPE
DUPLICATE_FILE_TYPE
INVALID_DADGER
INVALID_DADGNL
INVALID_RENOVAVEIS
MISSING_DADGER_FOR_DATE_MODE
NO_COMPARABLE_FILE_TYPES
```

### Exemplos

```bash
node examples/node-basic/index.mjs
node examples/cli/compare.mjs --left ./dadger.rv0 --right ./dadger.rv3 --mode data
```

O exemplo de navegador em `examples/browser-basic/index.html` mostra um
adaptador que lê os bytes com `readBrowserFile()`. A CLI usa o mesmo
`decodeFileContent()`, portanto não presume UTF-8 para DADGER, DADGNL,
renováveis ou novos tipos de arquivo.

### Compatibilidade

O pacote usa versionamento semântico. O campo `schemaVersion` evolui de forma
independente: campos novos opcionais podem ser adicionados sem mudar a versão,
mas remoções, renomeações ou mudança semântica exigem nova versão do contrato.

## Executar localmente

### Requisitos

- Node.js 20.19 ou mais recente.
- npm.

### Instalação

```bash
git clone https://github.com/jackgraziano/rvzero.git
cd rvzero
npm ci
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:8080
```

### Docker

```bash
git clone https://github.com/jackgraziano/rvzero.git
cd rvzero
docker compose up --build
```

Depois, acesse `http://localhost:8080`.

## Qualidade e testes

```bash
npm test
npm run build
npm run build:core
npm audit --audit-level=moderate
```

A suíte usa `node:test` e cobre, entre outros casos:

- alinhamento de revisões com datas-base diferentes;
- estágio mensal;
- diferença entre zero e campo vazio;
- campos posicionais com dois dígitos;
- associação de `HE` com `CM`;
- forward-fill individual de fatores;
- chaves compostas;
- registros repetidos;
- inserções no meio de blocos textuais.

## Arquitetura

```text
Conjunto de arquivos por revisão
  → detecção do tipo
  → parser DADGER, DADGNL e/ou renováveis
  → calendário DT + DP, quando disponível
  → associação de índices temporais → data
  → alinhamento por data/estágio
  → comparação semântica
  → relatório público versionado
  → adaptador de apresentação
  → componentes Vue especializados por domínio
```

Principais diretórios:

```text
src/
├── core/             # API programática sem Vue ou DOM
├── components/
│   ├── blocks/       # Tabelas especializadas de cada bloco
│   ├── ComparisonView.vue
│   ├── DadgnlComparisonView.vue
│   └── RenovaveisComparisonView.vue
├── composables/      # Ordenação, filtro, collapse e scroll
└── utils/
    ├── parsers/      # Leitura posicional dos blocos
    ├── comparison.js
    ├── reportPresentation.js
    └── temporal.js

tests/                # Testes unitários e de regressão
```

O frontend consome as ocorrências produzidas por `compareDeckSets()`, mas não
as exibe como uma tabela genérica de campos. `reportPresentation.js` adapta o
contrato semântico aos layouts de domínio: tabelas lado a lado, patamares
agrupados, matrizes temporais e listas próprias de fatores e coeficientes.

As decisões de domínio e os detalhes de cada bloco estão em
[ARCHITECTURE.md](ARCHITECTURE.md).

## Como contribuir

Contribuições são bem-vindas: correções de layout, novos blocos, testes,
melhorias de interface e documentação.

Antes de começar:

1. Leia [AGENTS.md](AGENTS.md) e [ARCHITECTURE.md](ARCHITECTURE.md).
2. Abra uma issue descrevendo o caso, especialmente quando houver dúvida sobre
   o layout de um registro.
3. Crie uma branch a partir de `main`.
4. Faça alterações pequenas e focadas.
5. Inclua um teste de regressão para correções de parser ou temporalidade.
6. Execute os comandos de qualidade antes de abrir o pull request.

```bash
npm test
npm run build
npm run build:core
npm audit --audit-level=moderate
git diff --check
```

Em pull requests que alterem um parser, informe:

- bloco e campos afetados;
- posições do layout utilizadas;
- exemplo mínimo que reproduza o problema;
- comportamento anterior e comportamento esperado;
- referência usada para confirmar o formato.

Não inclua decks operativos, dados privados, `node_modules` ou artefatos de
build no repositório.

### Adicionando suporte a um bloco

Antes de criar um componente novo, verifique se o formato se encaixa em uma das
abstrações existentes:

- `StageArrayBlock.vue` e `useTemporalComparison` para arrays por estágio;
- `useEntityTemporalComparison` para entidade × tempo;
- `useBlockComparison` para ordenação, filtro e sincronização das tabelas;
- `OUTROS` para registros simples que ainda não justificam parser próprio.

Parsers devem preservar zero, representar campos vazios como `null`, respeitar
o número real de estágios e usar a identidade completa de cada registro.

## Referência dos layouts

O projeto foi validado com arquivos DADGER reais e com geradores de decks. O
layout oficial do DECOMP deve ser a fonte principal para decisões de formato.

O código de montagem de decks pode ajudar a entender como os campos são
emitidos, mas o RVZero não depende de nenhum gerador externo e não deve
incorporar regras conjunturais específicas de um deck.

## Estado do projeto

O RVZero está em desenvolvimento ativo. DADGER é um formato amplo e possui
registros menos frequentes que podem ainda aparecer em `OUTROS`. Relatos com
exemplos mínimos e sem dados sensíveis ajudam bastante a ampliar a cobertura.

## Licença

Distribuído sob a [licença MIT](LICENSE). Copyright © 2026 Jackson Graziano.
