# Balerion Drinks · Sistema de Gestão e Propostas

Site completo em **um único arquivo HTML autocontido** (`index.html`) — sem build,
sem dependências externas, sem CDN. Fontes, logotipo, CSS e todo o JavaScript já
estão embutidos dentro do próprio arquivo. Isso significa que **esse é o site
inteiro**: não existem outros arquivos de CSS/JS/imagem para copiar.

## Como usar agora, sem hospedar

Basta abrir o `index.html` direto no navegador (duplo clique). Tudo funciona
localmente, incluindo o salvamento de dados.

## Como hospedar

Qualquer serviço de hospedagem de site estático serve, já que não há backend.
Algumas opções simples:

### Netlify (mais rápido, sem conta necessária para testar)
1. Acesse https://app.netlify.com/drop
2. Arraste o arquivo `index.html` (ou a pasta) para a página.
3. Pronto — você recebe uma URL pública na hora.

### Vercel
1. Crie um projeto novo em https://vercel.com/new
2. Faça upload da pasta contendo o `index.html`.
3. Deploy automático, sem configuração adicional.

### GitHub Pages
1. Suba o `index.html` para um repositório no GitHub.
2. Em *Settings → Pages*, ative o Pages apontando para a branch/pasta do arquivo.
3. O site fica disponível em `https://<usuario>.github.io/<repositorio>/`.

### Outra IA / editor
Para continuar editando em outra IA (ChatGPT, outro Claude, etc.) ou em outro
ambiente, basta enviar o próprio arquivo `index.html` — ele carrega o app
inteiro sozinho.

## Importante sobre os dados salvos (orçamentos, estoque, fichas, etc.)

O app guarda tudo em **localStorage do navegador** (não existe banco de dados
remoto). Isso quer dizer:

- Os dados ficam presos ao **navegador + domínio** onde o site foi aberto.
  Se você mudar de hospedagem (nova URL), os dados não migram sozinhos.
- Cada pessoa que abrir o link em um navegador diferente terá sua **própria
  cópia local** dos dados — não há sincronização entre usuários/dispositivos.
- Use a aba **Backup / Config** dentro do app para exportar um arquivo `.json`
  de backup e importar esses dados em outro navegador ou depois de trocar de
  hospedagem.

## Estrutura interna do arquivo

- `<style>` — todo o CSS (design tokens, layout, componentes, animações).
- `<script>` — todos os módulos do app (roteador de telas, Proposta, Cardápio,
  Estoque, Fichas Técnicas, Eventos, Logística, Financeiro, Feedback, Backup).
- Fontes (Cinzel, Playfair Display, Montserrat) e o logotipo estão embutidos
  como base64 dentro do próprio HTML.
