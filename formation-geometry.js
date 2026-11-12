/* Consume the published per-second coordinates as-is; never fill missing positions. */
(function(root){
 'use strict';
 function pastContext(records,second,maxAge=65){
  let lo=0,hi=records.length;while(lo<hi){const mid=(lo+hi)>>1;if(records[mid].t<=second)lo=mid+1;else hi=mid;}
  const r=records[lo-1];return r&&second-r.t<=maxAge?r:null;
 }
 function domain(track,game,phase,config){
  if(!track)return null;
  const phases={early:[120,899],middle:[900,1499],late:[1500,Infinity],all:[120,Infinity]},p=phases[phase];
  const start=Math.max(track.t0,config.start_s,p[0]),end=Math.min(track.t0+track.pos.length-1,Math.floor(game.duration-config.end_buffer_s),p[1]);
  return start<=end?{start,end}:null;
 }
 function frame(track,query,second,options,contexts){
  const empty=note=>({note,points:[],context:null});
  if(!track||track.game!==query.game)return empty('초 단위 위치 자료를 불러오지 못했습니다.');
  const side=track.players.find(p=>p.team===query.team)?.side;
  if(!side||(query.side!=='all'&&query.side!==side))return empty('선택한 팀과 진영이 이 경기의 조건과 다릅니다.');
  const context=pastContext(contexts,second),gold=context?.gold;
  const state=gold==null?'unknown':gold>=2?'ahead':gold<=-2?'behind':'even';
  if(query.state!=='all'&&state!==query.state)return empty(context?'이 초는 선택한 골드 상황에 해당하지 않습니다.':'이 초 이전의 골드 기록이 없어 상황을 구분할 수 없습니다.');
  const row=track.pos[second-track.t0];if(!row)return empty('이 초에는 위치 자료가 없습니다. 이전 초의 위치를 이어 쓰지 않습니다.');
  const points=[],counts={observed:0,interpolated:0,dead:0,unknown:0,weak:0,base:0,hiddenInterpolation:0};
  track.players.forEach((p,i)=>{
   if(p.team!==query.team)return;
   const [x,y,q]=row.slice(i*3,i*3+3);
   if(q===-2){counts.dead++;return;}if(q===-1){counts.unknown++;return;}if(q===1){counts.weak++;return;}
   if(q===0&&!options.includeInterpolation){counts.hiddenInterpolation++;return;}
   if(x+y<420||x+y>1580){counts.base++;return;}
   counts[q===0?'interpolated':'observed']++;
   if(options.role!==-1&&p.role!==options.role)return;
   points.push([p.role,x,y,0,0,0,0,0,0,0,q]);
  });
  if(options.strict&&counts.observed+counts.interpolated!==5)return {...empty('다섯 명 모두 표시 가능한 시점만 선택했습니다. 누락·사망·본진 체류 또는 보간 제외로 이 초는 비어 있습니다.'),context,counts};
  return {points,context,counts,side,state};
 }
 // Maximal cliques: every pair in a cluster is close. Cliques may overlap.
 function clusters(graph){
  const n=graph.nodes.length,adj=Array.from({length:n},()=>Array(n).fill(false)),candidates=[];
  for(const e of graph.edges)if(e.close)adj[e.i][e.j]=adj[e.j][e.i]=true;
  for(let mask=1;mask<(1<<n);mask++){
   const members=Array.from({length:n},(_,i)=>i).filter(i=>mask&(1<<i));if(members.length<2)continue;
   if(members.every((i,k)=>members.slice(k+1).every(j=>adj[i][j])))candidates.push({mask,members});
  }
  return candidates.filter(c=>!candidates.some(d=>d.mask!==c.mask&&(d.mask&c.mask)===c.mask)).map(c=>{
   const roles=c.members.map(i=>graph.nodes[i][0]).sort((a,b)=>a-b),edges=graph.edges.filter(e=>c.members.includes(e.i)&&c.members.includes(e.j));
   return {members:c.members,roles,key:roles.reduce((mask,r)=>mask|(1<<r),0),estimated:c.members.some(i=>graph.nodes[i][10]===0),diameter:Math.max(...edges.map(e=>e.distance))};
  }).sort((a,b)=>b.members.length-a.members.length||a.key-b.key);
 }
 // A padded convex outline also handles two co-located players and collinear groups.
 function clusterHull(points,padding=42){
  const samples=points.flatMap(p=>Array.from({length:16},(_,j)=>{const a=j*Math.PI/8;return [p[0]+padding*Math.cos(a),p[1]+padding*Math.sin(a)];}));
  const unique=[...new Map(samples.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  if(unique.length<3)return unique;
  const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lower=[],upper=[];
  for(const p of unique){while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
  for(const p of [...unique].reverse()){while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
  return lower.slice(0,-1).concat(upper.slice(0,-1));
 }
 root.SpatialNetwork={pastContext,domain,frame,clusters,clusterHull};
})(typeof window==='undefined'?globalThis:window);
