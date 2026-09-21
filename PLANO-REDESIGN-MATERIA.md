# Arcaffo GROUP — plano de implementação do site Matéria

Revisão de 15/09/2026: a segunda versão implementa liderança somente em Sobre, cronologia por capítulos, cultura explorável, serviços interativos, galeria mínima, setas SVG, motion progressivo e base técnica de descoberta. Resultados de QA e pendências externas estão na seção atualizada de `ENTREGA-MATERIA.md`. A publicação continua limitada a preview para revisão.

Data: 13 de setembro de 2026. Status: implementação concluída em prévia protegida da Vercel; domínio principal ainda não promovido. Este documento conserva o plano original. Resultados e limites de validação estão em [ENTREGA-MATERIA.md](ENTREGA-MATERIA.md).

## 1. Resultado pretendido

Fazer o visitante sentir que foi recebido por pessoas criteriosas, próximas e capazes de compreender seu negócio. A experiência deve oferecer espaço para conhecer, explorar e conversar, com clareza sobre a atuação da Arcaffo.

Conceito de experiência proposto: **uma visita à mesa de trabalho da Arcaffo**. A chegada apresenta a casa; uma interação demonstra seu modo de pensar; projetos e pessoas aprofundam a confiança; o contato inicia uma conversa acompanhada.

Calma é ritmo editorial, respiro e controle do visitante. Carregamento e resposta aos comandos continuam rápidos. A curadoria aparece na seleção do conteúdo e no atendimento pessoal. O conteúdo institucional permanece acessível, com convite à conversa sempre disponível.

## 2. Evidências e limites deste planejamento

Fontes examinadas: README e AGENTS do Design System v2.0 Matéria, todos os arquivos de tokens, patterns.css, duas imagens de referência, PRODUCT.md, DESIGN.md, estrutura Vite, estilos atuais, scripts de interação e geração, dados locais de conteúdo e integração de contato. O texto público da home foi consultado em https://www.arcaffo.com/.

Constatações:

- A nova identidade substitui expressamente a versão monocromática anterior: Newsreader Light 300, Inter, papel/espresso, formas retas, fotografia quente e luz âmbar discreta.
- PRODUCT.md e DESIGN.md ainda exigem a identidade antiga. Na implementação, atualizar suas regras visuais para a v2.0, preservando definições de negócio que continuem válidas.
- O site é HTML/CSS/JavaScript com Vite multipágina e funções na Vercel. A estrutura já gera HTML próprio para artigos e projetos.
- Há alterações locais preexistentes em páginas e estilos, além de arquivos novos. A execução precisa registrar essa base e preservar o trabalho existente.
- O painel edita conteúdo por Vercel Blob; o build sincroniza dados remotos e injeta textos por `data-cms`. A home pública e o JSON local apresentam textos diferentes. Alterar somente o HTML ou JSON local não garante que o texto novo chegue à produção.
- `contato.html` incorpora o Forms Arcaffo e escuta `arcaffo:success`. A presença de `api/contato.mjs` não significa que essa API seja o caminho usado pelo formulário atual.
- `js/main.js` aplica efeito de luz ligado ao mouse em vários cards. `js/servicos-hero.js` mantém um ciclo contínuo para a luz do símbolo. Esses comportamentos precisam ser reavaliados na nova direção e no orçamento de desempenho.
- O kit inclui Inter em TTF e importa Newsreader do Google Fonts; preparar entrega de fontes adequada ao site faz parte da implementação.
- As duas imagens inspecionadas, `mood-01.jpg` e `mood-07-light.jpg`, têm forte presença monocromática. O filtro quente não recupera cores originais nem substitui fotografias com pessoas, materiais e iluminação adequados.

Limites: esta etapa não incluiu auditoria visual completa da produção em navegador, medições de desempenho, envio de formulário, inspeção do painel remoto ou teste em aparelhos físicos. Esses são entregáveis da execução, e não resultados já comprovados.

## 3. Direção visual aplicada

Usar o pacote oficial como fonte da verdade, com cópia versionada no projeto e procedência registrada. O site deve importar o `styles.css` do pacote e consumir os tokens `--arcaffo-*`. A versão publicada não pode depender do caminho do Google Drive.

