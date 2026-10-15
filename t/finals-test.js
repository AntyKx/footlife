// 決賽流程測試:強制每一輪都晉級(R 回傳 0),直接呼叫世界盃與歐冠,隨機點選直到結束,抓錯誤並列出卡片標題
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
(async()=>{ for(const pos of ['FW','GK']){ for(const lucky of [true,false]){
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed=fin',pretendToBeVisual:true});
  const w=dom.window,d=w.document; w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=function(){}; const errs=[];
  w.addEventListener('error',e=>errs.push(String(e.error&&e.error.stack||e.message)));
  d.querySelector(`[data-v="${pos}"]`).click(); d.querySelector('[data-v="JP"]').click(); d.getElementById('btn-start').click();
  w.eval(`S.stage='PRO'; S.lv='ENG'; S.club='兵工廠'; S.clubTier=1; S.ntOn=true; S.ct={yrs:3,mult:1,lv:'ENG'}; S.lastSt={role:'主力',App:30};
    ${lucky?"R=()=>0.001;":""} window.__done=0;
    playTourney(T_WC,2030,true,false,()=>{ window.__done++; });`);
  let k=0; while(k++<400&&!w.__done){ const bs=[...d.querySelectorAll('#act .btn:not([disabled])')]; if(!bs.length)break; bs[Math.floor(Math.random()*bs.length)].click(); }
  w.eval(`window.__d2=0; S.contPlan={y:S.year,club:S.club,n:'歐冠'}; clubCups(()=>{ window.__d2=1; });`);
  k=0; while(k++<400&&!w.__d2){ const bs=[...d.querySelectorAll('#act .btn:not([disabled])')]; if(!bs.length)break; bs[Math.floor(Math.random()*bs.length)].click(); }
  const titles=[...d.querySelectorAll('.card h4')].map(h=>h.textContent).filter(t=>/世界盃|歐冠|決賽|點球|冠軍/.test(t));
  console.log(pos,lucky?'lucky':'normal','WCdone',w.__done,'CLdone',w.__d2,'\n  '+titles.join(' / '));
  console.log('  honors:',w.eval('S.honors.join("、")'));
  if(errs.length)console.log('ERR',errs.slice(0,3).join('\n'));
  w.close(); } } })();
