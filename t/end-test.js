// 生涯結算測試:隨機玩到引退,再一路點完結算畫面(記者會→引退之後→章節→數據→歷史地位→評價→結算圖),抓錯誤並印出結算文字
// 用法:node end-test.js [段數] [種子前綴] [國籍,可逗號分隔] [--text]
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const N=+process.argv[2]||4, SEEDP=process.argv[3]||'end', NATS=process.argv[4]&&process.argv[4]!=='-'?process.argv[4].split(','):null, TEXT=process.argv.includes('--text');
const pos=['GK','DF','MF','FW'], R=a=>a[Math.floor(Math.random()*a.length)];
(async()=>{ let errs=0;
  for(let k=0;k<N;k++){
    const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed='+SEEDP+k,pretendToBeVisual:true});
    const w=dom.window,d=w.document; w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=function(){}; w.confirm=()=>true;
    w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(t,p)=>p==='measureText'?(s=>({width:String(s).length*7})):(()=>{}),set:()=>true});
    w.HTMLCanvasElement.prototype.toDataURL=()=>'data:,';
    const err=[]; w.addEventListener('error',e=>err.push(String(e.error&&e.error.stack||e.message)));
    const ps=pos[k%4]; d.querySelector(`[data-v="${ps}"]`).click();
    if(NATS)d.querySelector(`[data-v="${NATS[k%NATS.length]}"]`).click();
    d.getElementById('btn-start').click();
    let steps=0, idle=0, sharing=false;
    while(steps++<9000){
      const S=w.eval('S');
      const pl=[...d.querySelectorAll('#act .pl:not([disabled])')]; if(pl.length){ R(pl).click(); continue; }
      const tc=[...d.querySelectorAll('#act .tcard')].filter(x=>!/\bsel\b|\bon\b/.test(x.className)); const tb=d.querySelector('#tb .btn');
      if(tc.length&&tb&&tb.disabled){ R(tc).click(); continue; }
      let bs=[...d.querySelectorAll('#act .btn:not([disabled])')].filter(b=>!/回到報價清單/.test(b.textContent));
      if(S.done){ const sh=bs.find(b=>/產生結算圖/.test(b.textContent)); if(sh){
          /* 先開收藏櫃再關掉,按鈕要還在 */
          bs.find(b=>/收藏櫃/.test(b.textContent)).click(); d.getElementById('achp-x').click(); await new Promise(r=>setTimeout(r,30));
          const sh2=[...d.querySelectorAll('#act .btn')].find(b=>/產生結算圖/.test(b.textContent)); if(!sh2){ err.push('收藏櫃關掉後按鈕不見了'); break; }
          sh2.click(); await new Promise(r=>setTimeout(r,30));
          const b3=[...d.querySelectorAll('#act .btn')]; b3.find(b=>/收藏櫃/.test(b.textContent)).click(); d.getElementById('achp-x').click(); await new Promise(r=>setTimeout(r,30));
          if(![...d.querySelectorAll('#act .btn')].some(b=>/重新開始/.test(b.textContent)))err.push('結算圖後開收藏櫃按鈕不見了');
          sharing=true; break; }
        const nx=bs.find(b=>/下一步|▸/.test(b.textContent)); if(nx){ nx.click(); continue; } }
      if(!bs.length){ if(idle++>40)break; await new Promise(r=>setTimeout(r,30)); continue; } idle=0;
      if(!S.done&&S.age<30){ const keep=bs.filter(b=>!/引退|不踢職業/.test(b.textContent)); if(keep.length)bs=keep; }
      R(bs).click();
    }
    const S=w.eval('S'), txt=[...d.querySelectorAll('#log .scr')].slice(-6).map(s=>s.innerText||s.textContent).join('\n');
    const chap=d.querySelectorAll('.card.chap').length, hb=d.querySelectorAll('.hb').length, tiles=d.querySelectorAll('.tile').length;
    console.log(`#${k} ${S.grp} ${S.nat} 引退 ${S.age} 歲 done=${S.done} 結算圖=${sharing} 章節=${chap} 歷史榜=${hb} 數據磚=${tiles} 精華=${d.querySelectorAll(".hlrow").length}（灰字 ${d.querySelectorAll(".hlrow .hlq").length}） 錯誤=${err.length}`);
    if(err.length){ errs+=err.length; console.log(err.slice(0,3).join('\n')); }
    if(TEXT)console.log([...d.querySelectorAll('.card')].slice(-30).map(c=>c.textContent.replace(/\s+/g,' ').trim()).filter(t=>t).slice(-24).join('\n')+'\n');
    w.close(); }
  console.log('errors',errs); })();
