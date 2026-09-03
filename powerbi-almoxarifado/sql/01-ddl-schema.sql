/* =====================================================================
   PROJETO: Dashboard de Indicadores do Almoxarifado
   ARQUIVO: 01-ddl-schema.sql
   OBJETIVO: Criacao do schema analitico (camada BI) do almoxarifado
   DIALETO: T-SQL (SQL Server). Notas de adaptacao para PostgreSQL e
            Oracle estao ao final do arquivo.
   ===================================================================== */

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'bi')
    EXEC('CREATE SCHEMA bi');
GO

/* ---------------------------------------------------------------------
   1. DIMENSOES
   --------------------------------------------------------------------- */

/* 1.1 Calendario ---------------------------------------------------- */
IF OBJECT_ID('bi.dCalendario') IS NOT NULL DROP TABLE bi.dCalendario;
CREATE TABLE bi.dCalendario (
    Data              DATE         NOT NULL PRIMARY KEY,
    Ano               INT          NOT NULL,
    Trimestre         VARCHAR(2)   NOT NULL,
    AnoTrimestre      VARCHAR(8)   NOT NULL,
    MesNumero         TINYINT      NOT NULL,
    MesNome           VARCHAR(15)  NOT NULL,
    MesAbrev          VARCHAR(3)   NOT NULL,
    AnoMes            INT          NOT NULL,
    AnoMesNome        VARCHAR(10)  NOT NULL,
    Semana            TINYINT      NOT NULL,
    DiaSemana         TINYINT      NOT NULL,
    DiaSemanaNome     VARCHAR(15)  NOT NULL,
    DiaUtil           BIT          NOT NULL,
    Feriado           BIT          NOT NULL DEFAULT 0,
    DataFimMes        DATE         NOT NULL
);
GO

/* 1.2 Item ---------------------------------------------------------- */
IF OBJECT_ID('bi.dItem') IS NOT NULL DROP TABLE bi.dItem;
CREATE TABLE bi.dItem (
    SK_Item                     INT           NOT NULL PRIMARY KEY,
    CodigoItem                  VARCHAR(30)   NOT NULL,
    Descricao                   VARCHAR(200)  NOT NULL,
    Categoria                   VARCHAR(60)   NULL,
    Subcategoria                VARCHAR(60)   NULL,
    UnidadeMedida               VARCHAR(6)    NULL,
    CurvaABC                    CHAR(1)       NULL,
    Criticidade                 VARCHAR(10)   NULL,
    EstoqueMinimo               DECIMAL(18,4) NULL,
    EstoqueMaximo               DECIMAL(18,4) NULL,
    PontoPedido                 DECIMAL(18,4) NULL,
    LoteMinimoCompra            DECIMAL(18,4) NULL,
    LeadTimePadraoDias          INT           NULL,
    CustoPadrao                 DECIMAL(18,4) NULL,
    Perecivel                   BIT           NOT NULL DEFAULT 0,
    ItemControlado              BIT           NOT NULL DEFAULT 0,
    SK_FornecedorPreferencial   INT           NULL,
    StatusItem                  VARCHAR(15)   NOT NULL DEFAULT 'Ativo',
    DataCadastro                DATE          NULL,
    CONSTRAINT UQ_dItem_Codigo UNIQUE (CodigoItem)
);
GO

/* 1.3 Fornecedor ---------------------------------------------------- */
IF OBJECT_ID('bi.dFornecedor') IS NOT NULL DROP TABLE bi.dFornecedor;
CREATE TABLE bi.dFornecedor (
    SK_Fornecedor           INT          NOT NULL PRIMARY KEY,
    CodigoFornecedor        VARCHAR(20)  NOT NULL,
    RazaoSocial             VARCHAR(150) NOT NULL,
    NomeFantasia            VARCHAR(100) NULL,
    CNPJ                    VARCHAR(18)  NULL,
    UF                      CHAR(2)      NULL,
    Cidade                  VARCHAR(80)  NULL,
    CategoriaFornecimento   VARCHAR(60)  NULL,
    PorteFornecedor         VARCHAR(15)  NULL,
    StatusFornecedor        VARCHAR(20)  NOT NULL DEFAULT 'Ativo',
    DataHomologacao         DATE         NULL,
    CONSTRAINT UQ_dFornecedor_Codigo UNIQUE (CodigoFornecedor)
);
GO

