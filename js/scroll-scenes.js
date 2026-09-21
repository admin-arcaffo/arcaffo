import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
export function initScrollScenes() {
 gsap.registerPlugin(ScrollTrigger);
 const media=gsap.matchMedia();
 media.add('(prefers-reduced-motion: no-preference)',()=>{
  const history=document.querySelector('.history-section');
  if(history)gsap.fromTo('.history-progress span',{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:history,start:'top center',end:'bottom bottom',scrub:.35}});
  gsap.utils.toArray('.ordo-dimensions article').forEach((el,i)=>gsap.fromTo(el,{y:24},{y:0,duration:.6,delay:i*.08,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
 });
 media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)',()=>{
  gsap.utils.toArray('[data-photo-motion] img').forEach(el=>gsap.fromTo(el,{scale:1.045,y:-8},{scale:1,y:8,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:.45}}));
 });
 window.addEventListener('pagehide',()=>media.revert(),{once:true});
}
