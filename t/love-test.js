// 戀愛統計(v0.29):隨機玩 N 段生涯,統計交往到結婚的季數、交往中的事件數、求婚成敗、分手
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const N=+process.argv[2]||12, SEEDP=process.argv[3]||'lv';
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
    if([...d.querySelectorAll('#act .btn:not([disabled])')].some(b=>/限定｜/.test(b.textContent)))st.cond++; { const lk=d.querySelector('#act .btn.lock small'); if(lk&&/限定/.test(lk.textContent))st.dlock++; }
    if(bs.some(b=>b.classList.contains('tac'))){ st.dec++; if(d.querySelector('#act .r-sig'))st.sigShown++; if(d.querySelector('#act .btn.lock'))st.lock++;
      if([...d.querySelectorAll('#act .tac')].some(b=>/角旗區|全員壓上|後衛前插|門將衝上去|慢慢開球/.test(b.textContent)))st.ctx++;
      const sg=d.querySelector('#act .r-sig'); if(sg&&Math.random()<.7){ st.sigPick++; sg.click(); continue; }
      const bold=bs.find(b=>b.classList.contains('r-bold')); if(bold&&Math.random()<.5){ bold.click(); continue; } }
    if(S.age<32){ const keep=bs.filter(b=>!/引退|不踢職業/.test(b.textContent)); if(keep.length)bs=keep; }
    const nx=bs.find(b=>/下一步|進入 .* 賽季/.test(b.textContent)); (nx||bs[Math.floor(Math.random()*bs.length)]).click(); } }
(async()=>{ const T={dec:0,sigShown:0,sigPick:0,lock:0,ctx:0,cond:0,dlock:0}; let err=0; const C={}, gap=[], evs=[];
  for(let k=0;k<N;k++){ const pos=['FW','MF','DF','GK'][k%4]; const A=mk(SEEDP+k);
    A.w.eval(`(()=>{ const o=card; window.__lv=[]; card=function(c,t,b){ const L=S.love; if(L&&S.stage==='PRO')__lv.push([S.year,L.st,t,L.eng?1:0]); return o.apply(this,arguments); }; })()`);
    A.d.querySelector(`[data-v="${pos}"]`).click(); A.d.getElementById('btn-start').click(); await play(A,T);
    const lv=A.w.eval('__lv'); let st=null, n=0;
    lv.forEach(([y,s,t])=>{ if(/戀情公開|意外的緣分|青梅竹馬|異鄉的家/.test(t)){ st=y; n=0; }
      else if(st!=null&&s==='dating')n++;
      if(t==='婚禮'&&st!=null){ gap.push(y-st); evs.push(n); st=null; }
      if(/^(分手|她說「我願意」|她跑出了球場|「我還沒準備好」|還不是時候|婚禮|道歉無效|劈腿曝光)$/.test(t))C[t]=(C[t]||0)+1; });
    err+=A.err.length; if(A.err.length)console.log(A.err[0].slice(0,300)); A.w.close(); }
  console.log('交往到結婚(季)',gap.join(','),'| 期間戀愛卡',evs.join(','));
  console.log(JSON.stringify(C),'errors',err); })();
