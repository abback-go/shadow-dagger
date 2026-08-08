import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const p = await b.newPage();
await p.goto('file:///home/user/shadow-dagger/proto/index.html');
await p.waitForTimeout(500);
const F = await p.evaluate(()=>window.__MAP__.FLOORS.map(f=>({
  n:f.n,yOff:f.yOff,w:f.w,h:f.h,geo:f.geo,entry:f.entry,exit:f.exit,
  shrines:f.shrines||[],crystals:f.crystals||[],dummies:f.dummies||[],goal:f.goal})));
await b.close();

// 설계 문서 (B) 전역 좌표표에서 뽑은 기대값
const EXPECT=[
 // [층, 라벨포함문자열, 전역 y(표면/상단)]
 [1,'대광장 바닥',1.0],[1,'계단 P1',2.4],[1,'계단 P2',3.6],[1,'출구 렛지 P3',5.0],
 [2,'회복 바닥',7.0],[2,'기둥머리 A',8.2],[2,'기둥머리 B',8.8],[2,'기둥머리 C',9.4],[2,'기둥머리 D',10.0],[2,'출구 렛지',10.8],
 [3,'바닥 안전지대',14.0],[3,'기둥머리 R1',18.2],[3,'좌벽 렛지 R2',21.8],[3,'좌벽 렛지 R3',26.2],[3,'히든 알코브',22.4],[3,'출구 렛지',27.5],
 [4,'진입 렛지',30.5],[4,'기둥머리 P1',30.8],[4,'좁은 렛지 P2',32.6],[4,'먼 기둥 머리',34.2],[4,'출구 렛지',35.5],
 [5,'아레나 바닥',39.0],[5,'중앙 대리석 단',40.4],[5,'기둥머리 P-air1',41.2],[5,'코니스',41.0],[5,'기둥머리 P-air2',42.5],[5,'출구 렛지',44.0],
 [6,'진입 단 E',48.5],[6,'착지 단 L1',52.5],[6,'착지 단 L2',55.5],[6,'도약 나브 NB1',56.0],[6,'착지 단 L3',59.0],
 [6,'착지 단 L4',62.0],[6,'도약 나브 NB2',62.5],[6,'착지 단 L5',65.0],[6,'출구 단 XE',67.0],[6,'히든 단 HC',63.5],
 [7,'성종 테라스 바닥',68.5],[7,'좌측 전망 발코니',69.6],[7,'스텝 A',70.0],[7,'종 대(플린스)',71.5],[7,'종탑 대들보',74.6],
];
let pass=0,fail=0;
for(const [n,lab,y] of EXPECT){
  const f=F.find(a=>a.n===n);
  const g=f.geo.find(a=>a.label.includes(lab));
  if(!g){ console.log(`✗ ${n}F "${lab}" 미발견`); fail++; continue; }
  const got=f.yOff+g.y[1];
  if(Math.abs(got-y)<0.001) pass++;
  else { console.log(`✗ ${n}F "${lab}" 기대 y${y} → 구현 y${got}`); fail++; }
}
// 포탈 정합
const PORT=[[1,32.5,5.0],[2,26.5,10.8],[3,6.0,27.5],[4,14.5,35.5],[5,16.5,44.0],[6,5.0,67.0]];
for(const [n,x,y] of PORT){
  const f=F.find(a=>a.n===n), gx=f.exit.x, gy=f.yOff+f.exit.y;
  if(Math.abs(gx-x)<0.001&&Math.abs(gy-y)<0.001) pass++;
  else{ console.log(`✗ ${n}F 출구 기대(${x},${y}) → 구현(${gx},${gy})`); fail++; }
}
const ENT=[[2,2.0,7.0],[3,1.5,14.0],[4,1.5,30.5],[5,1.5,39.0],[6,1.2,48.5],[7,5.0,68.5]];
for(const [n,x,y] of ENT){
  const f=F.find(a=>a.n===n), gx=f.entry.x, gy=f.yOff+f.entry.y;
  if(Math.abs(gx-x)<0.001&&Math.abs(gy-y)<0.001) pass++;
  else{ console.log(`✗ ${n}F 진입 기대(${x},${y}) → 구현(${gx},${gy})`); fail++; }
}
// 사당/결정/목표
const MARK=[['사당1',1,4.5,1.0],['사당2',5,2.5,39.0],['사당3',6,0.9,48.5],['사당4',6,3.3,59.0],['사당5',7,2.5,68.5]];
for(const [id,n,x,y] of MARK){
  const f=F.find(a=>a.n===n), s=f.shrines.find(a=>a.id.includes(id.replace('사당','사당')));
  if(!s){ console.log(`✗ ${id} 미발견`); fail++; continue; }
  const gy=f.yOff+s.y;
  if(Math.abs(s.x-x)<0.001&&Math.abs(gy-y)<0.001) pass++;
  else{ console.log(`✗ ${id} 기대(${x},${y}) → (${s.x},${gy})`); fail++; }
}
const CRY=[[3,6.0,22.9],[4,12.6,36.5],[6,1.0,63.5]];
for(const [n,x,y] of CRY){
  const f=F.find(a=>a.n===n), c=f.crystals[0], gy=f.yOff+c.y;
  if(Math.abs(c.x-x)<0.001&&Math.abs(gy-y)<0.001) pass++;
  else{ console.log(`✗ ${n}F 빛결정 기대(${x},${y}) → (${c.x},${gy})`); fail++; }
}
const g7=F.find(a=>a.n===7);
const bellLo=g7.yOff+g7.goal.y[0], bellHi=g7.yOff+g7.goal.y[1];
if(Math.abs(bellLo-72.8)<0.001&&Math.abs(bellHi-74.2)<0.001) pass++;
else { console.log(`✗ 성종 기대 y72.8–74.2 → ${bellLo}–${bellHi}`); fail++; }
// 허수아비 총수
const totalD=F.reduce((s,f)=>s+f.dummies.length,0);
console.log(`\n허수아비/표적 총 ${totalD}기`);
console.log(`\n결과: PASS ${pass} / FAIL ${fail}`);
process.exit(fail?1:0);
