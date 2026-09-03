# Power BI: Painel de Indicadores do Almoxarifado

Projeto completo e pronto para implementação: escopo, modelo de dados, banco, consultas de extração, biblioteca de medidas, especificação visual, governança e base de dados de exemplo para homologação.

---

## O que está incluso

| Entregável | Onde está | Conteúdo |
|------------|-----------|----------|
| Escopo do projeto | `docs/01-escopo-projeto.md` | Objetivos, perfis de acesso, fontes, regras de negócio, cronograma, riscos, critérios de aceite |
| Dicionário de indicadores | `docs/02-dicionario-indicadores.md` | 82 indicadores com definição, fórmula, medida DAX, meta e direção |
| Modelo de dados | `docs/03-modelo-dados.md` | Esquema estrela com 8 dimensões, 6 fatos, relacionamentos e volumetria |
| Layout do dashboard | `docs/04-layout-dashboard.md` | Wireframe das 12 páginas com visuais, campos e formatação |
| Governança e segurança | `docs/05-governanca-rls-publicacao.md` | RLS, workspaces, atualização, nomenclatura, otimização, checklist |
| Plano de implementação | `docs/06-plano-implementacao.md` | Passo a passo em 9 etapas com estimativa de esforço |
| Banco de dados | `sql/` | DDL do schema analítico e views de consumo |
| Extração e tratamento | `powerquery/` | Código M de parâmetros, calendário, dimensões e fatos |
| Biblioteca de medidas | `dax/` | 11 arquivos com 248 definições comentadas entre medidas, colunas e tabelas |
| Tema visual | `tema/tema-almoxarifado.json` | Tema corporativo pronto para aplicar |
| Base de exemplo | `dados-exemplo/` | Gerador Python e 15 arquivos CSV com 24 meses de histórico |
| Apresentação do projeto | `apresentacao-projeto.html` | Página única para apresentar o escopo à gestão |

---

## Início rápido em 30 minutos

Para ver o painel funcionando antes de conectar ao ERP:

```bash
cd dados-exemplo
python3 gerar_dados.py
```

No Power BI Desktop:

1. **Obter dados > Texto/CSV**, importe os 15 arquivos gerados.
   Configure delimitador **ponto e vírgula**, origem **65001: Unicode (UTF-8)** e localidade **Português (Brasil)**.
2. Crie os relacionamentos conforme a seção 5 de `docs/03-modelo-dados.md`.
3. Marque `dCalendario` como tabela de datas.
4. Cole as medidas dos arquivos de `dax/`, na ordem numérica.
5. Aplique o tema `tema/tema-almoxarifado.json`.
6. Monte as páginas seguindo `docs/04-layout-dashboard.md`.

A base de exemplo é calibrada para produzir indicadores realistas, com metas batidas e metas em aberto, o que permite testar toda a formatação condicional do painel.

---

## Indicadores da base de exemplo

Resultado da última posição gerada (agosto de 2026), útil para conferir se a carga ficou correta:

| Indicador | Valor | Meta | Situação |
|-----------|-------|------|----------|
| Valor de estoque | R$ 13,92 milhões | Referência | ● |
| Giro de estoque (12 meses) | 5,49 x | Acima de 4,00 x | Dentro |
| Cobertura | 68 dias | 30 a 60 dias | Acima da faixa |
| Fill Rate | 96,4% | Acima de 95% | Dentro |
| OTIF | 93,9% | Acima de 90% | Dentro |
| Taxa de ruptura | 0,8% | Abaixo de 3% | Dentro |
| Pontualidade do fornecedor | 88,8% | Acima de 92% | Fora |
| Acuracidade de inventário | 96,1% | Acima de 98% | Fora |
| Estoque sem giro | 11,1% do valor | Abaixo de 8% | Fora |

Volumetria gerada: 59 mil linhas de fato distribuídas em 250 itens, 345 combinações de item e depósito, 24 meses de histórico. A base inclui transferências entre depósitos, perdas, ajustes e pedidos em aberto, de modo que todas as regras de negócio do projeto possam ser exercitadas.

