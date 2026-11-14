// عرض الأذكار بتبويبات — والأفاتار بيغيّر مودها مع كل تبويب
// دليل بصري (بدون صوت): تختار الذِّكر يتقل ويتظلّل، ويظهر عدّاد ترديد، وبعد مهلة يتجاب اللي بعده
window.Adhkar = (function(){
  let cats=[], cur=-1;

  // ===== الدليل البصري =====
  let idx=-1, rep=0, repTarget=1, timer=null, stopped=true;

  function parseCount(s){ s=s||'';
    if(/مئة|مائة/.test(s)) return 100;
    if(/عشر/.test(s)) return 10;
    if(/سبع/.test(s)) return 7;
    if(/خمس/.test(s)) return 5;
    if(/أربع|اربع/.test(s)) return 4;
    if(/ثلاث/.test(s)) return 3;
    if(/مرتين/.test(s)) return 2;
    return 1;
  }
  function clean(t){ return (t||'').replace(/●/g,'، ').replace(/\s+/g,' ').trim(); }
  function readDelay(text){ const n=clean(text).length; return Math.min(Math.max(n*55, 2800), 14000); }
  function nodes(){ return Array.from(document.querySelectorAll('#adhkar-body .dhikr')); }
  function clearPlaying(){ document.querySelectorAll('#adhkar-body .dhikr.playing').forEach(e=>e.classList.remove('playing')); }
  function clearReps(){ document.querySelectorAll('#adhkar-body .rep').forEach(b=>b.remove()); }
  function setCounter(el, n, total){
    let b=el.querySelector('.rep'); if(!b){ b=document.createElement('div'); b.className='rep'; el.appendChild(b); }
    b.textContent = 'ردّد معايا  ' + n + ' / ' + total;
    b.style.animation='none'; void b.offsetWidth; b.style.animation='';
  }
  function keepAwake(){ if(window.Screensaver && Screensaver.resetIdle) Screensaver.resetIdle(); }

  function playIndex(i){
    const list=nodes(); if(i<0 || i>=list.length){ stopPlayer(); return; }
    idx=i; rep=0;
    const el=list[i];
    const item = (cats[cur] && cats[cur].items) ? cats[cur].items[i] : null;
    repTarget = parseCount(item && item.count);
    if(clean(item ? item.text : el.textContent).length > 140) repTarget = 1; else repTarget = Math.min(repTarget, 3);
    clearPlaying(); el.classList.add('playing');
    try{ el.focus(); }catch(e){} el.scrollIntoView({block:'center'});
    step();
  }
  function step(){
    if(stopped) return;
    const list=nodes(); const el=list[idx]; if(!el){ stopPlayer(); return; }
    keepAwake();
    rep++; setCounter(el, rep, repTarget);
    const item = (cats[cur] && cats[cur].items) ? cats[cur].items[idx] : null;
    const text = item ? item.text : el.textContent;
    timer=setTimeout(()=>{
      if(stopped) return;
      keepAwake();
      if(rep < repTarget){ step(); }
      else {
        const next=idx+1;
        if(next < nodes().length) playIndex(next); else stopPlayer();
      }
    }, readDelay(text));
  }
  function startPlayer(fromEl){
    stopPlayer(); stopped=false;
    const list=nodes(); let i=0;
    if(fromEl){ i=list.indexOf(fromEl); if(i<0) i=0; }
    playIndex(i);
  }
  function stopPlayer(){
    stopped=true; if(timer){ clearTimeout(timer); timer=null; }
    clearPlaying(); clearReps(); idx=-1; rep=0;
  }

  // ===== الصباح قبل العصر تقريبًا، والمساء بعده =====
  function defaultTab(){
    const h=new Date().getHours();
    const want = (h>=4 && h<15) ? 'morning' : 'evening';
    const i = cats.findIndex(c=>c.mood===want);
    return i<0 ? 0 : i;
  }
  function renderTabs(){
    const t=document.getElementById('adhkar-tabs');
    t.innerHTML=cats.map((c,i)=>
      `<button class="adhkar-tab${i===cur?' on':''}" data-nav tabindex="0" data-i="${i}"><span class="tab-ico">${c.icon||''}</span>${c.name}</button>`).join('');
    t.querySelectorAll('.adhkar-tab').forEach(b=>b.addEventListener('click',()=>{
      const ni=parseInt(b.getAttribute('data-i'),10);
      if(ni===cur) return;
      cur=ni; render();
      const on=t.querySelector('.adhkar-tab.on'); if(on) on.focus();
    }));
  }
  function renderBody(){
    const c=cats[cur]; const body=document.getElementById('adhkar-body');
    body.innerHTML = (c.items||[]).map(d=>
      `<div class="dhikr" data-nav tabindex="0">${d.note?`<div class="note">${d.note}</div>`:''}${d.text}<div class="count">${d.count}</div></div>`).join('');
    body.scrollTop=0;
    body.querySelectorAll('.dhikr').forEach(el=>el.addEventListener('click', ()=>{
      const list=nodes();
      if(!stopped && list[idx]===el) stopPlayer(); else startPlayer(el);
    }));
  }
  function render(){
    stopPlayer();
    renderTabs(); renderBody();
    if(window.Avatar) Avatar.setMood(cats[cur].mood || 'dhikr');
  }
  return {
    init(){ cats=window.ADHKAR||[]; },
    onEnter(){ if(!cats.length) this.init(); cur=defaultTab(); render(); },
    stop(){ stopPlayer(); }
  };
})();