/* 1.4 Centro de Custo ----------------------------------------------- */
IF OBJECT_ID('bi.dCentroCusto') IS NOT NULL DROP TABLE bi.dCentroCusto;
CREATE TABLE bi.dCentroCusto (
    SK_CentroCusto      INT          NOT NULL PRIMARY KEY,
    CodigoCentroCusto   VARCHAR(20)  NOT NULL,
    NomeCentroCusto     VARCHAR(100) NOT NULL,
    Area                VARCHAR(60)  NULL,
    Gerencia            VARCHAR(60)  NULL,
    Diretoria           VARCHAR(60)  NULL,
    Responsavel         VARCHAR(100) NULL,
    EmailResponsavel    VARCHAR(120) NULL,
    StatusCentroCusto   VARCHAR(15)  NOT NULL DEFAULT 'Ativo',
    CONSTRAINT UQ_dCentroCusto_Codigo UNIQUE (CodigoCentroCusto)
);
GO

/* 1.5 Deposito ------------------------------------------------------ */
IF OBJECT_ID('bi.dDeposito') IS NOT NULL DROP TABLE bi.dDeposito;
CREATE TABLE bi.dDeposito (
    SK_Deposito         INT          NOT NULL PRIMARY KEY,
    CodigoDeposito      VARCHAR(20)  NOT NULL,
    NomeDeposito        VARCHAR(100) NOT NULL,
    TipoDeposito        VARCHAR(30)  NULL,
    Planta              VARCHAR(60)  NULL,
    UF                  CHAR(2)      NULL,
    EmailResponsavel    VARCHAR(120) NULL,
    CONSTRAINT UQ_dDeposito_Codigo UNIQUE (CodigoDeposito)
);
GO

/* 1.6 Tipo de Movimento --------------------------------------------- */
IF OBJECT_ID('bi.dTipoMovimento') IS NOT NULL DROP TABLE bi.dTipoMovimento;
CREATE TABLE bi.dTipoMovimento (
    SK_TipoMovimento    INT          NOT NULL PRIMARY KEY,
    CodigoMovimento     VARCHAR(10)  NOT NULL,
    DescricaoMovimento  VARCHAR(80)  NOT NULL,
    Natureza            VARCHAR(10)  NOT NULL,  -- Entrada | Saida
    GrupoMovimento      VARCHAR(30)  NOT NULL,  -- Compra | Consumo | Ajuste | Transferencia | Devolucao | Perda
    AfetaCusto          BIT          NOT NULL DEFAULT 1,
    ContaConsumo        BIT          NOT NULL DEFAULT 0,
    CONSTRAINT UQ_dTipoMovimento_Codigo UNIQUE (CodigoMovimento)
);
GO

/* 1.7 Solicitante --------------------------------------------------- */
IF OBJECT_ID('bi.dSolicitante') IS NOT NULL DROP TABLE bi.dSolicitante;
CREATE TABLE bi.dSolicitante (
    SK_Solicitante   INT          NOT NULL PRIMARY KEY,
    Matricula        VARCHAR(20)  NOT NULL,
    NomeSolicitante  VARCHAR(100) NOT NULL,
    Cargo            VARCHAR(60)  NULL,
    SK_CentroCusto   INT          NULL,
    Email            VARCHAR(120) NULL
);
GO

/* 1.8 Status da Requisicao ------------------------------------------ */
IF OBJECT_ID('bi.dStatusRequisicao') IS NOT NULL DROP TABLE bi.dStatusRequisicao;
CREATE TABLE bi.dStatusRequisicao (
    SK_Status           INT         NOT NULL PRIMARY KEY,
    CodigoStatus        VARCHAR(10) NOT NULL,
    DescricaoStatus     VARCHAR(40) NOT NULL,
    StatusFinalizado    BIT         NOT NULL DEFAULT 0
);
GO

/* ---------------------------------------------------------------------
   2. TABELAS FATO
   --------------------------------------------------------------------- */

