// 校準結果分析:讀 calib.js 輸出的 JSON 行(可多個檔案),列出五帶門檻建議、特質比例、評分分布、各國統計
// 用法:node analyze.js 檔案1.jsonl 檔案2.jsonl ...
const fs=require('fs');
const rows=process.argv.slice(2).flatMap(f=>fs.readFileSync(f,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l)));
const n=rows.length, pct=(a,p)=>{ const s=[...a].sort((x,y)=>x-y); return s[Math.min(s.length-1,Math.floor(p/100*s.length))]; };
const fmt=x=>(x*100).toFixed(1)+'%';
console.log(`段數 ${n}｜錯誤 ${rows.filter(r=>r.err).length}｜未正常結束 ${rows.filter(r=>!r.done).length}`);
const sc=rows.map(r=>r.score);
console.log(`\n生涯分 p25/p50/p65/p90/p98/max：${[25,50,65,90,98].map(p=>pct(sc,p)).join(' / ')} / ${Math.max(...sc)}`);
console.log(`建議 TIER_TH（傳奇 p98、巨星 p90、主力 p65、浮沉 p25）：[${[98,90,65,25].map(p=>pct(sc,p)).join(',')}]`);
const pr=rows.filter(r=>r.peakRt).map(r=>r.peakRt), ar=rows.filter(r=>r.avgRt).map(r=>r.avgRt);
console.log(`\n巔峰單季評分 p50/p90/p98/max：${[50,90,98].map(p=>pct(pr,p)).join(' / ')} / ${Math.max(...pr)}`);
console.log(`生涯平均評分 p50/p90：${pct(ar,50)} / ${pct(ar,90)}｜巔峰綜合 p50/p90：${pct(rows.map(r=>r.peakOvr),50)} / ${pct(rows.map(r=>r.peakOvr),90)}`);
console.log(`引退年齡 p50：${pct(rows.map(r=>r.age),50)}｜職業季數 p50：${pct(rows.map(r=>r.seasons),50)}｜踢過五大 ${fmt(rows.filter(r=>r.top5>0).length/n)}`);
const tc={}; rows.forEach(r=>r.traits.forEach(t=>tc[t]=(tc[t]||0)+1));
console.log('\n特質：'+Object.entries(tc).sort((a,b)=>b[1]-a[1]).map(([t,c])=>`${t} ${fmt(c/n)}`).join('、'));
const has=(r,re)=>r.honors.some(h=>re.test(h));
const aw=[['金球獎',/\d 金球獎$/],['洲足球先生',/足球先生|年度最佳球員$/],['聯賽最佳球員',/[^盃]最佳球員$/],['聯賽金靴',/[^盃]金靴$/],['聯賽冠軍',/聯賽?冠軍（|[超甲乙丙]冠軍（|J1冠軍|K1冠軍|英冠冠軍/],
  ['世界盃參賽',/世界盃（/],['世界盃冠軍',/世界盃（冠軍/],['世界盃獎項',/世界盃(金球獎|金靴|金手套|最佳年輕球員)/],['歐冠冠軍',/歐冠（冠軍/],['決賽最佳球員',/決賽最佳球員/]];
console.log('\n獎項（至少一次的生涯比例）：'+aw.map(([k,re])=>`${k} ${fmt(rows.filter(r=>has(r,re)).length/n)}`).join('、'));
const pos={}; rows.forEach(r=>{ const p=pos[r.pos]||(pos[r.pos]={n:0,sc:[],y:0,rr:0,s:0,pr:[]}); p.n++; p.sc.push(r.score); p.y+=r.Y; p.rr+=r.R; p.s+=r.seasons; p.pr.push(r.peakRt); });
console.log('\n位置：'+Object.entries(pos).map(([k,p])=>`${k} 生涯分中位 ${pct(p.sc,50)}、巔峰評分中位 ${pct(p.pr,50)}、每季黃牌 ${(p.y/Math.max(1,p.s)).toFixed(1)}、生涯紅牌 ${(p.rr/p.n).toFixed(2)}`).join('\n      '));
const nat={}; rows.forEach(r=>{ const x=nat[r.nat]||(nat[r.nat]={n:0,sc:[],wc:0,t5:0}); x.n++; x.sc.push(r.score); if(has(r,/世界盃（/))x.wc++; if(r.top5)x.t5++; });
console.log('\n國籍（段數｜生涯分中位｜打過世界盃｜踢過五大）：');
Object.entries(nat).sort((a,b)=>pct(b[1].sc,50)-pct(a[1].sc,50)).forEach(([k,x])=>console.log(`  ${k} ${x.n}｜${pct(x.sc,50)}｜${fmt(x.wc/x.n)}｜${fmt(x.t5/x.n)}`));
const th=process.env.TH?JSON.parse(process.env.TH):null;
if(th){ const band=s=>s>=th[0]?0:s>=th[1]?1:s>=th[2]?2:s>=th[3]?3:4, c=[0,0,0,0,0]; sc.forEach(s=>c[band(s)]++);
  console.log(`\n用 TIER_TH=${JSON.stringify(th)}：傳奇 ${fmt(c[0]/n)}、巨星 ${fmt(c[1]/n)}、主力 ${fmt(c[2]/n)}、浮沉 ${fmt(c[3]/n)}、過客 ${fmt(c[4]/n)}`); }
const ac=rows.filter(r=>r.acad);
if(ac.length)console.log(`\n學院：${fmt(ac.length/n)}（海外 ${ac.filter(r=>r.acad==='foreign').length}）｜升上母隊 ${fmt(ac.filter(r=>r.acadGrad).length/ac.length)}｜被賣 ${fmt(ac.filter(r=>r.acadOut==='sold').length/ac.length)}｜被釋出 ${fmt(ac.filter(r=>r.acadOut==='released').length/ac.length)}｜買回 ${ac.filter(r=>r.boughtBack).length}`);
if(rows[0]&&rows[0].clubs!=null)console.log(`效力球隊數 p50：${pct(rows.map(r=>r.clubs),50)}`);
const achc={}; rows.forEach(r=>(r.ach||[]).forEach(a=>achc[a]=(achc[a]||0)+1));
if(Object.keys(achc).length)console.log('\n成就（達成生涯比例）：'+Object.entries(achc).sort((a,b)=>b[1]-a[1]).map(([k,c])=>`${k} ${fmt(c/n)}`).join('、'));