| Elemento | Aplicação |
|---|---|
| Papel `#F7F3EA` | Base predominante e superfícies de leitura |
| Areia `#EDE7DC` e linho `#D8CFC0` | Variações de superfície e filetes |
| Tinta `#221C16` e grafite `#574F45` | Texto principal e secundário |
| Espresso `#17130F` | Momentos de profundidade, convite e fechamento |
| Brasa `#C99A63` | Pequenos acentos e luz indireta conforme o sistema |
| Newsreader 300, caixa natural | Títulos e hierarquia editorial |
| Inter | Leitura, controles, legendas e rótulos |
| Cantos retos e filetes | Botões, campos, divisões e superfícies |
| Bandas fotográficas | Presença material e pausas entre capítulos |

Os códigos acima documentam os tokens oficiais; a implementação referencia variáveis, sem duplicar valores nas páginas.

Composição: alternar campos de papel, fotografias amplas e trechos espresso conforme a narrativa. Espaços generosos, alinhamento preciso e colunas de leitura confortáveis. Madeira, pedra e linho aparecem por fotografia e detalhes reais; evitar transformar a tela em uma simulação literal de mobiliário.

Priorizar imagens reais de pessoas, ambiente e trabalho da Arcaffo. Preparar uma pauta fotográfica com retratos próximos, conversa à mesa, mãos examinando materiais, detalhes de acabamento e luz lateral suave. Rever direitos de uso e disponibilidade dos originais. Ilustrações atmosféricas eventualmente geradas devem ser tratadas como ilustração, nunca como registro real da empresa ou de clientes.

Pontos a resolver antes de fechar os componentes:

- O guia diz que caixa alta se restringe a pequenos rótulos, mas o botão oficial usa caixa alta e 11px. Apresentar sua aplicação no protótipo e uma proposta de controle mais legível para decisão, sem alterar silenciosamente a regra.
- Os filtros fotográficos são obrigatórios no pacote, mas aplicá-los aos projetos pode mudar as cores das marcas dos clientes. **Decisão confirmada pelo usuário: preservar as cores originais dos trabalhos dos clientes.** Documentar a exceção e limitar filtros às fotografias institucionais; não aplicar filtro herdado nos contêineres do portfólio.
- O guia permite dois tratamentos por assunto e proíbe misturá-los na mesma peça. Definir a unidade dessa regra para o site antes de compor páginas com ambos. Até lá, manter um tratamento por página institucional.
- O pacote não cobre todos os estados web: foco, erro, sucesso, carregamento, menus e movimento. Documentar extensões semânticas `--arcaffo-*`, derivadas da identidade, com teste de contraste e legibilidade.

## 4. Navegação e percurso

Menu proposto: **Sobre · Como atuamos · Projetos · Artigos · Vamos conversar**. A página de serviços pode aparecer como “Como atuamos” mantendo sua URL atual. Assessoria, escola e clube permanecem acessíveis em Como atuamos e no rodapé, com identificação clara quando levam a outro site.

Cabeçalho discreto, estável e legível sobre todas as superfícies. No celular, menu com área confortável de toque, ordem clara, fechamento por Escape e retorno do foco ao botão de abertura. Mostrar a seção atual também nos detalhes de projetos e artigos.

Percurso principal:

**Chegada → modo de pensar → exploração de uma questão → evidência em projetos → pessoas → conversa.**

Esse percurso orienta a composição, mas não obriga o visitante a concluir etapas. Quem já quer conversar encontra o contato imediatamente; quem chega por artigo ou projeto tem um próximo passo contextual.

Home proposta:

1. **Recepção.** Fotografia real ampla, título Newsreader e apresentação objetiva da atuação. Dois caminhos claros: conhecer a forma de trabalho e iniciar uma conversa. Exemplo de título para avaliação: “Aproximamos a essência da sua empresa do que ela pode se tornar.” A frase de apoio deve explicitar branding, formação e assessoria para não deixar a proposta abstrata.
2. **Convicção.** A filosofia “Tudo o que fazemos, fazemos primeiro para o outro”, acompanhada de práticas concretas que a sustentem.
3. **Mesa de trabalho.** Experiência participativa descrita a seguir.
4. **Projetos selecionados.** Poucos casos com contexto e decisões visíveis; acesso ao acervo completo.
5. **Pessoas e lugar.** Quem acompanha o empresário, como trabalha e onde recebe. Fotografias e legendas reais.
6. **Ecossistema.** Explicar a relação entre as frentes e para qual necessidade cada uma contribui, com acesso aos respectivos sites.
7. **Convite.** O que acontece na primeira conversa, como solicitar e quais canais estão disponíveis.

