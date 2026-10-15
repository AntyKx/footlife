// 各位置平均評分檢查:同樣的「綜合 − 聯賽水準」差距下,各位置主力的平均評分應該接近
const {JSDOM}=require('jsdom'); const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/?seed=rt',pretendToBeVisual:true});
const w=dom.window; w.scrollTo=()=>{}; w.document.getElementById('btn-start').click();
const out=w.eval(`(()=>{ const res=[]; for(const [grp,dp] of [['GK','GK'],['DF','CB'],['DF','FB'],['MF','DM'],['MF','CM'],['MF','AM'],['FW','W'],['FW','ST']]){
  for(const gap of [0,8,15,20]){ S=newState('t',grp,'JP'); S.stage='PRO'; S.lv='ENG'; S.club='兵工廠'; S.dpos=dp; S.clubTier=2;
    const par=LV.ENG.par; Object.keys(S.ab).forEach(k=>S.ab[k]=par+gap); let rt=0,y=0,cs=0; const N=400;
    for(let i=0;i<N;i++){ S.mCards={y:0,r:0}; S.mDef=0; S.mG=0; S.mA=0; S.form=50; const st=simSeason(par,38,0); rt+=st.Rt; y+=st.Y; }
    res.push(dp+' 差距+'+gap+'：平均評分 '+(rt/N).toFixed(2)+'、黃牌 '+(y/N).toFixed(1)); } } return res.join(' / '); })()`);
console.log(out); w.close();
