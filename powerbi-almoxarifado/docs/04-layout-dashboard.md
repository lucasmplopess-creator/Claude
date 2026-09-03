# Layout do Dashboard: Wireframe e Especificação Visual

Especificação página a página. Cada bloco indica o visual, os campos, as medidas e as configurações de formatação.

**Resolução base:** 1280 x 720 (16:9). **Grade:** 12 colunas com espaçamento de 8 px. **Margem externa:** 16 px.

---

## Padrão visual aplicado em todas as páginas

| Elemento | Especificação |
|----------|---------------|
| Fundo da página | #F5F6F8 |
| Cartões e visuais | Fundo #FFFFFF, borda #E3E6EA, raio 8 px, sombra suave |
| Título de página | Segoe UI Semibold 20 px, cor #1F2933 |
| Título de visual | Segoe UI Semibold 12 px, cor #52606D |
| Rótulo de KPI | Segoe UI Bold 28 px, cor #1F2933 |
| Cor primária | #0B5FFF |
| Positivo | #1B8A5A | Atenção | #E8A33D | Negativo | #C0392B |
| Barra de navegação | Faixa lateral esquerda de 64 px com botões de página |
| Rodapé | Medida `Última Atualização` alinhada à direita, 10 px, cor #7B8794 |

**Regra de leitura:** o olho percorre a página em Z. Coloque o KPI mais importante no canto superior esquerdo e o detalhamento no rodapé.

---

## Página 1: Capa

| Posição | Elemento | Detalhe |
|---------|----------|---------|
| Centro | Título | "Painel de Indicadores do Almoxarifado" |
| Abaixo do título | Subtítulo | Nome da empresa e período de análise |
| Faixa central | 6 botões de navegação | Um para cada página principal, com ícone e rótulo |
| Rodapé | Última atualização e responsável pelo painel | Medida `Última Atualização` |

Configure cada botão com Ação do tipo Indicador (bookmark) ou Navegação de página.

---

## Página 2: Visão Executiva

**Objetivo:** responder em 10 segundos se o almoxarifado está saudável.

### Linha 1: filtros (altura 48 px)
Segmentações no formato lista suspensa: Período (dCalendario[AnoMesNome]), Depósito, Categoria, Centro de Custo. Adicione um botão "Limpar filtros" com ação de indicador.

### Linha 2: cartões de KPI (altura 110 px, 4 cartões de 296 px)

| Cartão | Medida principal | Rótulo secundário | Cor condicional |
|--------|------------------|-------------------|-----------------|
| Valor em Estoque | `Valor Estoque` | `Rótulo Var Estoque MoM` | `Cor Var Consumo MoM` |
| Giro de Estoque | `Giro 12 Meses` | Meta: `Meta Giro` | Verde se maior ou igual à meta |
| Cobertura | `Cobertura Dias` | Faixa ideal 30 a 60 dias | `Cor Cobertura` |
| Consumo do Período | `Valor Consumo` | `Rótulo Var Consumo MoM` | `Cor Var Consumo MoM` |

### Linha 3: cartões de nível de serviço (altura 110 px, 4 cartões)

| Cartão | Medida | Cor condicional |
|--------|--------|-----------------|
| Fill Rate | `Fill Rate %` | `Cor Fill Rate` |
| OTIF | `OTIF %` | `Cor OTIF` |
| Acuracidade de Inventário | `Acuracidade Inventário %` | `Cor Acuracidade` |
| Estoque sem Giro | `% Estoque sem Giro` | `Cor Estoque sem Giro` |

Use o visual Cartão novo (Card visual) com rótulo de referência apontando para a medida de meta.

### Linha 4: gráficos (altura 280 px)

| Visual | Tipo | Eixo | Valores |
|--------|------|------|---------|
| Evolução de estoque e consumo | Colunas agrupadas e linha | `dCalendario[AnoMesNome]` | Colunas: `Valor Consumo`. Linha: `Valor Estoque` |
| Composição do estoque | Barras empilhadas 100% | `dItem[Categoria]` | `Valor Estoque` segmentado por `dItem[ClasseABC]` |
| Top 10 itens por consumo | Barras horizontais | `dItem[ItemCompleto]` | `Valor Consumo`, filtro Top N = 10 |