Os números já presentes — 10 anos, NPS 97 e mais de 400 marcas — entram junto à evidência pertinente. Conferir origem e redação antes de publicar. Evitar contadores animados e repetição de afirmações de autoridade.

## 5. Interação assinatura: a mesa de trabalho

Uma seção editorial interativa permite experimentar o raciocínio da Arcaffo. O visitante escolhe uma questão reconhecível do negócio. Exemplos de entrada, a validar com o conteúdo real:

- “Minha marca já não representa a empresa.”
- “Minha equipe precisa de mais direção.”
- “Quero crescer com mais estrutura.”

A escolha abre uma composição com três conteúdos: o que procuramos compreender, como trabalhamos essa questão e um projeto ou conteúdo real relacionado. A passagem entre eles tem movimento breve e coordenado, como dar atenção a outro documento sobre a mesa.

Não apresentar diagnóstico automático, pontuação ou recomendação definitiva. A interação revela possibilidades e critérios; a avaliação do negócio acontece na conversa humana.

No desktop: opções ao lado da composição com fotografia/documento, texto e ligação para um caso. No celular: opções e conteúdo em sequência vertical, mantendo contexto e evitando painéis apertados. A experiência funciona por toque, teclado e mouse. Os três conteúdos essenciais continuam acessíveis quando JavaScript está desativado.

O visitante pode alterar a escolha sem perder seu lugar. Compartilhar o estado por fragmento ou parâmetro legível, se útil. Um convite contextual pode acompanhar a escolha até o contato, somente se a integração vigente suportar o recurso; não presumir esse suporte.

Dependência editorial: selecionar três exemplos reais que demonstrem o raciocínio. Onde não houver material suficiente, usar explicação honesta do processo e ligação para um conteúdo existente. A interação não deve esperar por estudos de caso fictícios.

## 6. Sistema de movimento e interação

Objetivos: calma, continuidade e resposta clara. Proposta de três durações, ainda sujeita ao protótipo: 180ms para feedback de controles, 350ms para mudança de conteúdo e 550ms para entradas editoriais. Curva predominante `cubic-bezier(0.4, 0, 0.2, 1)`, sem elasticidade. O estado de clique aparece imediatamente; a animação apenas acompanha a resposta.

| Momento | Comportamento proposto | Condição |
|---|---|---|
| Chegada | Composição já legível; fotografia e elementos secundários se acomodam suavemente | Título principal nunca espera uma introdução |
| Mesa de trabalho | Pequeno deslocamento e transição de conteúdo; marcador acompanha a escolha | Uma mudança principal por vez |
| Abrir projeto | Continuidade entre a imagem selecionada e a abertura do caso | View Transitions com alternativa de navegação normal |
| Leitura da página | Entradas discretas de blocos secundários, executadas uma vez | Conteúdo visível por padrão se scripts falharem |
| Botões e links | Mudança de superfície, filete e foco | Nenhum controle depende de passar o mouse |
| Galeria de projeto | Abrir imagem, avançar, voltar e fechar com controles claros | Preservar foco, legenda e posição de leitura |
| Superfície espresso | Halo âmbar do design system; eventual variação lenta apenas no ponto de destaque | Versão estática padrão; pausar qualquer movimento contínuo |

A assinatura concentra a coreografia: conteúdo principal, marcador secundário e ambiente material discreto. As demais áreas mantêm pouco movimento. Não adotar rolagem controlada artificialmente, cursor personalizado, efeitos de ímã, áudio automático ou carregamento cenográfico. Esses recursos dificultariam o ritmo controlado pelo visitante.

Respeitar `prefers-reduced-motion`: remover deslocamentos, transições entre páginas e qualquer animação ambiente; preservar orientação por foco, texto e estado selecionado. Interromper processamento fora da área visível e em aba inativa. Qualquer movimento automático prolongado precisa de controle de pausa; preferir cenas breves que se estabilizam.

## 7. Escopo por página

