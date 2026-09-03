# Governança, Segurança e Publicação

## 1. Segurança em nível de linha (RLS)

A RLS restringe as linhas que cada usuário enxerga sem criar cópias do relatório. Configure em Modelagem > Gerenciar funções no Power BI Desktop.

### 1.1 Função: Gestor de Centro de Custo
O gestor vê apenas o consumo da própria área.

**Tabela:** dCentroCusto
**Expressão DAX:**
```dax
[EmailResponsavel] = USERPRINCIPALNAME()
```

### 1.2 Função: Responsável por Depósito
**Tabela:** dDeposito
**Expressão DAX:**
```dax
[EmailResponsavel] = USERPRINCIPALNAME()
```

### 1.3 Função: Visão Corporativa
Sem filtro. Aplicada a diretoria, controladoria e equipe de suprimentos.

### 1.4 Função dinâmica por tabela de permissões
Modelo mais flexível quando um usuário responde por vários centros de custo.

Crie a tabela `dPermissao` com as colunas `Email` e `SK_CentroCusto`, relacione com dCentroCusto e aplique:

**Tabela:** dPermissao
```dax
[Email] = USERPRINCIPALNAME()
```

Marque o relacionamento entre `dPermissao` e `dCentroCusto` como bidirecional e ative "Aplicar filtro de segurança em ambas as direções". Oculte `dPermissao` do painel de campos.

### 1.5 Teste obrigatório
Antes de publicar, use Modelagem > Exibir como e simule cada função. Após publicar, teste novamente no Power BI Service em Conjunto de dados > Segurança > Testar como função.

**Atenção:** RLS não se aplica a quem tem permissão de Administrador, Membro ou Colaborador no workspace. Usuários finais devem receber acesso somente pelo app, com função de Visualizador.

---

## 2. Estrutura de workspace e publicação

### 2.1 Workspaces recomendados

| Workspace | Finalidade | Quem acessa |
|-----------|-----------|-------------|
| `ALM - Desenvolvimento` | Construção e testes | Equipe de BI |
| `ALM - Homologação` | Validação com usuários-chave | BI e key users |
| `ALM - Produção` | Versão oficial | BI (admin) e app publicado |

### 2.2 Publicação em app
No workspace de produção, publique um app com três audiências:

| Audiência | Páginas visíveis | Função |
|-----------|------------------|--------|
| Diretoria | Capa, Visão Executiva | Visualizador com RLS corporativa |
| Suprimentos | Todas | Visualizador com RLS corporativa |
| Gestores de área | Capa, Consumo por Centro de Custo | Visualizador com RLS de centro de custo |

### 2.3 Separação entre modelo e relatório
Publique o modelo semântico uma vez e conecte os relatórios a ele por conexão dinâmica. Isso permite que áreas diferentes criem relatórios próprios sobre a mesma base, sem duplicar dados nem regras de negócio.

---

## 3. Atualização de dados

### 3.1 Gateway
Instale o gateway de dados local em modo padrão, em servidor dedicado com disponibilidade contínua. Não use o modo pessoal em produção.

### 3.2 Agendamento sugerido

| Horário | Finalidade |
|---------|-----------|
| 06h00 | Carga principal antes do início do expediente |
| 12h30 | Atualização do meio do dia para a página operacional |
| 19h00 | Fechamento do dia |

Power BI Pro permite até 8 atualizações diárias. Premium por usuário permite 48.

### 3.3 Atualização incremental
Configure na tabela `fMovimentacaoEstoque`, que é a maior do modelo:

* Armazenar linhas dos últimos 3 anos
* Atualizar linhas dos últimos 10 dias
* Detectar alterações de dados pela coluna de data de modificação, se existir na origem

Isso reduz o tempo de refresh de dezenas de minutos para poucos minutos e é o principal ganho de desempenho da solução.

### 3.4 Monitoramento de falhas
Configure notificação de falha de atualização para o e-mail da equipe de BI e para uma caixa compartilhada, evitando que o alerta se perca em uma ausência.

---

## 4. Convenções de nomenclatura

| Objeto | Padrão | Exemplo |
|--------|--------|---------|
| Dimensão | `d` mais nome no singular | `dItem` |
| Fato | `f` mais nome no singular | `fMovimentacaoEstoque` |
| Parâmetro desconectado | `p` mais nome | `pJanelaMeses` |
| Medida | Nome de negócio em português, sem prefixo | `Valor Estoque` |
| Medida percentual | Sufixo `%` | `Fill Rate %` |
| Medida auxiliar oculta | Prefixo `_` | `_Base Consumo` |
| Consulta desabilitada de carga | Prefixo `fn` para funções | `fnConectar` |
| Coluna calculada | Sem espaço, PascalCase | `ClasseABC` |

---

## 5. Otimização de desempenho

### 5.1 Reduzir o modelo
* Remova colunas não utilizadas no Power Query, não no relatório
* Desative "Auto Data/Hora" em Arquivo > Opções > Carregamento de Dados
* Reduza a cardinalidade de colunas de data e hora separando data e hora em colunas distintas
* Desabilite a carga de consultas intermediárias (clique com o botão direito > desmarcar Habilitar carga)

### 5.2 Medidas
* Prefira `DIVIDE` a barra de divisão, para tratar divisão por zero sem erro
* Use variáveis para evitar recalcular a mesma expressão
* Evite `FILTER` sobre tabelas inteiras. Filtre colunas específicas
* Substitua iteradores item a item por colunas pré-calculadas na origem quando o volume passar de 500 mil linhas

### 5.3 Diagnóstico
Use o Analisador de Desempenho (Exibição > Analisador de Desempenho) para medir cada visual. Qualquer visual acima de 2 segundos merece revisão. Para análise profunda, use o DAX Studio conectado ao modelo.

---

## 6. Documentação e continuidade

| Item | Onde manter |
|------|-------------|
| Dicionário de indicadores | Este repositório e página 12 do relatório |
| Scripts SQL | Este repositório, versionado |
| Medidas DAX | Este repositório mais descrição preenchida em cada medida no modelo |
| Registro de mudanças | Arquivo `CHANGELOG.md` no repositório |
| Contatos responsáveis | Página de capa do relatório |

**Recomendação:** preencha o campo Descrição de cada medida no Power BI Desktop. A descrição aparece como dica de ferramenta no painel de campos e evita interpretações erradas por quem cria relatórios derivados.

---

## 7. Checklist de publicação

Antes de cada publicação em produção, confirme:

- [ ] Conciliação executada: totais do painel batem com o relatório oficial do ERP
- [ ] Todas as medidas com formatação definida no modelo
- [ ] Todas as colunas técnicas ocultas
- [ ] Colunas numéricas das fatos ocultas
- [ ] RLS testada com um usuário de cada função
- [ ] Tempo de abertura de cada página abaixo de 5 segundos
- [ ] Texto alternativo preenchido nos visuais
- [ ] Ordem de tabulação configurada
- [ ] Filtros na condição inicial correta (mês corrente selecionado)
- [ ] Página de glossário atualizada com eventuais novos indicadores
- [ ] Credenciais do gateway válidas
- [ ] Agendamento de atualização ativo
- [ ] Alertas configurados nos KPIs críticos
- [ ] App atualizado e audiências revisadas
- [ ] Changelog atualizado com a versão e a data
