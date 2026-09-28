export const PEOPLE = [
  {
    slug: 'arthur-fava',
    name: 'Arthur Fava',
    role: 'Sócio e Diretor Comercial',
    image: '/images/materia/arthur-960.webp',
    bio: 'Arthur Fava integra a sociedade da Arcaffo e atua na direção comercial. Sua participação na empresa começou em 2016, quando a Arcaffo se estruturou como agência de marketing voltada ao segmento da arquitetura. Hoje, participa da construção de posicionamentos, diagnósticos e decisões que conectam marca, comunicação e desenvolvimento de negócios.',
    focus: ['Estratégia comercial', 'Posicionamento de marca', 'Diagnóstico empresarial'],
  },
  {
    slug: 'luiz-paulo-pacheco',
    name: 'Luiz Paulo Pacheco',
    role: 'Sócio e Diretor de Projetos',
    image: '/images/materia/luiz-960.webp',
    bio: 'Luiz Paulo Pacheco integra a sociedade da Arcaffo desde 2019, período em que a empresa redirecionou sua atuação de forma especializada para o branding. Como Diretor de Projetos, participa da construção e do acompanhamento de projetos de posicionamento, identidade visual e expressão de marca.',
    focus: ['Direção de projetos', 'Identidade visual', 'Expressão de marca'],
  },
  {
    slug: 'fabricio-rodrigues',
    name: 'Fabrício O. Rodrigues',
    role: 'Sócio e Diretor Operacional',
    image: '/images/materia/fabricio-960.webp',
    bio: 'Fabrício O. Rodrigues integra a sociedade da Arcaffo desde 2024. Como Diretor Operacional, participa da organização da capacidade de entrega e da evolução dos projetos, conectando direção, processos e execução.',
    focus: ['Direção operacional', 'Processos de entrega', 'Implementação de projetos'],
  },
];

export const PEOPLE_BY_NAME = Object.fromEntries(PEOPLE.map(person => [person.name, person]));