| Página | Mudança principal | Critério de conclusão |
|---|---|---|
| Início | Recepção, mesa de trabalho, curadoria e convite | Visitante entende atuação e encontra os dois percursos |
| Sobre | Pessoas, filosofia, ambiente e história com leitura pausada | Identidade humana sustentada por conteúdo real |
| Serviços | Explicar necessidades, trabalho e relação entre frentes | Links e descrições correspondem às ofertas existentes |
| Projetos | Curadoria inicial, exploração do acervo e filtros úteis se os dados permitirem | Nenhum projeto publicado desaparece |
| Projeto | Contexto, decisões, entregas e galeria | Template gera todos os casos e preserva suas URLs |
| Artigos | Índice editorial legível e categorias quando disponíveis | Conteúdo encontrável e navegação acessível |
| Artigo | Coluna de leitura, autoria, imagens e próximo conteúdo | Texto íntegro, títulos longos e imagens bem resolvidos |
| Contato | Recepção pessoal e Forms integrado visualmente | Envio real confirmado no destino, erro recuperável |
| Obrigado | Confirmação e orientação para o próximo passo | Distingue recebimento de solicitação de horário confirmado |
| Vagas | Mesma identidade, informação prática e candidatura acessível | Preserva o caminho atual de candidatura |

Painel administrativo: manter edição e publicação funcionando; incluir apenas ajustes necessários aos novos campos e à prévia do site. Um redesenho completo do painel e dos subdomínios não faz parte desta proposta.

## 8. Ritual de contato

**Decisão confirmada pelo usuário: solicitar uma conversa; a equipe combina o horário.** O botão principal deve comunicar “Solicitar uma conversa”. A confirmação informa que a solicitação foi recebida e explica o contato posterior da equipe, sem afirmar que uma reunião já está agendada.

Antes de escolher a interface final, inspecionar as possibilidades reais do formulário incorporado: tema, fontes, campos, etapas, preseleção, estado de envio e redirecionamento. Priorizar os recursos nativos suportados. Caso a experiência dependa de mudança no Forms Arcaffo, explicitar a dependência e delimitar a alteração ao formulário deste site; não modificar formulários de outros clientes.

O contato deve explicar quem recebe a solicitação e o próximo passo. Coletar somente contexto necessário. Exibir nome da empresa e mensagem com clareza, mantendo WhatsApp e e-mail como alternativas. Não introduzir etapas obrigatórias apenas para produzir sensação de exclusividade.

Agenda direta fica fora desta implementação. Prazo de retorno e promessas de atendimento dependem de definição operacional real. O fluxo termina com recebimento confirmado da solicitação e orientação sobre como a equipe dará continuidade.

Testar sucesso, falha, envio repetido, lentidão do provedor e retorno à página. Erros preservam as informações preenchidas quando tecnicamente possível e oferecem orientação clara. Acompanhamento analítico diferencia abertura do contato, envio bem-sucedido e agendamento confirmado.

## 9. Implementação técnica

Manter inicialmente a arquitetura multipágina com Vite, HTML semântico, CSS e módulos JavaScript. Ela é compatível com a experiência proposta. Não há evidência neste levantamento de que uma migração para React ou Next.js traria benefício proporcional ao trabalho.

Recursos modernos previstos:

- CSS Grid, tipografia fluida e composição responsiva para adaptar a experiência ao conteúdo e à largura real.
- View Transitions como melhoria progressiva na navegação e nas mudanças de composição. Sem suporte, continuar com links e conteúdo funcionais.
- IntersectionObserver para ativar efeitos secundários e pausar trabalho fora de tela; usar CSS e Web Animations API quando apropriado à coreografia.
- Imagens responsivas com dimensões reservadas, formatos eficientes e carregamento adiado abaixo da primeira tela. A imagem principal recebe prioridade.
- Fontes WOFF2 locais com cobertura do português, licença verificada, `font-display` apropriado e carregamento apenas dos estilos necessários.
- Componentes compartilhados de cabeçalho, rodapé, convite e padrões editoriais por composição no build, reduzindo divergência entre páginas sem impor um framework no navegador.

Organização sugerida: pacote oficial em `public/design-system/arcaffo-materia/`, adaptações web em CSS próprio, componentes e comportamento em módulos pequenos. Registrar versão e licença dos ativos. Evitar uma terceira camada extensa de sobrescritas sobre `global-v2.css`: migrar por componentes, remover regras antigas quando substituídas e revisar os estilos embutidos no HTML e no gerador.

