/* Question-led team navigation and event-scoped team/player connections. */
(() => {
 'use strict';
 const roles=['top','jungle','mid','bot','support'];
 const entries=[
  {id:'formation',group:'movement',target:{teamPanel:'style',teamStyle:'formation'}},
  {id:'signature',group:'movement',target:{teamPanel:'style',teamStyle:'signature'}},
  {id:'state',group:'movement',target:{teamPanel:'style',teamStyle:'state'}},
  {id:'connections',group:'movement',target:{teamPanel:'style',teamStyle:'connections'}},
  {id:'trades',group:'decisions',target:{teamPanel:'operations',operationView:'trades'}},
  {id:'series',group:'decisions',target:{teamPanel:'operations',operationView:'series'}},
  {id:'plays',group:'outcomes',target:{teamPanel:'statistics',analysisPanel:'plays'}},
  {id:'time',group:'outcomes',target:{teamPanel:'statistics',analysisPanel:'time'}},
  {id:'lead',group:'outcomes',target:{teamPanel:'statistics',analysisPanel:'lead'}},
 ];
 const COPY={
  ko:{analysis:'팀 분석',playerAnalysis:'선수 분석',choose:'분석 선택',records:'경기 목록',roster:'이 대회 출전 선수',rosterHint:'선수를 누르면 개인 분석으로 이어집니다.',playerTeams:'이 대회의 팀',peers:t=>`${t} 동료 선수`,playerLink:'선수 보기',teamLink:'팀 분석',games:n=>`${n}경기`,back:(team,label)=>`← ${team} · ${label}`,groups:{movement:['움직임·배치','누가 모이고, 어디에 서 있을까?'],decisions:['오브젝트·세트 변화','무엇을 챙기고, 다음 세트에 어떻게 달라질까?'],outcomes:['플레이·경기 흐름','어떤 장면에서 벌고, 어떻게 이어질까?']},items:{formation:['팀 포메이션','실제 경기에서 모이고 흩어지는 과정'],signature:['반복되는 배치','여러 경기에서 되풀이된 특징'],state:['유리·불리할 때','골드 상황에 따라 달라지는 배치'],connections:['선수 간 연결','자주 가까이 있던 선수 조합'],trades:['오브젝트 교환','상대가 챙길 때 우리 팀이 얻은 것'],series:['세트별 변화','같은 상대와 다음 세트에서 바뀐 점'],plays:['플레이의 이득·손실','관여 장면의 승률·골드 변화'],time:['시간대·상황별','이득과 손실이 어느 구간에 몰렸나'],lead:['리드 전개','앞선 뒤 격차가 어떻게 변했나']}},
  en:{analysis:'Team analysis',playerAnalysis:'Player analysis',choose:'Choose an analysis',records:'Game list',roster:'Players in this event',rosterHint:'Select a player to open their analysis.',playerTeams:'Teams in this event',peers:t=>`${t} teammates`,playerLink:'Player profile',teamLink:'Team analysis',games:n=>`${n} games`,back:(team,label)=>`← ${team} · ${label}`,groups:{movement:['Movement & positioning','Who groups together, and where?'],decisions:['Objectives & between games','What do they take, and what changes next game?'],outcomes:['Plays & game flow','Where do gains and losses occur, and what follows?']},items:{formation:['Team formation','Watch grouping and spreading in a game'],signature:['Recurring positions','Patterns repeated across games'],state:['When ahead or behind','Positioning by gold state'],connections:['Player connections','Pairs frequently observed close together'],trades:['Objective exchanges','Own acquisitions around enemy objectives'],series:['Between games','What changed against the same opponent'],plays:['Play gains & losses','Win-probability and gold changes in involved moments'],time:['By phase & situation','Where gains and losses concentrate'],lead:['Lead development','How gaps change after taking a lead']}},
  ja:{analysis:'チーム分析',playerAnalysis:'選手分析',choose:'分析を選ぶ',records:'試合一覧',roster:'この大会の出場選手',rosterHint:'選手を選ぶと個人分析を開きます。',playerTeams:'この大会の所属チーム',peers:t=>`${t}のチームメイト`,playerLink:'選手を見る',teamLink:'チーム分析',games:n=>`${n}試合`,back:(team,label)=>`← ${team} · ${label}`,groups:{movement:['移動・配置','誰が集まり、どこに立つのか'],decisions:['オブジェクト・試合間の変化','何を獲得し、次の試合で何が変わるのか'],outcomes:['プレー・試合展開','利益と損失はどこで生じるのか']},items:{formation:['チームフォーメーション','実際の試合で集散を見る'],signature:['繰り返す配置','複数の試合で見られる特徴'],state:['有利・不利のとき','ゴールド状況別の配置'],connections:['選手のつながり','近くにいることが多い選手の組み合わせ'],trades:['オブジェクト交換','相手の獲得前後に得たもの'],series:['試合間の変化','同じ相手との次の試合で変わった点'],plays:['プレーの利益・損失','関与場面の勝率・ゴールド変化'],time:['時間帯・状況別','利益と損失が集中する区間'],lead:['リード展開','リード後に差がどう変わるか']}},
  zh:{analysis:'队伍分析',playerAnalysis:'选手分析',choose:'选择分析',records:'比赛列表',roster:'本赛事出场选手',rosterHint:'点击选手查看个人分析。',playerTeams:'本赛事所属队伍',peers:t=>`${t} 队友`,playerLink:'查看选手',teamLink:'队伍分析',games:n=>`${n}局`,back:(team,label)=>`← ${team} · ${label}`,groups:{movement:['移动与站位','谁聚在一起，站在哪里？'],decisions:['资源与局间变化','获得了什么，下一局如何变化？'],outcomes:['战术与比赛走势','收益和损失出现在哪里？']},items:{formation:['队伍阵型','观察实际比赛中的聚散'],signature:['重复站位','多场比赛中重复的特点'],state:['领先或落后时','不同经济局势下的站位'],connections:['选手关联','经常靠近的选手组合'],trades:['资源交换','对手获得资源时己方得到什么'],series:['局间变化','面对同一对手时下一局的变化'],plays:['战术收益与损失','参与片段中的胜率与经济变化'],time:['时段与局势','收益和损失集中在哪些区间'],lead:['领先走势','取得领先后差距如何变化']}},
 };
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const copy=lang=>COPY[lang]||COPY.en;
 function active(state){if(state.teamPanel==='records')return 'records';return entries.find(e=>Object.entries(e.target).every(([k,v])=>state[k]===v))?.id||'signature';}
 function destination(id){return id==='records'?{teamPanel:'records'}:{...(entries.find(e=>e.id===id)||entries.find(e=>e.id==='signature')).target};}
 function item(id,lang='ko'){const e=entries.find(e=>e.id===id)||(id==='records'?null:entries.find(e=>e.id==='signature')),c=copy(lang);return e?{...e,label:c.items[e.id][0],description:c.items[e.id][1],groupLabel:c.groups[e.group][0]}:{id:'records',label:c.records,description:'',groupLabel:c.analysis};}
 function navigation(state,lang='ko',compact=false){
  const c=copy(lang),selected=active(state),current=item(selected,lang);
  return `<aside class="profile-analysis-navigation"><details ${compact?'':'open'}><summary>${esc(c.choose)}<strong>${esc(current.label)}</strong></summary><nav aria-label="${esc(c.analysis)}">${Object.entries(c.groups).map(([key,[title,question]])=>`<section class="profile-analysis-group"><h2>${esc(title)}</h2><p>${esc(question)}</p>${entries.filter(e=>e.group===key).map(e=>`<button type="button" class="profile-analysis-pick ${selected===e.id?'on':''}" data-team-analysis="${e.id}" ${e.target.teamStyle?`data-team-style="${e.target.teamStyle}"`:''} aria-pressed="${selected===e.id}" ${selected===e.id?'aria-current="page"':''}><strong>${esc(c.items[e.id][0])}</strong><span>${esc(c.items[e.id][1])}</span></button>`).join('')}</section>`).join('')}</nav></details></aside>`;
 }
 function roster(games,rosters,team){
  const people=new Map();
  for(const g of games)for(const p of Object.values(rosters[g.id]||{})){
   if(p.team!==team||!p.player)continue;
   if(!people.has(p.player))people.set(p.player,{player:p.player,team,games:new Set(),roles:new Map()});
   const person=people.get(p.player);person.games.add(g.id);person.roles.set(p.position,(person.roles.get(p.position)||0)+1);
  }
  return [...people.values()].map(p=>({player:p.player,team:p.team,games:p.games.size,positions:[...p.roles].sort((a,b)=>b[1]-a[1]||roles.indexOf(a[0])-roles.indexOf(b[0])).map(([r])=>r)})).sort((a,b)=>roles.indexOf(a.positions[0])-roles.indexOf(b.positions[0])||b.games-a.games||a.player.localeCompare(b.player));
 }
 function playerTeams(games,rosters,player){
  const teams=new Map();
  for(const g of games)for(const p of Object.values(rosters[g.id]||{}))if(p.player===player){
   if(!teams.has(p.team))teams.set(p.team,{team:p.team,games:new Set(),positions:new Set()});
   teams.get(p.team).games.add(g.id);teams.get(p.team).positions.add(p.position);
  }
  return [...teams.values()].map(t=>({team:t.team,games:t.games.size,positions:[...t.positions]})).sort((a,b)=>b.games-a.games||a.team.localeCompare(b.team));
 }
 window.PlayValueProfiles={copy,active,destination,item,navigation,roster,playerTeams,ids:()=>entries.map(e=>e.id)};
})();
