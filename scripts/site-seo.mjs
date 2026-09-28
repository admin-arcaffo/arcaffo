import { readFileSync } from 'node:fs';
import { editorialContent } from '../shared/editorial-content.mjs';
import { HOME_CAMPAIGN } from '../shared/home-campaign.mjs';
import { SITE_ORIGIN as origin, absoluteUrl, jsonLd } from '../shared/seo.mjs';
export function applySeo($, path) {
 const kind=$('body').attr('data-page');
 const saved=JSON.parse(readFileSync('public/data/site-content.json','utf8'));
 const defaults=editorialContent(saved).seo;
 const cleanPath=path.split('?')[0];
 const route=cleanPath==='/'||cleanPath==='/index.html'?'/':cleanPath.endsWith('/index.html')?cleanPath.slice(0,-10):cleanPath;
 const url=absoluteUrl(route);
 const set=(name,value,attr='name')=>{let el=$(`meta[${attr}="${name}"]`);if(!el.length){$('head').append(`<meta ${attr}="${name}">`);el=$(`meta[${attr}="${name}"]`);}el.attr('content',value);};
 $('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"],link[rel="manifest"]').remove();
 $('head').append('<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48"><link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">');
 if(!$('link[rel="preload"][href="/design-system/arcaffo-materia/fonts/inter-latin.woff2"]').length)$('head').append('<link rel="preload" href="/design-system/arcaffo-materia/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>');
 set('theme-color','#F7F3EA');set('application-name','Arcaffo GROUP');
 const excluded=['obrigado','404','lp-marketing'].includes(kind)||['/artigo.html','/projeto.html'].includes(route);
 set('robots',excluded?'noindex, follow':'index, follow, max-image-preview:large');
 if(kind==='index'){
  $('title').text(HOME_CAMPAIGN.enabled?HOME_CAMPAIGN.seoTitle:defaults.home_title);
  set('description',HOME_CAMPAIGN.enabled?HOME_CAMPAIGN.seoDescription:defaults.home_description);
 }
 $('link[rel="canonical"]').remove();$('head').append('<link rel="canonical">');$('link[rel="canonical"]').attr('href',url);
 const title=$('title').text();const description=$('meta[name="description"]').attr('content')||$('main > section p').first().text().slice(0,160);
 set('description',description);set('og:title',title,'property');set('og:description',description,'property');set('og:url',url,'property');set('og:site_name','Arcaffo GROUP','property');set('og:locale','pt_BR','property');
 const detail=/^\/(artigos|projetos)\/.+\.html$/.test(route);
 const social=absoluteUrl(detail?$('meta[property="og:image"]').attr('content'):defaults.social_image);
 set('og:image',social,'property');set('og:image:alt',detail?$('main h1').text():'Arcaffo GROUP — branding e estratégia empresarial','property');
 if(!detail && social===absoluteUrl('/images/materia/social-home.jpg')){set('og:image:width','1200','property');set('og:image:height','630','property');}
 set('twitter:card','summary_large_image');set('twitter:title',title);set('twitter:description',description);set('twitter:image',social);set('twitter:image:alt',$('meta[property="og:image:alt"]').attr('content'));
 const serviceItems=[
  ['Consultoria de branding','/consultoria-de-branding/'],
  ['Posicionamento de marca','/posicionamento-de-marca/'],
  ['Identidade visual','/identidade-visual/'],
  ['Estratégia de marca','/estrategia-de-marca/'],
  ['Consultoria empresarial','/consultoria-empresarial/'],
  ['Gestão de marketing','/gestao-de-marketing/'],
 ];
 const organization={
  '@type':'ProfessionalService','@id':`${origin}/#organization`,name:'Arcaffo GROUP',slogan:'Pessoas, valores, Negócios & Marcas.',url:origin+'/',
  description:'Branding, assessoria estratégica e formação empresarial em Campo Grande, MS.',logo:absoluteUrl('/icon-512.png'),image:absoluteUrl('/images/fachada.webp'),
  telephone:'+5567982226166',email:'contato@arcaffo.com',
  address:{'@type':'PostalAddress',streetAddress:'Rua Piratininga, 641, Jardim dos Estados',addressLocality:'Campo Grande',addressRegion:'MS',addressCountry:'BR'},
  geo:{'@type':'GeoCoordinates',latitude:-20.457099172115935,longitude:-54.5978863988003},
  hasMap:'https://www.google.com/maps/search/?api=1&query=-20.457099172115935,-54.5978863988003',
  openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday'],opens:'08:00',closes:'18:00'}],
  contactPoint:{'@type':'ContactPoint',telephone:'+5567982226166',email:'contato@arcaffo.com',contactType:'sales',availableLanguage:'Portuguese'},
  areaServed:[{'@type':'City',name:'Campo Grande'},{'@type':'AdministrativeArea',name:'Mato Grosso do Sul'},{'@type':'Country',name:'Brasil'}],
  sameAs:['https://www.instagram.com/arcaffo/','https://www.linkedin.com/company/arcaffo','https://www.youtube.com/@arcaffo'],
  hasOfferCatalog:{'@type':'OfferCatalog',name:'Serviços da Arcaffo',itemListElement:serviceItems.map(([name,path])=>({'@type':'Offer',itemOffered:{'@type':'Service',name,url:absoluteUrl(path),provider:{'@id':`${origin}/#organization`}}}))},
 };
 // Retain generated page-specific entities; replace legacy global graphs.
 const entities=[];
 $('script[type="application/ld+json"]').each((_,el)=>{try{const data=JSON.parse($(el).text());if(!data['@graph'] && ['Article','CreativeWork','BreadcrumbList','FAQPage'].includes(data['@type'])){delete data['@context'];if(data.publisher)data.publisher={'@id':organization['@id']};entities.push(data);}}catch{}$(el).remove();});
 const type=kind==='sobre'?'AboutPage':kind==='contato'?'ContactPage':kind==='author'?'ProfilePage':['projetos','artigos','vagas'].includes(kind)?'CollectionPage':'WebPage';
 const graph=[organization,{'@type':'WebSite','@id':`${origin}/#website`,url:origin+'/',name:'Arcaffo GROUP',publisher:{'@id':organization['@id']},inLanguage:'pt-BR'},{'@type':type,'@id':url+'#webpage',url,name:title,description,inLanguage:'pt-BR',isPartOf:{'@id':`${origin}/#website`},about:{'@id':organization['@id']}},...entities];
 if(!detail && route!=='/'&&!excluded)graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Início',item:origin+'/'},{'@type':'ListItem',position:2,name:$('main h1').text(),item:url}]});
 if(kind==='servicos')graph.push(...[['Assessoria estratégica','advisor'],['Formação empresarial','escola'],['Relacionamento empresarial','ordo-legatum']].map(([name,id])=>({'@type':'Service',name,url:url+'#'+id,provider:{'@id':organization['@id']}})));
 if(kind==='branding-local')graph.push({'@type':'Service','@id':url+'#service',name:'Branding em Campo Grande',serviceType:'Estratégia de marca, posicionamento e identidade',url,provider:{'@id':organization['@id']},areaServed:[{'@type':'City',name:'Campo Grande'},{'@type':'AdministrativeArea',name:'Mato Grosso do Sul'},{'@type':'Country',name:'Brasil'}]});
 if(kind==='service-detail')graph.push({'@type':'Service','@id':url+'#service',name:$('body').attr('data-service-name'),serviceType:$('body').attr('data-service-type'),url,provider:{'@id':organization['@id']},areaServed:organization.areaServed});
 if(kind==='author'){
  const personId=url+'#person';
  graph.push({'@type':'Person','@id':personId,name:$('body').attr('data-person-name'),jobTitle:$('body').attr('data-person-role'),image:absoluteUrl($('body').attr('data-person-image')),url,worksFor:{'@id':organization['@id']}});
  graph.find(item=>item['@id']===url+'#webpage').mainEntity={'@id':personId};
 }
 $('head').append(`<script type="application/ld+json">${jsonLd({'@context':'https://schema.org','@graph':graph})}</script>`);
}
