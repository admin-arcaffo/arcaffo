import { icon } from '../shared/icons.mjs';
export function initGallery(track = () => {}) {
 const links=[...document.querySelectorAll('[data-gallery-image]')];
 if(!links.length || typeof HTMLDialogElement==='undefined')return;
 const dialog=document.createElement('dialog');dialog.className='gallery-dialog';dialog.setAttribute('aria-label','Galeria do projeto');
 dialog.innerHTML=`<div class="gallery-toolbar"><span class="gallery-title"></span><button type="button" data-close aria-label="Fechar galeria">${icon('close')}</button></div><div class="gallery-viewport"><img alt=""><div class="gallery-status" role="status" hidden></div></div><div class="gallery-footer"><button type="button" data-prev aria-label="Imagem anterior">${icon('left')}</button><span class="gallery-count" data-gallery-count aria-live="polite"></span><button type="button" data-next aria-label="Próxima imagem">${icon('right')}</button></div>`;
 dialog.querySelector('.gallery-title').textContent=document.querySelector('h1')?.textContent||'Galeria';
 document.body.append(dialog);
 let index=0,opener=null,request=0,start=null;
 const image=dialog.querySelector('img'),status=dialog.querySelector('[role="status"]');
 async function show(next) {
  index=(next+links.length)%links.length;const current=++request;
  const target=links[index];status.hidden=false;status.textContent='Carregando imagem…';
  dialog.querySelector('[data-gallery-count]').textContent=`${index+1} / ${links.length}`;
  const loaded=new Image();loaded.src=target.href;
  try {await loaded.decode();if(current!==request)return;
   image.src=loaded.src;image.alt=target.querySelector('img')?.alt||'Imagem do projeto';status.hidden=true;
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)image.animate([{opacity:.3,transform:'translateX(8px)'},{opacity:1,transform:'none'}],{duration:280,easing:'ease-out'});
   const prefetch=new Image();prefetch.src=links[(index+1)%links.length].href;
  } catch {if(current!==request)return;status.textContent='Não foi possível carregar esta imagem. ';const retry=document.createElement('button');retry.textContent='Tentar novamente';retry.onclick=()=>show(index);status.append(retry);}
 }
 links.forEach((link,i)=>link.addEventListener('click',event=>{event.preventDefault();opener=link;dialog.showModal();document.documentElement.classList.add('gallery-open');show(i);track('project_gallery_open',{category:'portfolio'});}));
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 dialog.querySelector('[data-prev]').onclick=()=>show(index-1);
 dialog.querySelector('[data-next]').onclick=()=>show(index+1);
 if(links.length===1)dialog.querySelectorAll('[data-prev],[data-next]').forEach(b=>b.hidden=true);
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}if(event.key==='ArrowRight'){event.preventDefault();show(index+1);}});
 const viewport=dialog.querySelector('.gallery-viewport');
 viewport.addEventListener('pointerdown',event=>{if(event.isPrimary)start={x:event.clientX,y:event.clientY};});
 viewport.addEventListener('pointerup',event=>{if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)show(index+(dx<0?1:-1));});
 viewport.addEventListener('pointercancel',()=>start=null);
 dialog.addEventListener('close',()=>{request++;document.documentElement.classList.remove('gallery-open');opener?.focus({preventScroll:true});});
}
