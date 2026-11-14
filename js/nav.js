// تنقّل بالريموت (D-pad) لشاشات webOS
(function(){
  const KEY = { LEFT:37, UP:38, RIGHT:39, DOWN:40, ENTER:13, BACK:461, ESC:27 };

  function activeScreen(){ return document.querySelector('.screen.active'); }
  function focusables(scr){
    return Array.from(scr.querySelectorAll('[data-nav],[data-back],button,.surah-item,.adhkar-tab,.dhikr'))
      .filter(el => el.offsetParent !== null && !el.disabled);
  }
  function rect(el){ const r = el.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2, r}; }

  function move(dir){
    const scr = activeScreen(); if(!scr) return;
    const items = focusables(scr); if(!items.length) return;
    const cur = document.activeElement && items.includes(document.activeElement) ? document.activeElement : items[0];
    if(cur !== document.activeElement){ cur.focus(); return; }
    const c = rect(cur); let best=null, bestScore=Infinity;
    items.forEach(el=>{
      if(el===cur) return; const t=rect(el);
      const dx=t.x-c.x, dy=t.y-c.y;
      let ok=false, primary=0, cross=0;
      if(dir===KEY.LEFT){ ok=dx<-8; primary=-dx; cross=Math.abs(dy); }
      if(dir===KEY.RIGHT){ ok=dx>8; primary=dx; cross=Math.abs(dy); }
      if(dir===KEY.UP){ ok=dy<-8; primary=-dy; cross=Math.abs(dx); }
      if(dir===KEY.DOWN){ ok=dy>8; primary=dy; cross=Math.abs(dx); }
      if(!ok) return;
      const score = primary + cross*2;
      if(score<bestScore){ bestScore=score; best=el; }
    });
    if(best){ best.focus(); best.scrollIntoView({block: best.classList.contains('dhikr') ? 'center' : 'nearest', inline:'nearest'}); }
  }

  document.addEventListener('keydown', function(e){
    const k = e.keyCode;
    if([KEY.LEFT,KEY.UP,KEY.RIGHT,KEY.DOWN].includes(k)){ e.preventDefault(); move(k); return; }
    if(k===KEY.ENTER){
      const el=document.activeElement;
      if(el && (el.hasAttribute('data-nav')||el.hasAttribute('data-back')||el.classList.contains('surah-item')||el.classList.contains('adhkar-tab')||el.classList.contains('dhikr'))){
        e.preventDefault(); el.click();
      }
      return;
    }
    if(k===KEY.BACK || k===KEY.ESC){ e.preventDefault(); window.NAV.back(); }
  });

  window.NAV = {
    focusFirst(){ const scr=activeScreen(); const f=focusables(scr); if(f.length) f[0].focus(); },
    back(){ if(window.ROUTER) window.ROUTER.back(); }
  };
})();
