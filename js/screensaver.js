// شاشة التوقف: آيات + صور (مع بدء تلقائي بعد الخمول)
window.Screensaver = (function(){
  const IDLE_MS=120000; // دقيقتان خمول
  let ayahTimer=null, photoTimer=null, lastActivity=Date.now(), ai=0, pi=0, running=false;
  // أفاتار كبير يبدّل كل الـ12 شكل، كل شكل 5 ثواني
  let moodTimer=null, mi=0;
  const BAQARA='https://server8.mp3quran.net/afs/002.mp3'; // سورة البقرة — مشاري العفاسي
  function startAvatarCycle(){
    stopAvatarCycle();
    const P=(window.Avatar && Avatar.POSES && Avatar.POSES.length)?Avatar.POSES:['sleep'];
    mi=0; if(window.Avatar) Avatar.setMood(P[0]);
    moodTimer=setInterval(()=>{ mi=(mi+1)%P.length; if(window.Avatar) Avatar.setMood(P[mi]); }, 5000);
  }
  function stopAvatarCycle(){ if(moodTimer){ clearInterval(moodTimer); moodTimer=null; } }
  function playBaqara(){ const a=document.getElementById('saver-audio'); if(!a) return;
    try{ if(a.getAttribute('src')!==BAQARA) a.src=BAQARA; a.play().catch(()=>{}); }catch(e){} }
  function stopBaqara(){ const a=document.getElementById('saver-audio'); if(!a) return; try{ a.pause(); }catch(e){} }

  function showAyah(){
    const a=window.AYAT[ai % window.AYAT.length]; ai++;
    const el=document.getElementById('saver-ayah'); const rf=document.getElementById('saver-ref');
    el.style.opacity=0;
    setTimeout(()=>{ el.textContent=a.t; rf.textContent=a.r; el.style.opacity=1; }, 300);
  }
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
    init(){},
    start(){
      if(running) return; running=true;
      showAyah(); showPhoto();
      ayahTimer=setInterval(showAyah, 12000);
      photoTimer=setInterval(showPhoto, 15000);
      startAvatarCycle();
      playBaqara();
    },
    stop(){
      running=false;
      clearInterval(ayahTimer); clearInterval(photoTimer);
      stopAvatarCycle();
      stopBaqara();
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
