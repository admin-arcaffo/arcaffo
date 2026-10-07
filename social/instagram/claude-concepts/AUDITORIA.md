# Auditoria visual — Instagram dos artigos-piloto

Material analisado: commit `8f7860c` (v1, rejeitada) e a tentativa não commitada no working tree (v2). Referências salvas em `_auditoria/`. Nenhum arquivo existente foi alterado.

## 0. Defeito técnico que atravessa tudo

**A Newsreader nunca foi renderizada.** O script embute `newsreader-latin.woff2` num `@font-face` dentro do SVG, mas o `sharp`/librsvg ignora WOFF2 em `@font-face`. Todos os títulos da v1 e da v2 saíram numa sans-serif de sistema. Metade da identidade tipográfica oficial estava ausente, e isso explica boa parte da sensação de genérico. Os conceitos desta pasta foram renderizados em Chromium (Playwright), com as fontes do pacote Matéria carregadas e verificadas.

## 1. O que faz parecer genérico

- Esqueleto único: logotipo, eyebrow, título, filete, corpo e foto. Muda a posição, não a lógica.
- Motivos por tema (o "OU" vazado, o "7" gigante, a mira, os retângulos) aplicados como marca-d'água a 17–28% de opacidade: decoram, mas não organizam a página.
- Números gigantes fantasmas (01–05) no canto superior direito. É um recurso típico de template e compete com o título.
- Títulos em sans genérica, tamanho médio e sem contraste de escala: nenhuma palavra carrega a ideia.

## 2. Hierarquia

- Título e corpo têm pesos visuais próximos. Falta um ponto de entrada forte.
- Nas telas internas, o corpo (~29 px) fica isolado no meio de grandes áreas vazias, e o olho não sabe para onde ir depois do título.
- Eyebrow, "PONTO 0X", folio e código ("R / R") somam quatro camadas de rótulo com pouca informação.

## 3. Repetição

- As 28 telas internas repetem a mesma coluna à esquerda com filete de 370 px. Os quatro temas só se diferenciam pelo motivo apagado ao fundo.
- Os quatro CTAs são idênticos: espresso, faixa brasa vertical, foto à direita e slogan. O slogan também invade a faixa brasa, **um bug visível**.
- Os Stories seguem o mesmo gabarito: bloco de texto no alto e foto ou caixa embaixo.

## 4. Proporção

- Na v1, a foto ocupa sempre uma faixa inferior de cerca de 35%, e o texto flutua num campo claro sem tensão.
- Na v2, as colunas de foto de 390–444 px criam retângulos estreitos que cortam mal as imagens (cartão "CIA DO" amputado).
- Os títulos das internas (~68 px) são pequenos demais para 1080 px, e a escala não cria ritmo.

## 5. Fotografia

- A mesma foto de capa se repete na capa, no slide 05, no CTA e em dois Stories de cada artigo.
- `fit: cover` + `position: attention` decidem o recorte automaticamente, sem intenção editorial, e cortam logotipos de clientes.
- O acervo real é rico, com 17 imagens da Cia do Vidro (corte do vidro, lâminas, construção do logotipo, papelaria), mas só a capa foi usada.
- A caixa "INTERAÇÃO" desenhada nos Stories imita um adesivo e contraria a regra de não simular elementos interativos.

## 6. O que preservar

- Tokens de cor corretos, sem preto puro nas superfícies, cantos retos e filetes finos.
- Cores dos projetos de clientes respeitadas, sem filtros.
- Paginação, cabeçalho editorial e ideia de "motivo por tema" (a intenção do README está certa, a execução não).
- Estrutura de dados (`content.json`, `caption.txt`, `stories-notes.txt`) e fluxo de publicação.
