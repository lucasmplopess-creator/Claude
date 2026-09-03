# Modelo de Dados: Esquema Estrela do Almoxarifado

## 1. Visão geral da arquitetura

```
                    ┌──────────────┐
                    │ dCalendario  │
                    └──────┬───────┘
                           │
   ┌────────────┐   ┌──────┴────────────────────────────┐   ┌──────────────┐
   │  dItem     ├───┤                                   ├───┤ dDeposito    │
   └────────────┘   │        TABELAS FATO               │   └──────────────┘
   ┌────────────┐   │  fMovimentacaoEstoque             │   ┌──────────────┐
   │dCentroCusto├───┤  fPosicaoEstoque                  ├───┤dTipoMovimento│
   └────────────┘   │  fRequisicaoItem                  │   └──────────────┘
   ┌────────────┐   │  fCompraItem                      │   ┌──────────────┐
   │dFornecedor ├───┤  fInventarioContagem              ├───┤ dSolicitante │
   └────────────┘   │  fOrcamento                       │   └──────────────┘
                    └───────────────────────────────────┘
```

**Padrão adotado:** esquema estrela puro, relacionamentos de um para muitos, filtro em direção única (da dimensão para o fato). Nenhum relacionamento bidirecional, exceto onde documentado.

---

## 2. Dimensões

### 2.1 dCalendario
Tabela de datas marcada como tabela de datas do modelo.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Data | Data | Chave primária |
| Ano | Inteiro | Ano com 4 dígitos |
| Trimestre | Texto | T1 a T4 |
| AnoTrimestre | Texto | 2026-T1 |
| MesNumero | Inteiro | 1 a 12 |
| MesNome | Texto | Janeiro a Dezembro |
| MesAbrev | Texto | Jan a Dez |
| AnoMes | Inteiro | 202601, usado para ordenação |
| AnoMesNome | Texto | Jan/26 |
| Semana | Inteiro | Semana do ano |
| DiaSemana | Inteiro | 1 a 7 |
| DiaSemanaNome | Texto | Segunda a Domingo |
| DiaUtil | Booleano | Verdadeiro se dia útil |
| Feriado | Booleano | Verdadeiro se feriado |
| DataFimMes | Data | Último dia do mês |
| MesesAtras | Inteiro | Distância em meses da data atual, útil para filtros dinâmicos |
| IsMesAtual | Booleano | Marca o mês corrente |
| IsAnoAtual | Booleano | Marca o ano corrente |

**Colunas de ordenação:** `MesNome` ordenado por `MesNumero`, `AnoMesNome` ordenado por `AnoMes`, `DiaSemanaNome` ordenado por `DiaSemana`.

### 2.2 dItem

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_Item | Inteiro | Chave substituta, primária |
| CodigoItem | Texto | Código do ERP |
| Descricao | Texto | Descrição do material |
| Categoria | Texto | Família principal |
| Subcategoria | Texto | Subgrupo |
| UnidadeMedida | Texto | UN, KG, MT, LT, CX |
| CurvaABC | Texto | Classificação estática do ERP |
| Criticidade | Texto | Alta, Média, Baixa |
| EstoqueMinimo | Decimal | Parâmetro de reposição |
| EstoqueMaximo | Decimal | Limite superior |
| PontoPedido | Decimal | Gatilho de compra |
| LoteMinimoCompra | Decimal | Lote mínimo do fornecedor |
| LeadTimePadraoDias | Inteiro | Prazo contratado |
| CustoPadrao | Decimal | Custo de referência |
| Perecivel | Booleano | Controle de validade |
| ItemControlado | Booleano | Exige assinatura ou EPI |
| SK_FornecedorPreferencial | Inteiro | Fornecedor principal |
| StatusItem | Texto | Ativo, Inativo, Descontinuado |
| DataCadastro | Data | Data de criação |

### 2.3 dFornecedor

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_Fornecedor | Inteiro | Chave primária |
| CodigoFornecedor | Texto | Código do ERP |
| RazaoSocial | Texto | Nome completo |
| NomeFantasia | Texto | Nome comercial |
| CNPJ | Texto | Documento |
| UF | Texto | Estado |
| Cidade | Texto | Município |
| CategoriaFornecimento | Texto | Segmento atendido |
| PorteFornecedor | Texto | Pequeno, Médio, Grande |
| StatusFornecedor | Texto | Ativo, Bloqueado, Em homologação |
| DataHomologacao | Data | Início do relacionamento |

