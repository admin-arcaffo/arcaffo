# Entrega — Arcaffo Matéria

## Segunda versão editorial — 15/09/2026

Esta seção atualiza os resultados da entrega original preservada abaixo.

Prévia final: https://arcaffo-dxry1g9ay-arcaffo-group.vercel.app — deployment `dpl_CHaJ2u9x7oRR66ghJWbSPm9zPhNy`, protegido pelo login Vercel. A URL antiga abaixo é apenas registro da primeira entrega.

- Home sem dobra individual de Arthur; liderança reunida em Sobre, com três retratos reais e fotografia institucional do acervo.
- Cronologia em capítulos com palco fixo desktop, navegação por anos e alternativa vertical mobile/sem movimento. Não foram inventadas fotografias históricas; o CMS aceita imagens e legendas confirmadas por capítulo.
- Essência em composição editorial e cultura em detalhes expansíveis. Serviços redesenhados em três frentes, com dez painéis exploráveis, navegação por teclado e conteúdo completo sem JavaScript.
- Galeria minimalista, setas SVG uniformes, navegação por gesto, foco restaurado e recuperação de erro de imagem. Cores dos clientes preservadas.
- Motion progressivo em títulos, seções, imagens e capítulos; rolagem nativa e respeito ao movimento reduzido. Skills frontend-design e motion-design orientaram a hierarquia e o ritmo, subordinadas ao design system oficial.
- Família de favicon ICO/SVG/PNG, ícones Apple/manifest, capa social, canonical, metadados, JSON-LD, sitemap, robots, llms.txt e página 404. Datas ausentes não são fabricadas; imagens externas conservam origem. Administração recebe noindex e cache de imagens estáveis foi corrigido.
- Novos campos opcionais no painel para Sobre/história, serviços e SEO, com defaults e validação de URLs; nenhuma gravação remota de conteúdo executada.

### Verificação da segunda versão

Build e sete testes automatizados aprovados. Auditoria Chrome/Firefox/WebKit: home, Sobre e Serviços em 360, 430, 768, 1024 e 1440px, sem transbordamento após carregamento; capítulos, painéis, galeria por gesto, foco, movimento reduzido e conteúdo sem JavaScript aprovados. WebKit automatizado não equivale a Safari em aparelho físico.

Axe: zero violações detectadas nas dez rotas públicas avaliadas. Lighthouse mobile local da home: desempenho 99, acessibilidade 100, boas práticas 100 e SEO 100; LCP 2,1s, CLS 0, bloqueio total 0ms. São medidas de laboratório, não métricas de campo nem garantia de indexação, Discover ou citação por IA.

Prévia intermediária `arcaffo-a8nq4nx6r-arcaffo-group.vercel.app`: formulário real GET 200, três campos, sem overflow/erros e zero escritas; URL inexistente HTTP 404. O teste real de recebimento permanece pendente de autorização. Não foram configuradas contas Search Console/Bing nem comprovada indexação, pois não há acesso confirmado a essas propriedades.

`npm audit --omit=dev`: zero vulnerabilidades. Auditoria completa ainda aponta dois pacotes de desenvolvimento (Vite/esbuild); a correção exige migração maior do Vite, não aplicada automaticamente. Dependências compatíveis atualizadas. Revisar antes de expor servidor de desenvolvimento em rede.

Relatórios: `.impeccable/qa/chapters/report.json`, `.impeccable/qa/materia/report.json`, `.impeccable/qa/materia/lighthouse.json` e auditoria de acessibilidade. Backup desta rodada: `/private/tmp/arcaffo-v3-backup.jUfsSU/site.tar.gz` (temporário, sem credenciais/dependências). Produção permanece inalterada.

### Refinamento orientado pela consultoria

Aplicados: nova quebra do texto inicial; ritmo regular entre 10 anos, +400 marcas e NPS 97; projetos alinhados por linha e com menor distância; assinatura oficial no título do ecossistema; subtítulo do ecossistema em duas linhas; raio discreto nos botões; maior presença do campo inicial da história; relação interativa e explícita entre Fé, Família e Autoridade; retratos institucionais de 2025, nomes conferidos e três sócios na mesma linha. O comentário sobre a fragilidade do globo da Advisor foi registrado, mas não redesenhado aqui porque depende da atualização oficial dessa submarca.

Prévia deste refinamento: https://arcaffo-nh03l0l6f-arcaffo-group.vercel.app — deployment `dpl_2FGFQty7j1zitiHYku6JWexyv89j`. Produção não promovida.

---

13/09/2026. Implementação disponível em prévia; não publicada no domínio principal.

Prévia: https://arcaffo-5uat6bcat-arcaffo-group.vercel.app

