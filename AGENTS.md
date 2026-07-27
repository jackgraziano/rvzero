# AGENTS.md

## Objetivo do projeto

O RVZero compara arquivos DADGER e renováveis do DECOMP bloco a bloco. Quando
há DADGER nos dois lados, o modo por data deve comparar o mesmo período do
calendário, mesmo quando esse período possui índices diferentes em revisões
distintas.

Antes de alterar regras de negócio, leia `ARCHITECTURE.md`.

## Comandos de desenvolvimento

Requer Node.js 20.19 ou mais recente.

```bash
npm ci
npm run dev
npm test
npm run build
npm audit
```

Antes de concluir uma alteração:

1. Execute `npm test`.
2. Execute `npm run build`.
3. Execute `npm audit --audit-level=moderate` quando dependências mudarem.
4. Execute `git diff --check`.
5. Quando parsers ou temporalidade mudarem, valide também com pelo menos dois
   DADGERs reais de revisões e datas-base diferentes.

## Invariantes temporais

- `DT` é a data de início do estágio 1.
- O estágio `n` começa em `DT + (n - 1) × 7 dias`.
- A duração do estágio é a soma das horas dos patamares do `DP`.
- O último estágio pode ser mensal; não presuma duração de sete dias.
- Use funções de `src/utils/temporal.js`. Não faça contas de calendário
  diretamente em componentes.
- Datas são estritas no formato `dd/mm/aaaa` e calculadas em UTC.
- No modo `data`, compare valores somente quando a data de início existe nos
  dois horizontes.
- Períodos presentes em apenas um horizonte devem aparecer esmaecidos e não
  devem contar como diferença.
- No modo `estagio`, compare o índice numérico diretamente. Esse modo é
  diagnóstico e não garante equivalência de calendário.
- Para `renovaveis.*`, `PerIni` só pode ser convertido em data quando há um
  DADGER em cada lado. Use `info_dadger.datas_estagios` do mesmo lado; nunca
  associe o arquivo de renováveis ao calendário do deck oposto.
- Sem os dois DADGERs, a comparação de renováveis deve permanecer disponível,
  mas somente pelo número de `PerIni`.
- `UH` representa condições iniciais. No modo `data`, compare UH apenas quando
  os dois arquivos possuem o mesmo `DT`.
- `RQ` é temporal, com um valor por estágio.
- `VI` é histórico para tempo de viagem e não deve ser tratado como horizonte
  futuro.

Exemplo obrigatório de regressão temporal:

```text
RV0 com DT 31/01/2026: estágio 6 começa em 07/03/2026
RV3 com DT 21/02/2026: estágio 3 começa em 07/03/2026

No modo data, estágio 6 deve ser comparado ao estágio 3.
```

## Regras para parsers

Os parsers estruturados ficam em `src/utils/parsers`.

- O DADGER é posicional. Confirme índices usando um arquivo real e uma
  especificação ou gerador confiável antes de alterar `slice`.
- Use `parseIntegerField` e `parseDecimalField` de `parserUtils.js`.
- Campo vazio deve ser `null`.
- Zero deve permanecer zero. Nunca use `parseFloat(...) || null`,
  `parseInt(...) || null` ou defaults que transformem zero em ausência.
- Não invente valores para campos em branco.
- Não presuma 24 estágios.
- Não presuma cinco patamares. Obtenha a quantidade a partir do `DP`.
- Arrays temporais devem ter exatamente `info_dadger.numero_estagios`
  posições.
- Ao fazer forward-fill, agrupe pela identidade completa da entidade.
- Se a identidade tiver mais de um campo, use chave composta sem colisões.
- Fatores e coeficientes devem ser herdados individualmente pela identidade de
  cada item; atualizar um item não pode apagar os demais.
- Registros pais inválidos devem interromper a associação com seus filhos.
- Preserve ocorrências repetidas. Não use `Map` de chave não exclusiva de modo
  que a última linha sobrescreva as anteriores.
- Linhas ativas de duas letras sem parser estruturado devem permanecer em
  `OUTROS`.
- `parseDadger` deve rejeitar arquivos sem `DT` válido ou sem `DP` válido.
- Suporte finais de linha LF e CRLF.

## Semântica dos blocos

- `DP`: carga, horas e quantidade de patamares por estágio/subsistema.
- `PQ`: forward-fill por fonte+subsistema; agregação separada de Pesada, Média
  e Leve. Não some patamares diferentes em um “total”.
