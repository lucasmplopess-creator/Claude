// =====================================================================
// DIMENSOES
// Cada bloco e uma consulta independente. Todas usam a funcao fnConectar
// definida em 00-parametros.m.
// =====================================================================

// ---------------------------------------------------------------------
// dItem
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "dItem" ),
    // Traz apenas as colunas usadas no relatorio. Cada coluna descartada
    // reduz o tamanho do modelo e acelera o refresh.
    Colunas = Table.SelectColumns ( Fonte, {
        "SK_Item", "CodigoItem", "Descricao", "Categoria", "Subcategoria",
        "UnidadeMedida", "CurvaABC", "Criticidade", "EstoqueMinimo",
        "EstoqueMaximo", "PontoPedido", "LoteMinimoCompra",
        "LeadTimePadraoDias", "CustoPadrao", "Perecivel", "ItemControlado",
        "StatusItem", "DataCadastro" } ),
    // Padroniza texto para evitar duplicidade por diferenca de caixa
    Limpo = Table.TransformColumns ( Colunas, {
        { "Descricao",   each Text.Proper ( Text.Trim ( _ ) ), type text },
        { "Categoria",   each Text.Proper ( Text.Trim ( _ ) ), type text },
        { "Subcategoria", each Text.Proper ( Text.Trim ( _ ) ), type text } } ),
    // Cria a descricao completa usada nas tabelas de detalhe
    ComRotulo = Table.AddColumn ( Limpo, "ItemCompleto",
        each [CodigoItem] & " - " & [Descricao], type text ),
    Tipado = Table.TransformColumnTypes ( ComRotulo, {
        { "SK_Item", Int64.Type }, { "EstoqueMinimo", type number },
        { "EstoqueMaximo", type number }, { "PontoPedido", type number },
        { "LeadTimePadraoDias", Int64.Type }, { "CustoPadrao", type number },
        { "Perecivel", type logical }, { "ItemControlado", type logical },
        { "DataCadastro", type date } } )
in
    Tipado

// ---------------------------------------------------------------------
// dFornecedor
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "dFornecedor" ),
    Colunas = Table.SelectColumns ( Fonte, {
        "SK_Fornecedor", "CodigoFornecedor", "RazaoSocial", "NomeFantasia",
        "UF", "Cidade", "CategoriaFornecimento", "PorteFornecedor",
        "StatusFornecedor", "DataHomologacao" } ),
    // O CNPJ e removido por nao ser usado em nenhuma analise. Dados
    // cadastrais sensiveis nao devem trafegar para o modelo sem uso.
    Limpo = Table.TransformColumns ( Colunas, {
        { "RazaoSocial", each Text.Proper ( Text.Trim ( _ ) ), type text } } ),
    Tipado = Table.TransformColumnTypes ( Limpo, {
        { "SK_Fornecedor", Int64.Type }, { "DataHomologacao", type date } } )
in
    Tipado

// ---------------------------------------------------------------------
// dCentroCusto
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "dCentroCusto" ),
    Colunas = Table.SelectColumns ( Fonte, {
        "SK_CentroCusto", "CodigoCentroCusto", "NomeCentroCusto", "Area",
        "Gerencia", "Diretoria", "Responsavel", "EmailResponsavel",
        "StatusCentroCusto" } ),
    // O email fica no modelo porque e a chave da seguranca em nivel de
    // linha. Mantenha a coluna oculta no relatorio.
    ComRotulo = Table.AddColumn ( Colunas, "CentroCustoCompleto",
        each [CodigoCentroCusto] & " - " & [NomeCentroCusto], type text ),
    Tipado = Table.TransformColumnTypes ( ComRotulo, { { "SK_CentroCusto", Int64.Type } } )
in
    Tipado

// ---------------------------------------------------------------------
// dDeposito
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "dDeposito" ),
    Tipado = Table.TransformColumnTypes ( Fonte, { { "SK_Deposito", Int64.Type } } )
in
    Tipado

// ---------------------------------------------------------------------
// dTipoMovimento
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "dTipoMovimento" ),
    Tipado = Table.TransformColumnTypes ( Fonte, {
        { "SK_TipoMovimento", Int64.Type },
        { "AfetaCusto", type logical },
        { "ContaConsumo", type logical } } )
in
    Tipado

// ---------------------------------------------------------------------
// dSolicitante
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "dSolicitante" ),
    Tipado = Table.TransformColumnTypes ( Fonte, {
        { "SK_Solicitante", Int64.Type }, { "SK_CentroCusto", Int64.Type } } )
in
    Tipado

// ---------------------------------------------------------------------
// dStatusRequisicao
// ---------------------------------------------------------------------
let
    Fonte = fnConectar ( "dStatusRequisicao" ),
    Tipado = Table.TransformColumnTypes ( Fonte, {
        { "SK_Status", Int64.Type }, { "StatusFinalizado", type logical } } )
in
    Tipado

// ---------------------------------------------------------------------
// dMetaKPI
// Origem sugerida: planilha no SharePoint, para que a gestao atualize as
// metas sem depender da equipe de BI.
// ---------------------------------------------------------------------
let
    Fonte = Excel.Workbook ( Web.Contents ( "https://SUA-EMPRESA.sharepoint.com/sites/almoxarifado/Documentos/metas_kpi.xlsx" ), null, true ),
    Planilha = Fonte { [ Item = "Metas", Kind = "Sheet" ] } [ Data ],
    Cabecalho = Table.PromoteHeaders ( Planilha, [ PromoteAllScalars = true ] ),
    Tipado = Table.TransformColumnTypes ( Cabecalho, {
        { "AnoMes", Int64.Type }, { "Indicador", type text },
        { "ValorMeta", type number }, { "TipoMeta", type text },
        { "LimiteInferior", type number }, { "LimiteSuperior", type number } } ),
    SemVazios = Table.SelectRows ( Tipado, each [Indicador] <> null and [Indicador] <> "" )
in
    SemVazios
