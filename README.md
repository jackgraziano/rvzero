# RVZero

[![Deploy to GitHub Pages](https://github.com/jackgraziano/rvzero/actions/workflows/deploy.yml/badge.svg)](https://github.com/jackgraziano/rvzero/actions/workflows/deploy.yml)

Comparador aberto de decks DADGER do DECOMP, executado inteiramente no
navegador.

**Aplicação:** [rv0.com.br](https://rv0.com.br/)

O RVZero lê dois decks, interpreta seus blocos posicionais e destaca as
alterações lado a lado. Seu principal cuidado é alinhar os dados pelo período
correto do calendário, em vez de assumir que estágios com o mesmo número
representam a mesma semana.

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
- Suporte a campos opcionais, valores zero e registros repetidos.
- Detecção dinâmica de blocos simples ainda sem parser estruturado.
- Comparação adicional de arquivos `renovaveis.*`.
- Processamento local: os arquivos são lidos pelo navegador e não são enviados
  para um servidor.

## Blocos DADGER

| Bloco | Tratamento |
| --- | --- |
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
| `OUTROS` | Registros ativos de duas letras sem parser estruturado |

O registro `VI` é mantido como histórico textual, pois representa vazões
passadas usadas no tempo de viagem, e não estágios futuros do horizonte.

## Como usar

1. Abra o RVZero.
2. Arraste um DADGER para cada uma das duas áreas de upload.
3. Escolha a comparação por **Data** ou **Estágio**.
4. Expanda os blocos que deseja analisar.
5. Ative ou desative **Mostrar apenas diferenças** conforme necessário.

Arquivos inválidos, sem `DT` ou sem registros `DP` válidos, são rejeitados para
evitar comparações temporais silenciosamente incorretas.

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
Arquivo
  → detecção do tipo
  → parser do bloco
  → calendário DT + DP
  → alinhamento por data/estágio
  → comparação semântica
  → componentes Vue
```

Principais diretórios:

```text
src/
├── components/
│   ├── blocks/       # Tabelas de comparação
│   └── ComparisonView.vue
├── composables/      # Alinhamento e comportamento compartilhado
└── utils/
    ├── parsers/      # Leitura posicional dos blocos
    ├── comparison.js
    └── temporal.js

tests/                # Testes unitários e de regressão
```

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
