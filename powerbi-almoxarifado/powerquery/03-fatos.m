// =====================================================================
// TABELAS FATO
// =====================================================================

// ---------------------------------------------------------------------
// fMovimentacaoEstoque
// Le da view vw_Movimentacao, que ja aplica o sinal do movimento.
// A filtragem por data e feita ANTES de qualquer transformacao para
// preservar o dobramento de consulta (query folding), fazendo o banco
// processar o filtro em vez do Power Query.
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "vw_Movimentacao" ),
    FiltroData = Table.SelectRows ( Fonte, each [Data] >= pDataInicio ),
    Colunas = Table.SelectColumns ( FiltroData, {
        "SK_Movimentacao", "Data", "SK_Item", "SK_Deposito", "SK_TipoMovimento",
        "SK_CentroCusto", "SK_Fornecedor", "NumeroDocumento", "Quantidade",
        "CustoUnitario", "ValorTotal", "QuantidadeSinalizada", "ValorSinalizado" } ),
    Tipado = Table.TransformColumnTypes ( Colunas, {
        { "Data", type date },
        { "SK_Item", Int64.Type }, { "SK_Deposito", Int64.Type },
        { "SK_TipoMovimento", Int64.Type }, { "SK_CentroCusto", Int64.Type },
        { "SK_Fornecedor", Int64.Type },
        { "Quantidade", type number }, { "CustoUnitario", type number },
        { "ValorTotal", Currency.Type },
        { "QuantidadeSinalizada", type number }, { "ValorSinalizado", Currency.Type } } )
in
    Tipado

// CARGA INCREMENTAL: apos a primeira carga, configure em
// Pagina Inicial > Transformar dados > Gerenciar Parametros, criando
// RangeStart e RangeEnd do tipo Data/Hora, e substitua o passo
// FiltroData por:
//   Table.SelectRows ( Fonte, each [Data] >= Date.From ( RangeStart )
//                                and [Data] <  Date.From ( RangeEnd ) )
// Depois, no modelo, clique com o botao direito na tabela >
// Atualizacao incremental > armazenar 3 anos, atualizar 10 dias.

// ---------------------------------------------------------------------
// fPosicaoEstoque
// Snapshot. Estrategia de volumetria: mensal para o historico completo,
// diario apenas para os ultimos 90 dias. Isso reduz o numero de linhas
// em cerca de 90% sem perder a analise operacional recente.
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "vw_PosicaoEstoque" ),
    FiltroData = Table.SelectRows ( Fonte, each [Data] >= pDataInicio ),
    // Mantem o ultimo dia de cada mes OU qualquer dia dos ultimos 90 dias
    Corte = Date.AddDays ( DateTime.Date ( DateTime.LocalNow () ), -90 ),
    Filtrado = Table.SelectRows ( FiltroData, each
        [Data] = Date.EndOfMonth ( [Data] ) or [Data] >= Corte ),
    Tipado = Table.TransformColumnTypes ( Filtrado, {
        { "Data", type date }, { "SK_Item", Int64.Type }, { "SK_Deposito", Int64.Type },
        { "QuantidadeSaldo", type number }, { "QuantidadeReservada", type number },
        { "QuantidadeBloqueada", type number }, { "QuantidadeDisponivel", type number },
        { "CustoMedio", type number }, { "ValorSaldo", Currency.Type },
        { "DataUltimaSaida", type date }, { "DataUltimaEntrada", type date },
        { "FlagSemGiro", Int64.Type }, { "FlagObsoleto", Int64.Type } } )
in
    Tipado

// ---------------------------------------------------------------------
// fRequisicaoItem
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "vw_Requisicao" ),
    FiltroData = Table.SelectRows ( Fonte, each [DataSolicitacao] >= pDataInicio ),
    Tipado = Table.TransformColumnTypes ( FiltroData, {
        { "SK_RequisicaoItem", Int64.Type }, { "NumeroRequisicao", type text },
        { "DataSolicitacao", type date }, { "DataPrometida", type date },
        { "DataAtendimento", type date },
        { "SK_Item", Int64.Type }, { "SK_Deposito", Int64.Type },
        { "SK_CentroCusto", Int64.Type }, { "SK_Solicitante", Int64.Type },
        { "SK_Status", Int64.Type },
        { "QuantidadeSolicitada", type number }, { "QuantidadeAtendida", type number },
        { "QuantidadeNaoAtendida", type number }, { "CustoUnitario", type number },
        { "HorasAtendimento", type number },
        { "FlagAtendidoTotal", Int64.Type }, { "FlagNoPrazo", Int64.Type },
        { "FlagOTIF", Int64.Type }, { "FlagPendente", Int64.Type },
        { "MotivoNaoAtendimento", type text } } )