### Linha 5: alertas (altura 90 px)
Cartão de texto com a medida `Status Geral Almoxarifado` e três cartões pequenos: `Itens Abaixo do Mínimo`, `Itens em Ruptura`, `Pedidos Atrasados`. Cada um com ação de drill-through para a página de itens críticos.

---

## Página 3: Posição de Estoque

| Área | Visual | Configuração |
|------|--------|--------------|
| Topo | 4 cartões | `Valor Estoque`, `Saldo Quantidade`, `SKUs com Saldo`, `Custo Médio Unitário` |
| Esquerda | Treemap | Categoria e subcategoria por `Valor Estoque` |
| Centro | Gráfico de dispersão | Eixo X: `Cobertura Dias`, Eixo Y: `Valor Estoque`, tamanho: `Qtd Consumo 12M`, legenda: `dItem[ClasseABC]` |
| Direita | Gráfico de rosca | `Valor Estoque` por `fPosicaoEstoque[FaixaAging]` |
| Rodapé | Matriz | Linhas: Categoria e Item. Colunas: `Saldo Quantidade`, `Valor Estoque`, `Cobertura Dias`, `Faixa de Cobertura`, `Estoque Mínimo Total`, `Classe ABC` |

**Formatação condicional da matriz:** aplique barras de dados em `Valor Estoque` e conjunto de ícones em `Faixa de Cobertura`.

O gráfico de dispersão é o visual mais revelador desta página. Itens no quadrante superior direito têm muito capital parado com cobertura alta, ou seja, são os primeiros candidatos a redução de compra.

---

## Página 4: Movimentação

| Área | Visual | Configuração |
|------|--------|--------------|
| Topo | 4 cartões | `Qtd Movimentações`, `Valor Entrada`, `Valor Saída`, `Valor Líquido Período` |
| Linha 2 esquerda | Colunas agrupadas | Eixo: `dCalendario[AnoMesNome]`. Valores: `Valor Entrada` e `Valor Saída` |
| Linha 2 direita | Gráfico de cascata | Categoria: `dTipoMovimento[GrupoMovimento]`. Valor: `Valor Líquido Período` |
| Linha 3 esquerda | Mapa de árvore | `dTipoMovimento[DescricaoMovimento]` por `Qtd Movimentações` |
| Linha 3 direita | Colunas | `Valor Perdas` e `Valor Ajustes` por mês, com linha de `% Perdas sobre Consumo` |
| Rodapé | Tabela | Data, Documento, Item, Depósito, Tipo, Quantidade, Valor |

---

## Página 5: Requisições e Nível de Serviço

| Área | Visual | Configuração |
|------|--------|--------------|
| Topo | 5 cartões | `Qtd Requisições`, `Fill Rate %`, `OTIF %`, `Tempo Médio Atendimento (h)`, `Requisições Pendentes` |
| Linha 2 esquerda | Linha e colunas | Colunas: `Qtd Itens Requisitados`. Linhas: `Fill Rate %` e `OTIF %` por mês, com linha constante nas metas |
| Linha 2 direita | Gráfico de funil | Solicitado, Atendido, Atendido no prazo |
| Linha 3 esquerda | Barras horizontais | `Fill Rate %` por `dCentroCusto[NomeCentroCusto]` |
| Linha 3 direita | Barras horizontais | `Itens em Ruptura` por `dItem[Categoria]` |
| Rodapé | Tabela de backlog | Requisição, Data, Dias em aberto, Item, Solicitante, Centro de Custo, Quantidade pendente. Ordenada por dias em aberto decrescente |

**Alerta configurado:** no Power BI Service, crie alerta no cartão de Fill Rate para disparar e-mail quando ficar abaixo de 95%.

---

## Página 6: Compras e Fornecedores