/* 2.1 Movimentacao de Estoque --------------------------------------- */
IF OBJECT_ID('bi.fMovimentacaoEstoque') IS NOT NULL DROP TABLE bi.fMovimentacaoEstoque;
CREATE TABLE bi.fMovimentacaoEstoque (
    SK_Movimentacao       BIGINT        NOT NULL PRIMARY KEY,
    Data                  DATE          NOT NULL,
    SK_Item               INT           NOT NULL,
    SK_Deposito           INT           NOT NULL,
    SK_TipoMovimento      INT           NOT NULL,
    SK_CentroCusto        INT           NULL,
    SK_Fornecedor         INT           NULL,
    NumeroDocumento       VARCHAR(30)   NULL,
    Quantidade            DECIMAL(18,4) NOT NULL,
    CustoUnitario         DECIMAL(18,4) NOT NULL,
    ValorTotal            DECIMAL(18,2) NOT NULL,
    QuantidadeSinalizada  DECIMAL(18,4) NOT NULL,
    ValorSinalizado       DECIMAL(18,2) NOT NULL
);
CREATE INDEX IX_fMov_Data      ON bi.fMovimentacaoEstoque (Data);
CREATE INDEX IX_fMov_Item      ON bi.fMovimentacaoEstoque (SK_Item);
CREATE INDEX IX_fMov_Deposito  ON bi.fMovimentacaoEstoque (SK_Deposito);
CREATE INDEX IX_fMov_Tipo      ON bi.fMovimentacaoEstoque (SK_TipoMovimento);
GO

/* 2.2 Posicao de Estoque (snapshot) --------------------------------- */
IF OBJECT_ID('bi.fPosicaoEstoque') IS NOT NULL DROP TABLE bi.fPosicaoEstoque;
CREATE TABLE bi.fPosicaoEstoque (
    Data                    DATE          NOT NULL,
    SK_Item                 INT           NOT NULL,
    SK_Deposito             INT           NOT NULL,
    QuantidadeSaldo         DECIMAL(18,4) NOT NULL,
    QuantidadeReservada     DECIMAL(18,4) NOT NULL DEFAULT 0,
    QuantidadeBloqueada     DECIMAL(18,4) NOT NULL DEFAULT 0,
    QuantidadeDisponivel    DECIMAL(18,4) NOT NULL,
    CustoMedio              DECIMAL(18,4) NOT NULL,
    ValorSaldo              DECIMAL(18,2) NOT NULL,
    DataUltimaSaida         DATE          NULL,
    DataUltimaEntrada       DATE          NULL,
    CONSTRAINT PK_fPosicaoEstoque PRIMARY KEY (Data, SK_Item, SK_Deposito)
);
CREATE INDEX IX_fPos_Item ON bi.fPosicaoEstoque (SK_Item);
GO

/* 2.3 Itens de Requisicao ------------------------------------------- */
IF OBJECT_ID('bi.fRequisicaoItem') IS NOT NULL DROP TABLE bi.fRequisicaoItem;
CREATE TABLE bi.fRequisicaoItem (
    SK_RequisicaoItem       BIGINT        NOT NULL PRIMARY KEY,
    NumeroRequisicao        VARCHAR(30)   NOT NULL,
    DataSolicitacao         DATE          NOT NULL,
    DataPrometida           DATE          NULL,
    DataAtendimento         DATE          NULL,
    SK_Item                 INT           NOT NULL,
    SK_Deposito             INT           NOT NULL,
    SK_CentroCusto          INT           NOT NULL,
    SK_Solicitante          INT           NULL,
    SK_Status               INT           NOT NULL,
    QuantidadeSolicitada    DECIMAL(18,4) NOT NULL,
    QuantidadeAtendida      DECIMAL(18,4) NOT NULL DEFAULT 0,
    QuantidadeNaoAtendida   DECIMAL(18,4) NOT NULL DEFAULT 0,
    CustoUnitario           DECIMAL(18,4) NULL,
    HorasAtendimento        DECIMAL(10,2) NULL,
    FlagAtendidoTotal       BIT           NOT NULL DEFAULT 0,
    FlagNoPrazo             BIT           NOT NULL DEFAULT 0,
    FlagOTIF                BIT           NOT NULL DEFAULT 0,
    MotivoNaoAtendimento    VARCHAR(60)   NULL
);
CREATE INDEX IX_fReq_DataSol ON bi.fRequisicaoItem (DataSolicitacao);
CREATE INDEX IX_fReq_Item    ON bi.fRequisicaoItem (SK_Item);
GO