in
    Tipado

// ---------------------------------------------------------------------
// fCompraItem
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "vw_Compra" ),
    FiltroData = Table.SelectRows ( Fonte, each [DataPedido] >= pDataInicio ),
    Tipado = Table.TransformColumnTypes ( FiltroData, {
        { "SK_CompraItem", Int64.Type }, { "NumeroPedido", type text },
        { "DataPedido", type date }, { "DataPrometida", type date },
        { "DataRecebimento", type date },
        { "SK_Item", Int64.Type }, { "SK_Fornecedor", Int64.Type },
        { "SK_Deposito", Int64.Type },
        { "QuantidadePedida", type number }, { "QuantidadeRecebida", type number },
        { "QuantidadeDevolvida", type number }, { "PrecoUnitario", type number },
        { "ValorPedido", Currency.Type }, { "ValorRecebido", Currency.Type },
        { "LeadTimeRealDias", Int64.Type },
        { "FlagEntregaNoPrazo", Int64.Type }, { "FlagRecebimentoTotal", Int64.Type },
        { "StatusPedido", type text } } )
in
    Tipado

// ---------------------------------------------------------------------
// fInventarioContagem
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "vw_Inventario" ),
    FiltroData = Table.SelectRows ( Fonte, each [DataContagem] >= pDataInicio ),
    Tipado = Table.TransformColumnTypes ( FiltroData, {
        { "SK_Contagem", Int64.Type }, { "DataContagem", type date },
        { "CicloInventario", type text },
        { "SK_Item", Int64.Type }, { "SK_Deposito", Int64.Type },
        { "QuantidadeSistema", type number }, { "QuantidadeContada", type number },
        { "DivergenciaQuantidade", type number }, { "CustoMedio", type number },
        { "DivergenciaValor", Currency.Type }, { "FlagSemDivergencia", Int64.Type },
        { "Contador", type text } } )
in
    Tipado

// ---------------------------------------------------------------------
// fOrcamento
// Origem sugerida: planilha da Controladoria em SharePoint ou OneDrive.
// O passo Unpivot converte o formato de planilha (um mes por coluna)
// para o formato de tabela que o modelo exige.
// ---------------------------------------------------------------------
let
    Fonte = Excel.Workbook ( Web.Contents ( "https://SUA-EMPRESA.sharepoint.com/sites/almoxarifado/Documentos/orcamento_material.xlsx" ), null, true ),
    Planilha = Fonte { [ Item = "Orcamento", Kind = "Sheet" ] } [ Data ],
    Cabecalho = Table.PromoteHeaders ( Planilha, [ PromoteAllScalars = true ] ),
    // Colunas fixas: CodigoCentroCusto e Categoria. As demais sao meses.
    Despivotado = Table.UnpivotOtherColumns (
        Cabecalho,
        { "CodigoCentroCusto", "Categoria" },
        "AnoMesTexto",
        "ValorOrcado" ),
    ComData = Table.AddColumn ( Despivotado, "DataReferencia", each
        #date (
            Number.FromText ( Text.End ( [AnoMesTexto], 4 ) ),
            Number.FromText ( Text.Start ( [AnoMesTexto], 2 ) ),
            1 ), type date ),
    ComAnoMes = Table.AddColumn ( ComData, "AnoMes", each
        Date.Year ( [DataReferencia] ) * 100 + Date.Month ( [DataReferencia] ), Int64.Type ),
    Tipado = Table.TransformColumnTypes ( ComAnoMes, {
        { "ValorOrcado", Currency.Type }, { "Categoria", type text } } ),
    SemVazios = Table.SelectRows ( Tipado, each [ValorOrcado] <> null and [ValorOrcado] > 0 ),
    Final = Table.RemoveColumns ( SemVazios, { "AnoMesTexto" } )
in
    Final
// O relacionamento com dCentroCusto exige a chave SK_CentroCusto. Faça a
// mesclagem (Merge) com dCentroCusto por CodigoCentroCusto e expanda
// somente a coluna SK_CentroCusto.
