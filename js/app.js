// الراوتر الرئيسي + الساعة + التهيئة
(function(){
  const screens = ['home','quran','prayer','adhkar','screensaver'];
  const MOOD = { home:'home', quran:'quran', prayer:'prayer', adhkar:'dhikr', screensaver:'sleep' };
  // عرض حركات مريم على الرئيسية: بتلفّ على كل الـ12 شكل، كل شكل 5 ثواني (دقيقة كاملة للدورة)
  const HOME_POSES = ['wave','love','point','twirl','cheer','stand'];
  let homeTimer = null, hp = 0;
  function posesList(){ return (window.Avatar && Avatar.POSES && Avatar.POSES.length) ? Avatar.POSES : HOME_POSES; }
  function startHomeShow(){
    stopHomeShow(); const P = posesList(); hp = 0; Avatar.setMood(P[0]);
    homeTimer = setInterval(()=>{ hp = (hp+1) % P.length; Avatar.setMood(P[hp]); }, 5000);
  }
  function stopHomeShow(){ if(homeTimer){ clearInterval(homeTimer); homeTimer = null; } }
  let stack = ['home'];

  function show(id){
    screens.forEach(s=>{
      const el=document.getElementById(s);
      el.classList.toggle('active', s===id);
    });
    if(id==='screensaver') Screensaver.start(); else Screensaver.stop();
    if(id==='quran') Quran.onEnter();
    if(id==='prayer') Prayer.onEnter();
    if(id!=='adhkar' && window.Adhkar && Adhkar.stop) Adhkar.stop();
    if(id==='home'){ startHomeShow(); } else { stopHomeShow(); Avatar.setMood(MOOD[id]||'home'); }
    if(id==='adhkar') Adhkar.onEnter();
    setTimeout(()=>window.NAV.focusFirst(), 60);
  }
  function go(id){ if(stack[stack.length-1]!==id) stack.push(id); show(id); }
  function back(){ if(stack.length>1){ stack.pop(); show(stack[stack.length-1]); } }
  window.ROUTER = { go, back, current:()=>stack[stack.length-1] };

  // أزرار التنقّل
  document.addEventListener('click', function(e){
    const nav = e.target.closest('[data-target]');
    if(nav){ go(nav.getAttribute('data-target')); return; }
    const bk = e.target.closest('[data-back]');
    if(bk){ back(); return; }
  });

  // الساعة
  function tick(){
    const d=new Date();
    const hh=String(d.getHours()).padStart(2,'0');
    const mm=String(d.getMinutes()).padStart(2,'0');
    const c=document.getElementById('clock'); if(c) c.textContent=hh+':'+mm;
    Screensaver.maybeAutoStart();
  }
  setInterval(tick,1000); tick();

  // إعادة ضبط مؤقّت شاشة التوقف عند أي ضغطة
  document.addEventListener('keydown', ()=>Screensaver.resetIdle());

  // تهيئة
  Avatar.mountAll();
  Prayer.init(); Quran.init(); Adhkar.init(); Screensaver.init();
  show('home');
})();
