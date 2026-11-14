// أفاتار مريم — رسم SVG بيتغيّر "مودها" حسب الشاشة
// الألوان مأخوذة من شكلها: شعر كيرلي غامق، بشرة قمحي، عيون غامقة، توكة وردة، فستان تُل
(function(root){
  const LOOK = {
    skin:'#d9a07a', skinShade:'#c98c66',
    hair:'#33221c', hairHi:'#5a3d31',
    eyes:'#2a1a14',
    dress:'#f4a7c9', dressHi:'#fbd3e6', tulle:'#f9c4dc',
    flower:'#ffffff', flowerMid:'#e9a8f0',
    cheeks:'#ff8fb3', lips:'#c4566f',
    accent:'#b98ad9'
  };

  // أجزاء الرسمة اللي بتظهر في كل مود
  // 12 حركة جسم (pose) + مودات الشاشات (aliases) مبنية عليها
  const MOODS = {
    // ===== الحركات الأساسية =====
    stand:  { label:'واقفة',          bg:'#f3e8ff', show:['sparkles','arms-idle','eyes-open','mouth-smile'] },
    wave:   { label:'بتسلّم',          bg:'#f3e8ff', show:['hearts','arms-wave','eyes-open','mouth-open'] },
    read:   { label:'بتقرأ',           bg:'#f6edff', show:['sparkles','arms-book','eyes-open','mouth-smile'], look:'down' },
    dua:    { label:'بتدعي',           bg:'#f3e8ff', show:['hearts','arms-dua','eyes-happy','mouth-smile'] },
    sleep:  { label:'نايمة',           bg:'#d9c8f5', show:['moon','stars','zzz','arms-idle','eyes-sleep','mouth-o'], cls:'av-sleeping' },
    clap:   { label:'بتسقّف',          bg:'#fbe6f2', show:['sparkles','arms-clap','eyes-happy','mouth-open'] },
    cheer:  { label:'فرحانة',          bg:'#fff1dc', show:['confetti','arms-cheer','eyes-happy','mouth-open'], cls:'av-jumping' },
    love:   { label:'ماسكة قلب',       bg:'#fbe6f2', show:['hearts','arms-heart','eyes-happy','mouth-smile'] },
    think:  { label:'بتفكّر',          bg:'#f3e8ff', show:['thought','arms-think','eyes-open','mouth-o'], look:'up' },
    point:  { label:'بتشاور',          bg:'#f6edff', show:['sparkles','arms-point','eyes-open','mouth-open'] },
    salam:  { label:'إيدها على قلبها', bg:'#fbe6f2', show:['hearts','arms-chest','eyes-happy','mouth-smile'] },
    twirl:  { label:'بتلف وبتتمايل',  bg:'#f3e8ff', show:['notes','arms-twirl','eyes-happy','mouth-open'], cls:'av-twirling' },

    // ===== مودات الشاشات =====
    home:    { alias:'wave' },
    quran:   { alias:'read' },
    prayer:  { alias:'dua' },
    morning: { bg:'#fff1dc', show:['sun','arms-dua','eyes-happy','mouth-smile'] },
    evening: { bg:'#e2d2fa', show:['moon','stars','arms-dua','eyes-happy','mouth-smile'] },
    dhikr:   { alias:'salam' },
    food:    { alias:'love' },
    kids:    { alias:'clap' }
  };
  Object.keys(MOODS).forEach(k=>{ const m=MOODS[k]; if(m.alias) MOODS[k]=Object.assign({}, MOODS[m.alias], {aliasOf:m.alias}); });
  const POSES = ['stand','wave','read','dua','sleep','clap','cheer','love','think','point','salam','twirl'];
  const POSE_CLASSES = ['av-sleeping','av-jumping','av-twirling'];
  const PARTS = ['hearts','sparkles','sun','moon','stars','zzz','arms-idle','arms-wave','arms-book','arms-dua',
                 'eyes-open','eyes-happy','eyes-sleep','mouth-smile','mouth-open','mouth-o'];

  let uid = 0, current = 'home';
  const L = LOOK;

  function heart(x,y,s,c){
    return `<path transform="translate(${x} ${y}) scale(${s})" fill="${c}" d="M0 3C0-1-6-1-6 3C-6 7 0 10 0 12C0 10 6 7 6 3C6-1 0-1 0 3Z"/>`;
  }
  function star(x,y,s,c,cls){
    return `<path class="${cls||''}" transform="translate(${x} ${y}) scale(${s})" fill="${c}" d="M0-10L2.5-2.5L10 0L2.5 2.5L0 10L-2.5 2.5L-10 0L-2.5-2.5Z"/>`;
  }
  // كيرلي: دواير متراصّة حوالين الراس
  function curls(){
    const pts = [[78,118,24],[72,150,24],[78,182,22],[92,206,20],[88,92,22],[106,70,22],[130,56,22],[156,52,22],
                 [182,58,22],[204,74,22],[218,98,22],[226,128,24],[226,160,23],[218,188,22],[206,210,19],[64,132,16],[236,142,16]];
    return pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}"/>`).join('') +
      `<ellipse cx="150" cy="112" rx="74" ry="62"/>`;
  }
  function flower(x,y){
    let p='';
    for(let i=0;i<5;i++){
      const a=(i*72-90)*Math.PI/180;
      p+=`<circle cx="${(x+Math.cos(a)*8).toFixed(1)}" cy="${(y+Math.sin(a)*8).toFixed(1)}" r="7" fill="${L.flower}" stroke="${L.flowerMid}" stroke-width="1.5"/>`;
    }
    return `<g class="av-flower">${p}<circle cx="${x}" cy="${y}" r="5" fill="${L.flowerMid}"/></g>`;
  }

  function build(mood, opts){
    opts = opts || {};
    const m = MOODS[mood] || MOODS.home;
    const id = 'avc' + (++uid);
    const vis = p => m.show.indexOf(p) >= 0 ? '' : ' style="display:none"';
    const part = (name, inner) => `<g data-part="${name}"${vis(name)}>${inner}</g>`;
    const look = m.look === 'down' ? 'translate(0 5)' : m.look === 'up' ? 'translate(3 -5)' : 'translate(0 0)';

    return `<svg class="av-svg ${m.cls||''}" data-mood="${mood}" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="مريم">
<defs><clipPath id="${id}"><circle cx="150" cy="150" r="146"/></clipPath></defs>
<circle class="av-bg" cx="150" cy="150" r="146" fill="${m.bg}"/>
<g clip-path="url(#${id})">
  ${part('hearts', `<g class="av-float">${heart(46,70,1.6,'#f7a8c8')}${heart(254,88,1.3,'#d6b0f0')}${heart(256,214,1.5,'#f7a8c8')}${heart(40,212,1.2,'#d6b0f0')}</g>`)}
  ${part('sparkles', `${star(52,74,1,'#e3c0ff','av-twinkle')}${star(250,70,1.2,'#f7a8c8','av-twinkle d2')}${star(254,190,.9,'#e3c0ff','av-twinkle d3')}`)}
  ${part('sun', `<g class="av-sun"><g class="av-rays" stroke="#ffc86b" stroke-width="5" stroke-linecap="round">
      <line x1="248" y1="30" x2="248" y2="20"/><line x1="248" y1="94" x2="248" y2="104"/><line x1="216" y1="62" x2="206" y2="62"/><line x1="280" y1="62" x2="290" y2="62"/>
      <line x1="225" y1="39" x2="218" y2="32"/><line x1="271" y1="85" x2="278" y2="92"/><line x1="271" y1="39" x2="278" y2="32"/><line x1="225" y1="85" x2="218" y2="92"/></g>
      <circle cx="248" cy="62" r="22" fill="#ffd98a"/></g>`)}
  ${part('moon', `<path fill="#fff1b8" d="M246 32A30 30 0 1 0 270 86A24 24 0 1 1 246 32Z"/>`)}
  ${part('stars', `${star(56,60,.9,'#fff6cf','av-twinkle')}${star(86,32,.6,'#fff6cf','av-twinkle d2')}${star(42,118,.6,'#fff6cf','av-twinkle d3')}${star(262,140,.7,'#fff6cf','av-twinkle d2')}`)}

  ${part('confetti', `<g class="av-confetti"><rect x="50" y="60" width="10" height="5" rx="2" fill="#f7a8c8" transform="rotate(30 55 62)"/><rect x="240" y="70" width="10" height="5" rx="2" fill="#c9a3ec" transform="rotate(-25 245 72)"/><rect x="70" y="190" width="9" height="5" rx="2" fill="#ffd27a" transform="rotate(60 74 192)"/><rect x="232" y="180" width="9" height="5" rx="2" fill="#f7a8c8" transform="rotate(-50 236 182)"/><circle cx="96" cy="40" r="4" fill="#c9a3ec"/><circle cx="206" cy="36" r="4" fill="#ffd27a"/><circle cx="40" cy="128" r="4" fill="#ffd27a"/><circle cx="262" cy="124" r="4" fill="#c9a3ec"/></g>`)}
  ${part('thought', `<g class="av-float"><circle cx="232" cy="110" r="5" fill="#fff"/><circle cx="242" cy="92" r="8" fill="#fff"/><circle cx="246" cy="62" r="20" fill="#fff" stroke="#e3c0ff" stroke-width="2"/><text x="246" y="72" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="700" fill="#b98ad9">?</text></g>`)}
  ${part('notes', `<g fill="#b98ad9" font-family="sans-serif" font-weight="700"><text class="av-z" x="44" y="96" font-size="30">♪</text><text class="av-z d2" x="236" y="80" font-size="34">♫</text><text class="av-z d3" x="248" y="190" font-size="26">♪</text></g>`)}

  <g class="av-figure">
    <rect x="141" y="194" width="18" height="26" rx="6" fill="${L.skin}"/>
    <!-- فستان تُل -->
    <path fill="${L.dress}" d="M108 300Q110 240 126 216L174 216Q190 240 192 300Z"/>
    <path fill="${L.tulle}" opacity=".85" d="M84 300Q96 262 118 252L182 252Q204 262 216 300Z"/>
    <path fill="${L.dressHi}" d="M126 216L174 216L178 252L122 252Z"/>
    <g fill="#fff" opacity=".7"><circle cx="136" cy="228" r="2.2"/><circle cx="150" cy="234" r="2.2"/><circle cx="164" cy="228" r="2.2"/><circle cx="143" cy="242" r="2.2"/><circle cx="157" cy="242" r="2.2"/></g>
    <circle cx="172" cy="248" r="8" fill="${L.flower}" stroke="${L.flowerMid}" stroke-width="2"/>

    <g class="av-head">
      <g fill="${L.hair}">${curls()}</g>
      <g fill="${L.hairHi}" opacity=".55"><circle cx="96" cy="84" r="8"/><circle cx="214" cy="112" r="7"/><circle cx="84" cy="168" r="6"/></g>
      <ellipse cx="150" cy="138" rx="58" ry="62" fill="${L.skin}"/>
      <!-- غُرّة كيرلي -->
      <g fill="${L.hair}"><circle cx="108" cy="92" r="20"/><circle cx="130" cy="80" r="20"/><circle cx="154" cy="78" r="19"/><circle cx="178" cy="84" r="19"/><circle cx="196" cy="98" r="17"/><circle cx="96" cy="114" r="14"/><circle cx="206" cy="120" r="13"/></g>
      ${flower(150,62)}
      <g class="av-look" transform="${look}">
        ${part('eyes-open', `<g class="av-blink"><ellipse cx="128" cy="140" rx="9" ry="11" fill="${L.eyes}"/><ellipse cx="172" cy="140" rx="9" ry="11" fill="${L.eyes}"/>
          <circle cx="131" cy="136" r="3.2" fill="#fff"/><circle cx="175" cy="136" r="3.2" fill="#fff"/></g>`)}
      </g>
      ${part('eyes-happy', `<g fill="none" stroke="${L.eyes}" stroke-width="4.5" stroke-linecap="round"><path d="M118 143Q128 132 138 143"/><path d="M162 143Q172 132 182 143"/></g>`)}
      ${part('eyes-sleep', `<g fill="none" stroke="${L.eyes}" stroke-width="4" stroke-linecap="round"><path d="M118 140Q128 148 138 140"/><path d="M162 140Q172 148 182 140"/></g>`)}
      <g fill="none" stroke="${L.eyes}" stroke-width="2.5" stroke-linecap="round" opacity=".7"><path d="M118 124Q128 119 137 123"/><path d="M163 123Q172 119 182 124"/></g>
      <ellipse cx="112" cy="162" rx="11" ry="7" fill="${L.cheeks}" opacity=".5"/><ellipse cx="188" cy="162" rx="11" ry="7" fill="${L.cheeks}" opacity=".5"/>
      <path d="M147 156Q150 159 153 156" fill="none" stroke="${L.skinShade}" stroke-width="2.5" stroke-linecap="round"/>
      ${part('mouth-smile', `<path d="M138 170Q150 182 162 170" fill="none" stroke="${L.lips}" stroke-width="4" stroke-linecap="round"/>`)}
      ${part('mouth-open', `<path d="M136 168Q150 190 164 168Z" fill="${L.lips}"/><path d="M140 169L160 169L158 173L142 173Z" fill="#fff"/>`)}
      ${part('mouth-o', `<ellipse cx="150" cy="172" rx="5" ry="4" fill="${L.lips}"/>`)}
    </g>

    ${part('arms-idle', `<g stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"><path d="M124 224Q110 248 106 272"/><path d="M176 224Q190 248 194 272"/></g>
      <circle cx="106" cy="276" r="9" fill="${L.skin}"/><circle cx="194" cy="276" r="9" fill="${L.skin}"/>`)}
    ${part('arms-wave', `<g stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"><path d="M124 224Q110 248 106 272"/></g><circle cx="106" cy="276" r="9" fill="${L.skin}"/>
      <g class="av-wave"><path d="M176 224Q204 214 218 186" stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"/><circle cx="221" cy="180" r="11" fill="${L.skin}"/></g>`)}
    ${part('arms-book', `<g class="av-book"><g stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"><path d="M124 224Q108 246 112 264"/><path d="M176 224Q192 246 188 264"/></g>
      <path fill="${L.accent}" d="M106 250L150 258L194 250L194 288L150 296L106 288Z"/>
      <path fill="#fff" d="M112 252L150 259L150 290L112 283Z"/><path fill="#fff" d="M188 252L150 259L150 290L188 283Z"/>
      <g stroke="#e3c0ff" stroke-width="2"><line x1="118" y1="262" x2="144" y2="267"/><line x1="118" y1="270" x2="144" y2="275"/><line x1="182" y1="262" x2="156" y2="267"/><line x1="182" y1="270" x2="156" y2="275"/></g>
      <circle cx="110" cy="268" r="9" fill="${L.skin}"/><circle cx="190" cy="268" r="9" fill="${L.skin}"/></g>`)}
    ${part('arms-dua', `<g class="av-dua"><g stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"><path d="M124 226Q108 234 122 216"/><path d="M176 226Q192 234 178 216"/></g>
      <ellipse cx="126" cy="211" rx="14" ry="9" transform="rotate(-25 126 211)" fill="${L.skin}"/><ellipse cx="174" cy="211" rx="14" ry="9" transform="rotate(25 174 211)" fill="${L.skin}"/></g>`)}
    ${part('arms-clap', `<g class="av-clapL"><path d="M124 226Q110 248 140 242" stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"/><circle cx="143" cy="238" r="10" fill="${L.skin}"/></g>
      <g class="av-clapR"><path d="M176 226Q190 248 160 242" stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"/><circle cx="157" cy="238" r="10" fill="${L.skin}"/></g>`)}
    ${part('arms-cheer', `<g class="av-cheer" stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"><path d="M124 224Q100 206 90 176"/><path d="M176 224Q200 206 210 176"/></g>
      <circle cx="88" cy="170" r="11" fill="${L.skin}"/><circle cx="212" cy="170" r="11" fill="${L.skin}"/>`)}
    ${part('arms-heart', `<g stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"><path d="M124 226Q116 250 132 252"/><path d="M176 226Q184 250 168 252"/></g>
      <g class="av-beat"><path transform="translate(150 222) scale(3.4)" fill="#e2669c" d="M0 3C0-1-6-1-6 3C-6 7 0 10 0 12C0 10 6 7 6 3C6-1 0-1 0 3Z"/><circle cx="141" cy="236" r="3" fill="#fff" opacity=".7"/></g>
      <circle cx="131" cy="250" r="9" fill="${L.skin}"/><circle cx="169" cy="250" r="9" fill="${L.skin}"/>`)}
    ${part('arms-think', `<g stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"><path d="M124 224Q110 248 106 272"/><path d="M176 226Q210 226 198 186"/></g>
      <circle cx="106" cy="276" r="9" fill="${L.skin}"/><circle cx="196" cy="180" r="10" fill="${L.skin}"/><path d="M193 172L188 160" stroke="${L.skin}" stroke-width="7" stroke-linecap="round"/>`)}
    ${part('arms-point', `<g stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"><path d="M124 224Q110 248 106 272"/><path class="av-pointarm" d="M176 226Q206 232 234 220"/></g>
      <circle cx="106" cy="276" r="9" fill="${L.skin}"/><g class="av-pointhand"><circle cx="238" cy="218" r="10" fill="${L.skin}"/><path d="M244 214L258 208" stroke="${L.skin}" stroke-width="7" stroke-linecap="round"/></g>`)}
    ${part('arms-chest', `<g stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"><path d="M124 224Q110 248 106 272"/><path d="M176 226Q192 250 168 244"/></g>
      <circle cx="106" cy="276" r="9" fill="${L.skin}"/><ellipse cx="162" cy="240" rx="13" ry="10" fill="${L.skin}"/>`)}
    ${part('arms-twirl', `<g stroke="${L.skin}" stroke-width="15" stroke-linecap="round" fill="none"><path d="M124 226Q100 238 78 228"/><path d="M176 226Q200 238 222 228"/></g>
      <circle cx="74" cy="226" r="10" fill="${L.skin}"/><circle cx="226" cy="226" r="10" fill="${L.skin}"/>`)}
  </g>
  ${part('zzz', `<g fill="#8f6cc7" font-family="sans-serif" font-weight="700"><text class="av-z" x="186" y="100" font-size="22">z</text><text class="av-z d2" x="202" y="76" font-size="28">z</text><text class="av-z d3" x="220" y="50" font-size="34">z</text></g>`)}
</g>
</svg>`;
  }

  function apply(svg, mood){
    const m = MOODS[mood] || MOODS.home;
    svg.setAttribute('data-mood', mood);
    POSE_CLASSES.forEach(c=>svg.classList.toggle(c, m.cls === c));
    svg.querySelector('.av-bg').setAttribute('fill', m.bg);
    const lk = svg.querySelector('.av-look'); if(lk) lk.setAttribute('transform', m.look==='down' ? 'translate(0 5)' : m.look==='up' ? 'translate(3 -5)' : 'translate(0 0)');
    svg.querySelectorAll('[data-part]').forEach(g=>{
      g.style.display = m.show.indexOf(g.getAttribute('data-part')) >= 0 ? '' : 'none';
    });
    // نطّة صغيرة مع تغيير المود
    const host = svg.parentNode;
    if(host && host.classList){ host.classList.remove('av-pop'); void host.offsetWidth; host.classList.add('av-pop'); }
  }

  function applyAll(mood){
    document.querySelectorAll('[data-avatar]').forEach(el=>{
      const fixed = el.getAttribute('data-avatar-fixed');
      const s = el.querySelector('svg'); if(s) apply(s, fixed || mood);
    });
  }
  let reactTimer = null;

  root.Avatar = {
    LOOK, MOODS, POSES, svg: build,
    mountAll(){ document.querySelectorAll('[data-avatar]').forEach(el=>{
      el.innerHTML = build(el.getAttribute('data-avatar-fixed') || current); }); },
    setMood(mood){
      if(reactTimer){ clearTimeout(reactTimer); reactTimer=null; }
      if(!MOODS[mood]) mood='home';
      current = mood;
      applyAll(mood);
    },
    // حركة مؤقتة (تفاعل) ترجع بعدها لمود الشاشة الأساسي
    react(mood, ms){
      if(!MOODS[mood]) return;
      applyAll(mood);
      if(reactTimer) clearTimeout(reactTimer);
      reactTimer = setTimeout(()=>{ reactTimer=null; applyAll(current); }, ms||1500);
    },
    mood(){ return current; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
