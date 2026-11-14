// اتجاه القبلة من القاهرة (ثابت — الشاشة ليس بها بوصلة)
window.Qibla = (function(){
  const LAT=30.0444, LNG=31.2357;         // القاهرة
  const KLAT=21.4225, KLNG=39.8262;        // الكعبة
  function bearing(){
    const toR=d=>d*Math.PI/180, toD=r=>r*180/Math.PI;
    const dL=toR(KLNG-LNG);
    const y=Math.sin(dL)*Math.cos(toR(KLAT));
    const x=Math.cos(toR(LAT))*Math.sin(toR(KLAT))-Math.sin(toR(LAT))*Math.cos(toR(KLAT))*Math.cos(dL);
    return (toD(Math.atan2(y,x))+360)%360;
  }
  function dirName(b){
    const names=['شمال','شمال شرق','شرق','جنوب شرق','جنوب','جنوب غرب','غرب','شمال غرب'];
    return names[Math.round(b/45)%8];
  }
  return {
    init(){},
    onEnter(){
      const b=bearing();
      document.getElementById('qibla-needle').style.transform=`translate(-50%,-100%) rotate(${b}deg)`;
      document.getElementById('qibla-info').innerHTML=
        `<div>اتجاه القبلة من القاهرة:</div>
         <div><b>${b.toFixed(1)}°</b> من الشمال</div>
         <div>الجهة: <b>${dirName(b)}</b></div>
         <div style="font-size:30px;color:var(--muted);margin-top:20px">
           وجّه نفسك ناحية هذه الزاوية بدءًا من اتجاه الشمال.</div>`;
    }
  };
})();