### 2.4 dCentroCusto

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_CentroCusto | Inteiro | Chave primária |
| CodigoCentroCusto | Texto | Código contábil |
| NomeCentroCusto | Texto | Descrição |
| Area | Texto | Área operacional |
| Gerencia | Texto | Nível gerencial |
| Diretoria | Texto | Nível diretoria |
| Responsavel | Texto | Gestor responsável |
| EmailResponsavel | Texto | Usado na RLS |
| StatusCentroCusto | Texto | Ativo ou Inativo |

### 2.5 dDeposito

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_Deposito | Inteiro | Chave primária |
| CodigoDeposito | Texto | Código do ERP |
| NomeDeposito | Texto | Descrição |
| TipoDeposito | Texto | Central, Avançado, Quarentena, Terceiros |
| Planta | Texto | Unidade fabril ou filial |
| UF | Texto | Estado |
| EmailResponsavel | Texto | Usado na RLS |

### 2.6 dTipoMovimento

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_TipoMovimento | Inteiro | Chave primária |
| CodigoMovimento | Texto | Código do ERP |
| DescricaoMovimento | Texto | Descrição |
| Natureza | Texto | Entrada, Saída |
| GrupoMovimento | Texto | Compra, Consumo, Ajuste, Transferência, Devolução, Perda |
| AfetaCusto | Booleano | Impacta valorização |
| ContaConsumo | Booleano | Entra no cálculo de CMM e giro |

**Regra crítica:** somente movimentos com `ContaConsumo = Verdadeiro` entram no consumo médio, giro e cobertura. Transferências entre depósitos não são consumo.

### 2.7 dSolicitante

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_Solicitante | Inteiro | Chave primária |
| Matricula | Texto | Identificação |
| NomeSolicitante | Texto | Nome |
| Cargo | Texto | Função |
| SK_CentroCusto | Inteiro | Vínculo padrão |
| Email | Texto | Contato |

### 2.8 dStatusRequisicao

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_Status | Inteiro | Chave primária |
| CodigoStatus | Texto | Código |
| DescricaoStatus | Texto | Aberta, Em separação, Atendida, Atendida parcial, Cancelada |
| StatusFinalizado | Booleano | Indica encerramento |

---

## 3. Tabelas fato

### 3.1 fMovimentacaoEstoque
**Grão:** uma linha por item, depósito, documento e tipo de movimento, na data do lançamento.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_Movimentacao | Inteiro | Chave técnica |
| Data | Data | Relacionamento com dCalendario |
| SK_Item | Inteiro | Relacionamento com dItem |
| SK_Deposito | Inteiro | Relacionamento com dDeposito |
| SK_TipoMovimento | Inteiro | Relacionamento com dTipoMovimento |
| SK_CentroCusto | Inteiro | Relacionamento com dCentroCusto |
| SK_Fornecedor | Inteiro | Preenchido nas entradas de compra |
| NumeroDocumento | Texto | Nota fiscal ou documento interno |
| Quantidade | Decimal | Sempre positiva |
| CustoUnitario | Decimal | Custo médio no momento |
| ValorTotal | Decimal | Quantidade x custo unitário |
| QuantidadeSinalizada | Decimal | Positiva em entrada, negativa em saída |
| ValorSinalizado | Decimal | Positivo em entrada, negativo em saída |

**Colunas sinalizadas:** criadas na camada SQL para simplificar medidas de saldo acumulado e reduzir o uso de CALCULATE com filtros.

### 3.2 fPosicaoEstoque
**Grão:** snapshot de saldo por item, depósito e data (diário para os últimos 90 dias, mensal para o histórico).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Data | Data | Data do snapshot |
| SK_Item | Inteiro | Item |
| SK_Deposito | Inteiro | Depósito |
| QuantidadeSaldo | Decimal | Saldo físico |
| QuantidadeReservada | Decimal | Comprometida em requisições |
| QuantidadeBloqueada | Decimal | Quarentena ou avaria |
| QuantidadeDisponivel | Decimal | Saldo menos reservada menos bloqueada |
| CustoMedio | Decimal | Custo médio na data |
| ValorSaldo | Decimal | Saldo x custo médio |
| DataUltimaSaida | Data | Base para itens sem giro |
| DataUltimaEntrada | Data | Base para idade do estoque |

**Natureza semi-aditiva:** esta tabela nunca deve ser somada ao longo do tempo. Todas as medidas de saldo usam `LASTNONBLANK` ou `LASTDATE` sobre `dCalendario[Data]`.

