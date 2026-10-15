// 快速冒煙測試:隨機點選跑完數段生涯,抓執行錯誤並統計新內容出現次數(不是平衡校準)
// 用法:cd t && npm install && node smoke.js [段數=7] [種子前綴=smk]
// 位置依序輪 GK/DF/MF/FW、國籍輪 7 國;每段約 10–20 秒
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const N=+process.argv[2]||7, SEEDP=process.argv[3]||'smk';
const tally={}; let errs=[];
const pos=['GK','DF','MF','FW'], nats=['TW','JP','KR','AU','CN','VN','TH'];
(async()=>{for(let k=0;k<N;k++){
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed='+SEEDP+k,pretendToBeVisual:true});
  const w=dom.window; w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=function(){};
  w.addEventListener('error',e=>errs.push(String(e.error&&e.error.stack||e.message)));
  const d=w.document;
  try{
    d.querySelector(`[data-v="${pos[k%4]}"]`).click(); d.querySelector(`[data-v="${nats[k%7]}"]`).click();
    const nm=d.querySelector('input'); if(nm)nm.value='測試';
    d.getElementById('btn-start').click();
    let steps=0, idle=0;
    while(steps++<6000){
      const S=w.eval('S'); if(!S||S.done)break;
      const pl=[...d.querySelectorAll('#act .pl:not([disabled])')];
      if(pl.length){ pl[Math.floor(Math.random()*pl.length)].click(); continue; }
      const bs=[...d.querySelectorAll('#act .btn:not([disabled])')].filter(b=>!/回到報價清單/.test(b.textContent));
      const tc=[...d.querySelectorAll('#act .tcard:not(.on):not(.sel)')], tb=d.querySelector('#tb .btn');
      if(tc.length&&tb&&tb.disabled){ tc[Math.floor(Math.random()*tc.length)].click(); continue; }
      if(!bs.length){ if(idle++>40)break; await new Promise(r=>setTimeout(r,60)); continue; } idle=0;
      bs[Math.floor(Math.random()*bs.length)].click();
    }
    const S=w.eval('S');
    const titles=[...d.querySelectorAll('.card')].map(c=>(c.querySelector('h3,.ch,.ttl')||c).textContent.slice(0,30));
    for(const t of titles){ const m=t.match(/^(回聲|劇情|插曲|後續|場外|關鍵時刻)/); if(m)tally[m[1]]=(tally[m[1]]||0)+1; }
    console.log(`#${k} ${pos[k%4]} ${nats[k%7]} age=${S.age} done=${S.done} steps=${steps} mem=${Object.keys(S.mem||{}).join(',')} arcs=${Object.keys(S.arcs||{}).join(',')}`);
  }catch(e){ errs.push(String(e.stack)); }
  w.close();
}
console.log('tally',JSON.stringify(tally));
console.log('errors',errs.length); [...new Set(errs)].slice(0,5).forEach(e=>console.log(e.slice(0,600)));
})();
