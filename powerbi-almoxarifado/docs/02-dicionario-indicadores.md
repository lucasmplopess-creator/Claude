# Dicionário de Indicadores do Almoxarifado

Documento de referência com definição, fórmula de negócio, medida DAX correspondente, meta sugerida e responsável por cada indicador.

**Legenda de direção:** ▲ quanto maior melhor | ▼ quanto menor melhor | ● manter na faixa

---

## Bloco 1: Posição e Valor de Estoque

| # | Indicador | Definição | Fórmula de negócio | Medida DAX | Meta sugerida | Dir. |
|---|-----------|-----------|--------------------|------------|---------------|------|
| 1.1 | Valor Total do Estoque | Capital imobilizado na data selecionada | Soma de (saldo x custo médio) na última data do período | `Valor Estoque` | Definida pela Controladoria | ● |
| 1.2 | Quantidade Total em Estoque | Volume físico total | Soma do saldo de todos os itens e depósitos | `Saldo Quantidade` | Sem meta | ● |
| 1.3 | SKUs Ativos | Itens distintos com saldo maior que zero | Contagem distinta de item com saldo positivo | `SKUs com Saldo` | Sem meta | ● |
| 1.4 | Estoque Médio | Média do valor de estoque no período | Média mensal do valor de estoque | `Estoque Médio Valor` | Sem meta | ● |
| 1.5 | Valor por Curva ABC | Distribuição do capital entre classes | Valor de estoque segmentado por classe ABC | `Valor Estoque` com filtro `Classe ABC` | Classe A até 70% do valor | ● |
| 1.6 | Itens Abaixo do Mínimo | Itens com saldo inferior ao estoque mínimo | Contagem de itens onde saldo < mínimo | `Itens Abaixo do Mínimo` | Zero para curva A | ▼ |
| 1.7 | Itens Acima do Máximo | Excesso de estoque | Contagem de itens onde saldo > máximo | `Itens Acima do Máximo` | Menor que 5% dos SKUs | ▼ |
| 1.8 | Itens no Ponto de Pedido | Itens que precisam de reposição imediata | Contagem onde saldo <= ponto de pedido | `Itens no Ponto de Pedido` | Acompanhamento diário | ● |
| 1.9 | Valor Imobilizado em Excesso | Capital acima do estoque máximo | Soma de (saldo menos máximo) x custo, quando positivo | `Valor Excesso Estoque` | Redução de 20% ao ano | ▼ |

---

## Bloco 2: Movimentação e Consumo

| # | Indicador | Definição | Fórmula de negócio | Medida DAX | Meta sugerida | Dir. |
|---|-----------|-----------|--------------------|------------|---------------|------|
| 2.1 | Quantidade de Entradas | Volume recebido no período | Soma das quantidades de movimentos de entrada | `Qtd Entrada` | Sem meta | ● |
| 2.2 | Valor de Entradas | Valor financeiro recebido | Soma de (quantidade x custo) das entradas | `Valor Entrada` | Sem meta | ● |
| 2.3 | Quantidade de Saídas | Volume consumido no período | Soma das quantidades de movimentos de saída | `Qtd Saída` | Sem meta | ● |
| 2.4 | Valor de Saídas (Consumo) | Custo do material consumido | Soma de (quantidade x custo) das saídas | `Valor Saída` | Dentro do orçamento | ● |
| 2.5 | Saldo Líquido do Período | Diferença entre entradas e saídas | Entradas menos saídas | `Saldo Líquido Período` | Sem meta | ● |
| 2.6 | Número de Movimentações | Volume operacional do almoxarifado | Contagem de linhas de movimentação | `Qtd Movimentações` | Sem meta | ● |
| 2.7 | Consumo Médio Mensal (CMM) | Base para reposição e cobertura | Média das saídas de consumo dos últimos 6 meses | `Consumo Médio Mensal` | Sem meta | ● |
| 2.8 | Consumo Médio Diário (CMD) | Base para cobertura em dias | CMM dividido por 30 | `Consumo Médio Diário` | Sem meta | ● |
| 2.9 | Variação de Consumo MoM | Evolução mês contra mês | (Consumo atual / consumo mês anterior) menos 1 | `Var % Consumo MoM` | Variação até 15% | ● |
| 2.10 | Variação de Consumo YoY | Evolução ano contra ano | (Consumo atual / mesmo mês ano anterior) menos 1 | `Var % Consumo YoY` | Sem meta | ● |
| 2.11 | Consumo Acumulado no Ano | Total consumido no exercício | Soma acumulada das saídas do ano | `Valor Saída YTD` | Dentro do orçamento anual | ● |
| 2.12 | Ajustes de Inventário | Correções lançadas no período | Soma dos movimentos de ajuste em valor | `Valor Ajustes` | Menor que 0,5% do estoque | ▼ |
| 2.13 | Perdas e Quebras | Baixas por avaria, vencimento ou perda | Soma dos movimentos de perda em valor | `Valor Perdas` | Menor que 0,3% do consumo | ▼ |