| Área | Visual | Configuração |
|------|--------|--------------|
| Topo | 5 cartões | `Valor Compras`, `Lead Time Médio (dias)`, `Pontualidade Fornecedor %`, `Pedidos em Aberto`, `Valor em Trânsito` |
| Linha 2 esquerda | Barras horizontais | Top 10 fornecedores por `Valor Compras` com `% Participação Fornecedor` no rótulo |
| Linha 2 direita | Dispersão | Eixo X: `Lead Time Médio (dias)`, Eixo Y: `Pontualidade Fornecedor %`, tamanho: `Valor Compras`, legenda: `Classificação Fornecedor` |
| Linha 3 esquerda | Colunas | `Lead Time Médio (dias)` vs `Lead Time Padrão (dias)` por fornecedor |
| Linha 3 direita | Linha | Evolução de `Preço Médio Aquisição` por mês para o item selecionado |
| Rodapé | Matriz de fornecedores | Fornecedor, `Valor Compras`, `Lead Time Médio (dias)`, `Pontualidade Fornecedor %`, `Taxa de Devolução %`, `IQF Fornecedor`, `Classificação Fornecedor` |

A dispersão de lead time contra pontualidade separa quatro perfis de fornecedor. O quadrante inferior direito (lead time alto e pontualidade baixa) é a pauta imediata de renegociação.

---

## Página 7: Consumo por Centro de Custo

| Área | Visual | Configuração |
|------|--------|--------------|
| Topo | 4 cartões | `Realizado Período`, `Orçamento Período`, `Saldo Orçamentário`, `% Realizado sobre Orçado` |
| Linha 2 | Gráfico de barras com linha de meta | `Realizado Período` por centro de custo, com `Orçamento Período` como linha |
| Linha 3 esquerda | Matriz hierárquica | Diretoria, Gerência, Centro de Custo, com `Realizado Período`, `Orçamento Período`, `% Realizado sobre Orçado`, `Status Orçamentário` |
| Linha 3 direita | Gráfico de área | Evolução mensal de `Realizado Acumulado YTD` e `Orçamento Acumulado YTD` |
| Rodapé | Cartão de projeção | `Projeção Consumo Ano` e `Projeção sobre Orçamento Anual` |

**Formatação condicional:** aplique `Status Orçamentário` como conjunto de ícones na matriz.

---

## Página 8: Inventário e Acuracidade

| Área | Visual | Configuração |
|------|--------|--------------|
| Topo | 5 cartões | `Itens Inventariados`, `Acuracidade Inventário %`, `Acuracidade Financeira %`, `Divergência Valor`, `Cobertura Inventário %` |
| Linha 2 esquerda | Linha | Evolução mensal de `Acuracidade Inventário %` com linha de meta em 98% |
| Linha 2 direita | Colunas divergentes | `Divergência Positiva` e `Divergência Negativa` por mês |
| Linha 3 esquerda | Barras | `Acuracidade Inventário %` por `dItem[ClasseABC]` com `Meta Acuracidade por Curva` |
| Linha 3 direita | Barras | Divergência por depósito |
| Rodapé | Tabela de divergências | Item, Depósito, Ciclo, Quantidade sistema, Quantidade contada, Divergência, Divergência em valor, Contador. Ordenada por divergência absoluta decrescente |

---

## Página 9: Itens Críticos e Ruptura

Página operacional, pensada para uso diário pela coordenação.

| Área | Visual | Configuração |
|------|--------|--------------|
| Topo | 4 cartões | `Itens Abaixo do Mínimo`, `Itens no Ponto de Pedido`, `Itens Zerados`, `SKUs com Ruptura` |
| Corpo | Tabela de ação | Item, Depósito, `Saldo Disponível`, `Estoque Mínimo Total`, `Ponto de Pedido Sugerido`, `Cobertura Dias`, `Quantidade Sugerida de Compra`, `Valor Sugerido de Compra`, Fornecedor preferencial, `Lead Time Padrão (dias)` |
| Lateral | Filtros rápidos | Criticidade, Curva ABC, Depósito |

