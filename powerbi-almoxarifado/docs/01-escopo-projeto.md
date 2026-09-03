# Escopo do Projeto: Dashboard de Indicadores do Almoxarifado

**Versão:** 1.0
**Plataforma:** Microsoft Power BI (Desktop + Service)
**Tipo de solução:** Painel executivo e operacional de gestão de estoques

---

## 1. Objetivo do projeto

Consolidar em um único painel os indicadores de desempenho do Almoxarifado, permitindo à gestão acompanhar valor imobilizado, giro, nível de serviço, acuracidade de inventário, consumo por centro de custo e desempenho de fornecedores, com atualização automática e visão histórica de 24 meses.

### Objetivos específicos

| # | Objetivo | Resultado esperado |
|---|----------|--------------------|
| 1 | Dar visibilidade ao capital imobilizado em estoque | Redução do valor parado em itens sem giro |
| 2 | Antecipar rupturas de material crítico | Queda no número de requisições não atendidas |
| 3 | Medir o nível de serviço do almoxarifado | Fill Rate e OTIF monitorados mensalmente |
| 4 | Controlar consumo por centro de custo | Rateio transparente e previsível de despesa |
| 5 | Elevar a acuracidade do inventário | Índice acima de 98% em contagem cíclica |
| 6 | Avaliar fornecedores por prazo e qualidade | Base objetiva para renegociação de contratos |

---

## 2. Público e perfis de acesso

| Perfil | Necessidade principal | Páginas liberadas | Restrição de dados |
|--------|----------------------|-------------------|--------------------|
| Diretoria / Controladoria | Visão financeira e tendência | Visão Executiva | Todos os depósitos |
| Gerência de Suprimentos | Giro, cobertura, compras | Todas | Todos os depósitos |
| Coordenação de Almoxarifado | Operação diária e rupturas | Operacional, Estoque, Requisições | Depósito próprio |
| Gestores de área | Consumo do seu centro de custo | Consumo por Centro de Custo | Centro de custo próprio |
| Compras | Lead time e fornecedores | Compras e Fornecedores | Todos os depósitos |
| Auditoria interna | Divergências e ajustes | Inventário e Auditoria | Somente leitura, todos |

---

## 3. Escopo funcional

### 3.1 Incluso no escopo

**Páginas do relatório**

1. Capa e navegação
2. Visão Executiva (KPIs consolidados e tendência)
3. Posição de Estoque (valor, quantidade, ABC, cobertura)
4. Movimentação (entradas, saídas, ajustes, transferências)
5. Requisições e Nível de Serviço (Fill Rate, OTIF, backlog)
6. Compras e Fornecedores (lead time, pontualidade, concentração)
7. Consumo por Centro de Custo (orçado vs realizado)
8. Inventário e Acuracidade (contagem cíclica, divergências)
9. Itens Críticos e Ruptura (alerta operacional)
10. Detalhamento Analítico (tabela exportável)
11. Glossário de Indicadores (dicionário na própria ferramenta)

**Recursos técnicos**

* Modelo estrela com 8 dimensões e 5 tabelas fato
* Biblioteca de 248 definições DAX organizadas em pastas de exibição
* Segurança em nível de linha (RLS) por depósito e centro de custo
* Atualização automática programada 3 vezes ao dia
* Drill-through de item, fornecedor e centro de custo
* Tooltips personalizados com histórico do item
* Bookmarks de navegação e painel de filtros
* Alertas no Power BI Service para KPIs fora da meta
* Tema visual corporativo aplicado (arquivo JSON)
* App publicado no Power BI Service com audiências separadas

### 3.2 Fora do escopo

* Integração transacional em tempo real (o painel opera com carga incremental)
* Escrita de dados de volta ao ERP
* Módulo de previsão de demanda com machine learning (previsto para fase 2)
* Aplicativo mobile customizado além do layout responsivo nativo
* Migração de dados históricos anteriores a 24 meses

---

## 4. Fontes de dados

