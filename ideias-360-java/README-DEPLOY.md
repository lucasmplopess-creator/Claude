# IDEIAS 360º — Backend Java + PostgreSQL

Aplicação completa (front-end + back-end) para coleta e consulta de ideias de
melhoria. Substitui a versão anterior 100% estática: agora existe um servidor
de verdade (Java / Spring Boot) e um banco de dados relacional (PostgreSQL)
guardando as respostas, com login obrigatório para consultá-las.

## Arquitetura

- **Back-end**: Java 17+, Spring Boot 3 (Web, Security, Data JPA), Maven.
- **Banco de dados**: PostgreSQL (schema versionado com Flyway — a primeira
  execução cria as tabelas sozinha, sem passo manual).
- **Front-end**: os mesmos arquivos HTML/CSS/JS de antes, agora servidos pelo
  próprio Spring Boot (pasta `src/main/resources/static/`) e conversando com
  a API via `fetch`, em vez de `localStorage`.
- Empacotado como um único `.jar` executável — não precisa de Tomcat/servidor
  de aplicação externo (o Spring Boot já embute um).

## O que foi implementado em segurança

- **Login obrigatório** para consultar/exportar/apagar ideias (tela
  "Consultar Ideias Enviadas"). Enviar uma nova ideia continua público, sem
  login, para qualquer colaborador.
- **Senhas com hash BCrypt** — nunca gravadas em texto puro no banco.
- **Usuário administrador configurado por variável de ambiente**
  (`ADMIN_USERNAME` / `ADMIN_PASSWORD`), nunca hardcoded no código-fonte. Se
  `ADMIN_PASSWORD` não for definida, uma senha aleatória é gerada e impressa
  uma única vez no log — apenas para testes locais.
- **Proteção CSRF** habilitada em toda a aplicação.
- **Rate limiting** (limite de tentativas por IP) no login e no envio de
  ideias, para dificultar força bruta e spam.
- **Validação de entrada** em todos os campos do formulário (tamanho máximo,
  campos obrigatórios), rejeitando payloads inválidos antes de tocarem o
  banco.
- **Consultas parametrizadas** via JPA/Hibernate (proteção padrão contra
  SQL injection).
- **Sem exposição de detalhes internos**: erros e exceptions não vazam stack
  trace nem mensagens internas nas respostas da API.
- **Cabeçalhos de segurança HTTP** padrão: HSTS, X-Content-Type-Options,
  X-Frame-Options (anti-clickjacking), Referrer-Policy.

### O que ainda depende da infraestrutura da TI

- **HTTPS/TLS**: a aplicação roda em HTTP simples por padrão. Em produção,
  o certificado TLS deve ser configurado no balanceador/reverse proxy da
  empresa (Nginx, IIS, F5, Application Gateway, etc.) na frente da aplicação
  — prática padrão em ambientes corporativos. Se preferirem TLS direto no
  Spring Boot, é possível configurar um keystore (`server.ssl.*`), mas isso
  não está incluído nesta entrega.
- **Backups do banco de dados**: ficam a cargo da política de backup do
  PostgreSQL já usada pela TI (pg_dump agendado, backup do provedor gerenciado,
  etc.).
- **Firewall/rede**: o banco de dados não deve ficar acessível publicamente —
  apenas pela aplicação, dentro da rede interna/VPC da empresa.

## Variáveis de ambiente

| Variável         | Obrigatória | Descrição                                                   |
|------------------|-------------|---------------------------------------------------------------|
| `DB_URL`         | Sim (prod)  | Ex: `jdbc:postgresql://host:5432/ideias360`                   |
| `DB_USERNAME`    | Sim (prod)  | Usuário do banco                                               |
| `DB_PASSWORD`    | Sim (prod)  | Senha do banco                                                  |
| `ADMIN_USERNAME` | Recomendado | Usuário para acessar "Consultar Ideias Enviadas" (padrão: `admin`) |
| `ADMIN_PASSWORD` | Recomendado | Senha desse usuário — **defina sempre em produção**             |
| `PORT`           | Não         | Porta HTTP da aplicação (padrão: `8080`)                        |

Sem `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` definidas, a aplicação tenta se
conectar a um PostgreSQL local (`localhost:5432/ideias360`) — útil só para
testes locais, nunca use isso em produção.

## Como rodar

### 1. Criar o banco de dados

```sql
CREATE DATABASE ideias360;
CREATE USER ideias360_app WITH PASSWORD 'defina-uma-senha-forte-aqui';
GRANT ALL PRIVILEGES ON DATABASE ideias360 TO ideias360_app;
```

As tabelas são criadas automaticamente pela aplicação na primeira execução
(via Flyway) — não precisa rodar nenhum script `.sql` manualmente.

> Se a TI preferir MySQL em vez de PostgreSQL: troque a dependência do driver
> no `pom.xml` (comentário já deixado lá indicando onde), ajuste `DB_URL`
> para o formato `jdbc:mysql://...` e recompile.

### 2. Compilar

```bash
mvn clean package -DskipTests
```

Isso gera `target/ideias360.jar`.

### 3. Rodar

```bash
export DB_URL="jdbc:postgresql://SEU_HOST:5432/ideias360"
export DB_USERNAME="ideias360_app"
export DB_PASSWORD="a-senha-que-voce-definiu"
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD="defina-uma-senha-forte-aqui-tambem"

java -jar target/ideias360.jar
```

A aplicação sobe em `http://SEU_SERVIDOR:8080` (ou a porta definida em
`PORT`). Recomenda-se rodar isso como um serviço gerenciado pelo sistema
(systemd, um serviço do Windows, um container Docker, etc.) em vez de um
processo solto no terminal — a forma exata depende do padrão da TI.

## Pontos que ainda precisam de ajuste antes de publicar

As opções dos campos de seleção do formulário (setor, eixo, valor da DS)
continuam sendo placeholders. Ficam no início do arquivo
`src/main/resources/static/app.js`, nas constantes `SETORES`, `EIXOS` e
`VALORES_DS` — edite os textos e recompile.
