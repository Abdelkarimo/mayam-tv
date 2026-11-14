// شاشة التوقف: تلاوة سورة البقرة أوفلاين + آياتها تتظلّل مع الصوت + أفاتار كبير يبدّل الأشكال
window.Screensaver = (function(){
  const IDLE_MS=120000; // دقيقتان خمول
  let photoTimer=null, lastActivity=Date.now(), pi=0, running=false;

  // ===== أفاتار كبير يبدّل كل الـ12 شكل، كل شكل 5 ثواني =====
  let moodTimer=null, mi=0;
  function startAvatarCycle(){
    stopAvatarCycle();
    const P=(window.Avatar && Avatar.POSES && Avatar.POSES.length)?Avatar.POSES:['sleep'];
    mi=0; if(window.Avatar) Avatar.setMood(P[0]);
    moodTimer=setInterval(()=>{ mi=(mi+1)%P.length; if(window.Avatar) Avatar.setMood(P[mi]); }, 5000);
  }
  function stopAvatarCycle(){ if(moodTimer){ clearInterval(moodTimer); moodTimer=null; } }

  // ===== تلاوة البقرة (أوفلاين) مع سينك النص =====
  let ayat=[], qi=0;
  // البيانات محمّلة كـ global من assets/quran/baqarah.js (fetch مبيشتغلش مع الملفات المحلية على التلفزيون)
  function loadBaqara(){ if(!ayat.length) ayat = (window.BAQARA||[]).slice(); }

  // احتياطي: لو بيانات البقرة مش موجودة، نعرض آيات نصية بدون صوت
  let fbTimer=null, fi=0;
  function startTextFallback(){
    stopTextFallback();
    const list = window.AYAT || [];
    const tick=()=>{ if(!list.length) return; const a=list[fi%list.length]; fi++;
      const el=document.getElementById('saver-ayah'); const rf=document.getElementById('saver-ref');
      if(el){ el.style.opacity=0; setTimeout(()=>{ el.textContent=a.t; el.style.opacity=1; }, 200); }
      if(rf) rf.textContent=a.r||''; };
    tick(); fbTimer=setInterval(tick, 12000);
  }
  function stopTextFallback(){ if(fbTimer){ clearInterval(fbTimer); fbTimer=null; } }
  const audioEl=()=>document.getElementById('saver-audio');
  function showAyah(i){
    if(!ayat.length) return;
    const a=ayat[i]; const el=document.getElementById('saver-ayah'); const rf=document.getElementById('saver-ref');
    if(el){ el.style.opacity=0; setTimeout(()=>{ el.textContent=a.t; el.style.opacity=1; }, 180); }
    if(rf) rf.textContent='سورة البقرة — آية ' + a.n;
  }
  function playAyah(i){
    if(!ayat.length) return;
    qi=((i % ayat.length) + ayat.length) % ayat.length;
    showAyah(qi);
    const au=audioEl(); if(!au) return;
    au.src='assets/quran/baqarah/' + ayat[qi].n + '.mp3';
    const p=au.play(); if(p && p.catch) p.catch(()=>{});
  }
  function onEnded(){ if(running) playAyah(qi+1); }
  function onError(){ if(running) setTimeout(()=>{ if(running) playAyah(qi+1); }, 500); }

  // ===== صور الخلفية =====
  function showPhoto(){
    const ph=document.getElementById('saver-photo');
    if(window.PHOTOS && window.PHOTOS.length){
      ph.style.opacity=0;
      setTimeout(()=>{ ph.style.backgroundImage=`url("${window.PHOTOS[pi%window.PHOTOS.length]}")`; ph.style.opacity=1; pi++; }, 600);
    } else {
      ph.style.backgroundImage='radial-gradient(circle at 50% 30%, #6b4f9e, #2a1d45)';
      ph.style.opacity=1;
    }
  }

  return {
    init(){
      loadBaqara();
      const au=audioEl();
      if(au){ au.loop=false; au.addEventListener('ended', onEnded); au.addEventListener('error', onError); }
    },
    start(){
      if(running) return; running=true;
      loadBaqara();
      startAvatarCycle();
      showPhoto(); photoTimer=setInterval(showPhoto, 15000);
      if(ayat.length){ playAyah(qi); }   // تلاوة البقرة أوفلاين مع سينك النص
      else { startTextFallback(); }       // احتياطي بدون صوت
    },
    stop(){
      running=false;
      clearInterval(photoTimer);
      stopAvatarCycle();
      stopTextFallback();
      const au=audioEl(); if(au){ try{ au.pause(); }catch(e){} }
    },
    resetIdle(){ lastActivity=Date.now(); },
    maybeAutoStart(){
      if(window.ROUTER && window.ROUTER.current()!=='screensaver'
         && Date.now()-lastActivity>IDLE_MS){
        window.ROUTER.go('screensaver');
      }
    }
  };
})();