As três metas em aberto são propositais. Elas dão material real para as páginas de ação do painel e mostram como a formatação condicional se comporta em cenário desfavorável.

---

## Estrutura de indicadores

O painel cobre nove blocos:

1. **Posição e valor de estoque:** capital imobilizado, SKUs, mínimos, máximos, excesso
2. **Movimentação e consumo:** entradas, saídas, ajustes, perdas, consumo médio
3. **Giro, cobertura e obsolescência:** giro, DIO, itens sem giro, custo de carregamento
4. **Nível de serviço:** Fill Rate, OTIF, tempo de atendimento, backlog, ruptura
5. **Compras e fornecedores:** lead time, pontualidade, devolução, IQF, concentração
6. **Centro de custo e orçamento:** realizado versus orçado, projeção, ranking
7. **Inventário e acuracidade:** IAE, acuracidade financeira, divergências
8. **Classificação estratégica:** curva ABC, curva XYZ, matriz, ponto de pedido, lote econômico
9. **Qualidade de dados:** pendências de cadastro que impedem o cálculo correto

---

## Decisões técnicas relevantes

**Snapshot de estoque com tratamento semi-aditivo.** A tabela de posição nunca é somada ao longo do tempo. Todas as medidas de saldo usam `LASTNONBLANK`. Somar o snapshot é o erro mais frequente em painéis de estoque e multiplica o valor pelo número de dias do período.

**Consumo separado de saída.** Transferência entre depósitos é saída, mas não é consumo. A dimensão de tipo de movimento carrega a marcação `ContaConsumo`, e todo cálculo de giro, cobertura e curva ABC filtra por ela. Sem essa separação, o giro fica inflado.

**Flags de nível de serviço calculadas na origem.** As marcações de atendido, no prazo e OTIF são resolvidas em SQL, não em DAX. Colunas de dois valores são comprimidas com eficiência máxima pelo VertiPaq, o que reduz o modelo e acelera as medidas.

**Curvas ABC e XYZ em duas versões.** Coluna calculada para uso em segmentações e eixos, que é rápida, e medida dinâmica para reclassificação conforme o filtro aplicado, que é mais pesada. Cada uma tem seu lugar e o arquivo indica qual usar.

**Carga incremental na maior tabela.** A movimentação de estoque é configurada para armazenar 3 anos e atualizar apenas os últimos 10 dias, o que é o maior ganho isolado de desempenho da solução.

**Parâmetros de reposição sugeridos versus cadastrados.** O painel calcula ponto de pedido e estoque de segurança a partir do histórico real e compara com o que está no ERP. A diferença entre os dois é a lista de ajustes de cadastro que resolve ruptura e excesso ao mesmo tempo.

---

## Adaptação ao seu ERP

O modelo foi desenhado para ser agnóstico. Para conectar ao seu sistema:

1. Mapeie as tabelas do ERP para as tabelas do schema `bi` descritas em `docs/03-modelo-dados.md`.
2. Classifique os tipos de movimento nas colunas `Natureza`, `GrupoMovimento` e `ContaConsumo`. Esta é a etapa que mais impacta a qualidade dos indicadores.
3. Se o ERP não mantém snapshot histórico de saldo, gere `fPosicaoEstoque` por acumulação das movimentações em uma rotina noturna.
4. Ajuste os nomes de coluna nas consultas de `powerquery/`.

Referências de tabela por ERP:

| ERP | Movimentação | Saldo | Item |
|-----|-------------|-------|------|
| SAP MM | MSEG e MKPF | MARD e MBEW | MARA e MARC |
| Protheus | SD3 | SB2 | SB1 |
| Senior | E210 | E210SLD | E070 |

---

## Requisitos

* Power BI Desktop, versão de setembro de 2024 ou superior
* Python 3.8 ou superior, apenas para gerar a base de exemplo (usa somente biblioteca padrão)
* Licença Power BI Pro para publicação
* Gateway de dados local, se a fonte for um banco no ambiente interno
