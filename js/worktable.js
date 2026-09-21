export function initWorktable(track = () => {}) {
  const root = document.querySelector('[data-worktable]'); if(!root)return;
  const choices = [...root.querySelectorAll('[data-choice]')]; const panels = [...root.querySelectorAll('[data-panel]')];
  const list = root.querySelector('.worktable-choices'); list.setAttribute('role','tablist'); list.setAttribute('aria-orientation','vertical');
  choices.forEach((choice,i)=>{choice.setAttribute('role','tab');choice.id=`tab-${choice.dataset.choice}`;choice.setAttribute('aria-controls',panels[i].id);panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',choice.id);});
  let selected = '';
  function select(key, animate = true) {
    if(!panels.some(p=>p.dataset.panel===key)) key='marca'; if(selected===key)return; selected=key;
    choices.forEach(c=>{const active=c.dataset.choice===key;c.setAttribute('aria-selected',String(active));c.tabIndex=active?0:-1;});
    panels.forEach(p=>{p.hidden=p.dataset.panel!==key;}); const active=panels.find(p=>!p.hidden);
    if(animate && !matchMedia('(prefers-reduced-motion: reduce)').matches)active.animate([{opacity:.9,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.4,0,.2,1)'});
  }
  choices.forEach((choice,i)=>{
    choice.addEventListener('click',e=>{e.preventDefault();select(choice.dataset.choice);history.replaceState(null,'',`#questao-${choice.dataset.choice}`);track('worktable_select',{category:choice.dataset.choice});});
    choice.addEventListener('keydown',e=>{
      let index=i;
      if(e.key==='ArrowDown'||e.key==='ArrowRight')index=(i+1)%choices.length;
      else if(e.key==='ArrowUp'||e.key==='ArrowLeft')index=(i-1+choices.length)%choices.length;
      else if(e.key==='Home')index=0;else if(e.key==='End')index=choices.length-1;
      else if(e.key===' '){e.preventDefault();choice.click();return;}else return;
      e.preventDefault();choices[index].focus();select(choices[index].dataset.choice);
    });
  });
  select(location.hash.replace('#questao-',''),false);
  window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#questao-'))select(location.hash.replace('#questao-',''));});
}
