# Plano para uso programático do RVZero

## Objetivo

Transformar o mecanismo de comparação do RVZero em um núcleo JavaScript
independente da interface, permitindo que ele seja:

- usado pela aplicação Vue atual;
- importado por outros projetos Node.js ou aplicações web;
- usado futuramente por uma CLI;
- usado futuramente por uma API HTTP;
- mantido e testado como uma única implementação das regras de negócio.

O site continuará sendo compilado pelo Vite e publicado como aplicação
estática no GitHub Pages.

## Resultado esperado

Um consumidor deverá conseguir executar:

```js
import { compareDeckSets } from 'rvzero/core'

const report = compareDeckSets(
  {
    left: [
      { name: 'dadger.rv1', content: dadgerRv1 },
      { name: 'dadgnl.rv1', content: dadgnlRv1 },
      { name: 'renovaveis.csv', content: renovaveisRv1 }
    ],
    right: [
      { name: 'dadger.rv4', content: dadgerRv4 },
      { name: 'dadgnl.rv4', content: dadgnlRv4 },
      { name: 'renovaveis.csv', content: renovaveisRv4 }
    ]
  },
  {
    mode: 'data',
    includeEqual: false,
    includeOutsideCommonHorizon: true
  }
)
```

O núcleo receberá nomes e conteúdos textuais. Leitura de arquivos do navegador,
filesystem, ZIP ou rede ficará a cargo de adaptadores externos.

## Princípios

1. O núcleo não pode importar Vue nem depender do DOM.
2. Site e consumidores externos devem usar os mesmos comparadores.
3. O resultado público não deve expor detalhes de apresentação dos componentes.
4. Data, estágio e semana originais devem ser preservados no relatório.
5. Registros fora do horizonte comum devem ser classificados explicitamente.
6. O contrato de saída deve possuir versão.
7. Uma migração incremental não pode interromper o site ou o GitHub Pages.
8. Parsers e comparadores devem continuar preservando zero e campos ausentes.

## Estado atual

Já são reutilizáveis fora da interface:

- parsers DADGER, DADGNL e renováveis;
- utilitários de calendário;
- alinhamentos básicos por estágio e data;
- comparação de renováveis;
- comparação de DADGNL;
- formatação e igualdade semântica.

Ainda precisam ser extraídas dos componentes Vue:

- comparação de `DP`;
- comparação de `PQ`;
- comparação de `CT`;
- comparação de `IA`;
- comparação de `UH`;
- comparação de `RI`;
- comparação de `HE`;
- comparação de `AC`;
- comparação de `OUTROS`;
- apresentação temporal de `RE`, `HQ`, `HV` e blocos de arrays.

Os composables `useTemporalComparison`, `useEntityTemporalComparison` e partes
de `useBlockComparison` ainda misturam regra de comparação com reatividade e
comportamento de interface.

## Arquitetura-alvo

```text
src/
├── core/
│   ├── index.js
│   ├── compareDeckSets.js
│   ├── contract/
│   │   ├── report.js
│   │   └── report.schema.json
│   ├── parsers/
│   ├── comparators/
│   │   ├── dadger/
│   │   ├── dadgnl/
│   │   └── renovaveis/
│   ├── temporal/
│   └── report/
├── components/
├── composables/
├── adapters/
│   └── browserFiles.js
└── App.vue

tests/
├── core/
├── contract/
└── front/
```

Não é necessário mover todos os arquivos imediatamente. A estrutura pode ser
alcançada gradualmente, preservando imports de compatibilidade durante a
migração.

## Contrato de entrada

```js
{
  left: Array<{
    name: string,
    content: string
  }>,
  right: Array<{
    name: string,
    content: string
  }>
}
```

Opções iniciais:

```js
{
  mode: 'data' | 'estagio',
  includeEqual: boolean,
  includeOutsideCommonHorizon: boolean
}
```

Regras:

- cada lado aceita no máximo um arquivo de cada tipo;
- o tipo é detectado pelo mesmo registro utilizado no upload;
- comparação por data exige um DADGER válido em cada lado;
- sem os dois DADGERs, DADGNL e renováveis continuam comparáveis por índice;
- arquivos duplicados, incompatíveis ou inválidos produzem erros estruturados;
- o núcleo não lê caminhos nem objetos `File`.

## Contrato de saída

Estrutura inicial proposta:

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

Cada ocorrência deve usar estados semânticos:

```text
equal
changed
only-left
only-right
outside-common-horizon
```