---

## Bloco 3: Giro, Cobertura e Obsolescência

| # | Indicador | Definição | Fórmula de negócio | Medida DAX | Meta sugerida | Dir. |
|---|-----------|-----------|--------------------|------------|---------------|------|
| 3.1 | Giro de Estoque | Quantas vezes o estoque se renova | Custo das saídas dividido pelo estoque médio | `Giro de Estoque` | Acima de 4 vezes ao ano | ▲ |
| 3.2 | Cobertura em Dias | Autonomia do estoque atual | Saldo dividido pelo consumo médio diário | `Cobertura Dias` | Entre 30 e 60 dias | ● |
| 3.3 | Dias de Estoque (DIO) | Dias de estoque no período | 365 dividido pelo giro de estoque | `Dias de Estoque (DIO)` | Menor que 90 dias | ▼ |
| 3.4 | Itens sem Giro | Itens sem saída há mais de 180 dias | Contagem de itens sem movimento de saída no período | `Itens sem Giro` | Menor que 10% dos SKUs | ▼ |
| 3.5 | Valor de Itens sem Giro | Capital parado | Valor de estoque dos itens sem giro | `Valor Itens sem Giro` | Redução de 30% ao ano | ▼ |
| 3.6 | % Estoque sem Giro | Participação do capital parado | Valor sem giro dividido pelo valor total | `% Estoque sem Giro` | Menor que 8% | ▼ |
| 3.7 | Itens Obsoletos | Sem giro há mais de 365 dias | Contagem de itens sem saída em 12 meses | `Itens Obsoletos` | Redução contínua | ▼ |
| 3.8 | Valor Obsoleto | Capital em risco de perda total | Valor de estoque dos itens obsoletos | `Valor Obsoleto` | Provisionado no balanço | ▼ |
| 3.9 | Custo de Manutenção de Estoque | Custo de carregar o estoque | Valor médio de estoque x taxa anual de carregamento | `Custo de Carregamento` | Menor que 25% ao ano | ▼ |

---

## Bloco 4: Nível de Serviço e Atendimento

| # | Indicador | Definição | Fórmula de negócio | Medida DAX | Meta sugerida | Dir. |
|---|-----------|-----------|--------------------|------------|---------------|------|
| 4.1 | Requisições Recebidas | Demanda total do período | Contagem distinta de requisições | `Qtd Requisições` | Sem meta | ● |
| 4.2 | Itens Requisitados | Linhas de demanda | Contagem de itens de requisição | `Qtd Itens Requisitados` | Sem meta | ● |
| 4.3 | Fill Rate (Taxa de Atendimento) | Percentual da demanda atendida em quantidade | Quantidade atendida dividida pela solicitada | `Fill Rate %` | Acima de 95% | ▲ |
| 4.4 | Taxa de Atendimento por Linha | Percentual de itens atendidos integralmente | Itens totalmente atendidos dividido pelo total | `Atendimento Linha %` | Acima de 92% | ▲ |
| 4.5 | OTIF | Atendido no prazo e completo | Requisições completas e no prazo dividido pelo total | `OTIF %` | Acima de 90% | ▲ |
| 4.6 | Pontualidade (On Time) | Atendido dentro do prazo prometido | Requisições no prazo dividido pelo total atendido | `On Time %` | Acima de 93% | ▲ |
| 4.7 | Tempo Médio de Atendimento | Agilidade do almoxarifado | Média de horas entre solicitação e entrega | `Tempo Médio Atendimento (h)` | Menor que 24 horas | ▼ |
| 4.8 | Requisições Pendentes | Backlog operacional | Contagem de requisições sem atendimento concluído | `Requisições Pendentes` | Menor que 5% do volume | ▼ |
| 4.9 | Idade Média do Backlog | Tempo médio de espera das pendências | Média de dias das requisições abertas | `Idade Média Backlog (dias)` | Menor que 3 dias | ▼ |
| 4.10 | Taxa de Ruptura | Demanda não atendida por falta de saldo | Itens não atendidos por falta dividido pelo total | `Taxa de Ruptura %` | Menor que 3% | ▼ |
| 4.11 | Valor da Demanda Não Atendida | Impacto financeiro da ruptura | Quantidade não atendida x custo do item | `Valor Demanda Não Atendida` | Redução contínua | ▼ |

