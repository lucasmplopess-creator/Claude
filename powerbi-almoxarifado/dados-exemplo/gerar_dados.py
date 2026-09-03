# -*- coding: utf-8 -*-
"""
Gerador de base de dados de exemplo do Almoxarifado.

Produz arquivos CSV coerentes entre si, com 24 meses de historico, para
homologar o modelo do Power BI antes da conexao com o ERB real.

Uso:
    python3 gerar_dados.py

Saida: arquivos CSV neste mesmo diretorio, separados por ponto e virgula,
codificacao UTF-8 com BOM (compativel com Excel em portugues do Brasil).
"""

import csv
import math
import os
import random
from datetime import date, timedelta

random.seed(42)

DIR = os.path.dirname(os.path.abspath(__file__))
SEP = ";"

DATA_INICIO = date(2024, 9, 1)
DATA_FIM = date(2026, 8, 31)

# =====================================================================
# UTILITARIOS
# =====================================================================

def gravar(nome, cabecalho, linhas):
    caminho = os.path.join(DIR, nome)
    with open(caminho, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=SEP)
        w.writerow(cabecalho)
        w.writerows(linhas)
    print("  {:<28} {:>8} linhas".format(nome, len(linhas)))


def dias_do_periodo(inicio, fim):
    d = inicio
    while d <= fim:
        yield d
        d += timedelta(days=1)


def meses_do_periodo(inicio, fim):
    a, m = inicio.year, inicio.month
    while (a, m) <= (fim.year, fim.month):
        yield a, m
        m += 1
        if m == 13:
            a, m = a + 1, 1


def fim_do_mes(ano, mes):
    if mes == 12:
        return date(ano, 12, 31)
    return date(ano, mes + 1, 1) - timedelta(days=1)


def dia_util_aleatorio(ano, mes):
    ultimo = fim_do_mes(ano, mes).day
    for _ in range(30):
        d = date(ano, mes, random.randint(1, ultimo))
        if d.weekday() < 5:
            return d
    return date(ano, mes, 15)


def brl(v):
    """Formata numero com virgula decimal, padrao brasileiro."""
    return ("%.4f" % v).replace(".", ",")


def brl2(v):
    return ("%.2f" % v).replace(".", ",")


# =====================================================================
# 1. DIMENSAO CALENDARIO
# =====================================================================
MESES_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
MESES_ABREV = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
               "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
DIAS_PT = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
FERIADOS = {"01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"}