Exemplo:

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
    "geracaoPesado": {
      "left": 350,
      "right": 0,
      "changed": true
    }
  }
}
```

Períodos exclusivos devem permanecer separados de diferenças comparáveis:

```json
{
  "fileType": "dadgnl",
  "block": "GL",
  "status": "outside-common-horizon",
  "identity": {
    "codigoUsina": 86
  },
  "calendar": {
    "date": "12/09/2026",
    "leftIndex": null,
    "rightIndex": 8
  }
}
```

## Erros estruturados

O núcleo deve lançar ou retornar erros com código estável:

```json
{
  "code": "MISSING_DADGER_FOR_DATE_MODE",
  "message": "A comparação por data exige um DADGER em cada lado.",
  "side": null,
  "fileName": null
}
```

Códigos iniciais:

```text
UNSUPPORTED_FILE_TYPE
DUPLICATE_FILE_TYPE
INVALID_DADGER
INVALID_DADGNL
INVALID_RENOVAVEIS
MISSING_DADGER_FOR_DATE_MODE
NO_COMPARABLE_FILE_TYPES
```

## Fases de implementação

### Fase 1 — Contrato e fundação

Entregas:

- criar `src/core/index.js`;
- definir tipos por JSDoc;
- criar `report.schema.json`;
- definir erros públicos;
- criar `parseDeckSet(files)`;
- definir `compareDeckSets()` inicialmente sem todos os blocos.

Critérios de aceite:

- nenhum arquivo de `src/core` importa Vue;
- entrada inválida gera erro estruturado;
- DADGNL e renováveis funcionam pela nova API;
- contrato possui `schemaVersion`;
- testes validam o JSON contra exemplos sintéticos.

### Fase 2 — Extrair comparadores DADGER

Migrar bloco a bloco:

1. arrays temporais: `TI`, `MP`, `FD`, `VE`, `RQ`;
2. blocos temporais tabulares: `DP`, `PQ`, `CT`, `IA`, `RI`;
3. restrições: `RE`, `HQ`, `HV`, `HE`;
4. blocos especiais: `UH`, `AC`, `OUTROS`.

Para cada bloco:

- criar função pura em `src/core/comparators/dadger`;
- produzir ocorrências no contrato público;
- preservar os casos fora do horizonte comum;
- adaptar o componente Vue para consumir o resultado puro;
- remover a regra duplicada do componente;
- adicionar testes de regressão.

Critérios de aceite:

- todos os blocos exibidos pelo site estão presentes no relatório;
- componentes não calculam diferenças;
- site e núcleo retornam as mesmas contagens;
- modos Data e Estágio permanecem disponíveis.

### Fase 3 — Relatório agregado

Entregas:

- consolidar blocos DADGER, DADGNL e renováveis;
- calcular resumo global;
- ordenar resultados de maneira determinística;
- incluir nomes e tipos dos arquivos de origem;
- incluir avisos sobre horizontes e arquivos sem correspondente;
- permitir filtrar iguais sem perder contexto.

Critérios de aceite:

- a mesma entrada sempre produz JSON com a mesma ordem;
- `summary` corresponde ao conteúdo dos blocos;
- `outside-common-horizon` não aumenta a contagem de diferenças;
- estágio ou semana original de cada lado permanece disponível.

### Fase 4 — Migrar o frontend

Entregas:

- `App.vue` chama `compareDeckSets()`;
- componentes recebem resultados prontos;
- composables mantêm apenas estado visual, ordenação, filtros e scroll;
- upload continua usando `FileReader` somente no adaptador do navegador;
- mensagens de erro usam os códigos públicos.

Critérios de aceite:

- nenhuma regressão visual ou temporal;
- o processamento continua local;
- upload múltiplo continua funcionando;
- o build do GitHub Pages continua produzindo somente `dist/`;
- testes e build passam no workflow atual.

### Fase 5 — Empacotamento

Configurar exports:

```json
{
  "exports": {
    "./core": "./dist-core/index.js"
  }
}
```

Entregas:

- build separado do núcleo;
- pacote ESM compatível com Node.js 20 ou superior;
- nenhuma dependência de Vue no bundle do núcleo;
- exemplo de instalação local, Git e npm;
- política de versionamento semântico;
- changelog para alterações do contrato.

Critérios de aceite:

```js
import { compareDeckSets } from 'rvzero/core'
```

deve funcionar em um projeto Node.js limpo.

### Fase 6 — CLI opcional

Exemplo:

```bash
rvzero compare \
  --left ./DC202607-sem2 \
  --right ./DC202607-sem5 \
  --mode data \
  --output resultado.json
