---
name: Arcaffo GROUP
description: Consultoria de branding e estruturação empresarial — identidade monocromática, tipografia editorial serifada sobre labels uppercase, camada de interface preta com glow inspirada em resend.com.
colors:
  arcaffo-black: "#000000"
  arcaffo-white: "#ffffff"
  arcaffo-tone-1: "#0d0d0d"
  arcaffo-tone-2: "#1a1a1a"
  arcaffo-tone-3: "#333333"
  arcaffo-tone-4: "#666666"
  arcaffo-tone-5: "#a6a6a6"
  arcaffo-tone-6: "#e6e6e6"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontWeight: 400
    letterSpacing: "0"
  heading:
    fontFamily: "Inter Tight, sans-serif"
    fontWeight: 400
    letterSpacing: "0.04em"
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
  eyebrow:
    fontFamily: "Inter Tight, sans-serif"
    fontSize: "13px"
    letterSpacing: "0.06em"
rounded:
  sm: "10px"
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.arcaffo-white}"
    textColor: "{colors.arcaffo-black}"
    rounded: "{rounded.sm}"
    padding: "14px 28px"
  button-secondary:
    backgroundColor: "rgba(255,255,255,0.04)"
    textColor: "{colors.arcaffo-white}"
    rounded: "{rounded.sm}"
    padding: "14px 28px"
  card:
    backgroundColor: "{colors.arcaffo-tone-2}"
    textColor: "{colors.arcaffo-white}"
    rounded: "{rounded.md}"
---

# Design System: Arcaffo GROUP

## Overview

**Creative North Star: "A Prova de Registro" (The Registration Mark)**

Arcaffo é um estúdio de branding que constrói marcas sobre verdade e precisão, não sobre efeito — "posicionamento sólido e ancorado na verdade". O sistema visual é a versão digital do próprio ofício do estúdio: pré-impressão, registro, alinhamento exato. Preto e branco não é uma limitação de paleta, é a declaração de que a marca não precisa de cor pra ter presença — ela se sustenta em tom, luz e tipografia.

A camada de fundo (superfícies pretas com glow radial sutil, cards com borda hairline + luz no topo) foi trazida da referência de interface do resend.com e aplicada sobre essa base monocromática já existente da marca. Títulos ganham peso editorial via serifa display (Instrument Serif); rótulos, botões e subtítulos ficam em caixa alta sans (Inter Tight); corpo de texto é sempre Inter regular. O elemento assinatura em desenvolvimento — marcas de registro/prova de prelo em traço fino, o dispositivo real usado por um estúdio gráfico pra alinhar uma prova antes de rodar a impressão — substitui o cubo 3D genérico removido desta base e dá à Arcaffo algo que não é "resend em preto e branco", é o vocabulário do próprio ofício da marca.

Rejeições confirmadas: nenhuma cor de acento (só preto/branco/tons de cinza); nenhuma fonte bold em título (Inter Tight é sempre peso 400, mesmo em uppercase); nenhuma foto colorida ou "clean"/estúdio (fotografia de marca é sempre P&B, mood escuro e atmosférico).

**Key Characteristics:**
- Monocromático absoluto — hierarquia por tom, nunca por cor
- Título serifado editorial + rótulos/botões em caixa alta sans — nunca a mesma família em ambos os papéis
- Superfícies pretas com glow radial sutil no topo, não gradientes decorativos aleatórios
- Bordas arredondadas consistentes (16px / 10px) em toda a interface, nunca radius ad-hoc
- Fotografia real da marca (não stock), sempre P&B, com overlay em gradiente preto quando usada como fundo

## Colors

Paleta estritamente monocromática: duas cores de marca (preto e branco) mais uma escala de seis tons intermediários só para hierarquia — nunca para decoração ou "acento".

### Primary
- **Mortem in Mundum** (`#000000`, `--arcaffo-black`): fundo padrão de toda a interface — canvas, header, footer, seções escuras.
- **Puritas** (`#ffffff`, `--arcaffo-white`): texto principal sobre fundo escuro, botão primário, logo em fundo preto.

