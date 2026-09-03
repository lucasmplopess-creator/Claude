# Plano de Implementação Passo a Passo

Roteiro operacional para sair do zero até o painel publicado. Cada etapa indica o arquivo do repositório a utilizar e o critério de conclusão.

---

## Etapa 1: Preparar o ambiente

**Ferramentas necessárias**

| Ferramenta | Finalidade | Custo |
|------------|-----------|-------|
| Power BI Desktop | Desenvolvimento do modelo e do relatório | Gratuito |
| Power BI Pro | Publicação e compartilhamento | Licença por usuário |
| Gateway de dados local | Atualização automática de fonte local | Gratuito |
| Tabular Editor 2 | Edição em lote de medidas e pastas de exibição | Gratuito |
| DAX Studio | Diagnóstico de desempenho | Gratuito |

**Conclusão:** Power BI Desktop instalado e acesso ao Power BI Service confirmado.

---

## Etapa 2: Preparar a base de dados

### Opção A: com banco de dados corporativo

1. Executar `sql/01-ddl-schema.sql` no banco analítico para criar o schema `bi`.
2. Criar as rotinas de carga do ERP para as tabelas do schema `bi` (responsabilidade da equipe de dados).
3. Executar `sql/02-views-analiticas.sql` para criar as views de consumo.
4. Validar com `SELECT * FROM bi.vw_ControleConciliacao ORDER BY Data DESC` e comparar com o relatório oficial de estoque do ERP.

### Opção B: homologação com dados de exemplo

1. Executar `python3 dados-exemplo/gerar_dados.py`.
2. Importar os CSV gerados diretamente no Power BI Desktop.

**Configuração de importação dos CSV**

| Parâmetro | Valor |
|-----------|-------|
| Delimitador | Ponto e vírgula |
| Origem do arquivo | 65001: Unicode (UTF-8) |
| Localidade da consulta | Português (Brasil) |

A localidade é obrigatória. Sem ela o Power BI interpreta a vírgula decimal como separador de milhar e todos os valores ficam mil vezes maiores.

**Conclusão:** todas as tabelas carregadas e o total de estoque conferindo com a origem.

---

## Etapa 3: Carregar e tratar os dados

1. Criar os parâmetros `pServidor`, `pBanco`, `pSchema` e `pDataInicio` conforme `powerquery/00-parametros.m`.
2. Criar a função `fnConectar` do mesmo arquivo.
3. Criar a consulta `dCalendario` com o código de `powerquery/01-dim_calendario.m`.
4. Criar as demais dimensões com `powerquery/02-dimensoes.m`.
5. Criar as tabelas fato com `powerquery/03-fatos.m`.
6. Criar a consulta `UltimaAtualizacao`.

**Verificação obrigatória:** em cada consulta, clicar com o botão direito no último passo e confirmar que "Exibir Consulta Nativa" está habilitado. Se estiver esmaecido, o dobramento de consulta foi quebrado e o refresh ficará lento. A causa mais comum é aplicar uma transformação antes do filtro de data.

**Conclusão:** todas as consultas carregando sem erro e com dobramento preservado nas tabelas fato.

---

## Etapa 4: Configurar o modelo

1. Criar os relacionamentos conforme a tabela da seção 5 do documento `03-modelo-dados.md`.
2. Marcar `dCalendario` como tabela de datas.
3. Configurar as colunas de ordenação de `dCalendario`.
4. Desativar Auto Data/Hora em Arquivo, Opções, Carregamento de Dados.
5. Ocultar todas as colunas de chave substituta.
6. Ocultar todas as colunas numéricas das tabelas fato.
7. Definir categoria de dados de UF como Estado ou Província e de Cidade como Cidade.

**Conclusão:** visão de modelo limpa, sem relacionamentos ambíguos e sem alertas de cardinalidade.

---

## Etapa 5: Criar as medidas

1. Criar a tabela `_Medidas` com o código de `dax/00-tabelas-auxiliares.dax`.
2. Criar as tabelas desconectadas `pSelecaoMetrica`, `pJanelaMeses` e `pNivelServico`.
3. Criar as colunas calculadas de `dItem` (curvas ABC e XYZ) e de `fPosicaoEstoque` (aging).
4. Colar as medidas na ordem dos arquivos, de `01` a `10`. A ordem importa porque as medidas posteriores referenciam as anteriores.
5. Definir a formatação de cada medida conforme o comentário ao lado dela.
6. Organizar em pastas de exibição conforme indicado no cabeçalho de cada arquivo.

