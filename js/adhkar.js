// عرض الأذكار بتبويبات
window.Adhkar = (function(){
  let cats=[], cur=0;
  function renderTabs(){
    const t=document.getElementById('adhkar-tabs');
    t.innerHTML=cats.map((c,i)=>`<button class="adhkar-tab${i===cur?' on':''}" data-nav tabindex="0" data-i="${i}">${c}</button>`).join('');
    t.querySelectorAll('.adhkar-tab').forEach(b=>b.addEventListener('click',()=>{ cur=parseInt(b.getAttribute('data-i'),10); render(); }));
  }
  function renderBody(){
    const list=window.ADHKAR[cats[cur]]||[];
    document.getElementById('adhkar-body').innerHTML = list.map(d=>
      `<div class="dhikr">${d.text}<div class="count">${d.count}</div></div>`).join('');
  }
  function render(){ renderTabs(); renderBody(); }
  return {
    init(){ cats=Object.keys(window.ADHKAR||{}); },
    onEnter(){ if(!cats.length) this.init(); render(); }
  };
})();
