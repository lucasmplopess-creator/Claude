// =====================================================================
// dCalendario
// Calendario gerado no Power Query. Preferivel a versao em DAX porque
// permite ajustes de feriado e de calendario fiscal sem recalcular o
// modelo inteiro.
// =====================================================================
let
    // Intervalo: do inicio do parametro pDataInicio ate o fim do ano corrente
    DataInicio = pDataInicio,
    DataFim    = #date ( Date.Year ( DateTime.LocalNow () ), 12, 31 ),
    QtdDias    = Duration.Days ( DataFim - DataInicio ) + 1,

    ListaDatas = List.Dates ( DataInicio, QtdDias, #duration ( 1, 0, 0, 0 ) ),
    TabelaBase = Table.FromList ( ListaDatas, Splitter.SplitByNothing (), { "Data" } ),
    TipoData   = Table.TransformColumnTypes ( TabelaBase, { { "Data", type date } } ),

    // Feriados nacionais fixos. Acrescente os moveis e os municipais
    // conforme a necessidade da operacao.
    ListaFeriados = {
        "01-01",  // Confraternização Universal
        "04-21",  // Tiradentes
        "05-01",  // Dia do Trabalho
        "09-07",  // Independência
        "10-12",  // Nossa Senhora Aparecida
        "11-02",  // Finados
        "11-15",  // Proclamação da República
        "11-20",  // Consciência Negra
        "12-25"   // Natal
    },

    ComAtributos = Table.AddColumn ( TipoData, "Atributos", each
        let
            d = [Data],
            mes = Date.Month ( d ),
            ano = Date.Year ( d ),
            diaSemana = Date.DayOfWeek ( d, Day.Monday ) + 1,
            chaveFeriado = Text.PadStart ( Number.ToText ( mes ), 2, "0" ) & "-"
                         & Text.PadStart ( Number.ToText ( Date.Day ( d ) ), 2, "0" ),
            ehFeriado = List.Contains ( ListaFeriados, chaveFeriado ),
            ehFimSemana = diaSemana >= 6
        in
            [
                Ano           = ano,
                Trimestre     = "T" & Number.ToText ( Date.QuarterOfYear ( d ) ),
                AnoTrimestre  = Number.ToText ( ano ) & "-T" & Number.ToText ( Date.QuarterOfYear ( d ) ),
                MesNumero     = mes,
                MesNome       = Text.Proper ( Date.ToText ( d, "MMMM", "pt-BR" ) ),
                MesAbrev      = Text.Proper ( Date.ToText ( d, "MMM", "pt-BR" ) ),
                AnoMes        = ano * 100 + mes,
                AnoMesNome    = Text.Proper ( Date.ToText ( d, "MMM/yy", "pt-BR" ) ),
                Semana        = Date.WeekOfYear ( d, Day.Monday ),
                DiaSemana     = diaSemana,
                DiaSemanaNome = Text.Proper ( Date.ToText ( d, "dddd", "pt-BR" ) ),
                Feriado       = ehFeriado,
                DiaUtil       = not ehFimSemana and not ehFeriado,
                DataFimMes    = Date.EndOfMonth ( d ),
                MesesAtras    = ( Date.Year ( DateTime.LocalNow () ) * 12 + Date.Month ( DateTime.LocalNow () ) )
                              - ( ano * 12 + mes ),
                IsMesAtual    = Date.EndOfMonth ( d ) = Date.EndOfMonth ( DateTime.Date ( DateTime.LocalNow () ) ),
                IsAnoAtual    = ano = Date.Year ( DateTime.LocalNow () )
            ]
    ),

    Expandido = Table.ExpandRecordColumn ( ComAtributos, "Atributos",
        { "Ano", "Trimestre", "AnoTrimestre", "MesNumero", "MesNome", "MesAbrev",
          "AnoMes", "AnoMesNome", "Semana", "DiaSemana", "DiaSemanaNome",
          "Feriado", "DiaUtil", "DataFimMes", "MesesAtras", "IsMesAtual", "IsAnoAtual" } ),

    Tipado = Table.TransformColumnTypes ( Expandido, {
        { "Ano", Int64.Type }, { "Trimestre", type text }, { "AnoTrimestre", type text },
        { "MesNumero", Int64.Type }, { "MesNome", type text }, { "MesAbrev", type text },
        { "AnoMes", Int64.Type }, { "AnoMesNome", type text }, { "Semana", Int64.Type },
        { "DiaSemana", Int64.Type }, { "DiaSemanaNome", type text },
        { "Feriado", type logical }, { "DiaUtil", type logical },
        { "DataFimMes", type date }, { "MesesAtras", Int64.Type },
        { "IsMesAtual", type logical }, { "IsAnoAtual", type logical } } )
in
    Tipado

// APOS A CARGA, no Power BI Desktop:
//   1. Modelagem > Marcar como tabela de data > coluna Data
//   2. Coluna MesNome      > Classificar por coluna > MesNumero
//   3. Coluna MesAbrev     > Classificar por coluna > MesNumero
//   4. Coluna AnoMesNome   > Classificar por coluna > AnoMes
//   5. Coluna DiaSemanaNome > Classificar por coluna > DiaSemana
