// 批次校準:模擬「像真人」的玩法跑多段生涯,每段輸出一行 JSON(寫到 stdout)
// 用法:node calib.js 段數 種子前綴 [起始編號]   (jsdom 一個程序最多跑約 40 段,太多會記憶體不足)
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const N=+process.argv[2]||20, SEEDP=process.argv[3]||'cal', K0=+process.argv[4]||0;
const pos=['GK','DF','MF','FW'], nats=['TW','JP','KR','AU','CN','VN','TH','EN','ES','FR','DE','IT','PT','NL','HR','BR','AR','UY','CO','US','MX','CA','MA','SN','NG','EG','CV','ID','SA'];
const R=a=>a[Math.floor(Math.random()*a.length)];
(async()=>{ for(let k=K0;k<K0+N;k++){
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed='+SEEDP+k,pretendToBeVisual:true});
  const w=dom.window,d=w.document; w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=function(){}; let err=null;
  w.addEventListener('error',e=>{ err=String(e.error&&e.error.message||e.message); });
  const nat=nats[(k*7+3)%nats.length], ps=pos[k%4];
  d.querySelector(`[data-v="${ps}"]`).click(); d.querySelector(`[data-v="${nat}"]`).click(); d.getElementById('btn-start').click();
  let steps=0, idle=0;
  while(steps++<8000){
    const S=w.eval('S'); if(!S||S.done)break;
    /* 加點:依位置權重投關鍵能力 */
    const pl=[...d.querySelectorAll('#act .abrow')].map(r=>({r,b:r.querySelector('.pl:not([disabled])'),n:(r.querySelector('.nm')||r).textContent})).filter(x=>x.b);
    if(pl.length){ const W=w.eval('DP_W[S.dpos]'), ABL=w.eval('ABL');
      const sc=x=>{ const k=Object.keys(ABL).find(k=>x.n.includes(ABL[k])); return (W[k]||0)+Math.random()*0.15; };
      pl.sort((a,b)=>sc(b)-sc(a))[0].b.click(); continue; }
    /* 訓練卡:星數多的優先 */
    const tb=d.querySelector('#tb .btn'), tc=[...d.querySelectorAll('#act .tcard')].filter(x=>!/\bsel\b|\bon\b/.test(x.className));
    if(tc.length&&tb&&tb.disabled){ const st=x=>{ const t=x.querySelector('.tpow'); return t?t.childNodes[0].textContent.length+(x.classList.contains('key')?1.5:0)+Math.random():0; };
      tc.sort((a,b)=>st(b)-st(a))[0].click(); continue; }
    let bs=[...d.querySelectorAll('#act .btn:not([disabled])')].filter(b=>!/回到報價清單/.test(b.textContent));
    if(!bs.length){ if(idle++>40)break; await new Promise(r=>setTimeout(r,40)); continue; } idle=0;
    const S2=w.eval('S');
    /* 年輕時不主動引退、不放棄職業 */
    if(S2.age<33){ const keep=bs.filter(b=>!/引退|不踢職業|退出國家隊/.test(b.textContent)); if(keep.length)bs=keep; }
    /* 有成功率的選項:挑期望值最高(成功點數 − 失敗代價) */
    const withP=bs.map(b=>{ const rb=b.querySelector('.ring b'), m=rb?[0,parseInt(rb.textContent)]:b.textContent.match(/成功率 (\d+)%/); /* v0.23 起成功率在戰術卡圓環裡 */ const t=b.textContent; const mag=/冒險/.test(t)?3:/穩健/.test(t)?1:2; return {b,p:m?+m[1]/100:null,mag,bold:/冒險/.test(t)}; });
    if(withP.every(x=>x.p!=null)&&withP.length>1){ withP.sort((a,b)=>(b.p*b.mag-(1-b.p)*(b.bold?1.5:0.5)+Math.random()*0.3)-(a.p*a.mag-(1-a.p)*(a.bold?1.5:0.5)+Math.random()*0.3)); withP[0].b.click(); continue; }
    /* 報價:挑年薪最高 */
    const offers=bs.filter(b=>/年薪約/.test(b.textContent));
    if(offers.length>1){ const money=b=>{ const m=b.textContent.match(/年薪約 ([\d,億萬]+)/); if(!m)return 0; const s=m[1]; const y=s.match(/(\d+)億/), wan=s.match(/([\d,]+)萬/); return (y?+y[1]*10000:0)+(wan?+wan[1].replace(/,/g,''):0); };
      offers.sort((a,b)=>money(b)-money(a)+Math.random()*50); offers[0].click(); continue; }
    R(bs).click();
  }
  const out=w.eval(`(()=>{ const pro=S.log.filter(r=>r.lv&&r.st.App>0); const rts=pro.map(r=>r.st.Rt);
    return {k:${k},nat:S.nat,pos:S.grp,age:S.age,done:!!S.done,score:careerScore(),peakOvr:S.peakOvr||ovr(),peakRt:rts.length?Math.max(...rts):0,
      avgRt:rts.length?+(rts.reduce((a,b)=>a+b,0)/rts.length).toFixed(2):0,seasons:pro.length,caps:S.caps,
      traits:Object.keys(S.traits).filter(t=>S.traits[t]),honors:S.honors,top5:pro.filter(r=>LV[r.lv].top5).length,
      Y:pro.reduce((a,r)=>a+(r.st.Y||0),0),R:pro.reduce((a,r)=>a+(r.st.R||0),0),acad:S.acad?(S.acad.foreign?'foreign':'home'):null,acadOut:S.acadOut||null,acadGrad:!!S.acadGrad,boughtBack:!!S.boughtBack,clubs:new Set(pro.filter(r=>!r.loan).map(r=>r.tm)).size,ach:(typeof ACH!=='undefined'?ACH.filter(a=>achLevel(a,achCtx([]))).map(a=>a.id):[])}; })()`);
  out.err=err; process.stdout.write(JSON.stringify(out)+'\n');
  w.close(); } })();