| Fonte | Sistema | Tabelas / objetos | Frequência |
|-------|---------|-------------------|------------|
| ERP (módulo materiais) | SAP MM, Protheus, Senior ou similar | Movimentações, saldos, itens, fornecedores | Diária incremental |
| Módulo de compras | ERP | Pedidos, itens de pedido, recebimentos | Diária incremental |
| Requisições internas | ERP ou sistema de workflow | Requisições e itens | Diária incremental |
| Inventário cíclico | Planilha controlada ou coletor | Contagens e divergências | Semanal |
| Orçamento | Planilha de Controladoria | Verba por centro de custo | Mensal |
| Cadastro de metas | Planilha ou SharePoint | Metas por indicador | Mensal |

**Recomendação de arquitetura:** criar views analíticas no banco (camada `bi_`) em vez de consultar tabelas transacionais diretamente. Isso isola o Power BI de mudanças de estrutura no ERP e reduz carga no ambiente de produção.

---

## 5. Regras de negócio consolidadas

| Regra | Definição adotada |
|-------|-------------------|
| Valorização de estoque | Custo médio ponderado móvel |
| Período de apuração | Mês fechado, com corte no último dia útil |
| Item sem giro | Sem saída registrada nos últimos 180 dias |
| Item obsoleto | Sem giro há mais de 365 dias ou marcado como descontinuado |
| Consumo Médio Mensal (CMM) | Média das saídas de consumo dos últimos 6 meses, exclui transferências |
| Ruptura | Saldo disponível igual a zero com demanda registrada no período |
| Estoque disponível | Saldo físico menos quantidade reservada e bloqueada |
| Atendimento no prazo | Data de atendimento menor ou igual à data prometida |
| Divergência aceitável | Até 0,5% da quantidade contada para itens de baixo valor |
| Curva ABC | A até 80% do valor de consumo, B até 95%, C o restante |
| Curva XYZ | X coeficiente de variação até 0,5, Y até 1,0, Z acima de 1,0 |

---

## 6. Entregáveis

| Entregável | Formato | Responsável |
|------------|---------|-------------|
| Documento de escopo e dicionário de indicadores | Markdown e PDF | BI |
| Scripts DDL e views analíticas | SQL | BI + DBA |
| Consultas de extração e tratamento | Power Query M | BI |
| Biblioteca de medidas | DAX | BI |
| Arquivo do relatório | PBIX | BI |
| Tema visual corporativo | JSON | BI |
| Base de dados de exemplo para homologação | CSV | BI |
| Manual do usuário e treinamento | PDF e sessão ao vivo | BI + Almoxarifado |

---

## 7. Cronograma sugerido

| Semana | Etapa | Marco |
|--------|-------|-------|
| 1 | Levantamento com as áreas e validação de regras | Escopo assinado |
| 2 | Modelagem do banco e criação das views | Camada `bi_` publicada |
| 3 | Extração, tratamento e carga no Power BI | Modelo carregando |
| 4 | Construção das medidas DAX | Biblioteca validada |
| 5 | Desenvolvimento visual das páginas | Protótipo navegável |
| 6 | Homologação com usuários-chave | Ajustes registrados |
| 7 | RLS, publicação, agendamento e app | Painel em produção |
| 8 | Treinamento e transferência de conhecimento | Aceite formal |

---

## 8. Premissas

1. O ERP disponibiliza acesso de leitura a uma réplica ou base de homologação.
2. Existe cadastro consistente de item, centro de custo e depósito.
3. Os tipos de movimento estão classificados por natureza (entrada, saída, ajuste, transferência).
4. Há licença Power BI Pro para todos os consumidores ou capacidade Premium por usuário.
5. As metas dos indicadores são definidas pela gestão antes da homologação.

## 9. Riscos e mitigação

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Cadastro de itens incompleto | Alto | Saneamento prévio com lista de pendências gerada pelo próprio painel |
| Tipos de movimento sem padronização | Alto | Tabela de-para mantida na camada `bi_` |
| Volume de movimentações elevado | Médio | Carga incremental e agregações pré-calculadas |
| Resistência ao uso | Médio | Treinamento por perfil e página de glossário embutida |
| Divergência entre painel e ERP | Alto | Página de conciliação com totais de controle |

---

## 10. Critérios de aceite

* Todos os indicadores do dicionário implementados e validados contra o ERP com diferença menor que 0,5%.
* Tempo de abertura de qualquer página abaixo de 5 segundos.
* RLS testada com pelo menos um usuário de cada perfil.
* Atualização automática executando sem falhas por 7 dias consecutivos.
* Manual entregue e treinamento realizado com registro de presença.
