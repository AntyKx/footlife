// 關鍵時刻擴充測試(v0.27):隨機玩六段生涯,統計招牌動作、鎖住提示、比賽情勢選項、第二拍、結果分級、輕傷、少一人的觸發次數
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
async function play(g,st){ const {w,d}=g; let steps=0, idle=0;
  while(steps++<25000){ const S=w.eval('S'); if(S.done)break;
    const cf=[...d.querySelectorAll('#act .btn:not([disabled])')].find(b=>/^確認/.test(b.textContent.trim())); if(cf){ cf.click(); continue; }
    const pl=[...d.querySelectorAll('#act .pl:not([disabled])')]; if(pl.length){ pl[Math.floor(Math.random()*pl.length)].click(); continue; }
    const tc=[...d.querySelectorAll('#act .tcard')].filter(x=>!/\bsel\b|\bon\b/.test(x.className)); const tb=d.querySelector('#tb .btn');
    if(tc.length&&tb&&tb.disabled){ tc[0].click(); continue; }
    let bs=[...d.querySelectorAll('#act .btn:not([disabled])')].filter(b=>!/回到報價清單/.test(b.textContent));
    if(!bs.length){ if(idle++>40)break; await new Promise(r=>setTimeout(r,20)); continue; } idle=0;
    if(bs.some(b=>b.classList.contains('tac'))){ st.dec++; if(d.querySelector('#act .r-sig'))st.sigShown++; if(d.querySelector('#act .btn.lock'))st.lock++;
      if([...d.querySelectorAll('#act .tac')].some(b=>/角旗區|全員壓上|後衛前插|門將衝上去|慢慢開球/.test(b.textContent)))st.ctx++;
      const sg=d.querySelector('#act .r-sig'); if(sg&&Math.random()<.7){ st.sigPick++; sg.click(); continue; }
      const bold=bs.find(b=>b.classList.contains('r-bold')); if(bold&&Math.random()<.5){ bold.click(); continue; } }
    if(S.age<32){ const keep=bs.filter(b=>!/引退|不踢職業/.test(b.textContent)); if(keep.length)bs=keep; }
    const nx=bs.find(b=>/下一步|進入 .* 賽季/.test(b.textContent)); (nx||bs[Math.floor(Math.random()*bs.length)]).click(); } }
(async()=>{ const T={dec:0,sigShown:0,sigPick:0,lock:0,ctx:0}; let err=0;
  for(const [k,pos] of [[0,'FW'],[1,'MF'],[2,'DF'],[3,'GK'],[4,'FW'],[5,'MF']]){ const A=mk('mo'+k); A.d.querySelector(`[data-v="${pos}"]`).click(); A.d.getElementById('btn-start').click(); await play(A,T);
    const q=s=>A.d.querySelectorAll(s).length, L=A.d.getElementById('log').textContent;
    console.log(pos,'err',A.err.length,A.err.slice(0,1).join(''),'| 第二拍',q('.card.moment2.pr'),'補救',q('.card.moment2.rv'),'完美',q('.tier.perfect'),'差一點',q('.tier.near'),'大失誤',q('.tier.blunder'),'輕傷',(L.match(/🩹 輕傷/g)||[]).length,'少一人',(L.match(/少一人作戰/g)||[]).length);
    err+=A.err.length; A.w.close(); }
  console.log(JSON.stringify(T),'errors',err); })();
