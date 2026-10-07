// Cases de identidade visual que pertencem ao brand studio MILME (migrados em 07/10/2026).
// A página canônica de cada um vive em MILME_ORIGIN; o arcaffo.com redireciona (301) e linka para lá.
// Para trocar o domínio da MILME (ex.: milme.com.br), altere só MILME_ORIGIN e regenere os redirects.
export const MILME_ORIGIN = 'https://milme.arcaffo.com';
export const MILME_SLUGS = new Set([
  "colatto",
  "touro-morto",
  "saneflow",
  "centralle-osteria",
  "indreco",
  "iclay",
  "beco",
  "calixto-sandes-e-zabaleta",
  "kassar",
  "liana-godoy",
  "instituto-construindo-um-artista",
  "casa-santa-thereza",
  "archdesign",
  "cia-do-vidro",
  "futura",
  "sweet",
  "profive",
  "la-parisienne",
  "rafael-a-obra",
  "trigou",
  "torque-solucoes-automotivas",
  "sacralita",
  "arkete",
  "ana-santarelli",
  "on-joias",
  "tassia-brito",
  "cake67",
  "aldraba",
  "claudia-comparin",
  "arcaffo",
  "claudia-comparin-papelaria",
  "lucas-grisoste",
  "dra-yana",
  "priscila-pieczykolan-arquitetura",
  "lara-cerantola",
  "construtora-riwal",
  "arqdeco",
  "it-decor"
]);
export const isMilmeProject = slug => MILME_SLUGS.has(String(slug));
export const milmeProjectUrl = slug => `${MILME_ORIGIN}/projetos/${slug}/`;
export const projectHref = slug => (isMilmeProject(slug) ? milmeProjectUrl(slug) : `/projetos/${slug}.html`);
export const MILME_SERVICE_URL = `${MILME_ORIGIN}/identidade-visual/`;
