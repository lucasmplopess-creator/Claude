/* =====================================================================
   ARQUIVO: 02-views-analiticas.sql
   OBJETIVO: Views de consumo do Power BI. O relatorio le SEMPRE destas
             views, nunca das tabelas transacionais do ERP.
   BENEFICIO: isola o modelo de mudancas de estrutura no ERP, centraliza
              regras de negocio e reduz o processamento no Power Query.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. vw_Movimentacao
   Aplica sinal ao movimento e ja traz os atributos de classificacao.
   --------------------------------------------------------------------- */
CREATE OR ALTER VIEW bi.vw_Movimentacao AS
SELECT
    m.SK_Movimentacao,
    m.Data,
    m.SK_Item,
    m.SK_Deposito,
    m.SK_TipoMovimento,
    m.SK_CentroCusto,
    m.SK_Fornecedor,
    m.NumeroDocumento,
    m.Quantidade,
    m.CustoUnitario,
    m.ValorTotal,
    CASE WHEN t.Natureza = 'Entrada' THEN  m.Quantidade
         ELSE -m.Quantidade END                       AS QuantidadeSinalizada,
    CASE WHEN t.Natureza = 'Entrada' THEN  m.ValorTotal
         ELSE -m.ValorTotal END                       AS ValorSinalizado,
    t.Natureza,
    t.GrupoMovimento,
    t.ContaConsumo
FROM bi.fMovimentacaoEstoque AS m
INNER JOIN bi.dTipoMovimento AS t
        ON t.SK_TipoMovimento = m.SK_TipoMovimento;
GO

/* ---------------------------------------------------------------------
   2. vw_PosicaoEstoque
   Snapshot com data da ultima saida e dias sem giro ja calculados.
   --------------------------------------------------------------------- */
CREATE OR ALTER VIEW bi.vw_PosicaoEstoque AS
SELECT
    p.Data,
    p.SK_Item,
    p.SK_Deposito,
    p.QuantidadeSaldo,
    p.QuantidadeReservada,
    p.QuantidadeBloqueada,
    p.QuantidadeDisponivel,
    p.CustoMedio,
    p.ValorSaldo,
    p.DataUltimaSaida,
    p.DataUltimaEntrada,
    DATEDIFF(DAY, p.DataUltimaSaida, p.Data)          AS DiasSemSaida,
    DATEDIFF(DAY, p.DataUltimaEntrada, p.Data)        AS IdadeEstoqueDias,
    CASE WHEN p.DataUltimaSaida IS NULL
           OR DATEDIFF(DAY, p.DataUltimaSaida, p.Data) > 180 THEN 1 ELSE 0 END AS FlagSemGiro,
    CASE WHEN p.DataUltimaSaida IS NULL
           OR DATEDIFF(DAY, p.DataUltimaSaida, p.Data) > 365 THEN 1 ELSE 0 END AS FlagObsoleto
FROM bi.fPosicaoEstoque AS p;
GO

/* ---------------------------------------------------------------------
   3. vw_Requisicao
   Calcula as flags de nivel de servico na origem. Manter esta logica em
   SQL evita medidas DAX pesadas com iteradores linha a linha.
   --------------------------------------------------------------------- */
CREATE OR ALTER VIEW bi.vw_Requisicao AS
SELECT
    r.SK_RequisicaoItem,
    r.NumeroRequisicao,
    r.DataSolicitacao,
    r.DataPrometida,
    r.DataAtendimento,
    r.SK_Item,
    r.SK_Deposito,
    r.SK_CentroCusto,
    r.SK_Solicitante,
    r.SK_Status,
    r.QuantidadeSolicitada,
    r.QuantidadeAtendida,
    r.QuantidadeSolicitada - r.QuantidadeAtendida      AS QuantidadeNaoAtendida,
    r.CustoUnitario,
    (r.QuantidadeSolicitada - r.QuantidadeAtendida)
        * ISNULL(r.CustoUnitario, 0)                   AS ValorNaoAtendido,
    r.HorasAtendimento,
    CASE WHEN r.QuantidadeAtendida >= r.QuantidadeSolicitada THEN 1 ELSE 0 END AS FlagAtendidoTotal,
    CASE WHEN r.DataAtendimento IS NOT NULL
          AND r.DataAtendimento <= r.DataPrometida     THEN 1 ELSE 0 END AS FlagNoPrazo,
    CASE WHEN r.QuantidadeAtendida >= r.QuantidadeSolicitada
          AND r.DataAtendimento IS NOT NULL
          AND r.DataAtendimento <= r.DataPrometida     THEN 1 ELSE 0 END AS FlagOTIF,
    CASE WHEN r.DataAtendimento IS NULL                THEN 1 ELSE 0 END AS FlagPendente,
    r.MotivoNaoAtendimento
FROM bi.fRequisicaoItem AS r;
GO

/* ---------------------------------------------------------------------
   4. vw_Compra
   Lead time real e flags de pontualidade calculados na origem.
   --------------------------------------------------------------------- */
CREATE OR ALTER VIEW bi.vw_Compra AS
SELECT
    c.SK_CompraItem,
    c.NumeroPedido,
    c.DataPedido,
    c.DataPrometida,
    c.DataRecebimento,
    c.SK_Item,
    c.SK_Fornecedor,
    c.SK_Deposito,
    c.QuantidadePedida,
    c.QuantidadeRecebida,
    c.QuantidadeDevolvida,
    c.PrecoUnitario,
    c.ValorPedido,
    c.ValorRecebido,
    DATEDIFF(DAY, c.DataPedido, c.DataRecebimento)     AS LeadTimeRealDias,
    DATEDIFF(DAY, c.DataPrometida, c.DataRecebimento)  AS AtrasoDias,
    CASE WHEN c.DataRecebimento IS NOT NULL
          AND c.DataRecebimento <= c.DataPrometida     THEN 1 ELSE 0 END AS FlagEntregaNoPrazo,
    CASE WHEN c.QuantidadeRecebida >= c.QuantidadePedida THEN 1 ELSE 0 END AS FlagRecebimentoTotal,
    CASE WHEN c.DataRecebimento IS NULL                THEN 1 ELSE 0 END AS FlagEmAberto,
    CASE WHEN c.DataRecebimento IS NULL
         THEN c.ValorPedido - c.ValorRecebido ELSE 0 END AS ValorEmTransito,
    c.StatusPedido
