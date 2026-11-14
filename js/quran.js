// القرآن: نص عثماني + تلاوة (مشاري العفاسي) عبر alquran.cloud
window.Quran = (function(){
  const API='https://api.alquran.cloud/v1';
  let surahs=[], current=null, ayahs=[], audioIdx=0, playing=false;
  const audio=()=>document.getElementById('quran-audio');

  function listSurahs(){
    const box=document.getElementById('surah-list');
    box.innerHTML = surahs.map(s=>
      `<div class="surah-item" data-nav tabindex="0" data-n="${s.number}">
         <span class="name">${s.name}</span><span class="num">${s.number}</span>
       </div>`).join('');
    box.querySelectorAll('.surah-item').forEach(el=>{
      el.addEventListener('click', ()=>openSurah(parseInt(el.getAttribute('data-n'),10)));
    });
  }

  function openSurah(n){
    stop();
    document.getElementById('surah-title').textContent='جارٍ التحميل…';
    document.getElementById('ayah-list').innerHTML='';
    fetch(`${API}/surah/${n}/ar.alafasy`).then(r=>r.json()).then(j=>{
      if(!j.data) throw new Error('bad');
      current=j.data; ayahs=j.data.ayahs;
      document.getElementById('surah-title').textContent=j.data.name+' ('+j.data.englishName+')';
      const html=ayahs.map((a,i)=>
        `<span class="ayah" id="ayah-${i}">${a.text} <span class="anum">${a.numberInSurah}</span> </span>`).join('');
      document.getElementById('ayah-list').innerHTML=html;
    }).catch(()=>{
      document.getElementById('surah-title').textContent='تعذّر التحميل';
      document.getElementById('ayah-list').innerHTML='<p class="status">تأكد من اتصال الشاشة بالإنترنت.</p>';
    });
  }

  function playFrom(i){
    if(!ayahs.length) return;
    audioIdx=i; playing=true;
    const a=audio(); a.src=ayahs[i].audio; a.play();
    highlight(i);
    document.getElementById('play-surah').textContent='⏸ إيقاف مؤقت';
  }
  function highlight(i){
    document.querySelectorAll('.ayah.playing').forEach(e=>e.classList.remove('playing'));
    const el=document.getElementById('ayah-'+i); if(el){ el.classList.add('playing'); el.scrollIntoView({block:'center'}); }
  }
  function stop(){
    playing=false; const a=audio(); a.pause(); a.removeAttribute('src');
    document.querySelectorAll('.ayah.playing').forEach(e=>e.classList.remove('playing'));
    const b=document.getElementById('play-surah'); if(b) b.textContent='▶ تشغيل التلاوة';
  }
  function toggle(){
    if(!ayahs.length) return;
    if(playing){ stop(); } else { playFrom(audioIdx||0); }
  }

  return {
    init(){
      const cached=null; try{ /*cache*/ }catch(e){}
      fetch(`${API}/surah`).then(r=>r.json()).then(j=>{ surahs=j.data||[]; listSurahs(); })
        .catch(()=>{ document.getElementById('surah-list').innerHTML='<p class="status">تعذّر تحميل قائمة السور.</p>'; });
      document.getElementById('play-surah').addEventListener('click', toggle);
      audio().addEventListener('ended', ()=>{
        if(playing && audioIdx<ayahs.length-1){ playFrom(audioIdx+1); } else { stop(); }
      });
    },
    onEnter(){ if(!surahs.length) this.init(); }
  };
})();
