// 位置代表數據:各細分位置在不同能力差下的數值與排名分布
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed=adv',pretendToBeVisual:true});
const w=dom.window,d=w.document;w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=function(){};let err=null;w.addEventListener('error',e=>err=e.message);
d.querySelector('[data-v="'+(process.argv[2]||"DF")+'"]').click();d.querySelector('[data-v="TW"]').click();d.getElementById('btn-start').click();
const out=w.eval(`(()=>{ const o={}; for(const dp of Object.keys(DP_ADV)){ o[dp]=[]; for(const df of [-8,0,8]){ S.dpos=dp; S.grp=DP_GRP[dp]; for(const k in S.ab)S.ab[k]=60+df; S.year++;
  const st=simSeason(60,38,0); o[dp].push(df+': Rt '+st.Rt+' | '+Object.keys(st.X).map(k=>ADV[k].n+' '+advTxt(k,st.X[k])+' '+advRank(st.X[k],st.Min)).join('｜')); } } return o; })()`);
for(const k in out)console.log(k+'\n  '+out[k].join('\n  '));console.log('err',err);process.exit(0);
