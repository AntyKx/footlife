// 點球大戰與決賽落敗測試
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
for(const pos of ['FW','GK']) for(let r=0;r<3;r++){
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed=pk'+r,pretendToBeVisual:true});
  const w=dom.window,d=w.document; w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=function(){}; const errs=[];
  w.addEventListener('error',e=>errs.push(String(e.error&&e.error.stack||e.message)));
  d.querySelector(`[data-v="${pos}"]`).click(); d.getElementById('btn-start').click();
  w.eval(`S.stage='PRO'; S.lv='J1'; S.club='浦和紅鑽'; S.clubTier=2; window.__r=null; finalSeries({comp:'世界盃',Y:2030,me:'台灣',opp:'巴西',par:60,base:0.3,path:['小組賽 勝勝和']},x=>{ window.__r=x; });`);
  let k=0; while(k++<50&&!w.__r){ const bs=[...d.querySelectorAll('#act .btn:not([disabled])')]; if(!bs.length)break; bs[Math.floor(Math.random()*bs.length)].click(); }
  const t=[...d.querySelectorAll('.card h4')].map(h=>h.textContent).filter(x=>/決賽|點球|冠軍/.test(x));
  console.log(pos,JSON.stringify(w.__r),t.join(' / '),errs.length?'ERR '+errs[0]:'');
  w.close(); }
