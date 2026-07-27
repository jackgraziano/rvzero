# Arquitetura do RVZero

O RVZero lê dois DADGERs, transforma os registros posicionais em estruturas
semânticas e os alinha por estágio ou por data de início do estágio. O modo por
data é o padrão porque revisões diferentes não atribuem o mesmo período do
calendário ao mesmo número de estágio.

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
  → fileTypeRegistry
  → parseDadger
      → parser de cada bloco
      → calendário DT + DP
  → ComparisonView
      → alinhamento temporal
      → comparação semântica
      → filtro de diferenças comparáveis
```

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

`VI` permanece em `OUTROS`: ele representa histórico de vazões para tempo de
viagem, e não os estágios futuros do horizonte. `RQ`, ao contrário, possui um
valor por estágio e é temporal.

## Comparação

`src/utils/comparison.js` concentra:

- alinhamento por data ou estágio com índices `Map`;
- igualdade semântica de objetos e coleções, ignorando o número do estágio
  quando datas equivalentes usam índices diferentes;
- alinhamento de sequências por distância de edição para `AC` e `OUTROS`, de
  forma que uma inserção não desloque todas as linhas posteriores;
- formatação comum e tratamento uniforme de `null`/`undefined`.

`useTemporalComparison` atende os blocos com arrays. `StageArrayBlock.vue`
renderiza TI, MP, FD, VE e RQ sem componentes duplicados.
`useEntityTemporalComparison` atende RE, HQ e HV.
`useBlockComparison` é a fonte única para ordenação, scroll, filtro e indicação
de diferenças.

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
