// 主帥適配分布:舊公式(風格能力 − OVR)vs 新公式(風格能力 − 全能力平均)
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed=fit',pretendToBeVisual:true});
const w=dom.window,d=w.document;w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=function(){};
d.querySelector('[data-v="DF"]').click();d.querySelector('[data-v="TW"]').click();d.getElementById('btn-start').click();
console.log(w.eval(`(()=>{ const out=[]; for(const dp of Object.keys(DP_W)){ S.dpos=dp; S.grp=DP_GRP[dp]; S.age=26; const pool=GRP_AB[S.grp]; S.ab={}; GRP_AB[S.grp].forEach(k=>S.ab[k]=0);
  const old={},nw={},ofr={}; for(let t=0;t<400;t++){ pool.forEach(k=>S.ab[k]=Math.round(48+Math.random()*14+(DP_W[dp][k]||0)*35)); 
    for(const st of ['press','possess','counter','direct']){ const f=coachFit({st}); old[f]=(old[f]||0)+1; const n=(true)?coachFit({st}):0; nw[n]=(nw[n]||0)+1; }
    if(typeof newCoach==='function'&&typeof offerCoach==='function'){ const c=offerCoach(); const f=coachFit(c); ofr[f]=(ofr[f]||0)+1; } }
  out.push(dp+' 舊 '+JSON.stringify(old)+' 新 '+JSON.stringify(nw)+' 報價 '+JSON.stringify(ofr)); } return out.join(' ## '); })()`));process.exit(0);
