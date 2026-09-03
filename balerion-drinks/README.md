# Landing Page — Balerion Drinks

Site institucional de uma página para a Balerion Drinks (bar de drinks e coquetéis para
eventos sociais e corporativos). Estático, sem build e sem backend: é só abrir o
`index.html` no navegador.

Identidade visual e conteúdo herdados da proposta comercial da empresa: paleta preto/dourado,
tipografia Cinzel + Cormorant Garamond, molduras e losangos dourados.

## Estrutura

```
balerion-drinks/
├── index.html      # todas as seções da página
├── styles.css      # identidade visual completa
├── script.js       # menu, abas de cardápio, animações, formulário → WhatsApp
└── assets/images/  # fotos reais entram aqui (ver tabela abaixo)
```

## Seções

1. **Hero** — headline, CTAs e números do serviço (5h de open bar, 4 pacotes, equipe, 0% álcool)
2. **Tipos de evento** — casamentos, aniversários, corporativos, formaturas, confraternizações
3. **Quem somos** — texto institucional + fotos
4. **Diferenciais** — 7 pontos fortes em cards
5. **Estrutura de serviço** — como funciona, em 5 passos
6. **Pacotes** — 4 pacotes com valores de referência
7. **Cardápios** — abas com as cartas Simples, Sofisticado, Mix de Sensações e Vitalis 0%
8. **Investimento** — o que está incluso + formas de pagamento
9. **Depoimentos** — 3 espaços marcados para depoimentos reais
10. **FAQ** — 7 perguntas frequentes
11. **Orçamento** — formulário que abre o WhatsApp com a mensagem pronta
12. **Rodapé** + botão flutuante de WhatsApp

## Fotos

Nenhuma imagem foi incluída ainda. Cada lugar que espera uma foto mostra um quadro tracejado
com o **nome do arquivo esperado**. Basta salvar a imagem em `assets/images/` com o nome
exato — a foto aparece sozinha, sem mexer no código.

| Onde aparece | Arquivo esperado |
|---|---|
| Hero (fundo) | `hero-bar-evento.jpg` |
| Quem somos | `quem-somos-balcao.jpg` |
| Quem somos | `quem-somos-bartender.jpg` |
| Diferenciais | `diferenciais-drink-taca.jpg` |
| Estrutura de serviço | `diferenciais-bartender-servindo.jpg` |
| Pacote Simples e Descontraído | `pacote-simples.jpg` |
| Pacote Sofisticado e Conceituado | `pacote-sofisticado.jpg` |
| Pacote Mix de Sensações | `pacote-mix.jpg` |
| Pacote Vitalis | `pacote-vitalis.jpg` |
| Aba Mix de Sensações | `mix-sensacoes-drinks.jpg` |

Formato sugerido: JPG otimizado, largura de 1600px (hero: 2000px).

## Conteúdo que ainda precisa de dado real

- **Depoimentos**: os 3 cards estão marcados com “substituir por depoimento real”.
- **Redes sociais**: o rodapé ainda não tem link de Instagram.
- **Valores**: os preços vieram da proposta comercial (open bar de 5h) e estão como
  “a partir de”. Ajuste se a tabela mudar.

## Contato usado na página

- WhatsApp: (19) 99998-9537 → `https://wa.me/5519999989537`
- Cidade: Pirassununga — SP

O número está em `script.js` (constante `WHATSAPP`) e nos links do HTML.

## Publicar

Qualquer serviço de arquivos estáticos serve — GitHub Pages, Netlify, Vercel — apontando
para esta pasta.