/* 2.4 Itens de Compra ----------------------------------------------- */
IF OBJECT_ID('bi.fCompraItem') IS NOT NULL DROP TABLE bi.fCompraItem;
CREATE TABLE bi.fCompraItem (
    SK_CompraItem           BIGINT        NOT NULL PRIMARY KEY,
    NumeroPedido            VARCHAR(30)   NOT NULL,
    DataPedido              DATE          NOT NULL,
    DataPrometida           DATE          NULL,
    DataRecebimento         DATE          NULL,
    SK_Item                 INT           NOT NULL,
    SK_Fornecedor           INT           NOT NULL,
    SK_Deposito             INT           NOT NULL,
    QuantidadePedida        DECIMAL(18,4) NOT NULL,
    QuantidadeRecebida      DECIMAL(18,4) NOT NULL DEFAULT 0,
    QuantidadeDevolvida     DECIMAL(18,4) NOT NULL DEFAULT 0,
    PrecoUnitario           DECIMAL(18,4) NOT NULL,
    ValorPedido             DECIMAL(18,2) NOT NULL,
    ValorRecebido           DECIMAL(18,2) NOT NULL DEFAULT 0,
    LeadTimeRealDias        INT           NULL,
    FlagEntregaNoPrazo      BIT           NOT NULL DEFAULT 0,
    FlagRecebimentoTotal    BIT           NOT NULL DEFAULT 0,
    StatusPedido            VARCHAR(15)   NOT NULL DEFAULT 'Aberto'
);
CREATE INDEX IX_fCompra_DataPedido ON bi.fCompraItem (DataPedido);
CREATE INDEX IX_fCompra_Fornecedor ON bi.fCompraItem (SK_Fornecedor);
GO

/* 2.5 Contagens de Inventario --------------------------------------- */
IF OBJECT_ID('bi.fInventarioContagem') IS NOT NULL DROP TABLE bi.fInventarioContagem;
CREATE TABLE bi.fInventarioContagem (
    SK_Contagem             BIGINT        NOT NULL PRIMARY KEY,
    DataContagem            DATE          NOT NULL,
    CicloInventario         VARCHAR(20)   NOT NULL,
    SK_Item                 INT           NOT NULL,
    SK_Deposito             INT           NOT NULL,
    QuantidadeSistema       DECIMAL(18,4) NOT NULL,
    QuantidadeContada       DECIMAL(18,4) NOT NULL,
    DivergenciaQuantidade   DECIMAL(18,4) NOT NULL,
    CustoMedio              DECIMAL(18,4) NOT NULL,
    DivergenciaValor        DECIMAL(18,2) NOT NULL,
    FlagSemDivergencia      BIT           NOT NULL DEFAULT 0,
    Contador                VARCHAR(60)   NULL
);
CREATE INDEX IX_fInv_Data ON bi.fInventarioContagem (DataContagem);
GO

/* 2.6 Orcamento por Centro de Custo --------------------------------- */
IF OBJECT_ID('bi.fOrcamento') IS NOT NULL DROP TABLE bi.fOrcamento;
CREATE TABLE bi.fOrcamento (
    AnoMes           INT           NOT NULL,
    DataReferencia   DATE          NOT NULL,
    SK_CentroCusto   INT           NOT NULL,
    Categoria        VARCHAR(60)   NOT NULL,
    ValorOrcado      DECIMAL(18,2) NOT NULL,
    CONSTRAINT PK_fOrcamento PRIMARY KEY (AnoMes, SK_CentroCusto, Categoria)
);
GO

