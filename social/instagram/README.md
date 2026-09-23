# Instagram a partir dos artigos

Desde 23/09/2026, todo artigo novo da Arcaffo precisa ter uma entrada em `content.json` com:

- um carrossel ou post fixo;
- uma legenda completa e autônoma;
- quando previsto na pauta, uma sequência de Stories;
- um CTA coerente com o artigo;
- texto sem afirmações ou números não sustentados pelo conteúdo original.

## Produção

```bash
npm run social:generate
npm run social:check
```

Os PNGs finais ficam em `social/instagram/exports/<slug>/`. O feed usa 1080 × 1350 px e os Stories usam 1080 × 1920 px.

Cada pasta deste primeiro lote inclui `caption.txt` e `stories-notes.txt`. Os adesivos descritos nas notas devem ser adicionados no aplicativo do Instagram para permanecerem interativos.

## Direção visual

As peças seguem o sistema Matéria do site: Newsreader, Inter, papel, espresso, brasa, filetes finos e imagens reais. Imagens de projetos mantêm suas cores. Não usar preto puro como superfície, efeitos de vidro, cantos arredondados decorativos ou fotografias geradas como registro da empresa.

## Publicação

1. Publicar o carrossel na ordem numérica.
2. Colar a legenda entregue, revisando apenas links ou datas contextuais.
3. Publicar os Stories na ordem e adicionar o adesivo indicado nas notas.
4. No último Story, usar o adesivo de link com a URL do artigo.
5. Registrar data, alcance, salvamentos, compartilhamentos e visitas ao perfil para comparar temas e formatos.
