# Gerador de Propostas — Balerion Drinks

Site simples (sem backend) que gera a proposta comercial da Balerion Drinks em HTML,
no mesmo layout/design do modelo de referência (10 páginas, estilo preto/dourado),
mudando apenas os dados do cliente.

## Como usar

1. Abra `index.html` no navegador (duplo clique ou `open index.html`).
2. Preencha: Nome do Cliente, Data do Evento, Local do Evento, Nº de Convidados, Tipo de Evento.
3. Clique em **Gerar Proposta** para ver a pré-visualização.
4. Clique em **Baixar HTML** para exportar o arquivo pronto para enviar ao cliente.

Cada campo do formulário só altera os trechos correspondentes: a capa (Local +
Convidados) e a página de Investimento (Tipo de Evento, Local, Convidados, Cliente
e Data do Evento). Todo o resto do conteúdo (textos institucionais, cardápios,
pacotes, valores, política de pagamento) é fixo, igual ao modelo original.

## Onde entram as fotos

As imagens ainda não foram incluídas no projeto — cada lugar onde uma foto deveria
aparecer está marcado com um quadro tracejado indicando o **nome de arquivo
esperado**. Para ativar as fotos reais:

1. Coloque os arquivos dentro de `assets/images/` usando exatamente os nomes abaixo.
2. Em `template.js`, troque cada chamada `imgSlot("nome-do-arquivo.jpg", ...)` por
   uma tag `<img src="assets/images/nome-do-arquivo.jpg">` (ou peça para eu fazer
   essa troca quando as imagens estiverem disponíveis).

| Página | Arquivo esperado | Conteúdo |
|---|---|---|
| Capa | `logo-balerion.png` | Logo do dragão/taça |
| Capa | `capa-bar-evento.jpg` | Foto do bar montado em evento |
| Quem Somos | `quem-somos-balcao.jpg` | Foto do balcão decorado |
| Quem Somos | `quem-somos-bartender.jpg` | Foto do bartender preparando drink |
| Diferenciais | `diferenciais-drink-taca.jpg` | Foto de drink em taça |
| Diferenciais | `diferenciais-bartender-servindo.jpg` | Foto do bartender servindo |
| Pacotes | `pacote-simples.jpg` | Foto do pacote Simples e Descontraído |
| Pacotes | `pacote-sofisticado.jpg` | Foto do pacote Sofisticado e Conceituado |
| Pacotes | `pacote-mix.jpg` | Foto do pacote Mix de Sensações |
| Pacotes | `pacote-vitalis.jpg` | Foto do pacote Vitalis |
| Cardápio Simples | `logo-balerion-mini.png` | Logo pequeno |
| Cardápio Simples | `cardapio-simples-drink.jpg` | Foto do drink com especiarias |
| Cardápio Sofisticado | `cardapio-sofisticado-drink.jpg` | Foto do drink com moldura do logo |
| Mix de Sensações | `mix-sensacoes-drinks.jpg` | Foto dos 5 drinks lado a lado |
| Vitalis | `vitalis-drink-sem-alcool.jpg` | Foto do drink sem álcool |
| Investimento | `logo-balerion.png` | Logo (reutilizado) |
| Fechamento | `logo-balerion.png` | Logo (reutilizado) |
| Fechamento | `fechamento-drink-destaque.jpg` | Foto de drink em destaque |

> Dica: para o arquivo HTML baixado continuar funcionando sozinho (sem depender de
> uma pasta de imagens ao lado), o ideal é embutir as fotos como base64 dentro do
> `template.js` em vez de referenciar `assets/images/...`. Posso fazer essa conversão
> assim que as imagens reais estiverem disponíveis.

## Estrutura do projeto

```
balerion-proposal-generator/
├── index.html      # formulário + pré-visualização
├── app.css          # estilo do formulário/site gerador
├── app.js           # lê o formulário, gera o HTML e baixa o arquivo
├── template.js       # monta as 10 páginas da proposta (buildProposalHTML)
└── assets/images/    # (vazio por enquanto) fotos reais entram aqui
```

## Publicar como site

Não há build/backend — dá para hospedar em qualquer serviço de arquivos estáticos
(GitHub Pages, Netlify, Vercel) apontando para esta pasta.