```

Opções:

```text
--format json|text
--include-equal
--include-outside-horizon
--fail-on-difference
```

A CLI será apenas um adaptador de filesystem sobre `compareDeckSets()`.

## Estratégia de migração

Cada bloco deve ser migrado em um commit pequeno:

```text
1. adicionar comparador puro e testes;
2. adaptar o componente para usar o comparador;
3. comparar contagens e resultados;
4. remover a implementação antiga;
5. executar testes e build.
```

Durante a migração, o site deve permanecer funcional. Não será criada uma
segunda implementação completa para depois substituir a primeira.

## Testes

### Testes unitários

- detecção dos três tipos de arquivo;
- parsing por conteúdo;
- alinhamento Data e Estágio;
- datas-base diferentes;
- horizonte comum e datas exclusivas;
- zero versus ausência;
- igualdade de coleções não ordenadas;
- forward-fill;
- identidades compostas;
- registros repetidos.

### Testes de contrato

- validação do JSON Schema;
- ordem determinística;
- códigos de erro;
- contagens do resumo;
- compatibilidade com `schemaVersion`.

### Testes de integração

- DADGER isolado;
- DADGNL isolado;
- renováveis isolado;
- combinações dos três tipos;
- comparação por data com DADGER;
- comparação por índice sem DADGER;
- arquivos presentes em apenas um lado.

### Validação com decks reais

Os decks reais não entram no repositório. Devem ser usados manualmente para:

- comparar resultados do site antes e depois da migração;
- conferir contagens por bloco;
- conferir estágios alinhados por data;
- conferir períodos fora do horizonte comum;
- confirmar que o relatório e a interface descrevem a mesma diferença.

## Compatibilidade com GitHub Pages

O deploy atual permanece:

```text
npm test
npm run build
upload de dist/
deploy no GitHub Pages
```

O núcleo será incluído no bundle do frontend pelo Vite. Nenhum servidor,
função dinâmica ou mudança de hospedagem é necessária.

## Versionamento

- pacote: versionamento semântico;
- relatório: `schemaVersion` independente;
- campos novos opcionais não exigem nova versão do schema;
- remoção, renomeação ou mudança semântica exige nova versão;
- erros públicos mantêm códigos estáveis.

## Documentação pública

Adicionar ao README:

- instalação;
- uso em Node.js;
- uso em navegador;
- contrato de entrada;
- exemplo de relatório;
- semântica do horizonte comum;
- lista de blocos suportados;
- política de compatibilidade.

Criar exemplos executáveis:

```text
examples/
├── node-basic/
├── browser-basic/
└── cli/
```

Os exemplos devem usar dados sintéticos, nunca decks operativos.

## Riscos

### Contrato acoplado à interface

Mitigação: não publicar campos como `dadger1`, `dadger2`, `display` ou
`diff_campo`. Usar nomes de domínio e estados semânticos.

### Divergência entre site e biblioteca

Mitigação: o site deve consumir o núcleo; não manter comparadores paralelos.

### Alteração silenciosa de semântica

Mitigação: testes de contrato, `schemaVersion` e casos explícitos para horizonte
comum.

### Resultado excessivamente grande

Mitigação: `includeEqual` desativado por padrão e possibilidade de selecionar
tipos ou blocos.

### Dependência acidental de APIs do navegador

Mitigação: núcleo recebe strings e objetos simples. `File`, `FileReader`,
filesystem e download ficam em adaptadores.

## Estimativa

Para um desenvolvedor familiarizado com o projeto:

| Escopo | Estimativa |
| --- | --- |
| MVP importável com contrato inicial | 4–6 dias |
| Todos os blocos e frontend migrado | 7–10 dias |
| Empacotamento, documentação e robustez para terceiros | 8–12 dias |
| CLI opcional | +1–2 dias |

As estimativas pressupõem manutenção do comportamento atual e ausência de
mudanças adicionais na semântica dos blocos durante a extração.

## Definição de pronto

O trabalho estará concluído quando:

1. outro projeto conseguir importar `rvzero/core`;
2. `compareDeckSets()` aceitar conteúdos DADGER, DADGNL e renováveis;
3. todos os blocos atualmente exibidos pelo site estiverem no relatório;
4. o site usar o mesmo núcleo publicado;
5. não houver dependência de Vue ou DOM no núcleo;
6. o JSON possuir contrato e versão documentados;
7. testes, build e `git diff --check` passarem;
8. o deploy no GitHub Pages continuar inalterado.
