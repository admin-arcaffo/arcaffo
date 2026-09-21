import { sanitizeSlug } from '../api/utils/slug.mjs';
const isProject=document.body.dataset.page==='projeto';
const slug=sanitizeSlug(new URLSearchParams(location.search).get(isProject?'id':'slug'));
if(slug && /^[a-z0-9-]+$/i.test(slug)) {
  fetch(`/data/${isProject?'projetos':'artigos'}.json`).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(items=>{
    if(items.some(item=>sanitizeSlug(item.slug)===slug && item.status!=='draft'))location.replace(`/${isProject?'projetos':'artigos'}/${encodeURIComponent(slug)}.html`); else showMissing();
  }).catch(showMissing);
} else showMissing();
function showMissing(){document.querySelector('main').innerHTML=`<section class="container page-intro"><h1>${isProject?'Projeto':'Artigo'} não encontrado.</h1><p>Explore nosso acervo para encontrar outras histórias.</p><a class="btn" href="/${isProject?'projetos':'artigos'}.html">Ver ${isProject?'projetos':'artigos'}</a></section>`;}
