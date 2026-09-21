# Arcaffo GROUP — Matéria, web v2

Direção vigente desde 13/09/2026. Substitui a identidade monocromática/Resend anterior.

## Fonte da verdade

Pacote fornecido pelo usuário em `Clientes/_Arcaffo/1. Institucional/1. Identidade Visual/_Estudos/Design System`, versão 2.0 Matéria. Cópia local em `public/design-system/arcaffo-materia/`; `css/materia.css` importa seu `styles.css`. Não alterar novamente para preto puro, Instrument Serif ou Inter Tight nos títulos.

## Experiência

Uma visita à mesa de trabalho da Arcaffo. Marca séria, próxima, sóbria e calorosa. A profundidade vem de conteúdo real, espaço e participação. Navegação rápida, rolagem nativa, ausência de espera cenográfica. Menu: Sobre, Como atuamos, Projetos, Artigos, Vamos conversar.

Home: recepção tipográfica/fotográfica → convicção → mesa de trabalho → projetos → pessoas → ecossistema → conversa. A mesa é uma exploração editorial de três questões, não um diagnóstico nem uma triagem de acesso.

## Identidade

- Slogan institucional: “Pessoas, valores, Negócios & Marcas.” Usar como assinatura de fechamento no rodapé e como dado estruturado da organização; não repetir em seções onde dispute atenção com mensagens principais.
- Títulos: Newsreader 300, caixa natural. Corpo: Inter 400; utilidades 500. Fontes locais WOFF2 com licença OFL incluída.
- Papel, areia, linho, tinta, grafite, espresso e brasa: somente tokens `--arcaffo-*` do pacote. Preto/branco puros somente nos arquivos de logotipo.
- Cantos retos; filetes de separação; nenhuma sombra decorativa ou vidro.
- Materialidade por imagem real, proporção e acabamento. Nenhuma fotografia gerada apresentada como registro da empresa.
- Fotografias institucionais de pessoas recebem tratamento quente. A foto da fachada já é monocromática no original e recebe a temperatura do filtro de apresentação. Não há promessa de recuperar cores do original.
- **Exceção autorizada pelo usuário: trabalhos de clientes preservam suas cores.** Nunca filtrar contêineres que contenham projetos. Logos de parceiros também preservam seus arquivos originais.
- Luz âmbar discreta, indireta e estática na superfície espresso.

## Adaptações web

Decisões de implementação para tornar o sistema utilizável: corpo 16px; botões em caixa natural com fonte 12–13px e alvo mínimo 48px; rótulos editoriais seguem o eyebrow de 10,5px. Assim os controles não se tornam títulos em caixa alta. Interações e estados usam os mesmos tokens, com erros identificados também por texto e borda. Dimensão máxima 1280px e gutters fluidos para o site.

As classes antigas mantidas no conteúdo de Sobre/Serviços usam aliases temporários `--color-*` mapeados para Matéria. Os arquivos CSS v1 e scripts antigos permanecem no repositório para preservar o trabalho anterior, mas não são carregados pelas páginas públicas v2.

## Movimento

180ms para feedback; 350ms para troca de conteúdo; 550ms para acomodação editorial. Curva `cubic-bezier(.4,0,.2,1)`, sem elasticidade. Conteúdo visível por padrão, mesmo sem JavaScript. View Transitions entre páginas quando suportado; nenhum bloqueio de navegação. `prefers-reduced-motion` remove animações. Não existe loop de luz seguindo o mouse.

## Arquitetura

- `templates/header.html` e `templates/footer.html`: composição compartilhada pelo plugin do Vite.
- `templates/home.html`, `contact.html`, `thanks.html`: fontes das três páginas. O plugin aplica essas fontes em desenvolvimento e no build; não editar suas cópias derivadas no HTML raiz.
- `scripts/materia-site.mjs`: composição, conteúdo do painel, listagens completas renderizadas no build e normalização dos slugs.
- `artigo.html`, `projeto.html`, `scripts/generate-pages.mjs`: fontes dos detalhes. Não editar os HTML de `artigos/` e `projetos/` diretamente.
- `js/worktable.js`, `gallery.js`, `main.js`: interações por teclado/toque, menu, filtros, contato e eventos sem dados pessoais.
- `shared/materia-content.mjs`: projeção versionada do conteúdo legado. Build/GET não escrevem no Blob. O próximo salvamento normal do painel persiste a versão 2 e conserva as cópias antigas em `legacyMateriaBackup`.

## Contato

