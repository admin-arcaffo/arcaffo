// Optional namespaces: old CMS documents continue to render without a migration.
export const CHAPTERS = ['2016', '2019', '2021', '2024', '2025'];
export const EDITORIAL_DEFAULTS = {
  about: {
    title: 'O que construímos começa em quem somos.',
    introduction: 'Somos um grupo de pessoas dedicado à construção de marcas e negócios. Desde 2016, aprofundamos nossa maneira de compreender, orientar e acompanhar empresários.',
    year_2016_title: 'O começo de uma direção.',
    year_2016_body: 'Com a entrada de Arthur Fava, a Arcaffo se estrutura como agência de marketing voltada ao segmento da arquitetura.',
    year_2019_title: 'A marca no centro.',
    year_2019_body: 'Luiz Paulo passa a integrar a sociedade. O olhar da empresa se volta de forma especializada ao branding.',
    year_2021_title: 'Um modo próprio de trabalhar.',
    year_2021_body: 'A metodologia da Arcaffo se consolida, ganhando estrutura e identidade própria.',
    year_2024_title: 'Mais pessoas. Mais capacidade.',
    year_2024_body: 'Fabrício O. Rodrigues ingressa na sociedade. A empresa amplia sua capacidade de entrega e seu ritmo de crescimento.',
    year_2025_title: 'O pensamento se expande.',
    year_2025_body: 'As imersões da Escola de Negócios e o Clube Ordo Legatum ampliam o ecossistema Arcaffo. Formação, assessoria e relacionamento passam a se encontrar.',
    ...Object.fromEntries(CHAPTERS.flatMap(year => [[`year_${year}_image`, ''], [`year_${year}_caption`, '']])),
  },
  services: {
    title: 'Uma direção. Diferentes formas de construir.',
    introduction: 'Assessoria estratégica, formação empresarial e relacionamento. Conheça como cada frente da Arcaffo participa do desenvolvimento da sua empresa.',
    bible_body: 'Identidade e posicionamento dão direção à marca. A Bíblia da Marca reúne o entendimento que orienta as decisões do negócio.',
    behavior_body: 'A direção se torna cultura quando aparece na maneira de liderar, decidir e trabalhar com as pessoas.',
    image_body: 'A imagem expressa o que a marca é. Design e comunicação aproximam sua identidade da percepção do público.',
    advisor_identity: 'Identidade e posicionamento para aproximar a essência da empresa de sua presença no mercado.',
    advisor_business: 'Modelo de negócio e vendas para dar estrutura às decisões de crescimento.',
    advisor_marketing: 'Gestão de marketing para conectar posicionamento, comunicação e execução.',
    advisor_culture: 'Intervenção de cultura para aproximar valores, liderança e comportamento.',
    school_immersion: 'Imersões presenciais para aprofundar branding, gestão estratégica e vendas.',
    school_company: 'Treinamento in company para desenvolver líderes e equipes no contexto da empresa.',
    school_workshop: 'Workshops e palestras para explorar temas como arquétipos de marca, branding e gestão.',
  },
  seo: {
    home_title: 'Arcaffo GROUP | Branding e estratégia empresarial em Campo Grande',
    home_description: 'Branding, assessoria estratégica e formação empresarial. Conheça os projetos, a história e as frentes da Arcaffo GROUP, em Campo Grande, MS.',
    social_image: '/images/materia/social-home.jpg',
  },
};
export function editorialContent(value = {}) {
  return Object.fromEntries(Object.entries(EDITORIAL_DEFAULTS).map(([ns, defaults]) => [ns, { ...defaults, ...value[ns] }]));
}
