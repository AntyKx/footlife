// 學院路線測試:隨機玩到 19 歲,統計學院考核結果(跳級、提前升格、被賣、被釋出、一隊升格、外租、海外學院)
// 用法:node acad-test.js [段數] [種子前綴]
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const N=+process.argv[2]||20, SEEDP=process.argv[3]||'acd', nats=['ES','EN','BR','JP','KR','AR','NL','VN','TH','US'];
(async()=>{ const tally={}, add=k=>tally[k]=(tally[k]||0)+1; let errs=0;
  for(let k=0;k<N;k++){
    const w=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed='+SEEDP+k,pretendToBeVisual:true}).window, d=w.document;
    w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=function(){}; w.addEventListener('error',()=>errs++);
    d.querySelector(`[data-v="${['GK','DF','MF','FW'][k%4]}"]`).click(); d.querySelector(`[data-v="${nats[k%nats.length]}"]`).click(); d.getElementById('btn-start').click();
    for(let i=0;i<3000;i++){ const S=w.eval('S'); if(!S||S.done||S.age>=19)break;
      const pl=[...d.querySelectorAll('#act .pl:not([disabled])')]; if(pl.length){ pl[0].click(); continue; }
      const tc=[...d.querySelectorAll('#act .tcard')], tb=d.querySelector('#tb .btn'); if(tc.length&&tb&&tb.disabled){ tc[i%tc.length].click(); continue; }
      const bs=[...d.querySelectorAll('#act .btn:not([disabled])')].filter(b=>!/回到報價/.test(b.textContent)); if(!bs.length)break;
      (bs.find(b=>b.classList.contains('main'))||bs[0]).click(); }
    const S=w.eval('S'), t=[...d.querySelectorAll('.card h4')].map(h=>h.textContent).join('|');
    if(S.acad)add(S.acad.foreign?'海外學院':'本國學院'); else add('非學院');
    ['跳級','提前升格','被賣','被釋出','一隊升格','簽約外租','學院畢業'].forEach(x=>{ if(t.includes(x))add(x); });
    w.close(); }
  console.log(JSON.stringify(tally),'errors',errs); })();