### Neutral (escala de tons — hierarquia, não decoração)
- **Tone 1** (`#0d0d0d`): fundo secundário, ligeiramente acima do preto puro (headers de seção, footer).
- **Tone 2** (`#1a1a1a`): fundo de cards e superfícies elevadas.
- **Tone 3** (`#333333`): bordas fortes, divisores, estados desabilitados.
- **Tone 4** (`#666666`): texto terciário/muted — usar com cautela, contraste baixo em fundo preto (~3.3:1); nunca em texto de leitura corrida.
- **Tone 5** (`#a6a6a6`): texto secundário em fundo escuro quando `#CCCCCC` não está disponível.
- **Tone 6** (`#e6e6e6`): quase-branco, para textos secundários em fundo escuro ou fundos quase-brancos no tema claro (ver Alternation Rule abaixo).

### Semantic (não-decorativo)
- **Erro de formulário** (`#ff8f8f` em fundo escuro / `#B3261E` em `.light-theme`): única exceção à escala preto→branco, reservada a estado de erro de campo/validação — nunca usada como acento decorativo.

### Named Rules
**The No-Accent Rule.** Nenhum elemento usa cor fora da escala preto→branco. Se uma seção "precisa" de destaque, o destaque vem de tom, tamanho, peso ou luz — nunca de introduzir uma cor nova.
**The Contrast Floor Rule.** Texto secundário em fundo escuro nunca fica abaixo de `#CCCCCC`/tone-6 (~11:1) para leitura corrida; tons mais escuros (tone-3/4/5) ficam reservados para bordas, superfícies e estados inativos. No tema claro, o piso equivalente é `#555555` (texto secundário) — tone-4/tone-5 direto em texto ficam fracos em fundo branco.
**The Alternation Rule.** Preto não é o único fundo — é o padrão. `.light-theme` (`css/global-v2.css`) inverte os tokens (`--color-bg-*`, `--color-text-*`, `--color-border*`, `--color-accent*`) para uma seção inteira virar clara sem precisar de um segundo sistema de cores; hoje usado nas páginas de artigo e, a partir desta leva, em seções escolhidas de `index`/`sobre`/`servicos`/`vagas` para criar ritmo (nunca a página inteira — hero e rodapé continuam pretos como moldura). Onde um componente precisa continuar escuro dentro de uma seção clara (ex. o 2º `.service-card`, `.job-card`) ou claro dentro de uma seção escura (ex. `.contact-form-inner` em `contato.html`), ele redefine localmente os mesmos tokens (`--color-bg-card`, `--color-text-primary` etc.) em vez de introduzir cor nova — é a mesma escala, só invertida num escopo menor. Exceção testada e revertida: `.ecosystem-card` em `index.html` chegou a usar esse mesmo mecanismo (card quase-preto dentro da seção clara), mas na prática lia como bloco pesado caído sobre o branco — virou tom sobre tom em vez de inversão total (`.light-theme .ecosystem-card` usa `--arcaffo-white`, um degrau acima do `#F7F7F7` da seção, com elevação por sombra suave em vez de escurecer o card). Nem todo componente dentro de seção clara precisa inverter — às vezes o contraste de tom já é suficiente, e inverter sólido fica pesado demais.

## Typography

**Display Font:** Instrument Serif (com Georgia como fallback)
**Heading/Label Font:** Inter Tight (com sans-serif do sistema como fallback) — sempre uppercase, sempre peso 400
**Body Font:** Inter (com sans-serif do sistema como fallback) — sempre peso 400

**Character:** Serifa editorial de alto contraste para título, contra uma sans geométrica em caixa alta para tudo o que é rótulo/estrutura — o mesmo par que um estúdio gráfico usaria numa capa impressa: um título com peso autoral, cercado de metadados técnicos em caixa alta.

### Hierarchy
- **Display / h1** (peso 400, tamanho por página — ex. hero 3.5rem/clamp, título de projeto maior — caixa normal, `letter-spacing: 0`): título principal de cada página/seção-âncora. Nunca uppercase, nunca bold.
- **Heading / h2–h6** (peso 400, caixa alta, `letter-spacing: 0.04em`): qualquer subtítulo estrutural. Nunca serifado, nunca bold — hierarquia entre h2/h3/h4 vem só do tamanho.
- **Eyebrow** (`.arcaffo-eyebrow`, Inter Tight uppercase, 13px, `letter-spacing: 0.06em`, `color: rgba(255,255,255,.45)`): rótulo curto acima de um título, ou usado dentro de botões.
- **Body** (Inter, peso 400): parágrafos e texto corrido.