**Regra de destaque:** aplique fundo vermelho claro nas linhas com `Cobertura Dias` menor que 15 e amarelo entre 15 e 30.

Esta é a página que gera ação. Configure a exportação para Excel habilitada e oriente a equipe a usá-la como lista diária de compra.

---

## Página 10: Classificação ABC e XYZ

| Área | Visual | Configuração |
|------|--------|--------------|
| Topo | 3 cartões | Contagem de itens em cada classe A, B e C |
| Linha 2 esquerda | Gráfico de Pareto | Colunas: `Valor Consumo 12M` por item. Linha: `% Acumulado ABC` |
| Linha 2 direita | Matriz ABC x XYZ | Linhas: `dItem[ClasseABC]`. Colunas: `dItem[ClasseXYZ]`. Valores: contagem de itens e `Valor Estoque` |
| Rodapé | Tabela | Item, Classe ABC, Classe XYZ, Matriz, `Estratégia de Reposição`, `Valor Consumo 12M`, `Coef Variação Consumo`, `Estoque Segurança Sugerido`, `Ponto de Pedido Sugerido`, `Gap Ponto de Pedido` |

A coluna `Gap Ponto de Pedido` é o entregável mais acionável de todo o painel: mostra exatamente quais parâmetros do ERP estão desatualizados e em quanto.

---

## Página 11: Detalhamento Analítico

Tabela única com todos os campos, pensada para exportação. Habilite "Exportar dados" nas configurações do relatório.

Colunas: Data, Documento, Tipo de Movimento, Item, Descrição, Categoria, Curva ABC, Depósito, Centro de Custo, Fornecedor, Quantidade, Custo Unitário, Valor Total.

---

## Página 12: Glossário de Indicadores

Tabela estática com Indicador, Definição, Fórmula e Meta. Elimina dúvidas recorrentes e reduz a dependência da equipe de BI para explicar o cálculo.

---

## Páginas de drill-through

### Drill-through: Detalhe do Item
Campo de drill-through: `dItem[ItemCompleto]`.

| Área | Conteúdo |
|------|----------|
| Cabeçalho | Código, descrição, categoria, unidade, curva ABC e XYZ, criticidade |
| Cartões | `Saldo Quantidade`, `Valor Estoque`, `Cobertura Dias`, `Consumo Médio Mensal Qtd` |
| Gráfico | Evolução do saldo e do consumo mensal nos últimos 12 meses |
| Parâmetros | Comparativo entre mínimo, máximo e ponto de pedido cadastrados versus sugeridos |
| Tabela | Últimas 50 movimentações do item |

### Drill-through: Detalhe do Fornecedor
Campo: `dFornecedor[RazaoSocial]`. Cartões de IQF, lead time, pontualidade e devolução, mais o histórico de pedidos.

### Drill-through: Detalhe do Centro de Custo
Campo: `dCentroCusto[NomeCentroCusto]`. Consumo mensal, orçado versus realizado e os 20 itens mais consumidos pela área.

---

## Dicas de tooltip personalizado

Crie uma página com tamanho de tooltip (320 x 240) contendo:
* Nome do item
* Minigráfico de consumo dos últimos 12 meses
* `Cobertura Dias` e `Classe ABC`
* `Ponto de Pedido Sugerido`

Ative em cada visual: Formatação > Dica de ferramenta > Tipo Página de relatório > selecione a página criada.

---

## Checklist de acessibilidade e desempenho

* Ordem de tabulação definida em cada página (Exibição > Painel de seleção > Ordem de tabulação)
* Texto alternativo preenchido em todos os visuais
* Contraste mínimo de 4,5 para 1 entre texto e fundo
* Máximo de 12 visuais por página, para manter o tempo de renderização abaixo de 5 segundos
* Interações entre visuais revisadas: desative o realce cruzado onde ele não agrega
* Segmentações com "Selecionar tudo" desabilitado nos filtros de alta cardinalidade