- `CT`: forward-fill por usina; nome e subsistema também são comparáveis.
- `IA`: identidade é subsistema de origem+destino; patamares são dinâmicos.
- `UH`: preserve campos opcionais e o status, como `NW`.
- `MP` e `FD`: Itaipu usa usina+conjunto 50/60 como identidade.
- `RE`: conjunto `RE/LU/FU/FT/FI/FE`.
- `HQ`: conjunto `HQ/LQ/CQ`.
- `HV`: conjunto `HV/LV/CV`.
- `RI`: identidade é usina+subsistema.
- `HE`: associe `CM` pelo número da restrição a todas as linhas `HE`
  correspondentes, não apenas à linha imediatamente anterior.
- `AC`: a chave mnemônico+período não é necessariamente única; preserve e
  alinhe todas as ocorrências.
- `OUTROS`: alinhe sequências de modo que uma inserção não desloque todas as
  linhas seguintes.

## Regras para comparação

- Centralize alinhamento e igualdade em `src/utils/comparison.js` ou nos
  composables existentes.
- `null` e `undefined` representam ausência equivalente.
- Compare o conteúdo de fatores e coeficientes, não apenas a quantidade.
- Ao comparar pela mesma data, ignore o número do estágio contido em objetos
  derivados.
- Coleções de fatores semanticamente não ordenadas devem ser comparadas sem
  depender da ordem das linhas.
- Use índices `Map` para alinhamentos grandes; evite `find` aninhado em loops de
  entidade × tempo.
- `rowHasDifferences` em `useBlockComparison.js` é a fonte única do filtro
  “mostrar apenas diferenças”.
- Ausência de entidade em uma temporalidade comum é diferença.
- Ausência causada apenas por horizontes diferentes não é diferença.
- Blocos estáticos presentes em apenas um arquivo são diferenças.

## Componentes Vue

- `ComparisonView.vue` apenas orquestra blocos.
- Use `ComparisonBlockHeader.vue` em todos os blocos. O cabeçalho precisa ser
  acionável por teclado, expor `aria-expanded` e indicar se há alterações.
- TI, MP, FD, VE e RQ usam `StageArrayBlock.vue`; não recrie componentes quase
  idênticos para esses formatos.
- Reutilize:
  - `useTemporalComparison` para entidade com array por estágio;
  - `useEntityTemporalComparison` para entidade × tempo;
  - `useBlockComparison` para filtro, ordenação, collapse e scroll.
- Um bloco deve ser renderizado quando houver dados em qualquer um dos dois
  arquivos, não apenas em ambos.
- Destaque somente células comparáveis.
- Células fora do horizonte compartilhado devem ser esmaecidas.
- Toda propriedade analisada pelo parser deve ser comparada ou ter uma decisão
  explícita documentada para ser ignorada.
- Não serialize objetos de domínio diretamente na interface. Para listas
  extensas de fatores ou coeficientes, agrupe por tipo e contexto e use rótulos
  de domínio, como faz `restrictionDisplay.js`.
- Zero é um valor visível. Em templates, prefira `??` a `||` ao aplicar o
  placeholder `-`.
- Estados de erro de upload devem aparecer junto ao campo; não use `alert`.
- Cada área de upload representa um conjunto e aceita até um arquivo por tipo.
  Substituir ou remover o DADGER não pode remover silenciosamente o arquivo de
  renováveis, nem o inverso.
- Valide tabelas lado a lado em desktop e empilhadas abaixo de 900 px.

## Testes

- Use `node:test` em `tests/`.
- Toda correção de bug deve incluir um teste de regressão mínimo.
- Prefira linhas posicionais pequenas construídas no próprio teste.
- Não faça a suíte depender de diretórios irmãos ou arquivos privados.
- Além de testes sintéticos, verificações manuais podem usar decks reais
  locais, mas esses caminhos não devem ser gravados na suíte.
- Cubra, conforme aplicável:
  - datas-base diferentes com período comum;
  - último estágio mensal;
  - zero versus campo vazio;
  - campos de dois dígitos alinhados à direita, como subsistema 11;
  - chaves compostas;
  - registros repetidos;
  - forward-fill parcial;
  - conteúdo alterado com a mesma quantidade de fatores;
  - inserção no meio de blocos de linhas.

## Referências externas

`~/code/myria/services/sinopse/montagem/monta_rv0` pode ser consultado para
entender como cada registro é montado e conferir layouts. Ele não é uma
dependência do RVZero.

- Não importe código de `myria`.
- Não modifique `myria` como parte de uma tarefa do RVZero.
- Não copie regras conjunturais específicas de um deck para o comparador.
- Quando o gerador e um arquivo real divergirem, registre a divergência e
  confirme o layout antes de decidir.

## Escopo e segurança

- Preserve alterações não relacionadas que já estejam no worktree.
- Não altere decks reais usados como amostra.
- Não faça commits automaticamente.
- Não inclua `node_modules`, `dist` ou dados operativos no Git.
- Evite dependências novas quando utilitários pequenos e testáveis forem
  suficientes.
- Mudanças de dependência exigem atualização de `package-lock.json`.
