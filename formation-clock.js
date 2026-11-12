/* Minute-level playback of observations. No positions are interpolated. */
(function(root){
 'use strict';
 const minuteOf=t=>Math.floor(t/60);
 function bounds(observations){
  const minutes=observations.filter(o=>o.points.length).map(o=>minuteOf(o.r.t));
  return minutes.length?{start:Math.min(...minutes),end:Math.max(...minutes)}:null;
 }
 function range(time){
  if(!time||time.mode==='all')return null;
  const end=time.minute+1;
  return {start:time.mode==='cumulative'?time.start:time.mode==='rolling'?Math.max(time.start,time.minute-time.width+1):time.minute,end};
 }
 function contains(t,time){const r=range(time),m=minuteOf(t);return !r||(m>=r.start&&m<r.end);}
 function clamp(value,b){return b?Math.max(b.start,Math.min(b.end,Number.isFinite(value)?value:b.start)):null;}
 function createPlayer(options){
  let timer=null,epoch=0;
  const schedule=options.schedule||setInterval,cancel=options.cancel||clearInterval;
  const playing=()=>timer!==null;
  function pause(){epoch++;if(timer!==null)cancel(timer);timer=null;options.onState?.(false);}
  function tick(){
   const b=options.bounds();if(!b){pause();return;}
   const current=options.read();
   if(current>=b.end){if(options.loop())options.write(b.start);else pause();return;}
   const next=clamp(current+1,b);options.write(next);
   if(next===b.end&&!options.loop())pause();
  }
  function arm(){const ticket=++epoch;timer=schedule(()=>{if(ticket===epoch)tick();},Math.max(100,options.delay()));options.onState?.(true);}
  function play(){
   const b=options.bounds();if(!b||b.end<=b.start||playing())return false;
   const current=options.read();options.write(current==null||current>=b.end?b.start:clamp(current,b));arm();return true;
  }
  function seek(value){pause();const b=options.bounds();if(b)options.write(clamp(value,b));}
  function step(delta){const b=options.bounds();if(b)seek((options.read()??b.start)+delta);}
  function reschedule(){if(playing()){cancel(timer);timer=null;arm();}}
  return {play,pause,seek,step,reschedule,isPlaying:playing};
 }
 function network(points,threshold){
  const nodes=points.filter(p=>p[0]>=0).sort((a,b)=>a[0]-b[0]),edges=[],neighbors=nodes.map(()=>[]);
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   const distance=Math.hypot(nodes[i][1]-nodes[j][1],nodes[i][2]-nodes[j][2]),close=distance<=threshold;
   edges.push({i,j,distance,close});if(close){neighbors[i].push(j);neighbors[j].push(i);}
  }
  const seen=new Set(),groups=[];
  for(let i=0;i<nodes.length;i++)if(!seen.has(i)){const group=[],queue=[i];seen.add(i);while(queue.length){const k=queue.pop();group.push(k);for(const j of neighbors[k])if(!seen.has(j)){seen.add(j);queue.push(j);}}groups.push(group);}
  const nearest=nodes.map((p,i)=>{const distances=edges.filter(e=>e.i===i||e.j===i).map(e=>e.distance);return distances.length?Math.min(...distances):null;});
  return {nodes,edges,groups,nearest,mean:edges.length?edges.reduce((sum,e)=>sum+e.distance,0)/edges.length:null};
 }
 root.SpatialTimeline={minuteOf,bounds,range,contains,clamp,createPlayer,network};
})(typeof window==='undefined'?globalThis:window);