Decisão confirmada: solicitar conversa; equipe combina o horário. Formulário `a282b5b2-866d-4111-9e6b-ffa659de8cdf`, destino Forms Arcaffo, campos existentes Nome/E-mail/Telefone. A apresentação não promete campo de mensagem ou horário reservado.

`public/embed/arcaffo-form.js` é a cópia versionada do script público do próprio Forms, consultado em 13/09/2026. SHA-256 upstream: `d2a4b3757c3f1ee6259fa4c523be2dcd274da0615b39d398e8a1f2dd7d1e3c78`. Adaptações: destino da API fixado no Forms, associação explícita dos campos a seus rótulos e suporte ao atributo `data-success-redirect` para confirmação no próprio site. O formulário e os dados remotos não foram modificados. Atualizações futuras do Forms precisam ser reconciliadas nesta cópia e testadas antes da publicação.

O assunto escolhido na mesa aparece como contexto de leitura. Não se injeta resposta nem se coleta informação adicional silenciosamente. A confirmação vem depois do sucesso do provedor. O endereço direto do Forms, WhatsApp e e-mail permanecem disponíveis como alternativas.

## Verificação e operação

- `npm run build:local`: gera páginas com o snapshot local, sem sincronizar dados remotos.
- `npm run build`: sincroniza o conteúdo do Blob quando configurado, gera e compila.
- `npm test`: migração idempotente, integridade de páginas/URLs, HTML estático e recursos do build.
- `scripts/audit-materia-browser.mjs`: navegadores desktop/mobile, imagens, overflow, menu, teclado, filtros, galeria, formulário simulado, confirmação, movimento reduzido e conteúdo sem JS.
- Dados pessoais e texto livre não entram no Analytics; previews não carregam GA.
- A versão anterior da árvore de trabalho foi preservada em `/private/tmp/arcaffo-materia-backup.VPlmNL/site-before.tar.gz` antes da migração. O arquivo exclui `.git`, credenciais e dependências.

Prova de build não substitui envio real no provedor, teste em aparelho físico nem métricas de campo. Consultar o relatório da entrega para os resultados efetivamente obtidos.

## Revisão editorial — 15 de setembro de 2026

`scripts/editorial-render.mjs` compõe Sobre, Serviços e os refinamentos da home durante a transformação HTML de `scripts/materia-site.mjs`. Editar esse módulo, não apenas os HTML de entrada. `css/chapters.css` concentra os novos layouts. `shared/editorial-content.mjs` define campos opcionais e defaults do CMS, sem sobrescrever dados remotos.

Liderança fica somente em Sobre. A história usa capítulos com palco fixo em desktop e leitura vertical em mobile/movimento reduzido; imagens históricas só entram quando identificadas pelo responsável. Essência é uma declaração; cultura, comportamentos exploráveis. Serviços usam painéis acessíveis com todas as informações disponíveis sem JavaScript.

`shared/icons.mjs` padroniza setas SVG em todos os dispositivos. A galeria usa dialog nativo, navegação por teclado/toque e retorno de foco. `js/chapters.js` faz a melhoria progressiva; GSAP/ScrollTrigger em `js/scroll-scenes.js` só carrega perto das seções relevantes, sem substituir a rolagem nativa.

`scripts/site-seo.mjs` centraliza canonical, indexação, compartilhamento, ícones e JSON-LD. Datas não são inventadas. `scripts/prepare-editorial-assets.mjs` gera imagens responsivas reais e a família de ícones; é executado manualmente com o acervo local, não durante o build Vercel. Arquivos com hash têm cache longo; imagens de URL estável precisam revalidar.

Auditoria adicional: `scripts/audit-chapters-browser.mjs` testa Chrome, Firefox e WebKit. Relatórios em `.impeccable/qa/chapters/`. Referências visuais consultadas: Awwwards (Sperotto, Kurzform e Family Style), traduzidas para o sistema Matéria, sem copiar suas identidades.

## Refinamento após consultoria — 15 de setembro de 2026

A home passa a usar ritmo regular nos três indicadores e uma grade de projetos em linhas alinhadas, sem stagger. O subtítulo inicial separa a frase de síntese, e o título do ecossistema incorpora a assinatura Arcaffo GROUP. Botões de ação recebem raio discreto de 3px para reforçar a affordance sem abandonar a sobriedade do sistema.

Em Sobre, o campo inicial da cronologia ganha mais presença; Fé, Família e Autoridade tornam-se princípios selecionáveis, mantendo a relação explícita entre palavra e texto e exibindo todo o conteúdo quando JavaScript não está disponível. Os três retratos usam o conjunto institucional de 2025, com Arthur Fava, Luiz Paulo Pacheco e Fabrício O. Rodrigues associados e alinhados corretamente.