/* 2.7 Metas de Indicadores ------------------------------------------ */
IF OBJECT_ID('bi.dMetaKPI') IS NOT NULL DROP TABLE bi.dMetaKPI;
CREATE TABLE bi.dMetaKPI (
    AnoMes           INT           NOT NULL,
    Indicador        VARCHAR(60)   NOT NULL,
    ValorMeta        DECIMAL(18,4) NOT NULL,
    TipoMeta         VARCHAR(20)   NOT NULL,  -- MaiorMelhor | MenorMelhor | Faixa
    LimiteInferior   DECIMAL(18,4) NULL,
    LimiteSuperior   DECIMAL(18,4) NULL,
    CONSTRAINT PK_dMetaKPI PRIMARY KEY (AnoMes, Indicador)
);
GO

/* ---------------------------------------------------------------------
   3. CHAVES ESTRANGEIRAS
   --------------------------------------------------------------------- */
ALTER TABLE bi.fMovimentacaoEstoque ADD CONSTRAINT FK_fMov_Data     FOREIGN KEY (Data)             REFERENCES bi.dCalendario (Data);
ALTER TABLE bi.fMovimentacaoEstoque ADD CONSTRAINT FK_fMov_Item     FOREIGN KEY (SK_Item)          REFERENCES bi.dItem (SK_Item);
ALTER TABLE bi.fMovimentacaoEstoque ADD CONSTRAINT FK_fMov_Dep      FOREIGN KEY (SK_Deposito)      REFERENCES bi.dDeposito (SK_Deposito);
ALTER TABLE bi.fMovimentacaoEstoque ADD CONSTRAINT FK_fMov_Tipo     FOREIGN KEY (SK_TipoMovimento) REFERENCES bi.dTipoMovimento (SK_TipoMovimento);
ALTER TABLE bi.fPosicaoEstoque      ADD CONSTRAINT FK_fPos_Item     FOREIGN KEY (SK_Item)          REFERENCES bi.dItem (SK_Item);
ALTER TABLE bi.fPosicaoEstoque      ADD CONSTRAINT FK_fPos_Dep      FOREIGN KEY (SK_Deposito)      REFERENCES bi.dDeposito (SK_Deposito);
ALTER TABLE bi.fRequisicaoItem      ADD CONSTRAINT FK_fReq_Item     FOREIGN KEY (SK_Item)          REFERENCES bi.dItem (SK_Item);
ALTER TABLE bi.fRequisicaoItem      ADD CONSTRAINT FK_fReq_CC       FOREIGN KEY (SK_CentroCusto)   REFERENCES bi.dCentroCusto (SK_CentroCusto);
ALTER TABLE bi.fCompraItem          ADD CONSTRAINT FK_fCompra_Item  FOREIGN KEY (SK_Item)          REFERENCES bi.dItem (SK_Item);
ALTER TABLE bi.fCompraItem          ADD CONSTRAINT FK_fCompra_Forn  FOREIGN KEY (SK_Fornecedor)    REFERENCES bi.dFornecedor (SK_Fornecedor);
ALTER TABLE bi.fInventarioContagem  ADD CONSTRAINT FK_fInv_Item     FOREIGN KEY (SK_Item)          REFERENCES bi.dItem (SK_Item);
GO

/* ---------------------------------------------------------------------
   4. NOTAS DE ADAPTACAO PARA OUTROS BANCOS
   ---------------------------------------------------------------------
   PostgreSQL:
     - Troque BIT por BOOLEAN e o valor padrao 0/1 por FALSE/TRUE.
     - Troque TINYINT por SMALLINT.
     - Troque VARCHAR(n) por VARCHAR(n) (compativel) e DATE permanece.
     - Substitua o bloco IF OBJECT_ID(...) DROP por DROP TABLE IF EXISTS.
     - Remova os comandos GO.

   Oracle:
     - Troque BIT por NUMBER(1) e VARCHAR por VARCHAR2.
     - Troque DECIMAL(18,4) por NUMBER(18,4).
     - Substitua DATE por DATE (compativel) e remova GO.
     - Use sequences para as chaves substitutas.

   MySQL / MariaDB:
     - Troque BIT por TINYINT(1).
     - Substitua o bloco IF OBJECT_ID por DROP TABLE IF EXISTS.
     - Remova GO e ajuste CREATE INDEX para a sintaxe inline.
   --------------------------------------------------------------------- */
