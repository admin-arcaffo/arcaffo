export const SITE_ORIGIN='https://www.arcaffo.com';
export function absoluteUrl(value, fallback='/images/materia/social-home.jpg') {
 try {const url=new URL(value || fallback,SITE_ORIGIN);return ['https:','http:'].includes(url.protocol)?url.href:new URL(fallback,SITE_ORIGIN).href;}catch{return new URL(fallback,SITE_ORIGIN).href;}
}
export function validDate(value) {
 if(!value || typeof value!=='string') return undefined;
 const date=new Date(value);return Number.isNaN(date.valueOf())?undefined:date.toISOString();
}
export const jsonLd = value => JSON.stringify(value).replace(/</g,'\\u003c');