Vercel: projeto `arcaffo-group/arcaffo`, deployment `dpl_H59d1sRqpTzupCJ5v4hPVDPKqr66`, estado Ready, destino preview. É necessário entrar na Vercel com acesso ao projeto. A proteção não foi desativada. O comando autenticado `vercel curl` gerou automaticamente um token de acesso à proteção para a conferência; nenhum segredo foi incorporado ao site ou a este relatório.

## Entregue

- Identidade Matéria aplicada às páginas públicas: cores oficiais, Newsreader e Inter locais, composição editorial, materiais fotográficos reais e acabamento sóbrio.
- Nova home com mesa de trabalho interativa, seleção de casos, pessoas e ecossistema.
- Navegação responsiva por teclado e toque, filtros de acervo, galeria ampliada, transições progressivas e respeito à preferência por movimento reduzido.
- Sobre, serviços, projetos, artigos, vagas, contato e confirmação integrados ao sistema visual.
- Acervo atualizado a partir dos dados públicos: 23 projetos, 27 artigos e 10 registros de vagas. Publicação/visibilidade respeitam os estados dos registros. Cores dos trabalhos dos clientes preservadas.
- Contato para solicitar conversa, sem prometer agendamento automático. Campos reais existentes: nome, e-mail e telefone. Confirmação no próprio site após sucesso do provedor.
- Compatibilidade com o painel: projeção versionada do conteúdo antigo, preservação do conteúdo anterior e persistência da migração no próximo salvamento normal. Nenhuma alteração remota de conteúdo foi feita por esta entrega.
- HTML dos acervos e detalhes renderizado no build, fontes WOFF2 locais e JavaScript progressivo. Scripts visuais antigos não são mais carregados nas páginas públicas.

## Evidências

- Build local e build remoto Vercel concluídos; o remoto sincronizou os dados do Blob e gerou 27 artigos e 23 projetos.
- `npm test`: quatro testes aprovados, cobrindo migração do conteúdo, acervo, detalhes, links internos e recursos locais.
- `git diff --check`: aprovado.
- Chrome automatizado: dez rotas em 390 e 1440px, sem overflow ou imagens quebradas; menu, teclado, mesa, busca, galeria, formulário simulado, confirmação, movimento reduzido e conteúdo sem JavaScript aprovados.
- Verificações adicionais de layout em 360, 768 e 1280px. Falha de envio simulada preservou os campos e permitiu tentar novamente.
- Axe: nenhuma violação automática nas dez rotas avaliadas, com regras WCAG A/AA aplicáveis configuradas até WCAG 2.2. Isso não equivale a certificação integral de acessibilidade.
- Prévia publicada: HTML e recursos lidos pela CLI autenticada da Vercel; Chrome carregou a definição real do Forms diretamente do provedor, HTTP 200, três campos, fonte correta, sem overflow ou erros JavaScript. Nenhuma escrita no Forms ocorreu.
- CSS público compilado: aproximadamente 32,6KB (7,3KB gzip); módulo principal: 7,9KB (3,1KB gzip). Não são pontuações de desempenho nem métricas de campo.

Relatórios e capturas locais: `.impeccable/qa/materia/`. Scripts de reprodução: `scripts/audit-materia-browser.mjs`, `scripts/audit-materia-accessibility.mjs` e `scripts/audit-materia-preview.mjs`. Os dois primeiros dependem de Playwright/Chrome; o segundo também de axe-core; o último exige CLI Vercel autenticada. A auditoria de interação usa o snapshot do formulário em `/private/tmp/arcaffo-contact-definition.json` e intercepta os envios.

## Limites e publicação

O envio com sucesso foi simulado, não submetido à equipe. O carregamento real do provedor foi confirmado. Recebimento final pela equipe ainda requer um teste real identificado e autorizado. Não foram certificados Safari, Firefox, aparelhos físicos ou métricas de campo de desempenho.

Próxima etapa: revisão da prévia pelo responsável e autorização para promover ao domínio principal; depois, conferência das páginas e do contato no domínio e teste real acompanhado. Nenhuma promoção, commit ou push foi executado.

As alterações preexistentes foram preservadas. Cópia anterior à migração em `/private/tmp/arcaffo-materia-backup.VPlmNL/site-before.tar.gz`, sem `.git`, credenciais e dependências. É uma cópia temporária, não um backup durável. Para rollback de publicação futura, selecionar o deployment de produção anterior na Vercel; não restaurar arquivos indiscriminadamente sobre trabalhos posteriores.

O contrato visual e as instruções de manutenção estão em [DESIGN.md](DESIGN.md). As skills de design e movimento orientaram a hierarquia editorial, a aplicação dos tokens e as interações contidas, mantendo o sistema oficial como fonte da verdade.