def gerar_calendario():
    linhas = []
    inicio = date(DATA_INICIO.year, 1, 1)
    fim = date(DATA_FIM.year, 12, 31)
    for d in dias_do_periodo(inicio, fim):
        chave = "%02d-%02d" % (d.month, d.day)
        feriado = chave in FERIADOS
        fim_semana = d.weekday() >= 5
        linhas.append([
            d.isoformat(), d.year, "T%d" % ((d.month - 1) // 3 + 1),
            "%d-T%d" % (d.year, (d.month - 1) // 3 + 1),
            d.month, MESES_PT[d.month - 1], MESES_ABREV[d.month - 1],
            d.year * 100 + d.month,
            "%s/%s" % (MESES_ABREV[d.month - 1], str(d.year)[2:]),
            d.isocalendar()[1], d.weekday() + 1, DIAS_PT[d.weekday()],
            "SIM" if (not fim_semana and not feriado) else "NAO",
            "SIM" if feriado else "NAO",
            fim_do_mes(d.year, d.month).isoformat(),
        ])
    gravar("dCalendario.csv",
           ["Data", "Ano", "Trimestre", "AnoTrimestre", "MesNumero", "MesNome",
            "MesAbrev", "AnoMes", "AnoMesNome", "Semana", "DiaSemana",
            "DiaSemanaNome", "DiaUtil", "Feriado", "DataFimMes"], linhas)


# =====================================================================
# 2. DIMENSOES CADASTRAIS
# =====================================================================
CATEGORIAS = {
    "Material Elétrico":      (["Cabos", "Disjuntores", "Lâmpadas", "Conectores"], 45, 380),
    "Material Hidráulico":    (["Tubos", "Conexões", "Registros", "Vedação"], 20, 260),
    "EPI":                    (["Proteção Cabeça", "Proteção Mãos", "Proteção Respiratória", "Calçados"], 15, 190),
    "Ferramentas":            (["Manuais", "Elétricas", "Medição", "Corte"], 60, 1500),
    "Peças de Reposição":     (["Rolamentos", "Correias", "Filtros", "Vedantes"], 80, 2200),
    "Lubrificantes":          (["Óleos", "Graxas", "Fluidos"], 35, 420),
    "Material de Escritório": (["Papelaria", "Informática", "Impressão"], 8, 120),
    "Limpeza e Higiene":      (["Químicos", "Descartáveis", "Utensílios"], 12, 95),
}
UNIDADES = ["UN", "CX", "KG", "MT", "LT", "PC", "PAR"]
UF_CIDADE = [("SP", "São Paulo"), ("SP", "Campinas"), ("MG", "Belo Horizonte"),
             ("PR", "Curitiba"), ("RS", "Porto Alegre"), ("SC", "Joinville"),
             ("RJ", "Rio de Janeiro"), ("BA", "Salvador"), ("PE", "Recife"),
             ("GO", "Goiânia")]

QTD_ITENS = 250
QTD_FORNECEDORES = 35
QTD_CENTROS_CUSTO = 12
QTD_DEPOSITOS = 4
QTD_SOLICITANTES = 40


def gerar_fornecedores():
    prefixos = ["Alfa", "Beta", "Delta", "Ômega", "Nexus", "Prime", "Vertex", "Orion",
                "Atlas", "Zenit", "Aurora", "Titan", "Vector", "Lumen", "Nova",
                "Sigma", "Kappa", "Solar", "Metro", "Global", "Ápice", "Fênix",
                "Ibéria", "Andes", "Pampa", "Cerrado", "Litoral", "Planalto",
                "Bandeirante", "Guará", "Ipê", "Jacarandá", "Peroba", "Sucupira", "Angico"]
    sufixos = ["Suprimentos", "Industrial", "Comercial", "Distribuidora",
               "Materiais", "Equipamentos", "Componentes"]
    portes = ["Pequeno", "Médio", "Grande"]
    linhas = []
    for i in range(1, QTD_FORNECEDORES + 1):
        uf, cidade = random.choice(UF_CIDADE)
        razao = "%s %s Ltda" % (prefixos[i - 1], random.choice(sufixos))
        linhas.append([
            i, "F%04d" % i, razao, prefixos[i - 1],
            uf, cidade, random.choice(list(CATEGORIAS.keys())),
            random.choice(portes),
            "Ativo" if random.random() > 0.08 else "Bloqueado",
            (date(2018, 1, 1) + timedelta(days=random.randint(0, 2400))).isoformat(),
        ])
    gravar("dFornecedor.csv",
           ["SK_Fornecedor", "CodigoFornecedor", "RazaoSocial", "NomeFantasia",
            "UF", "Cidade", "CategoriaFornecimento", "PorteFornecedor",
            "StatusFornecedor", "DataHomologacao"], linhas)
    return list(range(1, QTD_FORNECEDORES + 1))


CENTROS = [
    ("CC1010", "Manutenção Industrial", "Manutenção", "Gerência de Manutenção", "Diretoria de Operações"),
    ("CC1020", "Produção Linha A", "Produção", "Gerência de Produção", "Diretoria de Operações"),
    ("CC1030", "Produção Linha B", "Produção", "Gerência de Produção", "Diretoria de Operações"),
    ("CC1040", "Utilidades", "Manutenção", "Gerência de Manutenção", "Diretoria de Operações"),
    ("CC2010", "Logística e Expedição", "Logística", "Gerência de Logística", "Diretoria de Operações"),
    ("CC2020", "Almoxarifado Central", "Suprimentos", "Gerência de Suprimentos", "Diretoria Administrativa"),
    ("CC3010", "Qualidade", "Qualidade", "Gerência de Qualidade", "Diretoria Técnica"),
    ("CC3020", "Engenharia de Processos", "Engenharia", "Gerência de Engenharia", "Diretoria Técnica"),
    ("CC4010", "Administrativo", "Administrativo", "Gerência Administrativa", "Diretoria Administrativa"),
    ("CC4020", "Tecnologia da Informação", "Administrativo", "Gerência Administrativa", "Diretoria Administrativa"),
    ("CC5010", "Segurança do Trabalho", "SSMA", "Gerência de SSMA", "Diretoria de Operações"),
    ("CC5020", "Facilities", "Administrativo", "Gerência Administrativa", "Diretoria Administrativa"),
]


def gerar_centros_custo():
    nomes = ["Ana Ribeiro", "Carlos Menezes", "Débora Fontes", "Eduardo Salles",
             "Fernanda Alves", "Gustavo Prado", "Helena Duarte", "Igor Marques",
             "Juliana Castro", "Leonardo Pires", "Mariana Rocha", "Nelson Tavares"]
    linhas = []
    for i, (cod, nome, area, ger, dir_) in enumerate(CENTROS, start=1):
        resp = nomes[i - 1]
        email = resp.lower().replace(" ", ".").replace("é", "e").replace("ê", "e") \
                    .replace("á", "a").replace("ã", "a").replace("í", "i") \
                    .replace("ó", "o").replace("ú", "u").replace("ç", "c") + "@empresa.com.br"
        linhas.append([i, cod, nome, area, ger, dir_, resp, email, "Ativo"])
    gravar("dCentroCusto.csv",
           ["SK_CentroCusto", "CodigoCentroCusto", "NomeCentroCusto", "Area",
            "Gerencia", "Diretoria", "Responsavel", "EmailResponsavel",
            "StatusCentroCusto"], linhas)
    return list(range(1, QTD_CENTROS_CUSTO + 1))


DEPOSITOS = [
    ("DEP01", "Almoxarifado Central", "Central", "Planta Matriz", "SP", "almox.central@empresa.com.br"),
    ("DEP02", "Almoxarifado Manutenção", "Avançado", "Planta Matriz", "SP", "almox.manutencao@empresa.com.br"),
    ("DEP03", "Almoxarifado Filial Sul", "Central", "Filial Sul", "PR", "almox.sul@empresa.com.br"),
    ("DEP04", "Quarentena", "Quarentena", "Planta Matriz", "SP", "qualidade@empresa.com.br"),
]


def gerar_depositos():
    linhas = [[i] + list(d) for i, d in enumerate(DEPOSITOS, start=1)]
    gravar("dDeposito.csv",
           ["SK_Deposito", "CodigoDeposito", "NomeDeposito", "TipoDeposito",
            "Planta", "UF", "EmailResponsavel"], linhas)
    return list(range(1, QTD_DEPOSITOS + 1))


TIPOS_MOV = [
    (1, "101", "Entrada por compra", "Entrada", "Compra", "SIM", "NAO"),
    (2, "102", "Entrada por devolução de área", "Entrada", "Devolucao", "SIM", "NAO"),
    (3, "103", "Entrada por transferência", "Entrada", "Transferencia", "NAO", "NAO"),
    (4, "104", "Entrada por ajuste de inventário", "Entrada", "Ajuste", "SIM", "NAO"),
    (5, "105", "Entrada por devolução de fornecedor", "Entrada", "Devolucao", "SIM", "NAO"),
    (6, "201", "Saída para consumo", "Saida", "Consumo", "SIM", "SIM"),
    (7, "202", "Saída para manutenção", "Saida", "Consumo", "SIM", "SIM"),
    (8, "203", "Saída para produção", "Saida", "Consumo", "SIM", "SIM"),
    (9, "204", "Saída por transferência", "Saida", "Transferencia", "NAO", "NAO"),
    (10, "205", "Saída por ajuste de inventário", "Saida", "Ajuste", "SIM", "NAO"),
    (11, "206", "Saída por perda ou avaria", "Saida", "Perda", "SIM", "NAO"),
    (12, "207", "Saída por devolução ao fornecedor", "Saida", "Devolucao", "SIM", "NAO"),
]


def gerar_tipos_movimento():
    gravar("dTipoMovimento.csv",
           ["SK_TipoMovimento", "CodigoMovimento", "DescricaoMovimento",
            "Natureza", "GrupoMovimento", "AfetaCusto", "ContaConsumo"],
           [list(t) for t in TIPOS_MOV])


STATUS_REQ = [
    (1, "AB", "Aberta", "NAO"),
    (2, "SE", "Em separação", "NAO"),
    (3, "AT", "Atendida", "SIM"),
    (4, "AP", "Atendida parcialmente", "SIM"),
    (5, "CA", "Cancelada", "SIM"),
]


def gerar_status():
    gravar("dStatusRequisicao.csv",
           ["SK_Status", "CodigoStatus", "DescricaoStatus", "StatusFinalizado"],
           [list(s) for s in STATUS_REQ])


def gerar_solicitantes(centros):
    primeiros = ["Adriana", "Bruno", "Camila", "Diego", "Elaine", "Felipe", "Gabriela",
                 "Henrique", "Isabela", "João", "Karina", "Lucas", "Marcela", "Nicolas",
                 "Olívia", "Paulo", "Queila", "Rafael", "Sabrina", "Thiago"]
    ultimos = ["Almeida", "Barbosa", "Cardoso", "Dias", "Esteves", "Ferreira",
               "Gomes", "Henriques", "Inácio", "Jardim"]
    cargos = ["Técnico de Manutenção", "Operador", "Supervisor", "Analista",
              "Encarregado", "Mecânico", "Eletricista", "Auxiliar"]
    linhas = []
    for i in range(1, QTD_SOLICITANTES + 1):
        nome = "%s %s" % (random.choice(primeiros), random.choice(ultimos))
        linhas.append([i, "M%05d" % (10000 + i), nome, random.choice(cargos),
                       random.choice(centros),
                       "colaborador%02d@empresa.com.br" % i])
    gravar("dSolicitante.csv",
           ["SK_Solicitante", "Matricula", "NomeSolicitante", "Cargo",
            "SK_CentroCusto", "Email"], linhas)
    return list(range(1, QTD_SOLICITANTES + 1))


def gerar_itens(fornecedores):
    """Cada item recebe um perfil de demanda usado na simulacao."""
    criticidades = ["Alta", "Média", "Baixa"]
    linhas = []
    perfis = {}
    sk = 0
    cats = list(CATEGORIAS.items())
    for i in range(QTD_ITENS):
        sk += 1
        categoria, (subs, preco_min, preco_max) = cats[i % len(cats)]
        sub = random.choice(subs)
        # Distribuicao de valor tipica de almoxarifado: poucos itens caros
        preco = round(random.triangular(preco_min, preco_max, preco_min * 1.6), 2)
        # Demanda mensal media e variabilidade definem as curvas ABC e XYZ
        demanda_base = max(1.0, random.triangular(1, 220, 25))
        cv = random.triangular(0.15, 1.6, 0.45)
        lead_time = random.choice([7, 10, 15, 20, 30, 45])
        est_min = round(demanda_base * random.uniform(0.4, 1.2), 0)
        est_max = round(est_min * random.uniform(3.0, 6.0), 0)
        ponto_pedido = round(est_min + demanda_base * (lead_time / 30.0), 0)
        linhas.append([
            sk, "IT%05d" % (1000 + sk),
            "%s %s %s" % (sub, categoria.split()[0], "Ref %04d" % (1000 + sk)),
            categoria, sub, random.choice(UNIDADES), "",
            random.choices(criticidades, weights=[0.2, 0.5, 0.3])[0],
            int(est_min), int(est_max), int(ponto_pedido),
            int(max(1, round(demanda_base * 0.5))),
            lead_time, brl(preco),
            "SIM" if categoria == "Lubrificantes" and random.random() > 0.6 else "NAO",
            "SIM" if categoria == "EPI" else "NAO",
            random.choice(fornecedores),
            "Ativo" if random.random() > 0.05 else "Inativo",
            (date(2019, 1, 1) + timedelta(days=random.randint(0, 2000))).isoformat(),
        ])
        perfis[sk] = {
            "preco": preco, "demanda": demanda_base, "cv": cv,
            "lead_time": lead_time, "min": est_min, "max": est_max,
            "pp": ponto_pedido, "fornecedor": linhas[-1][16],
            "categoria": categoria,
        }
    gravar("dItem.csv",
           ["SK_Item", "CodigoItem", "Descricao", "Categoria", "Subcategoria",
            "UnidadeMedida", "CurvaABC", "Criticidade", "EstoqueMinimo",
            "EstoqueMaximo", "PontoPedido", "LoteMinimoCompra",
            "LeadTimePadraoDias", "CustoPadrao", "Perecivel", "ItemControlado",
            "SK_FornecedorPreferencial", "StatusItem", "DataCadastro"], linhas)
    return perfis


# =====================================================================
# 3. SIMULACAO DAS FATOS
# =====================================================================

def simular(perfis, centros, solicitantes):
    movimentacoes = []
    posicoes = []
    requisicoes = []
    compras = []
    inventarios = []

    sk_mov = 0
    sk_req = 0
    sk_cmp = 0
    sk_inv = 0

    meses = list(meses_do_periodo(DATA_INICIO, DATA_FIM))

    for sk_item, p in perfis.items():
        # Cada item fica em 1 ou 2 depositos
        depositos_item = [1] if random.random() < 0.55 else random.sample([1, 2, 3], k=2)
        for sk_dep in depositos_item:
            saldo = round(p["demanda"] * random.uniform(1.2, 3.0), 0)
            custo = p["preco"]
            ultima_saida = None
            ultima_entrada = DATA_INICIO
            pedidos_pendentes = []  # (data_chegada, qtd, sk_compra)

            # Alguns itens deixam de girar em algum ponto do historico, para
            # alimentar os indicadores de estoque sem giro e de obsolescencia
            vira_dormente = random.random() < 0.14
            mes_parada = random.randint(2, len(meses) - 8) if vira_dormente else None

            for idx_mes, (ano, mes) in enumerate(meses):
                ref_fim = fim_do_mes(ano, mes)
                item_parado = mes_parada is not None and idx_mes >= mes_parada

                # --- Recebimento de pedidos que chegam neste mes ---
                for (dt_chegada, qtd, _sk) in list(pedidos_pendentes):
                    if dt_chegada <= ref_fim:
                        saldo += qtd
                        ultima_entrada = dt_chegada
                        sk_mov += 1
                        movimentacoes.append([
                            sk_mov, dt_chegada.isoformat(), sk_item, sk_dep, 1, "",
                            p["fornecedor"], "NF%06d" % random.randint(100000, 999999),
                            brl(qtd), brl(custo), brl2(qtd * custo),
                            brl(qtd), brl2(qtd * custo)])
                        pedidos_pendentes.remove((dt_chegada, qtd, _sk))

                # --- Demanda do mes ---
                if item_parado:
                    demanda_mes = 0
                else:
                    sazonal = 1 + 0.18 * math.sin((mes - 1) / 12.0 * 2 * math.pi)
                    demanda_mes = max(0, random.gauss(p["demanda"] * sazonal,
                                                      p["demanda"] * p["cv"]))

                n_saidas = 0 if demanda_mes <= 0 else random.randint(1, 5)
                for _ in range(n_saidas):
                    dt = dia_util_aleatorio(ano, mes)
                    qtd_solicitada = round(demanda_mes / n_saidas, 0)
                    if qtd_solicitada <= 0:
                        continue
                    qtd_atendida = min(saldo, qtd_solicitada)
                    tipo_saida = random.choice([6, 7, 8])
                    sk_cc = random.choice(centros)

                    if qtd_atendida > 0:
                        saldo -= qtd_atendida
                        ultima_saida = dt
                        sk_mov += 1
                        movimentacoes.append([
                            sk_mov, dt.isoformat(), sk_item, sk_dep, tipo_saida,
                            sk_cc, "", "RQ%06d" % (sk_req + 1),
                            brl(qtd_atendida), brl(custo), brl2(qtd_atendida * custo),
                            brl(-qtd_atendida), brl2(-qtd_atendida * custo)])

                    # --- Requisicao correspondente ---
                    sk_req += 1
                    horas_sla = 24
                    dt_prometida = dt + timedelta(days=1)
                    atraso = random.random() < 0.14
                    if qtd_atendida <= 0:
                        dt_at = None
                        dt_atendimento = ""
                        horas = ""
                        sk_status = 1
                        motivo = "Falta de saldo"
                    else:
                        dias_extra = random.choice([0, 0, 0, 1, 2]) if atraso else 0
                        dt_at = dt + timedelta(days=dias_extra)
                        dt_atendimento = dt_at.isoformat()
                        horas = round(random.uniform(1, 8) + dias_extra * 24, 2)
                        sk_status = 3 if qtd_atendida >= qtd_solicitada else 4
                        motivo = "" if qtd_atendida >= qtd_solicitada else "Atendimento parcial"

                    # Flags de nivel de servico. Na producao estas colunas vem
                    # calculadas da view vw_Requisicao, nunca de medida DAX.
                    flag_total = 1 if qtd_atendida >= qtd_solicitada else 0
                    flag_prazo = 1 if (dt_at is not None and dt_at <= dt_prometida) else 0
                    flag_otif = 1 if (flag_total == 1 and flag_prazo == 1) else 0
                    flag_pendente = 1 if dt_at is None else 0

                    requisicoes.append([
                        sk_req, "RQ%06d" % sk_req, dt.isoformat(),
                        dt_prometida.isoformat(), dt_atendimento,
                        sk_item, sk_dep, sk_cc, random.choice(solicitantes), sk_status,
                        brl(qtd_solicitada), brl(qtd_atendida),
                        brl(qtd_solicitada - qtd_atendida), brl(custo),
                        brl2(horas) if horas != "" else "",
                        flag_total, flag_prazo, flag_otif, flag_pendente, motivo])

                # --- Perda ocasional ---
                if random.random() < 0.015 and saldo > 5:
                    dt = dia_util_aleatorio(ano, mes)
                    qtd_perda = round(saldo * random.uniform(0.01, 0.05), 0)
                    if qtd_perda > 0:
                        saldo -= qtd_perda
                        sk_mov += 1
                        movimentacoes.append([
                            sk_mov, dt.isoformat(), sk_item, sk_dep, 11,
                            random.choice(centros), "", "PERDA%05d" % sk_mov,
                            brl(qtd_perda), brl(custo), brl2(qtd_perda * custo),
                            brl(-qtd_perda), brl2(-qtd_perda * custo)])

                # --- Reposicao: gera pedido de compra ---
                if saldo <= p["pp"] and not item_parado:
                    qtd_pedido = max(p["max"] - saldo, p["demanda"])
                    qtd_pedido = round(qtd_pedido, 0)
                    dt_pedido = dia_util_aleatorio(ano, mes)
                    # O prazo prometido carrega uma folga de 3 dias sobre o lead
                    # time padrao, pratica usual em contrato de fornecimento.
                    lt_real = max(2, int(random.gauss(p["lead_time"] * 0.92, p["lead_time"] * 0.22)))
                    dt_prometida_c = dt_pedido + timedelta(days=p["lead_time"] + 3)
                    dt_receb = dt_pedido + timedelta(days=lt_real)
                    qtd_receb = qtd_pedido if random.random() > 0.06 else round(qtd_pedido * random.uniform(0.7, 0.98), 0)
                    qtd_devol = round(qtd_receb * random.uniform(0.01, 0.06), 0) if random.random() < 0.05 else 0
                    preco_pedido = round(custo * random.uniform(0.97, 1.06), 4)

                    sk_cmp += 1
                    recebido = dt_receb <= DATA_FIM
                    compras.append([
                        sk_cmp, "PC%06d" % sk_cmp, dt_pedido.isoformat(),
                        dt_prometida_c.isoformat(),
                        dt_receb.isoformat() if recebido else "",
                        sk_item, p["fornecedor"], sk_dep,
                        brl(qtd_pedido), brl(qtd_receb) if recebido else brl(0),
                        brl(qtd_devol) if recebido else brl(0),
                        brl(preco_pedido), brl2(qtd_pedido * preco_pedido),
                        brl2(qtd_receb * preco_pedido) if recebido else brl2(0),
                        lt_real if recebido else "",
                        ("SIM" if dt_receb <= dt_prometida_c else "NAO") if recebido else "NAO",
                        ("SIM" if qtd_receb >= qtd_pedido else "NAO") if recebido else "NAO",
                        "Recebido" if recebido else "Aberto"])
                    if recebido:
                        pedidos_pendentes.append((dt_receb, qtd_receb, sk_cmp))
                        custo = round(custo * 0.8 + preco_pedido * 0.2, 4)

                # --- Snapshot de fim de mes ---
                reservada = round(saldo * random.uniform(0, 0.06), 0)
                bloqueada = round(saldo * random.uniform(0, 0.02), 0) if random.random() < 0.1 else 0
                disponivel = max(0, saldo - reservada - bloqueada)
                dias_sem_saida = (ref_fim - ultima_saida).days if ultima_saida else 9999
                posicoes.append([
                    ref_fim.isoformat(), sk_item, sk_dep,
                    brl(saldo), brl(reservada), brl(bloqueada), brl(disponivel),
                    brl(custo), brl2(saldo * custo),
                    ultima_saida.isoformat() if ultima_saida else "",
                    ultima_entrada.isoformat() if ultima_entrada else "",
                    1 if dias_sem_saida > 180 else 0,
                    1 if dias_sem_saida > 365 else 0])

                # --- Contagem ciclica ---
                if random.random() < 0.09:
                    dt_cont = dia_util_aleatorio(ano, mes)
                    divergente = random.random() < 0.045
                    if divergente:
                        contada = max(0, round(saldo * random.uniform(0.90, 1.08), 0))
                    else:
                        contada = saldo
                    sk_inv += 1
                    inventarios.append([
                        sk_inv, dt_cont.isoformat(), "CIC-%d%02d" % (ano, mes),
                        sk_item, sk_dep, brl(saldo), brl(contada),
                        brl(contada - saldo), brl(custo),
                        brl2((contada - saldo) * custo),
                        "NAO" if divergente else "SIM",
                        random.choice(["Contador A", "Contador B", "Contador C"])])

    gravar("fMovimentacaoEstoque.csv",
           ["SK_Movimentacao", "Data", "SK_Item", "SK_Deposito", "SK_TipoMovimento",
            "SK_CentroCusto", "SK_Fornecedor", "NumeroDocumento", "Quantidade",
            "CustoUnitario", "ValorTotal", "QuantidadeSinalizada", "ValorSinalizado"],
           movimentacoes)
    gravar("fPosicaoEstoque.csv",
           ["Data", "SK_Item", "SK_Deposito", "QuantidadeSaldo", "QuantidadeReservada",
            "QuantidadeBloqueada", "QuantidadeDisponivel", "CustoMedio", "ValorSaldo",
            "DataUltimaSaida", "DataUltimaEntrada", "FlagSemGiro", "FlagObsoleto"],
           posicoes)
    gravar("fRequisicaoItem.csv",
           ["SK_RequisicaoItem", "NumeroRequisicao", "DataSolicitacao", "DataPrometida",
            "DataAtendimento", "SK_Item", "SK_Deposito", "SK_CentroCusto",
            "SK_Solicitante", "SK_Status", "QuantidadeSolicitada", "QuantidadeAtendida",
            "QuantidadeNaoAtendida", "CustoUnitario", "HorasAtendimento",
            "FlagAtendidoTotal", "FlagNoPrazo", "FlagOTIF", "FlagPendente",
            "MotivoNaoAtendimento"], requisicoes)
    gravar("fCompraItem.csv",
           ["SK_CompraItem", "NumeroPedido", "DataPedido", "DataPrometida",
            "DataRecebimento", "SK_Item", "SK_Fornecedor", "SK_Deposito",
            "QuantidadePedida", "QuantidadeRecebida", "QuantidadeDevolvida",
            "PrecoUnitario", "ValorPedido", "ValorRecebido", "LeadTimeRealDias",
            "FlagEntregaNoPrazo", "FlagRecebimentoTotal", "StatusPedido"], compras)
    gravar("fInventarioContagem.csv",
           ["SK_Contagem", "DataContagem", "CicloInventario", "SK_Item", "SK_Deposito",
            "QuantidadeSistema", "QuantidadeContada", "DivergenciaQuantidade",
            "CustoMedio", "DivergenciaValor", "FlagSemDivergencia", "Contador"],
           inventarios)
    return movimentacoes


def gerar_orcamento(centros):
    """Orcamento por centro de custo e categoria, com folga de 5% a 20%."""
    linhas = []
    for ano, mes in meses_do_periodo(DATA_INICIO, DATA_FIM):
        for cc in centros:
            for cat in CATEGORIAS:
                base = random.uniform(3000, 45000)
                linhas.append([ano * 100 + mes, date(ano, mes, 1).isoformat(),
                               cc, cat, brl2(round(base, 2))])
    gravar("fOrcamento.csv",
           ["AnoMes", "DataReferencia", "SK_CentroCusto", "Categoria", "ValorOrcado"],
           linhas)


def gerar_metas():
    metas = [
        ("Fill Rate", 0.95, "MaiorMelhor"),
        ("OTIF", 0.90, "MaiorMelhor"),
        ("Acuracidade", 0.98, "MaiorMelhor"),
        ("Giro de Estoque", 4.0, "MaiorMelhor"),
        ("Cobertura", 45, "Faixa"),
        ("Estoque sem Giro", 0.08, "MenorMelhor"),
        ("Taxa de Ruptura", 0.03, "MenorMelhor"),
        ("Pontualidade Fornecedor", 0.92, "MaiorMelhor"),
    ]
    linhas = []
    for ano, mes in meses_do_periodo(DATA_INICIO, DATA_FIM):
        for ind, val, tipo in metas:
            li = brl(val * 0.9) if tipo == "Faixa" else ""
            ls = brl(val * 1.35) if tipo == "Faixa" else ""
            linhas.append([ano * 100 + mes, ind, brl(val), tipo, li, ls])
    gravar("dMetaKPI.csv",
           ["AnoMes", "Indicador", "ValorMeta", "TipoMeta",
            "LimiteInferior", "LimiteSuperior"], linhas)


# =====================================================================
# EXECUCAO
# =====================================================================
if __name__ == "__main__":
    print("Gerando base de exemplo do Almoxarifado...")
    print("Periodo: %s a %s\n" % (DATA_INICIO.isoformat(), DATA_FIM.isoformat()))
    gerar_calendario()
    fornecedores = gerar_fornecedores()
    centros = gerar_centros_custo()
    gerar_depositos()
    gerar_tipos_movimento()
    gerar_status()
    solicitantes = gerar_solicitantes(centros)
    perfis = gerar_itens(fornecedores)
    simular(perfis, centros, solicitantes)
    gerar_orcamento(centros)
    gerar_metas()
    print("\nConcluido. Importe os CSV no Power BI com:")
    print("  Delimitador: ponto e virgula")
    print("  Codificacao: 65001 (UTF-8)")
    print("  Localidade da consulta: Portugues (Brasil)")