---

## Bloco 5: Compras e Fornecedores

| # | Indicador | Definição | Fórmula de negócio | Medida DAX | Meta sugerida | Dir. |
|---|-----------|-----------|--------------------|------------|---------------|------|
| 5.1 | Valor de Compras | Investimento em reposição | Soma do valor dos itens recebidos | `Valor Compras` | Dentro do orçamento | ● |
| 5.2 | Pedidos em Aberto | Compras ainda não recebidas | Contagem de pedidos sem recebimento total | `Pedidos em Aberto` | Sem meta | ● |
| 5.3 | Valor em Trânsito | Capital comprometido não recebido | Valor dos pedidos em aberto | `Valor em Trânsito` | Sem meta | ● |
| 5.4 | Lead Time Médio de Compra | Tempo entre pedido e recebimento | Média de dias entre data do pedido e data de entrega | `Lead Time Médio (dias)` | Menor que o lead time padrão | ▼ |
| 5.5 | Aderência ao Lead Time | Entregas dentro do prazo padrão | Recebimentos no prazo dividido pelo total | `Aderência Lead Time %` | Acima de 90% | ▲ |
| 5.6 | Pontualidade do Fornecedor | Cumprimento da data prometida | Entregas na data prometida dividido pelo total | `Pontualidade Fornecedor %` | Acima de 92% | ▲ |
| 5.7 | Acuracidade de Quantidade | Entrega da quantidade correta | Quantidade recebida dividida pela pedida | `Acuracidade Quantidade %` | Entre 98% e 100% | ▲ |
| 5.8 | Taxa de Devolução | Qualidade do recebimento | Quantidade devolvida dividido pela recebida | `Taxa de Devolução %` | Menor que 2% | ▼ |
| 5.9 | IQF (Índice de Qualificação do Fornecedor) | Nota composta do fornecedor | Média ponderada de prazo, quantidade e qualidade | `IQF Fornecedor` | Acima de 85 pontos | ▲ |
| 5.10 | Concentração de Fornecedores | Dependência de poucos parceiros | Participação dos 5 maiores no valor total | `% Top 5 Fornecedores` | Menor que 60% | ▼ |
| 5.11 | Variação do Custo de Aquisição | Evolução do preço pago | (Custo médio atual / custo médio anterior) menos 1 | `Var % Custo Aquisição` | Abaixo da inflação do período | ▼ |

---

## Bloco 6: Consumo por Centro de Custo

| # | Indicador | Definição | Fórmula de negócio | Medida DAX | Meta sugerida | Dir. |
|---|-----------|-----------|--------------------|------------|---------------|------|
| 6.1 | Consumo por Centro de Custo | Despesa de material por área | Valor das saídas agrupado por centro de custo | `Valor Saída` com contexto de centro de custo | Dentro do orçamento | ● |
| 6.2 | Orçamento do Período | Verba aprovada | Soma do orçamento do centro de custo no período | `Orçamento Período` | Referência | ● |
| 6.3 | Realizado vs Orçado | Consumo do orçamento | Valor realizado dividido pelo orçado | `% Realizado sobre Orçado` | Até 100% | ▼ |
| 6.4 | Saldo Orçamentário | Verba disponível | Orçado menos realizado | `Saldo Orçamentário` | Positivo | ▲ |
| 6.5 | Consumo por Categoria | Distribuição por família de material | Valor das saídas agrupado por categoria | `Valor Saída` com contexto de categoria | Sem meta | ● |
| 6.6 | Top 10 Itens de Maior Consumo | Concentração da despesa | Ranking de itens por valor de saída | `Rank Consumo Item` | Foco de negociação | ● |
| 6.7 | Custo Médio por Requisição | Ticket médio da demanda interna | Valor total das saídas dividido pelo número de requisições | `Custo Médio por Requisição` | Sem meta | ● |

---

## Bloco 7: Inventário e Acuracidade

