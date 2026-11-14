// الراوتر الرئيسي + الساعة + التهيئة
(function(){
  const screens = ['home','quran','prayer','adhkar','qibla','screensaver'];
  let stack = ['home'];

  function show(id){
    screens.forEach(s=>{
      const el=document.getElementById(s);
      el.classList.toggle('active', s===id);
    });
    if(id==='screensaver') Screensaver.start(); else Screensaver.stop();
    if(id==='quran') Quran.onEnter();
    if(id==='prayer') Prayer.onEnter();
    if(id==='adhkar') Adhkar.onEnter();
    if(id==='qibla') Qibla.onEnter();
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
  Prayer.init(); Quran.init(); Adhkar.init(); Qibla.init(); Screensaver.init();
  show('home');
})();
