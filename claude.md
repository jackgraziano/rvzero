# Guia de desenvolvimento

A regra central e o formato dos blocos estão documentados em
`ARCHITECTURE.md`. Antes de alterar um parser, confirme as posições no manual
do DECOMP ou em um gerador de DADGER válido.

Convenções:

- preservar zero e representar campo vazio como `null`;
- não assumir 24 estágios nem cinco patamares;
- comparar por data somente quando a data existe nos dois horizontes;
- não transformar ausência de horizonte em diferença;
- usar chaves compostas quando a identidade do registro tiver mais de um campo;
- aplicar forward-fill por entidade, nunca globalmente;
- comparar conteúdo de fatores e coeficientes, não apenas sua quantidade;
- adicionar teste de regressão para cada correção de parser ou temporalidade;
- executar `npm test`, `npm run build` e `npm audit` antes de entregar.
