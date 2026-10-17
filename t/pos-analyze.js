const fs=require('fs');const rows=[];for(const f of process.argv.slice(2))for(const l of fs.readFileSync(f,'utf8').split('\n'))if(l.trim())rows.push(JSON.parse(l));
const med=a=>{a=a.slice().sort((x,y)=>x-y);return a[Math.floor(a.length/2)]};const avg=a=>(a.reduce((s,x)=>s+x,0)/a.length).toFixed(2);
const P=['GK','DF','MF','FW'];
const keys={最佳球員:/[^決]最佳球員$|聯賽最佳球員$/,金靴金手套:/金靴|金手套/,最佳陣容:/年度最佳陣容/,年輕:/最佳年輕球員/,聯賽冠軍:/(聯賽|超|甲|乙|J1|K1|英冠)[^（]*冠軍（/,決賽MVP:/決賽最佳球員/,洲先生:/足球先生|年度最佳球員/};
for(const p of P){const r=rows.filter(x=>x.pos===p);const o={n:r.length,score:med(r.map(x=>x.score)),peakRt:med(r.map(x=>x.peakRt)),avgRt:med(r.map(x=>x.avgRt)),peakOvr:med(r.map(x=>x.peakOvr))};
for(const k in keys)o[k]=avg(r.map(x=>x.honors.filter(h=>keys[k].test(h)).length));console.log(p,JSON.stringify(o));}
const all=rows;const has=re=>(all.filter(x=>x.honors.some(h=>re.test(h))).length/all.length*100).toFixed(1)+'%';
console.log('任何冠軍（',has(/冠軍（/),'聯賽冠軍',has(/[^盃]冠軍（/),'盃賽冠軍',has(/盃冠軍（/),'世界盃參賽',has(/世界盃（/),'決賽MVP',has(/決賽最佳球員/));
const cnt=re=>avg(all.map(x=>x.honors.filter(h=>re.test(h)).length));console.log('每段平均聯賽冠軍',cnt(/[^盃]冠軍（/),'盃冠',cnt(/盃冠軍（/));
