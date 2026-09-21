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

- Nome público: **Arcaffo GROUP**.
- Slogan institucional: **Pessoas, valores, Negócios & Marcas.**
- Identidade vigente: **Matéria v2.0**, fornecida em 13/09/2026. Base de papel e espresso, neutros quentes, tinta e grafite para leitura e acento brasa contido. Substitui expressamente a identidade monocromática anterior.
- Tipografia: Newsreader Light 300, caixa natural, para títulos; Inter para corpo e controles. Cantos retos, divisões por filetes e fotografia ampla. Especificação web em `DESIGN.md`.
- Fonte da verdade: `public/design-system/arcaffo-materia/styles.css` e tokens oficiais; extensões web em `css/materia.css`.
- Fotografia institucional segue o tratamento do pacote. **Decisão do usuário: preservar as cores originais dos trabalhos de clientes no portfólio.**
- Logo: duas variações (wordmark "arcaffo" e símbolo reduzido "ff"), cada uma em preto e branco, SVG+PNG — arquivos atualizados em `logo/ArcaffoGroup_logo_*_1.1.*` no brand kit.
- Assinatura de experiência: mesa de trabalho editorial com três questões do negócio, navegação acessível e ligação com evidências reais.
- Contato confirmado pelo usuário: solicitar uma conversa; equipe combina o horário. Preservar o formulário Forms existente e seus destinos; confirmação clara no site.

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
3. Sobriedade com calor humano: hierarquia por tom, tipografia, espaço e fotografia. A experiência deve convidar à participação e à conversa, preservando rapidez de resposta e autonomia de navegação.
4. Fala com quem decide: o leitor-alvo é o dono/sócio de uma PME brasileira, não um departamento de marketing corporativo — linguagem direta, sem jargão de agência.
5. Prova, não afirmação: usar os números reais (10 anos, NPS 97, +400 marcas) e os cases reais em vez de alegações genéricas de autoridade.

## Accessibility & Inclusion

Nenhum requisito formal declarado pelo cliente. Há um commit anterior no histórico do projeto (`2ec8a3c fix(a11y): increase footer text contrast and fix heading hierarchy for screen readers`) — sinal de que contraste adequado e hierarquia de headings correta já são um padrão mínimo esperado neste projeto; preservar esse padrão no redesign.