Preservar atributos `data-cms` e `data-cms-href` ou migrá-los com compatibilidade documentada. Novos conteúdos editáveis precisam de campos correspondentes no painel, valores iniciais e comportamento de retorno. Como o build busca conteúdo remoto, preparar migração controlada e reversível do conteúdo para impedir que a versão antiga sobrescreva a nova.

Modificar os templates `artigo.html` e `projeto.html` e o gerador; regenerar derivados em ambiente isolado. O script atual recria diretórios de páginas: registrar a base e não executá-lo sobre arquivos ainda não preservados. Separar o teste do build visual da sincronização remota para tornar a prévia reproduzível.

Antes de instalar novas bibliotecas, revisar dependências e versões compatíveis. Incluir biblioteca de animação somente se o protótipo demonstrar uma necessidade concreta não atendida de forma simples pelas APIs nativas.

## 10. Etapas e critérios de passagem

| Etapa | Entrega concreta | O que permite avançar |
|---|---|---|
| 1. Base e inventário | Registro das alterações existentes, URLs, conteúdo, integração, capturas desktop/mobile e métricas iniciais | Diferenças entre local, painel e produção compreendidas |
| 2. Direção e conteúdo | Composição da home, contato, um projeto e artigo; seleção de imagens; textos propostos; decisões do design system registradas | Direção visual representativa e dependências identificadas |
| 3. Protótipo navegável | Home e mesa de trabalho, menu mobile e caminho até o contato em prévia | Experiência avaliada em tela grande e pequena antes de expandir |
| 4. Fundação | Tokens, fontes, componentes, movimento, documentação e estratégia de conteúdo | Componentes aderentes e funcionais por teclado/toque |
| 5. Migração completa | Todas as páginas públicas, templates, gerador e ajustes do painel necessários | Inventário de páginas e conteúdo totalmente coberto |
| 6. Integração e qualidade | Forms, eventos, SEO, acessibilidade, desempenho e navegadores | Critérios abaixo atendidos; limitações documentadas |
| 7. Publicação | Prévia final, backup de conteúdo/configuração e implantação com retorno preparado | Fluxos críticos comprovados na prévia e após publicação |
| 8. Acompanhamento | Comparação de experiência e conversão, correções baseadas no uso | Dados suficientes e retorno qualitativo para decidir ajustes |

Ordem crítica: direção → protótipo → fundação → páginas → integração → validação → publicação. A curadoria de imagens e a confirmação operacional do contato podem avançar durante o protótipo. Não fixar calendário definitivo sem dimensionar essas duas dependências e o acervo.

## 11. Critérios de qualidade

Visual e marca:

- Todas as páginas públicas usam a identidade Matéria, inclusive detalhes gerados e estados de erro/vazio.
- Conferir títulos longos, textos do painel, recortes de pessoas, logotipos e alternância de superfícies.
- Validar comparações visuais em aproximadamente 360, 390, 768, 1280 e 1440px; conferir também largura estreita e zoom de 200%.
- Um pequeno grupo de visitantes descreve a experiência com perguntas abertas. Buscar percepções de seriedade, acolhimento, tranquilidade e confiança, sem sugerir esses adjetivos na pergunta.

Funcional e acessibilidade:

- Menu, mesa de trabalho, filtros, galerias e contato operáveis por teclado e toque, com foco visível e ordem lógica.
- Contraste medido em textos, controles e fundos fotográficos; meta WCAG 2.2 AA. Tokens são ponto de partida, não prova automática de contraste.
- Controles principais com alvo confortável de aproximadamente 44px; rótulos pequenos do kit não determinam o tamanho de toda a interação.
- Leitor de tela recebe estado selecionado, abertura de painéis e resultado do envio. Sem dependência exclusiva de cor ou animação.
- Conteúdo institucional e navegação básicos disponíveis sem JavaScript; contato externo alternativo acessível se o embed falhar.
- Chrome, Safari e Firefox atuais, com verificação mobile real quando disponível. Emulador não substitui a comprovação em aparelho.
- Envio de teste identificado e verificado no destino de homologação; em produção, prova controlada e sem contaminar relatórios comerciais.