### 3.3 fRequisicaoItem
**Grão:** uma linha por item de requisição.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_RequisicaoItem | Inteiro | Chave técnica |
| NumeroRequisicao | Texto | Documento |
| DataSolicitacao | Data | Relacionamento ativo com dCalendario |
| DataPrometida | Data | SLA acordado |
| DataAtendimento | Data | Relacionamento inativo, ativado por USERELATIONSHIP |
| SK_Item | Inteiro | Item |
| SK_Deposito | Inteiro | Depósito de atendimento |
| SK_CentroCusto | Inteiro | Centro de custo do solicitante |
| SK_Solicitante | Inteiro | Requisitante |
| SK_Status | Inteiro | Situação atual |
| QuantidadeSolicitada | Decimal | Demanda |
| QuantidadeAtendida | Decimal | Entregue |
| QuantidadeNaoAtendida | Decimal | Solicitada menos atendida |
| CustoUnitario | Decimal | Custo no atendimento |
| HorasAtendimento | Decimal | Diferença em horas entre solicitação e entrega |
| FlagAtendidoTotal | Booleano | Atendida integralmente |
| FlagNoPrazo | Booleano | Atendimento até a data prometida |
| FlagOTIF | Booleano | Total e no prazo |
| MotivoNaoAtendimento | Texto | Falta de saldo, cancelamento, item bloqueado |

**Decisão de modelagem:** as flags são calculadas na camada SQL, não em DAX. Isso melhora a compressão do VertiPaq e acelera as medidas de nível de serviço.

### 3.4 fCompraItem
**Grão:** uma linha por item de pedido de compra.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_CompraItem | Inteiro | Chave técnica |
| NumeroPedido | Texto | Documento |
| DataPedido | Data | Relacionamento ativo |
| DataPrometida | Data | Prazo do fornecedor |
| DataRecebimento | Data | Relacionamento inativo |
| SK_Item | Inteiro | Item |
| SK_Fornecedor | Inteiro | Fornecedor |
| SK_Deposito | Inteiro | Destino |
| QuantidadePedida | Decimal | Solicitado |
| QuantidadeRecebida | Decimal | Recebido |
| QuantidadeDevolvida | Decimal | Rejeitado |
| PrecoUnitario | Decimal | Preço negociado |
| ValorPedido | Decimal | Quantidade x preço |
| ValorRecebido | Decimal | Recebido x preço |
| LeadTimeRealDias | Inteiro | Dias entre pedido e recebimento |
| FlagEntregaNoPrazo | Booleano | Recebimento até a data prometida |
| FlagRecebimentoTotal | Booleano | Quantidade completa |
| StatusPedido | Texto | Aberto, Parcial, Recebido, Cancelado |

### 3.5 fInventarioContagem
**Grão:** uma linha por item, depósito e ciclo de contagem.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| SK_Contagem | Inteiro | Chave técnica |
| DataContagem | Data | Data do inventário |
| CicloInventario | Texto | Identificador do ciclo |
| SK_Item | Inteiro | Item |
| SK_Deposito | Inteiro | Depósito |
| QuantidadeSistema | Decimal | Saldo do ERP |
| QuantidadeContada | Decimal | Saldo físico apurado |
| DivergenciaQuantidade | Decimal | Contada menos sistema |
| CustoMedio | Decimal | Custo na data |
| DivergenciaValor | Decimal | Divergência x custo |
| FlagSemDivergencia | Booleano | Verdadeiro quando dentro da tolerância |
| Contador | Texto | Responsável pela contagem |

### 3.6 fOrcamento
**Grão:** orçamento mensal por centro de custo e categoria.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| AnoMes | Inteiro | Período |
| DataReferencia | Data | Primeiro dia do mês, usada no relacionamento |
| SK_CentroCusto | Inteiro | Centro de custo |
| Categoria | Texto | Família de material |
| ValorOrcado | Decimal | Verba aprovada |

**Atenção:** esta fato tem grão mensal, diferente do grão diário das demais. Relacione com `dCalendario` pela coluna `DataReferencia` e sempre exiba em contexto mensal ou superior, ou use uma tabela ponte de calendário mensal.

---

## 4. Tabelas auxiliares

### 4.1 _Medidas
Tabela vazia criada apenas para hospedar as medidas DAX, mantendo o painel de campos organizado.

### 4.2 dMetaKPI
Metas por indicador e período, permitindo comparação dinâmica.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| AnoMes | Inteiro | Período |
| Indicador | Texto | Nome do KPI |
| ValorMeta | Decimal | Meta do período |
| TipoMeta | Texto | Maior melhor, menor melhor, faixa |
| LimiteInferior | Decimal | Faixa aceitável |
| LimiteSuperior | Decimal | Faixa aceitável |

