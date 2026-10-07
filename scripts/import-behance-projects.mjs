import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const auditPath = process.argv[2];
if (!auditPath) throw new Error('Uso: node scripts/import-behance-projects.mjs <auditoria.json>');

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'public/data/projetos.json');
const IMAGES_DIR = path.join(ROOT, 'public/images/projetos');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const CURATED = {
  250277779: {
    slug: 'colatto',
    title: 'COLATTO',
    tags: ['Estratégia', 'Identidade Visual', 'Typedesign'],
    team: 'Arthur Fava, Fabrício Rodrigues, Carlos Santana',
    contributors: ['Arthur Fava', 'Fabrício Rodrigues', 'Carlos Santana'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Coautoria', value: 'Arthur Fava, Fabrício Rodrigues, Carlos Santana e Arcaffo. Branding' },
    ],
    caseStudy: {
      question: 'Como construir uma marca para um escritório que entende arquitetura como ferramenta de bem-estar?',
      answer: 'A COLATTO atua em projetos de arquitetura e interiores, residenciais e comerciais, com foco no bem-estar, no desenvolvimento e na felicidade das pessoas. Estratégia, identidade e expressão tipográfica organizam esse posicionamento em uma presença minimalista orientada por excelência e funcionalidade.',
      decisions: [
        'Reunir arquitetura residencial, comercial e de interiores sob uma identidade única.',
        'Dar protagonismo ao logotipo e à tipografia no reconhecimento da marca.',
        'Usar uma linguagem minimalista coerente com excelência, funcionalidade e atenção aos detalhes.',
      ],
      perspective: 'O projeto evidencia como uma identidade de arquitetura pode comunicar a experiência que pretende criar: ambientes funcionais que também favorecem bem-estar e desenvolvimento.',
      metaDescription: 'Case COLATTO: estratégia, identidade visual e expressão tipográfica para um escritório de arquitetura e interiores focado em bem-estar e funcionalidade.',
    },
  },
  242872547: {
    slug: 'touro-morto',
    title: 'Touro Morto®',
    tags: ['Estratégia', 'Identidade Visual', 'Packaging', 'Motion'],
    team: 'Arthur Fava, Fabrício Rodrigues, Luiz Paulo Pacheco, Everton Gargioni, Leandro Ramos',
    contributors: ['Arthur Fava', 'Fabrício Rodrigues', 'Luiz Paulo Pacheco', 'Everton Gargioni', 'Leandro Ramos'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Estratégia', value: 'Arthur Fava, Fabrício Rodrigues e Luiz Paulo Pacheco' },
      { label: 'Identidade visual', value: 'Everton Gargioni' },
      { label: 'Design de embalagem e motion', value: 'Leandro Ramos' },
    ],
    caseStudy: {
      question: 'Como fazer uma cerveja acessível parecer forte e bem cuidada sem perder sua atitude raiz?',
      answer: 'A Touro Morto foi construída como uma cerveja simples, direta e acessível, com uma marca que exala força e tradição. Estratégia, identidade visual, embalagem e motion demonstram que design bem resolvido pode caber no bolso sem suavizar o sabor ou a personalidade do produto.',
      decisions: [
        'Posicionar a marca em torno de força, tradição, sabor e acessibilidade.',
        'Transformar a atitude raiz em identidade visual e embalagem cuidadas.',
        'Levar a mesma presença para peças estáticas e aplicações em movimento.',
      ],
      perspective: 'A proposta mostra que preço acessível e qualidade de design podem coexistir. A embalagem sustenta essa percepção no ponto de contato mais direto entre a cerveja e o consumidor.',
      metaDescription: 'Case Touro Morto: estratégia, identidade visual, embalagem e motion para uma cerveja acessível, direta e marcada por força e tradição.',
    },
  },
  234442867: {
    slug: 'saneflow',
    title: 'Saneflow®',
    tags: ['Posicionamento', 'Identidade Visual'],
    team: 'Arthur Fava, Fabrício Rodrigues, Luiz Paulo Pacheco, Leandro Ramos, Yasmin Rodrigues',
    contributors: ['Arthur Fava', 'Fabrício Rodrigues', 'Luiz Paulo Pacheco', 'Leandro Ramos', 'Yasmin Rodrigues'],
    organizations: ['Arcaffo. Branding', 'MILME® Studio'],
    credits: [
      { label: 'Posicionamento e estratégia', value: 'Arcaffo. Branding — Arthur Fava, Fabrício Rodrigues e Luiz Paulo Pacheco' },
      { label: 'Identidade visual', value: 'MILME® Studio — direção criativa de Leandro Ramos; design de Leandro Ramos e Yasmin Rodrigues' },
    ],
    caseStudy: {
      question: 'Como atualizar uma consultoria de saneamento para expressar conhecimento técnico sem parecer fria ou distante?',
      answer: 'A Saneflow oferece soluções estratégicas e personalizadas para operações de saneamento, com foco em controle de perdas de água, eficiência energética e uso eficiente de recursos. O novo posicionamento orientou uma identidade institucional, ética e clara, capaz de também ganhar vibração nos contextos digitais e de comunicação.',
      decisions: [
        'Alinhar a identidade visual ao novo posicionamento da consultoria.',
        'Equilibrar sobriedade institucional e clareza com uma presença digital mais vibrante.',
        'Comunicar excelência técnica, eficiência e resultados aplicáveis sem criar distanciamento.',
      ],
      perspective: 'Em serviços técnicos, a identidade precisa sustentar autoridade e tornar a especialização compreensível. A Saneflow combina rigor institucional com uma comunicação mais próxima e adaptável.',
      metaDescription: 'Case Saneflow: posicionamento pela Arcaffo e identidade visual pela MILME para uma consultoria especializada em eficiência e operações de saneamento.',
    },
  },
  232073823: {
    slug: 'centralle-osteria',
    title: 'Centralle Osteria',
    tags: ['Estratégia', 'Identidade Visual', 'Ilustração'],
    team: 'Arthur Fava, Fabrício Rodrigues, Luiz Paulo Pacheco, Leandro Ramos, Yasmin Rodrigues',
    contributors: ['Arthur Fava', 'Fabrício Rodrigues', 'Luiz Paulo Pacheco', 'Leandro Ramos', 'Yasmin Rodrigues'],
    organizations: ['Arcaffo. Branding', 'MILME® Studio'],
    credits: [
      { label: 'Estratégia', value: 'Arcaffo. Branding — Arthur Fava, Fabrício Rodrigues e Luiz Paulo Pacheco' },
      { label: 'Identidade visual', value: 'MILME® Studio — direção criativa de Leandro Ramos; design de Leandro Ramos e Yasmin Rodrigues' },
    ],
    caseStudy: {
      question: 'Como traduzir a primeira osteria de Campo Grande em uma marca ao mesmo tempo sofisticada, manual e memorável?',
      answer: 'A Centralle nasceu para celebrar a gastronomia italiana de forma autêntica, intensa e simples. A estratégia e a identidade combinam tradição e criatividade, o rústico e a elegância, com ilustrações e tipografias alinhadas a pratos preparados com cuidado e a um ambiente descrito como caoticamente planejado e intencional.',
      decisions: [
        'Equilibrar sofisticação e manualidade em toda a expressão da marca.',
        'Usar ilustrações e tipografias como parte da atmosfera da osteria.',
        'Construir uma identidade capaz de comunicar ingredientes, processos e memórias.',
      ],
      perspective: 'Em hospitalidade, a marca prepara a experiência antes do primeiro prato. O sistema da Centralle conecta cozinha, ambiente e narrativa em torno da memória que cada encontro pode deixar.',
      metaDescription: 'Case Centralle Osteria: estratégia pela Arcaffo e identidade pela MILME para a primeira osteria de Campo Grande, entre tradição e manualidade.',
    },
  },
  146638359: {
    slug: 'aldraba',
    title: 'Aldraba',
    tags: ['Estratégia', 'Identidade Visual'],
    team: 'Arthur Fava, Luiz Paulo Pacheco, Everton Gargioni',
    contributors: ['Arthur Fava', 'Luiz Paulo Pacheco', 'Everton Gargioni'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Branding', value: 'Arcaffo. Branding — Arthur Fava e Luiz Paulo Pacheco' },
      { label: 'Design', value: 'Everton Gargioni' },
      { label: 'Imagens', value: 'Unsplash' },
    ],
    descriptionPt: 'A Aldraba realiza projetos e construções com metodologia BIM. Os benefícios vão além da economia: maior qualidade das obras, melhores entregas e resultados, com menos imprevistos. A identidade visual foi orientada por minimalismo, inovação, qualificação técnica, autoridade, credibilidade e segurança. A marca atende construtoras, incorporadoras, clientes finais e profissionais de arquitetura e engenharia.',
    caseStudy: {
      question: 'Como comunicar os ganhos da metodologia BIM para públicos técnicos e clientes finais?',
      answer: 'A Aldraba realiza projetos e construções com metodologia BIM, buscando economia, qualidade, melhores entregas e menos imprevistos. O branding e a identidade visual foram orientados por minimalismo, inovação, autoridade, credibilidade e segurança.',
      decisions: [
        'Traduzir qualificação técnica e inovação em uma presença visual minimalista.',
        'Construir sinais de autoridade, credibilidade e segurança.',
        'Criar uma marca capaz de dialogar com construtoras, incorporadoras, clientes finais e profissionais do setor.',
      ],
      perspective: 'Quando um método técnico é parte central da proposta, a identidade precisa tornar seus benefícios perceptíveis sem depender de uma explicação longa em cada contato.',
      metaDescription: 'Case Aldraba: branding e identidade visual para uma empresa de projetos e construções com metodologia BIM, foco técnico e menos imprevistos.',
    },
  },
  94198635: {
    slug: 'claudia-comparin',
    title: 'Claudia Comparin',
    tags: ['Estratégia', 'Identidade Visual'],
    team: 'Arthur Fava, Luiz Paulo Pacheco, Everton Gargioni',
    contributors: ['Arthur Fava', 'Luiz Paulo Pacheco', 'Everton Gargioni'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Coautoria', value: 'Arthur Fava, Luiz Paulo Pacheco, Everton Gargioni e Arcaffo. Branding' },
    ],
    descriptionPt: 'Arquitetura, interiores e alma. O escritório acredita que a vida vem de dentro, da alma. Seu trabalho se concentra nas pessoas, em seus sonhos e rotinas, para transformar ambientes simples em mais do que casas: lares.',
    caseStudy: {
      question: 'Como expressar uma arquitetura orientada por pessoas, sonhos e rotinas?',
      answer: 'A marca Claudia Comparin parte da ideia de arquitetura, interiores e alma. A identidade organiza uma atuação centrada nas pessoas e na transformação de ambientes em lares, conectando espaço, rotina e significado.',
      decisions: [
        'Colocar pessoas, sonhos e rotinas no centro da narrativa da marca.',
        'Expressar a passagem de casa para lar como dimensão emocional do trabalho.',
        'Construir uma identidade visual compatível com arquitetura e interiores.',
      ],
      perspective: 'O projeto evidencia uma distinção importante para marcas de arquitetura: comunicar não apenas os espaços produzidos, mas a vida que esses espaços devem acolher.',
      metaDescription: 'Case Claudia Comparin: estratégia e identidade visual para um escritório de arquitetura e interiores centrado em pessoas, sonhos, rotinas e lares.',
    },
  },
  92185511: {
    slug: 'arcaffo',
    title: 'Arcaffo.',
    tags: ['Estratégia', 'Identidade Visual'],
    team: 'Arthur Fava, Luiz Paulo Pacheco',
    contributors: ['Arthur Fava', 'Luiz Paulo Pacheco'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Coautoria', value: 'Arthur Fava, Luiz Paulo Pacheco e Arcaffo. Branding' },
    ],
    descriptionPt: 'Projeto de construção da marca do próprio estúdio de branding Arcaffo, reunindo branding, design gráfico e identidade visual.',
    caseStudy: {
      question: 'Como dar forma à marca do próprio estúdio de branding?',
      answer: 'O projeto Arcaffo reúne branding, design gráfico e identidade visual na construção da marca do próprio estúdio. O sistema apresenta a linguagem que passou a identificar a empresa e suas aplicações.',
      decisions: [
        'Construir uma identidade para representar o próprio estúdio de branding.',
        'Integrar estratégia de marca, design gráfico e identidade visual.',
        'Demonstrar a linguagem por meio de aplicações consistentes.',
      ],
      perspective: 'Projetar a própria marca exige transformar método e visão em sinais reconhecíveis. Este case registra uma etapa da identidade construída para a Arcaffo.',
      metaDescription: 'Case Arcaffo: construção da marca e da identidade visual do próprio estúdio de branding, reunindo estratégia e design gráfico.',
    },
  },
  195270395: {
    slug: 'claudia-comparin-papelaria',
    title: 'Cláudia Comparin — Papelaria',
    tags: ['Identidade Visual', 'Papelaria', 'Acabamento Gráfico'],
    team: 'Arcaffo. Branding, Alma Design & Letterpress',
    contributors: [],
    organizations: ['Arcaffo. Branding', 'Alma Design & Letterpress'],
    credits: [
      { label: 'Coautoria', value: 'Arcaffo. Branding e Alma Design & Letterpress' },
    ],
    descriptionPt: 'A papelaria de Cláudia Comparin Architects combina a beleza da impressão em letterpress com o brilho do hot stamping sobre papéis terracota e off-white.',
    caseStudy: {
      question: 'Como levar a identidade de um escritório de arquitetura para uma papelaria de presença tátil e refinada?',
      answer: 'A papelaria de Cláudia Comparin Architects combina impressão em letterpress e hot stamping sobre papéis terracota e off-white. O projeto transforma cor, textura, relevo e brilho em elementos materiais da experiência da marca.',
      decisions: [
        'Combinar letterpress e hot stamping na produção das peças.',
        'Trabalhar com papéis terracota e off-white como base do conjunto.',
        'Preservar a identidade do escritório na passagem do sistema visual para os materiais impressos.',
      ],
      perspective: 'A papelaria evidencia como acabamento e suporte podem ampliar uma identidade visual: o reconhecimento deixa de ser apenas visto e passa também pela textura e pelo contato com o material.',
      metaDescription: 'Case Cláudia Comparin: papelaria com letterpress, hot stamping e papéis terracota e off-white, criada pela Arcaffo com a Alma Design & Letterpress.',
    },
  },
  109333171: {
    slug: 'nadyelle-farias-arquiteta',
    title: 'Nadyelle Farias — Arquiteta',
    tags: ['Identidade Visual'],
    team: 'Ingrid Lima, Gringo Studio, Arcaffo. Branding',
    contributors: ['Ingrid Lima'],
    organizations: ['Arcaffo. Branding', 'Gringo Studio'],
    credits: [
      { label: 'Coautoria', value: 'Ingrid Lima — Gringo Studio e Arcaffo. Branding' },
    ],
    descriptionPt: 'Projeto de identidade visual para Nadyelle Farias, arquiteta, apresentado por meio de aplicações que demonstram o funcionamento do sistema de marca.',
    caseStudy: {
      question: 'Como construir uma presença visual própria para uma profissional de arquitetura?',
      answer: 'O projeto desenvolve a identidade visual de Nadyelle Farias e apresenta o sistema em diferentes aplicações. A marca organiza uma assinatura profissional reconhecível para sua atuação como arquiteta.',
      decisions: [
        'Criar uma identidade vinculada diretamente ao nome da arquiteta.',
        'Demonstrar o sistema visual em aplicações profissionais.',
        'Manter unidade entre assinatura, composição e materiais da marca.',
      ],
      perspective: 'Em marcas profissionais, a identidade precisa tornar o nome reconhecível e sustentar consistência nos pontos de contato em que a atuação é apresentada.',
      metaDescription: 'Case Nadyelle Farias: identidade visual e aplicações de marca para uma profissional de arquitetura, em coautoria com Gringo Studio e Arcaffo.',
    },
  },
  100127475: {
    slug: 'lucas-grisoste',
    title: 'Lucas Grisoste',
    tags: ['Estratégia', 'Identidade Visual'],
    team: 'Everton Gargioni, Arcaffo. Branding',
    contributors: ['Everton Gargioni'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Coautoria', value: 'Everton Gargioni e Arcaffo. Branding' },
    ],
    descriptionPt: 'Lucas Grisoste é cirurgião-dentista e coloca-se no lugar das outras pessoas, cuidando dos resultados e da experiência de seus pacientes. Para entregar os melhores e mais bonitos sorrisos, busca bons fornecedores, materiais, parceiros e profissionais.',
    caseStudy: {
      question: 'Como traduzir cuidado, qualidade e experiência em uma marca profissional de odontologia?',
      answer: 'A marca de Lucas Grisoste parte de uma prática atenta aos resultados e à experiência dos pacientes. A identidade organiza uma proposta profissional que valoriza bons materiais, fornecedores, parceiros e especialistas para entregar sorrisos bem cuidados.',
      decisions: [
        'Colocar o cuidado com a experiência do paciente no centro da narrativa.',
        'Associar a marca à busca por materiais, fornecedores e profissionais de qualidade.',
        'Construir uma identidade visual adequada à atuação de um cirurgião-dentista.',
      ],
      perspective: 'Em serviços de saúde, a marca precisa apoiar confiança antes do atendimento. Qualidade técnica e atenção à experiência tornam-se partes inseparáveis da percepção profissional.',
      metaDescription: 'Case Lucas Grisoste: estratégia e identidade visual para um cirurgião-dentista orientado por cuidado, qualidade e experiência do paciente.',
    },
  },
  98886649: {
    slug: 'dra-yana',
    title: 'Dra. Yana',
    tags: ['Estratégia', 'Identidade Visual'],
    team: 'Renato AB, Arcaffo. Branding',
    contributors: ['Renato AB'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Coautoria', value: 'Renato AB e Arcaffo. Branding' },
    ],
    descriptionPt: 'Projeto de branding e identidade visual para a dermatologista Dra. Yana Almeidinha.',
    caseStudy: {
      question: 'Como construir uma identidade profissional para uma médica dermatologista?',
      answer: 'O projeto organiza branding e identidade visual para a Dra. Yana Almeidinha. A apresentação demonstra a marca e suas aplicações no contexto de uma atuação profissional em dermatologia.',
      decisions: [
        'Construir a marca a partir do nome profissional da dermatologista.',
        'Criar um sistema de identidade aplicável à comunicação da prática médica.',
        'Apresentar a marca de forma consistente em diferentes materiais.',
      ],
      perspective: 'Uma identidade para saúde precisa tornar a atuação reconhecível e coerente sem substituir a informação clínica ou a relação de confiança construída no atendimento.',
      metaDescription: 'Case Dra. Yana: projeto de branding e identidade visual para a dermatologista Yana Almeidinha, desenvolvido com participação da Arcaffo.',
    },
  },
  83322921: {
    slug: 'priscila-pieczykolan-arquitetura',
    title: 'Priscila Pieczykolan Arquitetura',
    tags: ['Identidade Visual'],
    team: 'Luiz Paulo Pacheco, Arcaffo. Branding',
    contributors: ['Luiz Paulo Pacheco'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Coautoria', value: 'Luiz Paulo Pacheco e Arcaffo. Branding' },
    ],
    descriptionPt: 'Projeto de identidade visual para a arquiteta Priscila Pieczykolan.',
    caseStudy: {
      question: 'Como transformar o nome de uma arquiteta em um sistema visual reconhecível?',
      answer: 'O projeto desenvolve a identidade visual de Priscila Pieczykolan e apresenta sua aplicação em materiais profissionais. A marca funciona como assinatura para a atuação da arquiteta.',
      decisions: [
        'Usar o nome profissional como núcleo da identidade.',
        'Criar uma assinatura visual aplicável aos materiais do escritório.',
        'Demonstrar consistência entre marca e aplicações.',
      ],
      perspective: 'Para profissionais de arquitetura, a identidade atua como uma assinatura contínua: acompanha projetos, apresentações e contatos sem competir com o próprio trabalho arquitetônico.',
      metaDescription: 'Case Priscila Pieczykolan Arquitetura: identidade visual e aplicações de marca para uma profissional de arquitetura, desenvolvidas pela Arcaffo.',
    },
  },
  61888515: {
    slug: 'lara-cerantola',
    title: 'Lara Cerantola',
    tags: ['Identidade Visual'],
    team: 'Everton Gargioni, Arcaffo. Branding',
    contributors: ['Everton Gargioni'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Coautoria', value: 'Everton Gargioni e Arcaffo. Branding' },
    ],
    descriptionPt: 'Sistema de identidade de marca desenvolvido para Lara Cerantola.',
    caseStudy: {
      question: 'Como organizar uma assinatura profissional em um sistema completo de identidade?',
      answer: 'O projeto apresenta o sistema de identidade de marca de Lara Cerantola, com logotipo, monograma e aplicações ligadas ao universo da arquitetura e da comunicação profissional.',
      decisions: [
        'Estruturar a identidade a partir do nome profissional.',
        'Articular logotipo e monograma dentro do mesmo sistema.',
        'Aplicar a marca em materiais de contato e apresentação.',
      ],
      perspective: 'Um sistema de identidade amplia a utilidade do logotipo ao criar relações consistentes entre assinatura, monograma, composição e aplicações cotidianas.',
      metaDescription: 'Case Lara Cerantola: sistema de identidade de marca, logotipo, monograma e aplicações profissionais desenvolvido com participação da Arcaffo.',
    },
  },
  66464191: {
    slug: 'construtora-riwal',
    title: 'Construtora RiWal',
    tags: ['Estratégia', 'Identidade Visual'],
    team: 'Luiz Paulo Pacheco, Arcaffo. Branding',
    contributors: ['Luiz Paulo Pacheco'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Coautoria', value: 'Luiz Paulo Pacheco e Arcaffo. Branding' },
    ],
    descriptionPt: 'Criação de uma nova marca e identidade visual para a Construtora RiWal, de Maracaju, Mato Grosso do Sul.',
    caseStudy: {
      question: 'Como criar uma nova presença de marca para uma construtora de Maracaju?',
      answer: 'O projeto desenvolve uma nova marca e identidade visual para a Construtora RiWal. O sistema apresenta a empresa por meio de uma assinatura e aplicações coerentes com sua atuação em construção.',
      decisions: [
        'Criar uma nova marca para identificar a construtora.',
        'Desenvolver um sistema visual aplicável à comunicação da empresa.',
        'Relacionar a identidade ao contexto de arquitetura e construção.',
      ],
      perspective: 'Em construção, a identidade ajuda a tornar a empresa reconhecível em materiais institucionais e nos diferentes pontos de contato associados aos empreendimentos.',
      metaDescription: 'Case Construtora RiWal: criação de marca e identidade visual para uma empresa de construção de Maracaju, Mato Grosso do Sul.',
    },
  },
  66044601: {
    slug: 'arqdeco',
    title: 'ArqDecô',
    tags: ['Estratégia', 'Identidade Visual', 'Papelaria'],
    team: 'Luiz Paulo Pacheco, Arcaffo. Branding',
    contributors: ['Luiz Paulo Pacheco'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Coautoria', value: 'Luiz Paulo Pacheco e Arcaffo. Branding' },
    ],
    descriptionPt: 'Idealizado por Elayne Felix, o Studio ArqDecô reúne arquitetura e design de interiores em um trabalho multidisciplinar. A equipe interpreta o desejo de cada cliente para transformar espaços em ambientes personalizados, combinando design de qualidade, comprometimento, seriedade e respeito. A identidade foi construída para comunicar clareza, dinamismo, inovação e organização.',
    caseStudy: {
      question: 'Como representar um estúdio multidisciplinar de arquitetura e interiores com clareza e dinamismo?',
      answer: 'A ArqDecô reúne arquitetura e design de interiores para transformar desejos em ambientes personalizados. A marca foi construída para comunicar organização, multidisciplinaridade, clareza e transparência, com uma estrutura dinâmica entre “Arq” e “Decô”, letras finas e geométricas e uma personalidade minimalista.',
      decisions: [
        'Usar a estrutura entre “Arq” e “Decô” para permitir composições verticais e flexíveis.',
        'Adotar letras finas e geométricas para expressar profissionalismo, inovação e atualidade.',
        'Estender o sistema para identidade visual e papelaria do estúdio.',
      ],
      perspective: 'A solução demonstra como a estrutura do próprio nome pode gerar flexibilidade visual e explicar uma atuação que integra diferentes disciplinas sem perder clareza.',
      metaDescription: 'Case ArqDecô: estratégia, identidade visual e papelaria para um estúdio multidisciplinar de arquitetura e design de interiores em Campo Grande.',
    },
  },
  48081431: {
    slug: 'it-decor',
    title: 'It Decor',
    tags: ['Redesign', 'Identidade Visual'],
    team: 'Luiz Paulo Pacheco, Arcaffo. Branding',
    contributors: ['Luiz Paulo Pacheco'],
    organizations: ['Arcaffo. Branding'],
    credits: [
      { label: 'Coautoria', value: 'Luiz Paulo Pacheco e Arcaffo. Branding' },
    ],
    descriptionPt: 'Redesign de marca realizado para a It Decor, empresa que trabalha para se tornar referência em decoração de interiores.',
    caseStudy: {
      question: 'Como atualizar a marca de uma empresa que busca ser referência em decoração de interiores?',
      answer: 'O projeto redesenha a marca da It Decor e organiza uma identidade visual ligada ao universo da decoração e do design de interiores. A apresentação demonstra a nova assinatura em diferentes aplicações.',
      decisions: [
        'Redesenhar a marca para acompanhar a ambição de referência no segmento.',
        'Relacionar identidade, tipografia e aplicações ao universo de interiores.',
        'Criar consistência entre a assinatura e os materiais de comunicação.',
      ],
      perspective: 'Redesigns ganham sentido quando atualizam a percepção da empresa e aumentam a consistência dos pontos de contato sem apagar o reconhecimento já construído.',
      metaDescription: 'Case It Decor: redesign e identidade visual para uma empresa que busca se tornar referência em decoração e design de interiores.',
    },
  },
};

