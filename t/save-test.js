// 存檔測試:A 局玩到第 K 次自動存檔時記下存檔,繼續玩到引退;B 局讀同一份存檔、用同樣的選擇規則玩到引退,兩局結果要一模一樣
// 選擇規則只看畫面上的按鈕文字(雜湊),所以兩局在相同畫面一定做相同選擇
// 用法:node save-test.js [段數] [種子前綴]
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const N=+process.argv[2]||4, SEEDP=process.argv[3]||'sv';
const hash=s=>{ let h=7; for(const c of s)h=(h*31+c.charCodeAt(0))|0; return Math.abs(h); };
function mk(seed){ const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed='+seed,pretendToBeVisual:true});
  const w=dom.window; w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=function(){}; w.confirm=()=>true;
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,p)=>p==='measureText'?(s=>({width:String(s).length*7})):(()=>{}),set:()=>true});
  const err=[]; w.addEventListener('error',e=>err.push(String(e.error&&e.error.stack||e.message))); return {w,d:w.document,err}; }
async function play(g,stopAt){ const {w,d}=g; let steps=0, idle=0, saves=0, snap=null, last=null;
  while(steps++<20000){ const S=w.eval('S'); if(S.done)break;
    const cur=w.localStorage.getItem('fl-save'); if(stopAt&&cur&&cur!==last){ last=cur; if(++saves===stopAt){ snap=cur; } }
    const cf=[...d.querySelectorAll('#act .btn:not([disabled])')].find(b=>/^確認/.test(b.textContent.trim())); if(cf){ cf.click(); continue; }
    const pl=[...d.querySelectorAll('#act .pl:not([disabled])')]; if(pl.length){ pl[hash(S.year+':'+(d.querySelector('#act').textContent.length))%pl.length].click(); continue; }
    const tc=[...d.querySelectorAll('#act .tcard')].filter(x=>!/\bsel\b|\bon\b/.test(x.className)); const tb=d.querySelector('#tb .btn');
    if(tc.length&&tb&&tb.disabled){ tc[hash(tc.map(x=>x.textContent).join('|'))%tc.length].click(); continue; }
    let bs=[...d.querySelectorAll('#act .btn:not([disabled])')].filter(b=>!/回到報價清單/.test(b.textContent));
    if(!bs.length){ if(idle++>40)break; await new Promise(r=>setTimeout(r,20)); continue; } idle=0;
    if(S.age<30){ const keep=bs.filter(b=>!/引退|不踢職業/.test(b.textContent)); if(keep.length)bs=keep; }
    const nx=bs.find(b=>/下一步|進入 .* 賽季/.test(b.textContent)); (nx||bs[hash(bs.map(b=>b.textContent).join('|'))%bs.length]).click(); }
  const S=w.eval('S'); return {snap,sum:JSON.stringify({age:S.age,year:S.year,club:S.club,ab:S.ab,honors:S.honors,caps:S.caps,log:S.log.length,sal:Math.round(S.salary)})}; }
(async()=>{ let bad=0;
  for(let k=0;k<N;k++){ const seed=SEEDP+k, K=3+k%5;
    const A=mk(seed); A.d.querySelector(`[data-v="${['GK','DF','MF','FW'][k%4]}"]`).click(); A.d.getElementById('btn-start').click();
    const ra=await play(A,K); if(!ra.snap){ console.log(`#${k} 沒有產生第 ${K} 次存檔`); bad++; continue; }
    const B=mk(seed); B.w.localStorage.setItem('fl-save',ra.snap); B.w.eval('resumeBox()'); B.d.getElementById('rsm-go').click();
    const rb=await play(B,0); const ok=ra.sum===rb.sum;
    if(!ok){ bad++; console.log(ra.sum+'\n'+rb.sum); }
    console.log(`#${k} 第 ${K} 次存檔讀回：${ok?'結果相同':'結果不同'}｜錯誤 A=${A.err.length} B=${B.err.length}｜存檔 ${(ra.snap.length/1024).toFixed(0)} KB`);
    if(A.err.length||B.err.length){ bad++; console.log([...A.err,...B.err].slice(0,3).join('\n')); }
    A.w.close(); B.w.close(); }
  console.log('bad',bad); })();
