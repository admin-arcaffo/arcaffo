# Instagram a partir dos artigos

Desde 23/09/2026, todo artigo novo da Arcaffo precisa ter uma entrada em `content.json` com:

- um carrossel ou post fixo;
- uma legenda completa e autônoma;
- quando previsto na pauta, uma sequência de Stories;
- um CTA coerente com o artigo;
- texto sem afirmações ou números não sustentados pelo conteúdo original.

## Produção

```bash
npx playwright install chromium   # só na primeira vez em cada máquina
npm run social:generate
npm run social:check
```

O gerador renderiza as peças em Chromium (Playwright) para usar de fato Newsreader e Inter. Se preferir um Chrome já instalado, defina `ARCAFFO_CHROMIUM=/caminho/do/executavel`. A geração falha, listando o problema, quando um texto sai da página, estoura a largura, se sobrepõe a outro ou invade as áreas de interface dos Stories (250 px no topo e 250 px na base).

Os PNGs finais ficam em `social/instagram/exports/<slug>/`. O feed usa 1080 × 1350 px e os Stories usam 1080 × 1920 px.

Cada pasta deste primeiro lote inclui `caption.txt` e `stories-notes.txt`. Os adesivos descritos nas notas devem ser adicionados no aplicativo do Instagram para permanecerem interativos.

## Direção visual

As peças seguem o sistema Matéria do site: Newsreader, Inter, papel, espresso, brasa, filetes finos e imagens reais. Imagens de projetos mantêm suas cores. Não usar preto puro como superfície, efeitos de vidro, cantos arredondados decorativos ou fotografias geradas como registro da empresa.

Sistema vigente: **Dossiê** (aprovado em 23/09/2026). A leitura estratégica como documento: grade fixa (margem 72 px, coluna de notas 72–348, coluna de texto 396–1008), cabeçalho corrido com série, tema e paginação, pranchas fotográficas com legenda "Fig." e um filete de tinta como estrutura. Cada tema tem uma figura própria, definida em `DIRECTION` no gerador: camadas (rebranding), régua de sinais (diagnóstico), índice de critérios (guia de decisão) e diagramas de estrutura (arquitetura). Novo artigo = nova entrada em `DIRECTION` com número da série, figura e recortes de fotografia do acervo real. Nos Stories, a área do adesivo é marcada por cantos e um rótulo utilitário, nunca por um adesivo desenhado.

Cada artigo deve receber um motivo visual ligado ao assunto — corte, diagnóstico, território, sistema, percurso ou outra metáfora pertinente. Esse motivo organiza números, diagramas, fotografia e ritmo ao longo da sequência. A família tipográfica, a paleta, o cabeçalho editorial e a paginação mantêm a unidade da série; não repetir a mesma composição em todos os temas.

## Publicação

1. Publicar o carrossel na ordem numérica.
2. Colar a legenda entregue, revisando apenas links ou datas contextuais.
3. Publicar os Stories na ordem e adicionar o adesivo indicado nas notas.
4. No último Story, usar o adesivo de link com a URL do artigo.
5. Registrar data, alcance, salvamentos, compartilhamentos e visitas ao perfil para comparar temas e formatos.
