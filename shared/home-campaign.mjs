// Oferta da campanha de pesquisa (Google Ads SET-26). A porta de entrada é o
// formulário de contato, não o WhatsApp: o formulário registra a empresa e o
// momento do lead antes de a equipe responder.
const WHATSAPP_MESSAGE = [
  'Olá! Quero o Diagnóstico gratuito de Marca e Posicionamento.',
  'Empresa: ',
  'Segmento: ',
  'Tempo de mercado: ',
  'Já tem agência ou equipe de marketing? ',
].join('\n');

export const HOME_CAMPAIGN = Object.freeze({
  enabled: true,
  eyebrow: 'Agência de branding em Campo Grande',
  titleLead: 'Chega de trocar de agência de Marketing',
  titleAccent: 'a cada 6 meses.',
  title: 'Chega de trocar de agência de Marketing a cada 6 meses.',
  subtitle: 'Há 10 anos em Campo Grande, acompanhamos empresários na construção de marcas com essência e negócios com direção. Sem recomeçar do zero a cada troca.',
  diagnosticTitle: 'Diagnóstico gratuito de Marca e Posicionamento.',
  diagnosticBody: 'Uma conversa de 40 minutos com um estrategista da Arcaffo sobre como sua marca, seu posicionamento e sua comunicação estão hoje. Depois, você recebe por escrito uma leitura de uma página: o que está travando o crescimento e os três próximos passos. Sem compromisso e sem proposta comercial nessa primeira conversa.',
  diagnosticForLabel: 'Para quem é.',
  diagnosticFor: 'Empresas de Mato Grosso do Sul com mais de dois anos de operação, equipe própria e que já investem em marketing — com ou sem agência — sem ver o retorno que esperavam.',
  diagnosticNotForLabel: 'Para quem não é.',
  diagnosticNotFor: 'Quem precisa apenas de um logotipo, está abrindo a empresa agora ou trabalha sozinho. Nesses casos, um começo melhor é a',
  diagnosticNotForLinkLabel: 'Escola de Negócios e Marcas',
  diagnosticNotForLinkUrl: 'https://enm.arcaffo.com',
  diagnosticNote: 'A agenda é limitada a poucos diagnósticos por semana, para que cada conversa receba o tempo que merece.',
  diagnosticItems: [
    'Leitura de marca e posicionamento',
    'Diagnóstico da comunicação atual',
    'Três próximos passos, por escrito',
  ],
  proof: '10 anos em Campo Grande · +400 marcas · NPS 97',
  ctaFull: 'Quero o diagnóstico gratuito de marca',
  ctaMobile: 'Pedir diagnóstico gratuito',
  ctaFinal: 'Quero o diagnóstico gratuito',
  ctaHref: '/contato.html?assunto=diagnostico',
  whatsappLabel: 'Prefere o WhatsApp? Envie os dados da sua empresa por lá',
  whatsappUrl: `https://wa.me/5567982226166?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
  seoTitle: 'Arcaffo GROUP | Agência de branding em Campo Grande',
  seoDescription: 'Chega de trocar de agência de marketing a cada 6 meses. Agência de branding em Campo Grande há 10 anos: marcas com essência, negócios com direção. Peça um diagnóstico gratuito de marca e posicionamento.',
});
