# Arquitetura do RVZero

O RVZero lê dois conjuntos que podem conter DADGER, DADGNL e renováveis. Ele
transforma os registros em estruturas semânticas e os alinha por índice ou por
data de início. O alinhamento por data exige um DADGER em cada lado, pois é o
`DT` do DADGER que ancora o calendário da revisão.

## Regra temporal

- `DT` é a data de início do estágio 1.
- O estágio `n` começa em `DT + (n - 1) × 7 dias`.
- A duração vem da soma das horas dos patamares do `DP`. Os estágios semanais
  normalmente têm 168 horas; o último estágio pode representar o restante do
  mês seguinte e, portanto, durar várias semanas.
- `info_dadger.estagios` preserva início, fim, horas e a consistência das horas
  entre subsistemas. `datas_estagios` permanece como índice rápido
  `{ estágio: data_inicio }`.
- No modo `data`, somente datas de início presentes nos dois horizontes são
  comparáveis. Datas exclusivas de um horizonte aparecem esmaecidas e não são
  diferenças.
- No modo `estagio`, a comparação é numérica e serve como diagnóstico do
  arquivo; ela não representa necessariamente o mesmo período do calendário.
- Em `renovaveis.*`, `PerIni` é o índice do período. Sem DADGERs, os arquivos
  são comparados diretamente por esse índice.
- Quando os dois lados têm DADGER, cada `PerIni` é convertido pela tabela
  `info_dadger.datas_estagios` do próprio lado. Assim, por exemplo, o período 2
  de uma revisão pode ser comparado ao período 1 da revisão seguinte.
- O DADGNL não possui `DT`. Em `TG` e `GL`, a semana `n` começa em
  `DT + (n - 1) × 7 dias`, usando o DADGER do mesmo lado.
- O horizonte DADGNL pode ultrapassar o horizonte curto do DADGER. Seu
  calendário é extrapolado até `info_dadgnl.numero_semanas`, obtido do maior
  índice de `GL`; não deve ser truncado por `info_dadger.numero_estagios`.
- A data textual de `GL` é preservada como dado de origem e pode ser usada para
  validação, mas o alinhamento usa o `DT` do DADGER.
- `UH` contém condições iniciais. No modo `data`, dois blocos UH só são
  comparáveis quando os dois `DT` são iguais.

Todas as operações de data usam calendário UTC e formato estrito
`dd/mm/aaaa`, evitando deslocamentos por fuso horário e datas normalizadas
silenciosamente pelo JavaScript.

Exemplo real:

```text
DADGER RV0: DT 31/01/2026, estágio 6 começa 07/03/2026
DADGER RV3: DT 21/02/2026, estágio 3 começa 07/03/2026

Modo data: estágio 6 ↔ estágio 3
Modo estágio: estágio 3 ↔ estágio 3
```

## Fluxo

```text
DropZone
  → conjunto por lado (DADGER + DADGNL + renováveis)
  → decodificação comum (BOM → UTF-8 válido → Windows-1252/Latin-1)
  → fileTypeRegistry
  → parseDadger / parseDadgnl / parseRenovaveis
      → parser de cada bloco
      → calendário DT + DP
  → ComparisonView / DadgnlComparisonView / RenovaveisComparisonView
      → associação de índices → data do DADGER
      → alinhamento temporal
      → comparação semântica
      → filtro de diferenças comparáveis
```

A decodificação acontece no adaptador e é independente do tipo de arquivo.
Assim, DADGER, DADGNL, renováveis e tipos adicionados futuramente seguem a
mesma regra. BOMs de UTF-8 e UTF-16 são respeitados; sem BOM, os bytes são
validados como UTF-8 estrito e, se inválidos, decodificados como Windows-1252,
compatível com o conteúdo imprimível usual de Latin-1. O núcleo continua
recebendo apenas conteúdo textual.

## Parsers

Os parsers ficam em `src/utils/parsers`. Campos em branco são `null`; zero é
sempre preservado como zero. Registros inválidos não recebem valores
inventados. Um DADGER precisa ter `DT` válido e ao menos um `DP` válido.