Desempenho e descoberta:

- Metas de campo no percentil 75: LCP até 2,5s, INP até 200ms e CLS até 0,1. Antes do lançamento, usar laboratório como aproximação e documentar aparelho/rede; medição de laboratório não comprova INP de campo.
- Definir orçamento por tipo de página depois de medir a base, incluindo fontes, imagens, JavaScript e embed. Efeitos devem caber no orçamento.
- Nenhum vídeo necessário para compreender a primeira tela; adotar vídeo apenas se houver material e ganho demonstrável, com imagem alternativa e controles adequados.
- Preservar URLs, canonicals, metadados, dados estruturados, sitemap e redirecionamentos existentes. Conferir amostras e inventário automático de todas as páginas geradas.
- Evitar páginas com conteúdo escondido esperando animação, links quebrados, erros de console e recursos ausentes.

## 12. Sucesso após publicação

Medir participação na mesa de trabalho, abertura de projetos, continuidade de leitura, acesso ao contato e solicitações efetivamente recebidas. Manter distinção entre clique no WhatsApp, envio de formulário e reunião confirmada.

Comparar indicadores com a base anterior, por dispositivo e origem de tráfego, durante uma janela com volume suficiente. O objetivo é melhorar compreensão e qualidade das conversas. Tempo maior na página só é um sinal positivo quando acompanhado de participação e facilidade de encontrar o que se procura.

Eventos não devem transportar nome, e-mail, telefone ou conteúdo livre das mensagens. Registrar apenas estados e categorias necessários. Avaliar a qualidade das conversas com a equipe, por meio de processo combinado, sem criar classificações automáticas de visitantes.

## 13. Publicação e retorno

Conferir projeto Vercel, domínio e base de conteúdo reais antes de qualquer publicação. Disponibilizar prévia completa, guardar o deployment anterior e um snapshot compatível dos dados/configurações que forem alterados. Validar se a prévia depende de algum recurso de produção antes dos testes.

Após publicar, conferir home, projeto, artigo, menu mobile e contato. Se houver falha crítica, retornar à versão anterior e restaurar a configuração/conteúdo correspondente quando necessário: retornar só o código pode não desfazer mudanças feitas no painel.

Este documento autoriza planejamento, não executa publicação nem migração. Implementação, edição remota e publicação devem seguir o escopo que o usuário autorizar na continuidade.

## 14. Decisões confirmadas, pendências e recomendação

1. Contato — confirmado: solicitar conversa, com horário combinado posteriormente pela equipe.
2. Portfólio — confirmado: preservar as cores originais dos trabalhos dos clientes e registrar essa exceção ao tratamento institucional.
3. Aplicação web do sistema: tamanho/caixa dos botões, estados de interface e unidade da regra de fotografia. Resolver em proposta visual concreta, antes de consolidar componentes.
4. Fotografia e histórias: verificar quais registros reais e casos possuem conteúdo suficiente. Criar pauta de produção apenas para lacunas identificadas.
5. Operação: responsável por receber solicitações, próximo passo real e prazo que pode ser comunicado. Não inventar disponibilidade.

Próxima entrega recomendada: **protótipo navegável da home com a mesa de trabalho e o caminho até o contato, em desktop e celular**, acompanhado de um projeto e um artigo representativos para verificar a amplitude do sistema antes da migração completa.

## Referências

- Design System fornecido: `/Users/arthurfava/Library/CloudStorage/GoogleDrive-admin@arcaffo.com/Drives compartilhados/Clientes/_Arcaffo/1. Institucional/1. Identidade Visual/_Estudos/Design System`.
- [Site público consultado](https://www.arcaffo.com/).
- [MDN — View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API): transições de estados e entre documentos, aplicadas aqui como melhoria progressiva.
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): respeito à preferência de movimento reduzido.
- [web.dev — Web Vitals](https://web.dev/articles/vitals): indicadores e metas de desempenho em campo.
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/): critérios de acessibilidade a verificar durante a implementação.

Método de trabalho: frontend-design orientou a composição específica para a Arcaffo e a concentração da assinatura em uma interação útil; motion-design orientou intenção, ritmo e coordenação dos movimentos. A identidade fornecida e as prioridades do usuário prevalecem sobre exemplos genéricos dessas skills.