**Atalho recomendado:** use o Tabular Editor 2 para colar as medidas em lote e definir formato e pasta de exibição de várias medidas ao mesmo tempo, o que reduz esta etapa de horas para minutos.

**Conclusão:** todas as medidas sem erro de sintaxe e retornando valores coerentes em uma tabela de teste.

---

## Etapa 6: Validar os números

Crie uma página temporária de conferência com uma matriz por mês contendo `Valor Entrada`, `Valor Saída`, `Valor Estoque` e `Giro 12 Meses`. Compare com o relatório oficial do ERP.

| Verificação | Critério de aceite |
|-------------|--------------------|
| Valor de estoque no fechamento | Diferença menor que 0,5% |
| Total de entradas do mês | Diferença menor que 0,5% |
| Total de saídas do mês | Diferença menor que 0,5% |
| Número de requisições | Diferença menor que 1% |
| Soma por centro de custo | Igual ao rateio contábil |

Divergências acima disso quase sempre têm três causas: tipo de movimento classificado errado na dimensão, transferência sendo contada como consumo, ou filtro de data aplicado sobre a coluna errada em uma tabela com relacionamento inativo.

**Conclusão:** conciliação assinada pela Controladoria.

---

## Etapa 7: Construir as páginas

1. Aplicar o tema em Exibição, Temas, Procurar temas, selecionando `tema/tema-almoxarifado.json`.
2. Construir cada página conforme `docs/04-layout-dashboard.md`.
3. Criar as páginas de drill-through e marcá-las como ocultas.
4. Criar a página de tooltip e marcá-la como ocultada.
5. Configurar botões de navegação e indicadores (bookmarks).
6. Preencher o texto alternativo de cada visual.
7. Definir a ordem de tabulação de cada página.

**Conclusão:** protótipo navegável apresentado aos usuários-chave.

---

## Etapa 8: Segurança e publicação

1. Criar as funções de RLS conforme `docs/05-governanca-rls-publicacao.md`.
2. Testar cada função com Exibir como.
3. Publicar no workspace de homologação.
4. Configurar o gateway e as credenciais.
5. Testar a atualização manual e depois agendar.
6. Após o aceite, publicar em produção e criar o app com as audiências definidas.
7. Atribuir os usuários às funções de RLS no Power BI Service.

**Conclusão:** app publicado, usuários com acesso e atualização automática funcionando.

---

## Etapa 9: Treinamento e transferência

1. Sessão de 1 hora com cada perfil de usuário, focada nas páginas que ele utiliza.
2. Entrega do manual do usuário.
3. Definição do responsável pela manutenção e do canal de solicitação de mudanças.
4. Agendamento da revisão de indicadores após 60 dias de uso.

**Conclusão:** aceite formal registrado.

---

## Estimativa de esforço

| Etapa | Horas estimadas |
|-------|-----------------|
| 1. Ambiente | 4 |
| 2. Base de dados | 24 |
| 3. Carga e tratamento | 16 |
| 4. Modelo | 8 |
| 5. Medidas | 16 |
| 6. Validação | 12 |
| 7. Páginas | 32 |
| 8. Segurança e publicação | 12 |
| 9. Treinamento | 8 |
| **Total** | **132 horas** |

Considerando um analista dedicado em meio período, o projeto leva de 7 a 8 semanas. Com dedicação integral, de 4 a 5 semanas.

---

## Erros mais comuns e como evitá-los

| Erro | Consequência | Prevenção |
|------|-------------|-----------|
| Somar o snapshot de estoque ao longo do tempo | Valor de estoque multiplicado pelo número de dias | Usar `LASTNONBLANK` em toda medida de saldo |
| Contar transferência como consumo | Giro e curva ABC inflados | Filtrar por `dTipoMovimento[ContaConsumo]` |
| Esquecer de marcar a tabela de datas | Inteligência temporal com resultado errado em períodos parciais | Marcar antes de criar qualquer medida temporal |
| Aplicar filtro depois de transformações no Power Query | Refresh lento e carga excessiva no ERP | Filtrar a data no primeiro passo após a fonte |
| Deixar colunas numéricas da fato visíveis | Usuário arrasta a coluna e obtém soma incorreta | Ocultar todas e expor apenas medidas |
| Criar medidas dentro das tabelas fato | Painel de campos desorganizado | Centralizar em `_Medidas` |
| Usar relacionamento bidirecional para resolver filtro | Ambiguidade e resultados imprevisíveis | Resolver com `CROSSFILTER` ou `TREATAS` na medida específica |
| Não testar a RLS antes de publicar | Exposição de dados sensíveis | Testar cada função com Exibir como |