| # | Indicador | Definição | Fórmula de negócio | Medida DAX | Meta sugerida | Dir. |
|---|-----------|-----------|--------------------|------------|---------------|------|
| 7.1 | Itens Inventariados | Cobertura da contagem cíclica | Contagem de itens contados no período | `Itens Inventariados` | 100% da curva A por trimestre | ▲ |
| 7.2 | Cobertura do Inventário | Percentual do cadastro contado | Itens contados dividido pelos itens ativos | `Cobertura Inventário %` | Acima de 90% ao ano | ▲ |
| 7.3 | Acuracidade de Inventário (IAE) | Precisão do saldo do sistema | Itens sem divergência dividido pelos contados | `Acuracidade Inventário %` | Acima de 98% | ▲ |
| 7.4 | Acuracidade Financeira | Precisão em valor | 1 menos (divergência absoluta em valor / valor contado) | `Acuracidade Financeira %` | Acima de 99% | ▲ |
| 7.5 | Divergência em Quantidade | Diferença física apurada | Quantidade contada menos quantidade do sistema | `Divergência Quantidade` | Próximo de zero | ● |
| 7.6 | Divergência em Valor | Impacto financeiro da divergência | Divergência de quantidade x custo médio | `Divergência Valor` | Menor que 0,5% do estoque | ▼ |
| 7.7 | Itens com Divergência | Volume de erros | Contagem de itens com diferença diferente de zero | `Itens com Divergência` | Redução contínua | ▼ |
| 7.8 | Divergências Positivas e Negativas | Padrão do erro | Separação entre sobras e faltas | `Divergência Positiva` e `Divergência Negativa` | Equilíbrio | ● |

---

## Bloco 8: Classificações Estratégicas

| # | Indicador | Definição | Critério | Medida DAX |
|---|-----------|-----------|----------|------------|
| 8.1 | Curva ABC | Classificação por valor de consumo anual | A até 80%, B até 95%, C acima | `Classe ABC Dinâmica` |
| 8.2 | Curva XYZ | Classificação por previsibilidade de demanda | X até 0,5, Y até 1,0, Z acima de 1,0 de coeficiente de variação | `Classe XYZ` |
| 8.3 | Matriz ABC x XYZ | Estratégia de reposição por quadrante | Cruzamento das duas classificações | `Matriz ABC-XYZ` |
| 8.4 | Criticidade do Item | Impacto da falta na operação | Cadastro no item: alta, média, baixa | Coluna `dItem[Criticidade]` |
| 8.5 | Estoque de Segurança Sugerido | Proteção contra variabilidade | Fator de serviço x desvio da demanda no lead time | `Estoque Segurança Sugerido` |
| 8.6 | Ponto de Pedido Sugerido | Momento de comprar | (CMD x lead time) mais estoque de segurança | `Ponto de Pedido Sugerido` |
| 8.7 | Lote Econômico de Compra (LEC) | Quantidade ótima de reposição | Raiz de (2 x demanda anual x custo do pedido / custo de manutenção unitário) | `Lote Econômico Compra` |

### Estratégia por quadrante da matriz ABC x XYZ

| Quadrante | Perfil | Estratégia recomendada |
|-----------|--------|------------------------|
| AX | Alto valor, demanda previsível | Reposição automática, estoque de segurança baixo, contrato de fornecimento |
| AY | Alto valor, demanda oscilante | Revisão quinzenal, estoque de segurança moderado |
| AZ | Alto valor, demanda errática | Compra sob demanda, aprovação gerencial, evitar estoque |
| BX | Valor médio, previsível | Ponto de pedido automático |
| BY | Valor médio, oscilante | Revisão mensal |
| BZ | Valor médio, errático | Compra pontual |
| CX | Baixo valor, previsível | Lote grande, revisão trimestral |
| CY | Baixo valor, oscilante | Lote grande, revisão trimestral |
| CZ | Baixo valor, errático | Candidato a eliminação de cadastro ou compra direta pela área |

---

## Bloco 9: Indicadores de Controle e Qualidade de Dados

| # | Indicador | Finalidade |
|---|-----------|-----------|
| 9.1 | Itens sem Curva ABC atribuída | Detectar cadastro incompleto |
| 9.2 | Itens sem Estoque Mínimo cadastrado | Impede cálculo de ruptura |
| 9.3 | Movimentos sem Centro de Custo | Impede rateio correto |
| 9.4 | Movimentos com Custo Zerado | Distorce valorização |
| 9.5 | Itens sem Fornecedor Vinculado | Impede análise de suprimento |
| 9.6 | Data da Última Atualização | Confiança no dado exibido |
| 9.7 | Total de Controle vs ERP | Conciliação obrigatória antes da publicação |

---

## Resumo dos KPIs prioritários para a Visão Executiva

Os 8 indicadores que devem aparecer como cartões principais na primeira página:

1. Valor Total do Estoque
2. Giro de Estoque
3. Cobertura em Dias
4. Fill Rate
5. OTIF
6. Acuracidade de Inventário
7. % Estoque sem Giro
8. Itens em Ruptura
