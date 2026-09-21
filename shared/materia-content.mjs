// A versioned projection keeps legacy Blob content from restoring v1 copy.
// GET/build are read-only; the next ordinary CMS save persists this migration.
export const MATERIA_DEFAULTS = {
  home: {
    hero_title_lead: 'Marcas com essência.', hero_title_accent: 'Negócios com direção.',
    hero_subtitle: 'Acompanhamos empresários na construção de marcas, no desenvolvimento de pessoas e na estruturação de negócios. Com profundidade, critério e proximidade.',
    hero_cta_primary_label: 'Conheça como trabalhamos', hero_cta_primary_href: '#mesa-de-trabalho',
    hero_cta_secondary_label: 'Solicitar uma conversa', hero_cta_secondary_href: '/contato.html',
    philosophy_title_lead: 'Tudo começa ', philosophy_title_accent: 'pelo outro.',
    ecosystem_title_lead: 'Um propósito. ', ecosystem_title_accent: 'Diferentes caminhos.',
    projects_title: 'O pensamento ganha forma.', problem_solution_title: 'O que você traz à mesa?',
    mesa_subtitle: 'Cada empresa chega com uma história. Escolha uma questão e conheça um pouco do nosso olhar.',
  },
  global: {
    footer_tagline: 'Formamos empresários, estruturamos negócios e elevamos a cultura.',
    prefooter_title_lead: 'Vamos olhar para ', prefooter_title_accent: 'o seu próximo capítulo.',
    prefooter_body: 'Deixe seus dados para que possamos conhecer sua empresa e o momento que você está vivendo. Nossa equipe entra em contato para combinar uma conversa.',
    prefooter_cta_label: 'Solicitar uma conversa', prefooter_cta_href: '/contato.html',
  },
};
export function migrateMateriaContent(value) {
  const source = value && !Array.isArray(value) ? value : {};
  if (source.designVersion === 2) return {
    ...source,
    home: { ...MATERIA_DEFAULTS.home, ...source.home },
    global: { ...MATERIA_DEFAULTS.global, ...source.global },
  };
  return {
    ...source, designVersion: 2,
    legacyMateriaBackup: source.legacyMateriaBackup || { home: source.home || {}, global: source.global || {} },
    home: { ...source.home, ...MATERIA_DEFAULTS.home },
    global: { ...source.global, ...MATERIA_DEFAULTS.global },
  };
}
