export function initChapters(track = () => {}) {
 const essence=document.querySelector('[data-essence]');
 if(essence){
  const tabs=[...essence.querySelectorAll('[role="tab"]')],panels=[...essence.querySelectorAll('[role="tabpanel"]')];
  const choose=(index,focus=false)=>{tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});if(focus)tabs[index].focus();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)panels[index].animate([{opacity:.88,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:350,easing:'cubic-bezier(.4,0,.2,1)'});};
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>{choose(i);track('essence_explore',{principle:tab.textContent.trim()});});tab.addEventListener('keydown',event=>{let next=i;if(['ArrowDown','ArrowRight'].includes(event.key))next=(i+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(event.key))next=(i-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();choose(next,true);});});choose(0);
 }
 document.querySelectorAll('[data-explorer]').forEach(root=>{
  const options=[...root.querySelectorAll('[data-option]')],panels=[...root.querySelectorAll('[data-explorer-panel]')];
  const list=root.querySelector('.explorer-options');list.setAttribute('role','tablist');list.setAttribute('aria-orientation','vertical');
  options.forEach((option,i)=>{option.id=`${root.dataset.explorer}-tab-${i}`;option.setAttribute('role','tab');option.setAttribute('aria-controls',panels[i].id);panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',option.id);});
  function choose(index,animate=true){
   options.forEach((option,i)=>{option.setAttribute('aria-selected',String(i===index));option.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});
   if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)panels[index].animate([{opacity:.9,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:300,easing:'ease-out'});
  }
  function fromHash(){const index=panels.findIndex(panel=>'#'+panel.id===location.hash);if(index>=0)choose(index,false);}
  choose(0,false);fromHash();window.addEventListener('hashchange',fromHash);
  options.forEach((option,i)=>{
   option.addEventListener('click',event=>{event.preventDefault();choose(i);history.replaceState(null,'','#'+panels[i].id);track('service_explore',{category:root.dataset.explorer,selection:String(i+1)});});
   option.addEventListener('keydown',event=>{let index=i;if(['ArrowDown','ArrowRight'].includes(event.key))index=(i+1)%options.length;else if(['ArrowUp','ArrowLeft'].includes(event.key))index=(i-1+options.length)%options.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=options.length-1;else if(event.key===' '){event.preventDefault();option.click();return;}else return;event.preventDefault();options[index].focus();choose(index);});
  });
 });
 const chapters=[...document.querySelectorAll('[data-chapter]')];
 if(chapters.length && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('history-enhanced');
  const stage=document.querySelector('.history-stage-artifact'),year=document.querySelector('.history-stage-year');
  let active='';
  const set=chapter=>{if(active===chapter.dataset.chapter)return;active=chapter.dataset.chapter;year.textContent=active;stage.innerHTML=chapter.querySelector('.chapter-artifact').innerHTML;
   document.querySelectorAll('[data-year-link]').forEach(a=>a.setAttribute('aria-current',String(a.dataset.yearLink===active)));
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)stage.animate([{opacity:.9,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:480,easing:'cubic-bezier(.4,0,.2,1)'});
   track('history_chapter',{year:active});
  };
  let queued=false;
  const update=()=>{queued=false;const line=innerHeight*.4;const current=chapters.find(c=>{const r=c.getBoundingClientRect();return r.top<=line&&r.bottom>line;});if(current)set(current);};
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);set(chapters[0]);schedule();
 }
 document.querySelectorAll('.culture-accordions details').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)track('culture_explore',{category:details.querySelector('summary').textContent.trim()});}));
 if(document.querySelector('.history-section,.method-section')) {
  const target=document.querySelector('.history-section,.method-section');
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();import('./scroll-scenes.js').then(m=>m.initScrollScenes()).catch(()=>{});}},{rootMargin:'400px'});observer.observe(target);
 }
}
