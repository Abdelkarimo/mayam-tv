// عرض الأذكار بتبويبات — والأفاتار بيغيّر مودها مع كل تبويب
window.Adhkar = (function(){
  let cats=[], cur=-1;

  // الصبح قبل العصر تقريبًا، والمساء بعده
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
      cur=parseInt(b.getAttribute('data-i'),10); render();
      const on=t.querySelector('.adhkar-tab.on'); if(on) on.focus();
    }));
  }
  function renderBody(){
    const c=cats[cur]; const body=document.getElementById('adhkar-body');
    body.innerHTML = (c.items||[]).map(d=>
      `<div class="dhikr" tabindex="0">${d.note?`<div class="note">${d.note}</div>`:''}${d.text}<div class="count">${d.count}</div></div>`).join('');
    body.scrollTop=0;
  }
  function render(){
    renderTabs(); renderBody();
    if(window.Avatar) Avatar.setMood(cats[cur].mood || 'dhikr');
  }
  return {
    init(){ cats=window.ADHKAR||[]; },
    onEnter(){ if(!cats.length) this.init(); cur=defaultTab(); render(); }
  };
})();
