// =====================================================================
// PARAMETROS DA SOLUCAO
// Crie cada bloco como uma consulta separada em Pagina Inicial >
// Transformar dados > Nova Fonte > Consulta em Branco > Editor Avancado.
// Parametrizar a conexao permite trocar de homologacao para producao
// sem editar consulta por consulta.
// =====================================================================

// ---------------------------------------------------------------------
// pServidor  (tipo Texto, valor sugerido: "srv-bi\\INSTANCIA")
// pBanco     (tipo Texto, valor sugerido: "DW_Corporativo")
// pSchema    (tipo Texto, valor sugerido: "bi")
// Crie os tres em Pagina Inicial > Gerenciar Parametros > Novo Parametro.
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// pDataInicio: primeira data carregada no modelo.
// Reduzir a janela historica e a forma mais rapida de diminuir o tamanho
// do arquivo quando o modelo passar do limite de 1 GB no Power BI Pro.
// ---------------------------------------------------------------------
let
    pDataInicio = #date ( Date.Year ( DateTime.LocalNow () ) - 2, 1, 1 )
in
    pDataInicio

// ---------------------------------------------------------------------
// UltimaAtualizacao: carimbo de data e hora do refresh.
// Ajuste o fuso horario conforme a regiao. O exemplo usa Brasilia
// (UTC menos 3 horas).
// ---------------------------------------------------------------------
let
    Fonte = DateTimeZone.SwitchZone ( DateTimeZone.UtcNow (), -3 ),
    Tabela = #table (
        type table [ DataHora = datetime ],
        { { DateTime.From ( Fonte ) } }
    )
in
    Tabela

// ---------------------------------------------------------------------
// fnConectar: funcao reutilizavel de conexao ao banco.
// Centraliza a string de conexao. Se o servidor mudar, altere o
// parametro e todas as consultas acompanham.
// ---------------------------------------------------------------------
let
    fnConectar = ( NomeObjeto as text ) as table =>
        let
            Fonte = Sql.Database ( pServidor, pBanco ),
            Objeto = Fonte { [ Schema = pSchema, Item = NomeObjeto ] } [ Data ]
        in
            Objeto
in
    fnConectar
