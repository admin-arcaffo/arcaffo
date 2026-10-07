# Direção 03 — Escala

**Princípio de composição.** A tipografia constrói o sentido. Em cada frase, as palavras que carregam a decisão ganham escala monumental (Newsreader 150–250 px), e os conectivos ficam pequenos, em Inter. A frase é a mesma do conteúdo aprovado, e a hierarquia vem da escala: "Rebranding / ou / redesign?", "mudar / ou ser / compreendida", "direção / ou na / expressão?". Composição assimétrica: blocos ancorados em margens alternadas, com vazio ativo entre eles.

**Fotografia.** É uma amostra de matéria, pequena e precisa, como um material preso numa prancha de referências, com filete de contorno e rótulo "Amostra — Cia do Vidro". A foto não compete com o texto: prova que existe projeto real por trás da palavra. O contraste entre palavra enorme e amostra pequena é a tensão principal.

**Tipografia.** O máximo contraste de escala permitido pelas duas fontes oficiais, sem recursos extras. As palavras-chave usam tracking levemente negativo, e o corpo e os rótulos seguem o site.

**Ritmo da sequência.** Cada tela destaca uma ou duas palavras, e o carrossel se lê como uma frase longa passando de página em página. Nas internas, as três palavras-chave (Estratégia, Percepção, Expressão) se alternam entre esquerda e direita e a pergunta encaixa no vão. O ritmo nasce do texto.

**Adequação à Arcaffo.** O texto continua protagonista, o critério nº 1. Culta sem pretensão: é tipografia de livro em escala de cartaz. Funciona em miniatura (a capa se lê no grid do perfil), é a mais reconhecível sem depender do logotipo e diferencia bem os temas: cada artigo tem palavras próprias para amplificar.

**Riscos e limitações.**
- Exige critério editorial em cada peça (quais palavras crescem). Não é automatizável por completo e pede um campo novo de marcação em `content.json` (por exemplo `emphasis`) sem alterar o texto.
- Títulos longos com várias palavras-chave perdem força e precisam de uma regra de fallback (escala uniforme).
- Tudo fica bonito, mas depende de a Newsreader ser renderizada corretamente, o que exige trocar o motor de renderização (ver AUDITORIA.md).
- Com pouca fotografia, trabalhos de clientes aparecem menos. Artigos centrados em projeto podem pedir uma prancha maior.