### 4.3 pSelecaoMetrica
Tabela desconectada para troca dinâmica de métrica em gráficos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Ordem | Inteiro | Ordenação |
| Metrica | Texto | Nome exibido |
| Codigo | Texto | Identificador usado no SWITCH |

### 4.4 pFaixaTempo
Parâmetro numérico para janelas móveis (3, 6, 12 meses).

---

## 5. Relacionamentos

| De (dimensão) | Para (fato) | Cardinalidade | Direção | Ativo |
|---------------|-------------|---------------|---------|-------|
| dCalendario[Data] | fMovimentacaoEstoque[Data] | 1:N | Única | Sim |
| dCalendario[Data] | fPosicaoEstoque[Data] | 1:N | Única | Sim |
| dCalendario[Data] | fRequisicaoItem[DataSolicitacao] | 1:N | Única | Sim |
| dCalendario[Data] | fRequisicaoItem[DataAtendimento] | 1:N | Única | Não |
| dCalendario[Data] | fCompraItem[DataPedido] | 1:N | Única | Sim |
| dCalendario[Data] | fCompraItem[DataRecebimento] | 1:N | Única | Não |
| dCalendario[Data] | fInventarioContagem[DataContagem] | 1:N | Única | Sim |
| dCalendario[Data] | fOrcamento[DataReferencia] | 1:N | Única | Sim |
| dItem[SK_Item] | todas as fatos com item | 1:N | Única | Sim |
| dDeposito[SK_Deposito] | todas as fatos com depósito | 1:N | Única | Sim |
| dCentroCusto[SK_CentroCusto] | fMovimentacaoEstoque, fRequisicaoItem, fOrcamento | 1:N | Única | Sim |
| dFornecedor[SK_Fornecedor] | fCompraItem, fMovimentacaoEstoque | 1:N | Única | Sim |
| dTipoMovimento[SK_TipoMovimento] | fMovimentacaoEstoque | 1:N | Única | Sim |
| dSolicitante[SK_Solicitante] | fRequisicaoItem | 1:N | Única | Sim |
| dStatusRequisicao[SK_Status] | fRequisicaoItem | 1:N | Única | Sim |

**Relacionamentos inativos:** as datas de atendimento e recebimento ficam inativas para permitir análise pela data de solicitação por padrão. Use `USERELATIONSHIP` nas medidas que precisam da visão por data de entrega.

---

## 6. Boas práticas aplicadas no modelo

1. **Ocultar colunas de chave** nas dimensões e fatos, deixando visíveis apenas os atributos de negócio.
2. **Ocultar todas as colunas numéricas das fatos**, expondo somente medidas. Isso impede agregações incorretas pelo usuário final.
3. **Desativar Auto Data/Hora** em Opções do Arquivo. Evita a criação de tabelas de data ocultas por coluna.
4. **Marcar dCalendario como tabela de datas** para habilitar as funções de inteligência temporal.
5. **Definir categoria de dados** para colunas de UF e Cidade, habilitando os visuais de mapa.
6. **Nomear medidas em português** com padrão consistente, sem abreviações obscuras.
7. **Organizar medidas em pastas de exibição** dentro da tabela `_Medidas`.
8. **Definir formatação padrão** de cada medida no próprio modelo, não no visual.
9. **Reduzir cardinalidade** de colunas de alta variação, como `NumeroDocumento`, removendo o que não for usado.
10. **Usar tipo Decimal Fixo** em valores monetários, que ocupa menos memória que Decimal.

---

## 7. Estimativa de volumetria

| Tabela | Linhas estimadas (24 meses) | Observação |
|--------|------------------------------|------------|
| dCalendario | 1.100 | 3 anos |
| dItem | 3.000 a 15.000 | Depende do cadastro |
| dFornecedor | 200 a 1.500 | |
| dCentroCusto | 50 a 300 | |
| dDeposito | 3 a 30 | |
| fMovimentacaoEstoque | 500.000 a 3.000.000 | Maior tabela |
| fPosicaoEstoque | 200.000 a 1.500.000 | Snapshot mensal mais 90 dias diários |
| fRequisicaoItem | 100.000 a 600.000 | |
| fCompraItem | 30.000 a 200.000 | |
| fInventarioContagem | 20.000 a 150.000 | |

Até 5 milhões de linhas o modelo opera bem em Import Mode com licença Pro. Acima disso avalie capacidade Premium, agregações ou modo composto.