### Named Rules
**The Never-Bold-Heading Rule.** `h1`–`h6` nunca usam `font-weight` acima de 400 — hierarquia é tamanho + caixa (uppercase nos h2–h6), nunca peso. Isso vale mesmo quando o instinto normal seria "deixar mais forte".
**The One-Family-Per-Role Rule.** Instrument Serif só aparece em títulos display (h1) ou na variante âncora de h2 (`.section-title--anchor`, ver abaixo) — e mesmo aí, só numa palavra via `.font-accent`, nunca no h2 inteiro. Nunca usar a serifa em corpo de texto, botão ou rótulo — e nunca usar Inter Tight/Inter no título principal.

**The Anchor-Title Exception.** Regra base: h1 = serifa, h2–h6 = Inter Tight uppercase, sem exceção — já é assim em todo o CSS (`h1 { font-family: var(--arcaffo-font-display) }`, `h2..h6 { text-transform: uppercase }`), não é preciso reforçar isso em lugar nenhum. Mas repetir "Inter Tight uppercase" em toda `.section-title` da página (10+ ocorrências no site) lê como monótono quando a serifa é o elemento de maior personalidade da marca. Pra isso, `.section-title--anchor` quebra o uppercase de UM h2 por seção (peso 300, `letter-spacing: -1px`, caixa normal) e uma palavra dentro dele ganha `.font-accent.text-accent` (serifa itálica) — o mesmo tratamento que o h2 do CTA final ("Pronto para construir um *legado?*") já usava informalmente. Usar só nos títulos que carregam o peso emocional da seção (ex.: "Nossa Essência", "Liderança") — nunca nos rótulos utilitários ("Portfólio", "Pilares Culturais"), senão o contraste que dá a personalidade desaparece.

## Layout

Container padrão até 1200–1360px conforme a seção, com padding lateral fluido. Grid de 12 colunas para blocos assimétricos (ex. projetos em destaque na home), grid simples 2–4 colunas para listagens de cards. Breakpoints principais em 768px (mobile) e 899–1024px (tablet/coluna dupla). Recomendado para a próxima leva de páginas: migrar tamanhos de fonte fixos (`rem`) para `clamp()` fluido nos títulos display, como na referência de qualidade (`entrega_encontro_3/html/styles.css`) — reduz a quantidade de overrides por breakpoint.

### Named Rules
**The Centered-Header Rule.** `.section-header` (título + subtítulo de abertura de seção) é sempre centralizado — é o padrão em uso em toda seção com título/subtítulo próprio (Filosofia, Ecossistema, Portfólio etc.). O conteúdo abaixo (grids de card, colunas de texto) fica alinhado à esquerda por padrão, e só centraliza quando o próprio conteúdo pede isso explicitamente (cards curtos e simétricos, como os do Ecossistema e da Filosofia; CTAs isolados). Não alternar por seção sem motivo — a regra evita que cada seção nova decida isso de novo.

## Elevation & Depth

Sem sombras tradicionais (`box-shadow` escuro) como recurso primário de profundidade — o sistema usa **luz**, não sombra: glow radial branco muito sutil no topo das superfícies (`.arcaffo-surface::before`) e dos cards (`.card`/`.arcaffo-card`), simulando uma fonte de luz incidindo de cima. Bordas hairline brancas a 10–12% de opacidade fazem o trabalho que uma sombra faria em separar camadas.

### Named Rules
**The Light-Not-Shadow Rule.** Profundidade vem de um glow branco sutil no topo da superfície + borda hairline, nunca de `box-shadow` preto. Uma superfície "elevada" é mais clara no topo, não mais escura embaixo.

## Motion

**Arquétipo: Premium** (skill `motion-design`) — elegante, minimal, sem overshoot. É a única leitura compatível com uma marca monocromática que se sustenta em tom, luz e tipografia, não em efeito. Constantes da identidade de motion (`css/global-v2.css :root`):
- **Curva assinatura:** `--arcaffo-ease` = `cubic-bezier(0.4, 0, 0.2, 1)` — usada em ~80% das transições do site.
- **Paleta de duração:** `--arcaffo-dur-quick` (150ms, feedback de hover/estado), `--arcaffo-dur-standard` (350ms, cards/painéis), `--arcaffo-dur-slow` (550ms, imagens grandes/revelações dramáticas).
- **Entrada de texto/hero:** `.animate-on-scroll` continua em 800ms — reservado para momentos de título/hero, não para grades de cards.
- **Entrada de grid:** `.card-reveal` (350ms, `--arcaffo-ease`) — usa a duração "standard", com stagger calculado via JS (`Math.min(i * 40, 400)`ms), nunca por classe `.delay-N` fixa (não escala além de poucos itens).

