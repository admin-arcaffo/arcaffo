# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Donos e sócios de pequenas e médias empresas no Brasil que não conseguem acertar o marketing, não têm uma cultura organizacional forte, e querem aumentar a autoridade e fortalecer a marca do próprio negócio.

## Product Purpose

Arcaffo GROUP é uma consultoria de branding e estruturação empresarial. Constrói marcas, forma empresários e estrutura negócios — não entrega só identidade visual, entrega posicionamento, cultura e a estrutura de negócio por trás da marca. Missão declarada: "Tudo o que fazemos, fazemos primeiro para o outro."

## Positioning

O diferencial não é "fazer a identidade visual de uma empresa" — é a combinação de três frentes que normalmente vêm de fornecedores separados: branding (marca, posicionamento), formação empresarial (educar o empresário, estruturar cultura) e assessoria (acompanhamento contínuo do negócio). Confirmado com o cliente como o gancho central do site.

## Operating Context

- Site institucional multi-página (não é um app): home, sobre, serviços/assessoria, formação empresarial, portfólio de projetos (com páginas de detalhe por caso), blog de artigos (com páginas de detalhe), vagas (carreiras), contato, obrigado (pós-formulário).
- Conteúdo de várias seções (textos de hero, CTAs, títulos) é editável via painel admin próprio (`admin/`), marcado no HTML com atributos `data-cms="..."` — qualquer redesign precisa preservar esses hooks, não hardcodar por cima.
- Portfólio e artigos são grandes: dezenas de páginas de projeto e de artigo, geradas a partir de `public/data/{projetos,artigos}.json` via `scripts/generate-pages.mjs` usando `projeto.html`/`artigo.html` como templates — mudanças de head/estrutura nesses dois templates precisam ser feitas nos arquivos-fonte, não nos gerados.
- Site em produção, com formulário de contato real e vagas reais.

## Capabilities and Constraints

- Site estático (Vite multi-page, sem framework de UI), deploy na Vercel.
- CMS simples: admin edita `public/data/site-content.json` (e afins) via Vercel Blob; front-end lê esses dados via `data-cms`.
- Sem dependências de UI framework (React/Vue) — HTML/CSS/JS puro.

## Brand Commitments

- Nome público da marca passa a ser **Arcaffo GROUP** (confirmado com o cliente — o site atual ainda diz só "Arcaffo" em todo lugar; isso muda: header/logo, `<title>`, rodapé, meta tags).
- Base monocromática obrigatória: só preto (`Mortem in Mundum` #000000) e branco (`Puritas` #FFFFFF), com uma escala de tons intermediários definida (`--arcaffo-tone-1` a `-6`, #0D0D0D → #E6E6E6) para hierarquia sem sair do sistema P&B. Nunca introduzir cor.
- Tipografia obrigatória: `h1` em Instrument Serif (serifa display, caixa normal); `h2`–`h6` em Inter Tight (caixa alta, peso 400 sempre — nunca bold); corpo de texto em Inter (peso 400 sempre). Regra de marca, não limitação técnica da fonte (ambas são variable fonts 100–900).
- Fonte da verdade dos tokens: `styles.css` do "Design System Arcaffo GROUP" (Google Drive, brand kit oficial v1.0 de 31.12.2024 + atualização de Interface inspirada em resend.com) — cores, radius (`--arcaffo-radius` 16px / `--arcaffo-radius-sm` 10px), botões (`.arcaffo-btn-primary/secondary/glow`), cards (`.arcaffo-card`), tiles de ícone (`.arcaffo-icon-tile`, stroke 1.4px) e o padrão `.arcaffo-surface` (fundo preto + glow radial sutil no topo) já estão especificados lá — não inventar variantes novas desses componentes.
- Fotografia de marca: sempre preto e branco, mood escuro/atmosférico (nunca colorida ou "clean"/estúdio) — biblioteca em `photos/mood-*.jpg` no brand kit. Quando usada como fundo: overlay em gradiente preto (transparente no topo → opaco na base) para contraste de texto.
- Logo: duas variações (wordmark "arcaffo" e símbolo reduzido "ff"), cada uma em preto e branco, SVG+PNG — arquivos atualizados em `logo/ArcaffoGroup_logo_*_1.1.*` no brand kit.
- Referência de qualidade/estrutura (não de conteúdo — é de outro cliente): projeto entregue pela Codex em `Edna Nogueira/_assets/entrega_encontro_3/html` — usa os mesmos tokens do brand kit Arcaffo, com tipografia fluida (`clamp()`), grids com divisórias hairline entre blocos, cards com hover/shadow, seção de fluxo de processo com conector entre dois blocos, e um elemento gráfico assinatura próprio daquele cliente (não copiar o elemento em si, copiar o princípio de ter uma assinatura visual única).

## Evidence on Hand

- 10 anos de mercado (atuação desde 2016), pioneiros em Branding no Mato Grosso do Sul.
- NPS 97 — metodologia própria de construção de marcas.
- +400 marcas atendidas, em 8 estados brasileiros e 4 países.
- Confirmado com o cliente: manter esses números no redesign (não atualizar, não inventar novos).
- Portfólio real com dezenas de cases (ex.: Kassar, Sacralita, iClay, Torque Soluções Automotivas, La Parisienne, etc.), cada um com equipe nomeada (Arthur Fava, Luiz Paulo Pacheco, Everton Gargioni, Eduardo Azevedo).
- Foto real da fachada física da empresa (`images/fachada.webp`), hoje tratada em preto e branco na home — candidata natural a substituir/complementar as fotos-mood genéricas do brand kit por serem a fachada real deles.
- Blog com dezenas de artigos reais publicados (branding, cultura organizacional, marketing).

## Product Principles

1. Verdade antes de venda: a marca é construída sobre posicionamento real e verdade, não sobre truques de marketing — evitar copy hiperbólico ou promessas vazias.
2. Uma marca, três frentes: todo o site deve deixar claro que branding, formação empresarial e assessoria são partes do mesmo produto, não serviços avulsos.
3. Monocromia é a marca, não uma limitação: a ausência de cor é a assinatura visual (`Mortem in Mundum` / `Puritas`) — hierarquia se resolve com tom, tipografia e luz, nunca com cor.
4. Fala com quem decide: o leitor-alvo é o dono/sócio de uma PME brasileira, não um departamento de marketing corporativo — linguagem direta, sem jargão de agência.
5. Prova, não afirmação: usar os números reais (10 anos, NPS 97, +400 marcas) e os cases reais em vez de alegações genéricas de autoridade.

## Accessibility & Inclusion

Nenhum requisito formal declarado pelo cliente. Há um commit anterior no histórico do projeto (`2ec8a3c fix(a11y): increase footer text contrast and fix heading hierarchy for screen readers`) — sinal de que contraste adequado e hierarquia de headings correta já são um padrão mínimo esperado neste projeto; preservar esse padrão no redesign.
