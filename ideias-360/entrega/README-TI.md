# IDEIAS 360º — Documentação para TI

## O que é

Aplicativo web para coleta e consulta de ideias de melhoria ("IDEIAS 360º"), com a identidade visual da Dentsply Sirona. É um app **100% front-end** (HTML, CSS e JavaScript puro) — não existe back-end, banco de dados ou linguagem de servidor (não há código Java, PHP, .NET etc. neste projeto). Cada resposta enviada é salva no `localStorage` do navegador de quem preencheu o formulário.

## Conteúdo desta entrega

```
entrega/
├── README-TI.pdf / README-TI.md      (este documento)
├── ideias-360-arquivo-unico/
│   └── ideias-360.html               (app completo em 1 arquivo só — HTML+CSS+JS+imagens)
└── ideias-360-web/
    ├── index.html
    ├── styles.css
    ├── app.js
    └── assets/
        ├── logo-icon.png
        └── banner-dentsply-sirona.png
```

Duas versões do **mesmo aplicativo** — use a que fizer mais sentido para o servidor:

- **`ideias-360-arquivo-unico/ideias-360.html`** — um único arquivo HTML autocontido (CSS, JavaScript e as imagens já embutidas em base64 dentro dele). Basta colocar esse arquivo em qualquer servidor web estático. Mais simples de distribuir, porém mais pesado (~0,8 MB) porque carrega tudo de uma vez.
- **`ideias-360-web/`** — a mesma aplicação separada em arquivos (`index.html`, `styles.css`, `app.js`, pasta `assets/` com as imagens). Recomendada para produção: os arquivos ficam em cache pelo navegador separadamente e o carregamento é mais leve.

## Como hospedar

Qualquer servidor de arquivos estáticos serve (Apache, Nginx, IIS, S3 + CloudFront, GitHub Pages, etc.):

1. Copiar o conteúdo da pasta `ideias-360-web/` (ou apenas o arquivo único) para o diretório público do servidor.
2. Garantir que `index.html` seja o arquivo de entrada.
3. Não é necessário runtime de servidor (Node, Java, PHP...), banco de dados, variáveis de ambiente nem build/compilação — são arquivos estáticos prontos para uso.
4. Recomendado servir por HTTPS, como qualquer aplicação interna.

## Pontos que precisam de ajuste antes de publicar

As opções dos campos de seleção do formulário são **placeholders** (valores de exemplo) e precisam ser substituídas pelas informações reais da empresa. Elas ficam no início do arquivo `app.js` (ou dentro da tag `<script>` no `ideias-360.html`, se for usar o arquivo único), nas constantes:

- `SETORES` — lista de setores (usada em "setor da oportunidade" e "setor de trabalho").
- `EIXOS` — eixos estratégicos relacionados à sugestão.
- `VALORES_DS` — valores da empresa.

Basta editar os textos dentro dessas listas, sem precisar mexer no resto do código.

## Armazenamento dos dados — atenção

Como não há banco de dados nem servidor de back-end, cada resposta enviada fica salva **apenas no navegador de quem preencheu** (via `localStorage`). Não existe uma base central automática consolidando todas as respostas de todos os usuários. Para reunir as respostas de várias pessoas, cada uma precisa exportar manualmente pela tela "Consultar Ideias Enviadas" (botões "Exportar CSV" / "Exportar JSON") e enviar o arquivo exportado para quem for consolidar.

Se for necessário centralizar as respostas automaticamente em um servidor/banco de dados, isso exigiria desenvolvimento adicional (um back-end e uma API para receber e armazenar os envios) — não está incluído nesta entrega.

## Código-fonte / histórico de versões

O código também está versionado em um repositório Git (branch `claude/app-360-ideias-gvqgat`, pasta `ideias-360/`), caso a equipe de TI prefira colher os arquivos por lá em vez do zip.