### Named Rules
**The Three-Layer Hover Rule.** Todo hover de card relevante (`.project-card`) combina camada primária (imagem escalando), secundária (moldura/borda do overlay reagindo) e ambiente (glow sutil no topo, mesma receita de luz da Elevation Rule) — hover de uma camada só lê como incompleto.
**The Reduced-Motion Rule.** `@media (prefers-reduced-motion: reduce)` zera a duração das transições de entrada e do hover em camadas — quem pede menos movimento recebe o estado final direto, nunca a jornada.

## Shapes

Dois raios em todo o sistema, sem exceção: `--arcaffo-radius` (16px, cards/superfícies grandes) e `--arcaffo-radius-sm` (10px, botões/tiles/elementos menores). Bordas sempre hairline (1px), nunca grossas. Ícones em stroke fino (1.4px), nunca preenchidos/sólidos.

## Components

### Buttons
- **Shape:** `--arcaffo-radius-sm` (10px), padding `14px 28px`.
- **Primary:** fundo branco sólido, texto preto, tipografia Inter Tight uppercase 13px.
- **Secondary:** fundo `rgba(255,255,255,.04)`, borda hairline `rgba(255,255,255,.14)`, texto branco.
- **Glow (opcional):** `.arcaffo-btn-glow` — halo radial branco suave atrás do botão (`blur(10px)`, opacidade 0.6), reservado para CTAs de maior peso.

### Cards / Containers
- **Corner Style:** `--arcaffo-radius` (16px).
- **Background:** `--arcaffo-tone-2` (#1A1A1A) ou gradiente sutil `rgba(255,255,255,.06)→.02`.
- **Border:** hairline branco a 10% de opacidade.
- **Elevation:** glow radial branco no topo (ver Elevation & Depth) — não confundir com o spotlight dinâmico por mouse (`--mouse-x/--mouse-y`, ver abaixo), que é uma camada adicional, não substituta.

### Icon Tiles
- **Style:** tile 64×64px, `--arcaffo-radius-sm`, fundo `rgba(255,255,255,.04)`, borda hairline 10%. Ícone SVG stroke 1.4px, `currentColor`, nunca preenchido.

### Navigation
- Header fixo, transparente até rolar; ao rolar, ganha fundo `--color-bg-glass` com `backdrop-filter: blur(20px)` e borda inferior hairline. Links em Inter Tight uppercase, opacidade reduzida (0.6) até hover/ativo.

### Spotlight de Card (comportamento herdado — preservar)
Cards têm um spotlight dinâmico que segue o mouse (`--mouse-x`/`--mouse-y` setados em `js/main.js`, aplicado via `::before`/`::after` com `radial-gradient`) — uma camada independente do glow estático de luz no topo. As duas camadas coexistem; uma não substitui a outra.

### Registration Mark (proposto — assinatura visual, ainda não implementado nesta base)
Elemento assinatura pendente de construção: marcas de registro/prova de prelo (cruzetas finas de alinhamento, como as usadas por gráficas para conferir registro de cor antes de rodar a impressão) em traço 1px, aparecendo com moderação — ex. como acento no hero, no canto de cards de destaque, ou como divisor entre seções. Objetivo: dar à Arcaffo um motivo gráfico que não é uma cópia do resend.com, e que vem do próprio ofício de um estúdio de branding/pré-impressão. Regra de uso: nunca decorativo/aleatório — cada marca de registro aparece num ponto que faz sentido estrutural (canto de alinhamento, início/fim de seção), nunca espalhada como textura.

## Do's and Don'ts

### Do:
- **Do** usar `var(--arcaffo-*)` para toda cor, fonte e radius novos — nunca hex/px hardcoded.
- **Do** preservar os atributos `data-cms="..."` existentes ao editar qualquer texto editável pelo admin.
- **Do** usar fotografia real da marca (fachada real, fotos de projetos reais) antes de recorrer às fotos-mood genéricas do brand kit.
- **Do** manter os dois raios (16px/10px) e nada além deles.

### Don't:
- **Don't** introduzir qualquer cor fora da escala preto→branco.
- **Don't** deixar um `h1`–`h6` com `font-weight` acima de 400.
- **Don't** usar `box-shadow` escuro como recurso primário de profundidade — usar glow claro no topo.
- **Don't** editar `artigos/*.html` ou `projetos/*.html` gerados diretamente — editar os templates-fonte (`artigo.html`, `projeto.html`) e os arquivos em `public/data/*.json`.