const SEGMENT_BY_SLUG = {
  colatto: 'Arquitetura e Interiores',
  'touro-morto': 'Alimentos e Bebidas',
  saneflow: 'Construção e Engenharia',
  'centralle-osteria': 'Alimentos e Bebidas',
  aldraba: 'Construção e Engenharia',
  'claudia-comparin': 'Arquitetura e Interiores',
  arcaffo: 'Serviços Profissionais',
  'claudia-comparin-papelaria': 'Arquitetura e Interiores',
  'nadyelle-farias-arquiteta': 'Arquitetura e Interiores',
  'lucas-grisoste': 'Saúde e Bem-estar',
  'dra-yana': 'Saúde e Bem-estar',
  'priscila-pieczykolan-arquitetura': 'Arquitetura e Interiores',
  'lara-cerantola': 'Arquitetura e Interiores',
  'construtora-riwal': 'Construção e Engenharia',
  arqdeco: 'Arquitetura e Interiores',
  'it-decor': 'Arquitetura e Interiores',
};

function deterministicId(number) {
  const hex = createHash('sha256').update(`arcaffo-behance-${number}`).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`;
}

function bestRendition(imageSizes = {}) {
  const all = imageSizes.allAvailable || [];
  const usable = all.filter((item) => item.url && !item.url.includes('_still/') && !item.url.includes('_opt_'));
  const webp = usable.filter((item) => item.type === 'WEBP' || item.url.includes('_webp/'));
  const candidates = webp.length ? webp : usable;
  const bounded = candidates.filter((item) => !item.width || item.width <= 1920);
  return [...(bounded.length ? bounded : candidates)].sort((a, b) => (b.width || 0) - (a.width || 0))[0]
    || imageSizes.size_disp
    || null;
}

function embedFrom(module) {
  const html = module.originalEmbed || module.embed || '';
  const match = html.match(/<iframe[^>]+src="([^"]+)"/i);
  if (!match) return null;
  const url = match[1].replaceAll('&amp;', '&');
  const hostname = new URL(url).hostname;
  if (!['player.vimeo.com', 'www-ccv.adobe.io'].includes(hostname)) return null;
  return {
    type: 'embed',
    url,
    width: Number(module.originalWidth || module.width) || 16,
    height: Number(module.originalHeight || module.height) || 9,
  };
}

async function downloadImage(remote, basename, alt) {
  const response = await fetch(remote.url, {
    headers: { 'user-agent': USER_AGENT, referer: 'https://www.behance.net/' },
  });
  if (!response.ok) throw new Error(`Falha ${response.status} ao baixar ${remote.url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(buffer, { animated: true, limitInputPixels: false }).metadata();
  const extension = ({ jpeg: 'jpg', png: 'png', gif: 'gif', webp: 'webp' })[metadata.format] || 'webp';
  const filename = `${basename}.${extension}`;
  await writeFile(path.join(IMAGES_DIR, filename), buffer);
  return {
    type: 'image',
    url: `/images/projetos/${filename}`,
    width: metadata.width || remote.width,
    height: metadata.pageHeight || metadata.height || remote.height,
    alt,
  };
}

async function importMedia(project, slug) {
  let sequence = 0;
  const media = [];

  for (const module of project.modules || []) {
    if (module.__typename === 'ImageModule') {
      const remote = bestRendition(module.imageSizes);
      if (!remote) continue;
      sequence += 1;
      media.push(await downloadImage(remote, `behance-${project.id}-${String(sequence).padStart(2, '0')}`, `${project.name} — aplicação ${sequence}`));
    } else if (module.__typename === 'MediaCollectionModule') {
      const items = [];
      for (const component of module.components || []) {
        const remote = bestRendition(component.imageSizes);
        if (!remote) continue;
        sequence += 1;
        items.push(await downloadImage(remote, `behance-${project.id}-${String(sequence).padStart(2, '0')}`, `${project.name} — aplicação ${sequence}`));
      }
      if (items.length) media.push({ type: 'collection', items });
    } else if (['EmbedModule', 'VideoModule'].includes(module.__typename)) {
      const embed = embedFrom(module);
      if (embed) media.push({ ...embed, title: `${project.name} — peça em movimento` });
    }
  }

  if (!media.some((item) => item.type === 'image' || item.type === 'collection')) {
    throw new Error(`Nenhuma imagem encontrada para ${slug}`);
  }
  return media;
}

await mkdir(IMAGES_DIR, { recursive: true });
const audit = JSON.parse(await readFile(auditPath, 'utf8'));
const existing = JSON.parse(await readFile(DATA_PATH, 'utf8'));
const imported = [];

for (const result of audit.results) {
  const curated = CURATED[result.id];
  if (!curated) continue;

  const source = result.project?.project;
  if (!source) throw new Error(`Dados estruturados ausentes para ${result.id}`);
  const generatedPrefix = `behance-${source.id}-`;
  const previousFiles = (await readdir(IMAGES_DIR)).filter((name) => name.startsWith(generatedPrefix));
  await Promise.all(previousFiles.map((name) => unlink(path.join(IMAGES_DIR, name))));
  const media = await importMedia(source, curated.slug);
  const coverRemote = source.covers?.size_original_webp || source.covers?.allAvailable?.[0];
  const cover = await downloadImage(coverRemote, `behance-${source.id}-cover`, `${curated.title} — capa do projeto`);
  const createdAt = new Date(source.publishedOn * 1000).toISOString();

  imported.push({
    id: deterministicId(source.id),
    behanceId: source.id,
    title: curated.title,
    slug: curated.slug,
    segment: SEGMENT_BY_SLUG[curated.slug],
    description: curated.descriptionPt || source.description.trim(),
    cover: cover.url,
    coverWidth: cover.width,
    coverHeight: cover.height,
    tags: curated.tags,
    sourceTags: source.tags.map((tag) => tag.title.trim()).filter(Boolean),
    team: curated.team,
    contributors: curated.contributors,
    organizations: curated.organizations,
    credits: curated.credits,
    sourceUrl: source.url,
    caseStudy: curated.caseStudy,
    images: media.flatMap((item) => item.type === 'image' ? [item] : item.type === 'collection' ? item.items : []),
    media,
    status: 'published',
    createdAt,
    updatedAt: createdAt,
  });
  console.log(`Importado: ${curated.title} (${media.length} módulos)`);
}

const importedSlugs = new Set(imported.map((project) => project.slug));
const importedBehanceIds = new Set(imported.map((project) => project.behanceId));
const untouched = existing.filter((project) => !importedSlugs.has(project.slug) && !importedBehanceIds.has(project.behanceId));
const recentIds = new Set([250277779, 242872547, 234442867, 232073823]);
const recent = imported.filter((project) => recentIds.has(project.behanceId));
const archive = imported.filter((project) => !recentIds.has(project.behanceId));

await writeFile(DATA_PATH, `${JSON.stringify([...recent, ...untouched, ...archive], null, 2)}\n`);
console.log(`Concluído: ${imported.length} projetos e ${imported.reduce((sum, project) => sum + project.images.length, 0)} imagens.`);
