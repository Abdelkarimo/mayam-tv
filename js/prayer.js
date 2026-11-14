// مواقيت الصلاة — القاهرة (هيئة المساحة المصرية، method=5)
window.Prayer = (function(){
  const LAT=30.0444, LNG=31.2357, METHOD=5;
  const NAMES={ Fajr:'الفجر', Sunrise:'الشروق', Dhuhr:'الظهر', Asr:'العصر', Maghrib:'المغرب', Isha:'العشاء' };
  const ORDER=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
  let timings=null;

  function fmtDate(d){
    const dd=String(d.getDate()).padStart(2,'0');
    const mm=String(d.getMonth()+1).padStart(2,'0');
    return dd+'-'+mm+'-'+d.getFullYear();
  }
  function to12(t){
    let [h,m]=t.split(':').map(Number);
    const am = h<12; let hh=h%12; if(hh===0) hh=12;
    return hh+':'+String(m).padStart(2,'0')+(am?' ص':' م');
  }
  function cache(obj){ try{ localStorage.setItem('prayer', JSON.stringify(obj)); }catch(e){} }
  function readCache(){ try{ return JSON.parse(localStorage.getItem('prayer')); }catch(e){ return null; } }

  function render(){
    const wrap=document.getElementById('prayer-times');
    const dateEl=document.getElementById('prayer-date');
    const status=document.getElementById('prayer-status');
    if(!timings){ status.textContent='جارٍ تحميل المواقيت…'; return; }
    status.textContent='';
    const now=new Date(); const nowMin=now.getHours()*60+now.getMinutes();
    let nextIdx=-1;
    const mins = ORDER.map(k=>{ const [h,m]=timings[k].split(':').map(Number); return h*60+m; });
    for(let i=0;i<ORDER.length;i++){ if(mins[i]>nowMin){ nextIdx=i; break; } }
    wrap.innerHTML = ORDER.map((k,i)=>
      `<div class="ptime${i===nextIdx?' next':''}"><div class="name">${NAMES[k]}</div><div class="time">${to12(timings[k])}</div></div>`
    ).join('');
    const d=new Date();
    dateEl.textContent = d.toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    // تلميح الصلاة القادمة في الرئيسية
    const hint=document.getElementById('next-prayer-hint');
    if(hint && nextIdx>=0) hint.textContent='الصلاة القادمة: '+NAMES[ORDER[nextIdx]]+' '+to12(timings[ORDER[nextIdx]]);
  }

  function avatar(m){ if(window.Avatar && window.ROUTER && window.ROUTER.current()==='prayer') Avatar.setMood(m); }

  function load(){
    avatar('think');
    const url=`https://api.aladhan.com/v1/timings/${fmtDate(new Date())}?latitude=${LAT}&longitude=${LNG}&method=${METHOD}`;
    fetch(url).then(r=>r.json()).then(j=>{
      if(j && j.data && j.data.timings){
        timings=j.data.timings; cache({date:fmtDate(new Date()), timings}); render(); avatar('dua');
      } else throw new Error('bad');
    }).catch(()=>{
      const c=readCache();
      if(c && c.timings){ timings=c.timings; render(); avatar('dua');
        document.getElementById('prayer-status').textContent='(المواقيت من آخر تحميل — تأكد من اتصال الإنترنت لتحديثها)';
      } else {
        document.getElementById('prayer-status').textContent='تعذّر تحميل المواقيت. تأكد من اتصال الشاشة بالإنترنت.';
      }
    });
  }

  return {
    init(){ const c=readCache(); if(c&&c.timings) timings=c.timings; load(); setInterval(load, 3600000); },
    onEnter(){ render(); if(!timings) load(); },
    getTimings(){ return timings; }
  };
})();
