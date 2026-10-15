// 各洲賽事測試:洲際俱樂部賽事與洲際國家隊賽事,隨機點選到結束,抓錯誤並列出卡片標題
// 用法:node regions-test.js [html 路徑,預設 ../index.html]
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
const cases=[
  ['BR','BRA','弗拉門哥','自由盃','T_COPA'],['AR','ARG','河床','南美盃','T_COPA'],['US','MLS','邁阿密國際','中北美冠軍盃','T_GOLD'],
  ['MA','MAR','卡薩布蘭卡維達德','非洲冠軍聯賽','T_AFCON'],['EG','EGY','阿赫利','非洲聯合會盃','T_AFCON'],['EN','ENG','兵工廠','歐冠','T_EURO'],['HR','CRO','札格雷布迪納摩','歐霸','T_EURO']];
(async()=>{ for(const [nat,lv,club,cl,T] of cases){
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed=rg'+nat,pretendToBeVisual:true});
  const w=dom.window,d=w.document; w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=function(){}; const errs=[];
  w.addEventListener('error',e=>errs.push(String(e.error&&e.error.message||e.message)));
  d.querySelector(`[data-v="${nat}"]`).click(); d.getElementById('btn-start').click();
  const run=async(code,flag)=>{ w.eval(code); let k=0; while(k++<300&&!w[flag]){ const bs=[...d.querySelectorAll('#act .btn:not([disabled])')]; if(!bs.length)break; bs[Math.floor(Math.random()*bs.length)].click(); } };
  w.eval(`S.stage='PRO'; S.lv='${lv}'; S.club='${club}'; S.clubTier=1; S.ntOn=true; S.ct={yrs:3,mult:1,lv:'${lv}'}; S.lastSt={role:'主力',App:30};`);
  await run(`window.__a=0; S.contPlan={y:S.year,club:S.club,n:'${cl}'}; clubCups(()=>{ window.__a=1; });`,'__a');
  await run(`window.__b=0; contCupCycle(${T},2031,()=>{ window.__b=1; });`,'__b');
  await run(`window.__c=0; yearAwards(); intlYear(2030,()=>{ window.__c=1; });`,'__c');
  const t=[...d.querySelectorAll('.card h4')].map(h=>h.textContent).filter(x=>/盃|聯賽|冠軍|世界盃|獎|先生|國家盃/.test(x));
  console.log(nat,cl,'done',w.__a,w.__b,w.__c,errs.length?'ERR '+errs[0]:'','\n  '+t.slice(0,14).join(' / '));
  w.close(); } })();