FROM bi.fCompraItem AS c;
GO

/* ---------------------------------------------------------------------
   5. vw_Inventario
   Aplica a tolerancia de divergencia definida na regra de negocio.
   --------------------------------------------------------------------- */
CREATE OR ALTER VIEW bi.vw_Inventario AS
SELECT
    i.SK_Contagem,
    i.DataContagem,
    i.CicloInventario,
    i.SK_Item,
    i.SK_Deposito,
    i.QuantidadeSistema,
    i.QuantidadeContada,
    i.QuantidadeContada - i.QuantidadeSistema          AS DivergenciaQuantidade,
    ABS(i.QuantidadeContada - i.QuantidadeSistema)     AS DivergenciaAbsoluta,
    i.CustoMedio,
    (i.QuantidadeContada - i.QuantidadeSistema)
        * i.CustoMedio                                 AS DivergenciaValor,
    CASE WHEN i.QuantidadeSistema = 0 THEN
             CASE WHEN i.QuantidadeContada = 0 THEN 1 ELSE 0 END
         WHEN ABS(i.QuantidadeContada - i.QuantidadeSistema)
              / NULLIF(i.QuantidadeSistema, 0) <= 0.005 THEN 1
         ELSE 0 END                                    AS FlagSemDivergencia,
    i.Contador
FROM bi.fInventarioContagem AS i;
GO

/* ---------------------------------------------------------------------
   6. vw_ConsumoMensalItem
   Agregacao pre-calculada de consumo mensal por item e deposito.
   Usada para acelerar o calculo de CMM, curva ABC e curva XYZ em
   modelos com grande volume de movimentacao.
   --------------------------------------------------------------------- */
CREATE OR ALTER VIEW bi.vw_ConsumoMensalItem AS
SELECT
    cal.AnoMes,
    MIN(cal.Data)                       AS DataReferencia,
    m.SK_Item,
    m.SK_Deposito,
    SUM(m.Quantidade)                   AS QuantidadeConsumida,
    SUM(m.ValorTotal)                   AS ValorConsumido,
    COUNT(*)                            AS QtdMovimentos
FROM bi.fMovimentacaoEstoque AS m
INNER JOIN bi.dTipoMovimento AS t ON t.SK_TipoMovimento = m.SK_TipoMovimento
INNER JOIN bi.dCalendario    AS cal ON cal.Data = m.Data
WHERE t.ContaConsumo = 1
GROUP BY cal.AnoMes, m.SK_Item, m.SK_Deposito;
GO

/* ---------------------------------------------------------------------
   7. vw_QualidadeCadastro
   Alimenta a pagina de qualidade de dados. Cada linha e uma pendencia
   de cadastro que impede o calculo correto de algum indicador.
   --------------------------------------------------------------------- */
CREATE OR ALTER VIEW bi.vw_QualidadeCadastro AS
SELECT 'Item sem curva ABC'          AS Pendencia, i.CodigoItem AS Chave, i.Descricao AS Detalhe
FROM bi.dItem i WHERE i.CurvaABC IS NULL AND i.StatusItem = 'Ativo'
UNION ALL
SELECT 'Item sem estoque minimo',    i.CodigoItem, i.Descricao
FROM bi.dItem i WHERE i.EstoqueMinimo IS NULL AND i.StatusItem = 'Ativo'
UNION ALL
SELECT 'Item sem lead time padrao',  i.CodigoItem, i.Descricao
FROM bi.dItem i WHERE i.LeadTimePadraoDias IS NULL AND i.StatusItem = 'Ativo'
UNION ALL
SELECT 'Item sem categoria',         i.CodigoItem, i.Descricao
FROM bi.dItem i WHERE i.Categoria IS NULL AND i.StatusItem = 'Ativo'
UNION ALL
SELECT 'Movimento sem centro de custo', m.NumeroDocumento, CONVERT(VARCHAR(10), m.Data, 103)
FROM bi.fMovimentacaoEstoque m
INNER JOIN bi.dTipoMovimento t ON t.SK_TipoMovimento = m.SK_TipoMovimento
WHERE m.SK_CentroCusto IS NULL AND t.Natureza = 'Saida'
UNION ALL
SELECT 'Movimento com custo zerado', m.NumeroDocumento, CONVERT(VARCHAR(10), m.Data, 103)
FROM bi.fMovimentacaoEstoque m
WHERE m.CustoUnitario = 0;
GO

/* ---------------------------------------------------------------------
   8. vw_ControleConciliacao
   Totais de controle para conferir o painel contra o ERP antes de cada
   publicacao. Executar e comparar com o relatorio oficial de estoque.
   --------------------------------------------------------------------- */
CREATE OR ALTER VIEW bi.vw_ControleConciliacao AS
SELECT
    p.Data,
    COUNT(DISTINCT p.SK_Item)   AS QtdItens,
    SUM(p.QuantidadeSaldo)      AS QuantidadeTotal,
    SUM(p.ValorSaldo)           AS ValorTotalEstoque
FROM bi.fPosicaoEstoque AS p
GROUP BY p.Data;
GO