| Bloco | Tratamento |
| --- | --- |
| `DP` | Carga, horas e quantidade de patamares por estágio/subsistema |
| `PQ` | Forward-fill por fonte+subsistema; soma separada de P/M/L |
| `CT` | Forward-fill por usina; preserva nome e subsistema |
| `IA` | Forward-fill por par de subsistemas; patamares definidos pelo DP |
| `UH` | Condições iniciais, campos opcionais e status (`NW`, etc.) |
| `TI`, `MP`, `FD`, `VE`, `RQ` | Arrays com exatamente o número de estágios do deck |
| `RE` | `RE/LU/FU/FT/FI/FE`; fatores herdados individualmente por identidade |
| `HQ` | `HQ/LQ/CQ`; coeficientes herdados individualmente |
| `HV` | `HV/LV/CV`; coeficientes herdados individualmente |
| `RI` | Forward-fill por usina+subsistema |
| `HE` | `CM` associado pelo número da restrição a todas as linhas `HE` |
| `AC` | Todas as ocorrências são preservadas, inclusive chaves repetidas |
| `OUTROS` | Qualquer registro ativo de duas letras sem parser estruturado |

O parser DADGNL cobre:

| Bloco | Tratamento |
| --- | --- |
| `TG` | Campos completos de P/M/L; forward-fill por usina até o horizonte GL |
| `GS` | Mês relativo e quantidade de semanas |
| `NL` | Usina, subsistema e lag |
| `GL` | Geração, duração e data textual para cada usina e semana |

`VI` permanece em `OUTROS`: ele representa histórico de vazões para tempo de
viagem, e não os estágios futuros do horizonte. `RQ`, ao contrário, possui um
valor por estágio e é temporal.

## Comparação

`src/core` concentra a produção das ocorrências do relatório público, incluindo
alinhamento, igualdade e classificação semântica. O frontend não recalcula o
estado de uma ocorrência.

`src/utils/comparison.js` permanece como base para:

- alinhamento por data ou estágio com índices `Map`;
- igualdade semântica de objetos e coleções, ignorando o número do estágio
  quando datas equivalentes usam índices diferentes;
- alinhamento de sequências por distância de edição para `AC` e `OUTROS`, de
  forma que uma inserção não desloque todas as linhas posteriores;
- formatação comum e tratamento uniforme de `null`/`undefined`.

`reportPresentation.js` converte as ocorrências versionadas em estruturas de
apresentação, sem alterar sua classificação. Isso permite preservar os layouts
especializados: CT continua agrupado por patamar; RE/HQ/HV preservam limites,
fatores e coeficientes; arrays continuam como entidade × tempo.

`useTemporalComparison` atende os blocos com arrays a partir das ocorrências da
API. `StageArrayBlock.vue` renderiza TI, MP, FD, VE e RQ sem componentes
duplicados. `useEntityTemporalComparison` atende RE, HQ e HV.
`useBlockComparison` é a fonte única para ordenação, scroll, filtro e indicação
de diferenças. `renovaveisComparison.js` concentra a associação de `PerIni` ao
calendário e mantém períodos fora do horizonte compartilhado fora do conjunto
de diferenças. `dadgnlComparison.js` faz o mesmo para `TG` e `GL`, extrapolando
o calendário semanal a partir do `DT`; `GS` e `NL` são comparados como blocos
estáticos.

## Estrutura principal

```text
src/
├── components/
│   ├── blocks/
│   │   ├── StageArrayBlock.vue
│   │   └── *Block.vue
│   ├── ComparisonView.vue
│   ├── DropZone.vue
│   └── TopBar.vue
├── composables/
│   ├── useBlockComparison.js
│   ├── useEntityTemporalComparison.js
│   └── useTemporalComparison.js
└── utils/
    ├── parsers/
    ├── comparison.js
    ├── dadgnlComparison.js
    ├── renovaveisComparison.js
    └── temporal.js
```

## Verificação

```bash
npm ci
npm test
npm run build
npm audit
```

Os testes cobrem calendário semanal/mensal, alinhamento de RVs diferentes,
horizontes não compartilhados, zeros, HE/CM, forward-fill individual de RE,
agregação de PQ, arrays limitados ao horizonte e inserções em blocos de linhas.
