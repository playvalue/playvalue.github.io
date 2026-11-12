/* Minute-frame proximity and subsequent growth. No movement or individual credit is inferred. */
(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ROLE={ko:{top:'탑',jungle:'정글',mid:'미드',bot:'원딜',support:'서포터'},en:{top:'TOP',jungle:'JG',mid:'MID',bot:'ADC',support:'SUP'}};
  const COPY={
    ko:{network:'선수 연결',growth:'단독 구간 성장',phases:{early:'초반 · 2~15분',middle:'중반 · 15~25분',late:'후반 · 25분 이후'},states:{all:'모든 상황',ahead:'유리 · +2,000골드 이상',even:'균형 · 골드 차이 2,000 미만',behind:'불리 · −2,000골드 이하'},
      networkSub:'어떤 선수들이 자주 가까이 있나요? 선을 누르면 두 선수의 기록을, 선수 이름을 누르면 혼자 있을 때의 성장을 볼 수 있습니다.',
      networkMethod:'선이 굵을수록 두 선수가 가까이 있던 비율이 높습니다. 보라색은 참고 기준보다 8%p 이상 높음, 주황색은 8%p 이상 낮음, 회색은 그 사이입니다. 원이 클수록 가까이 있던 동료 수가 많습니다. 선수의 위치는 그래프를 읽기 위한 배치이며 실제 맵 위치가 아닙니다.',
      phaseReference:'참고 기준은 같은 대회·시간대의 평균입니다. 예를 들어 실제 60%, 참고 기준 40%면 이 팀에서 20%p 더 자주 가까이 있었습니다. 골드 차이·조합·상대의 영향도 포함된 비교입니다.',
      actual:'실제 비율',expected:'참고 기준',difference:'기준과의 차이',limited:'자료 적음',observed:'자료 범위',pp:'%p',
      games:n=>`${n}경기`,series:n=>`맞대결 ${n}회`,opponents:n=>`상대 ${n}팀`,rows:(n,unit='위치 기록')=>`${unit} ${n}개`,frameRecords:'위치 기록',minuteRecords:'1분 구간',startRecords:'시작 기록',trios:'자주 함께 있던 세 선수',
      triadNote:'세 명이 모두 서로 가까이 있던 비율입니다. 한 명을 사이에 두고 길게 이어진 배치는 제외합니다.',
      details:'두 선수 조합 전체 보기',missing:'이 팀·선수의 연결·성장 자료를 더 모으고 있습니다.',empty:'이 조건에서 한 경기당 기록이 3개 이상인 자료가 없습니다.',
      growthSub:'동료와 떨어져 있던 시점부터 다음 1분 동안, 얼마나 성장했고 얼마나 자주 사망했나요?',
      growthMethod:'시작할 때 살아서 본진 밖에 있고, 약 2,250유닛 안에 활동 중인 동료가 없었던 경우를 봅니다. 이후 사망하거나 본진에 돌아간 구간도 포함합니다. 1분 내내 혼자 있었다는 뜻은 아닙니다.',
      read:'숫자 읽는 법',growthRead:'큰 숫자는 실제 기록이고, 기준과의 차이는 실제값에서 참고 기준을 뺀 값입니다. CS +1이면 비교 기준보다 다음 1분에 CS를 1개 더 얻었다는 뜻이며, 정글 몬스터 CS도 포함합니다. 사망 비율은 낮을수록 덜 사망한 것입니다. 참고 기준은 같은 대회·포지션의 기록으로 예측하며 시간대 평균을 쓰는 경우도 있습니다. 차이의 95% 범위가 0을 포함하면 늘었는지 줄었는지 방향이 불확실합니다.',
      solo:'혼자 시작한 비율',cs:'다음 1분 CS',xp:'다음 1분 경험치',death:'다음 1분 사망 비율',perMin:'CS/분',xpUnit:'XP/분',
      ci:'차이의 95% 범위',unseen:'예측을 학습할 때 없었던 챔피언의 비율',weak:'이 지표의 비교 예측은 시간대 평균보다 정확하지 않았습니다. 기준과의 차이를 선수의 강점으로 단정하기 어렵습니다.',
      scatter:'같은 포지션의 선수들과 비교',scatterX:'혼자 시작한 비율 (%)',scatterY:'다음 1분 CS가 참고 기준보다 많거나 적은 정도',scatterNote:'오른쪽일수록 혼자 시작한 비율이 높고, 위쪽일수록 그 뒤 CS가 참고 기준보다 많았습니다. 빈 원은 자료가 적은 선수입니다. 가로축은 모든 시작 기록, 세로축은 한 경기에서 단독 시작이 3번 이상인 구간만 쓰므로 자료 범위가 다릅니다.',
      teamLink:'팀 연결로 돌아가기',examples:'실제 시작 장면 보기',method:'계산 방법과 자료 범위',
      networkCaveat:'가까이 있었다는 기록만으로 함께 이동했거나 서로 지원·희생·오더를 했다고 판단할 수는 없습니다.',growthCaveat:'성장 차이에는 웨이브 기회·챔피언 상성·상대의 영향도 남아 있습니다. 선수 개인의 실력이나 승리 기여도를 분리한 값은 아닙니다.',
      longMethod:'연결은 다섯 명 모두 살아서 본진 밖에 있는 분 단위 기록에서 두 선수가 약 2,250유닛 이내인지 확인합니다. 이동 경로를 이어 그린 그래프가 아닙니다. 비율·평균은 경기마다 구한 뒤 경기끼리 같은 비중으로 평균하며, 종료 3분 전까지만 집계합니다. 예측할 시리즈를 학습에서 제외하고, 별도의 검증으로 시간대 평균 또는 상황을 고려한 모형을 고릅니다. 상황 모형은 시간·골드·직전 모형 승률·진영·조합 특성을 사용합니다. 성장에서는 포지션·현재 위치·주변 인원·레벨·경제 상태·양측 챔피언도 고려합니다. 시간대 평균을 쓴 지표는 이 조건들이 모두 보정된 값이 아닙니다. 웨이브 기회·상성·상대 실력도 완전히 통제하지 못합니다. 95% 범위는 시리즈 단위로 자료를 다시 뽑아 계산합니다. 차이의 범위가 0을 포함하면 늘었는지 줄었는지 방향이 불확실합니다. 이 범위에는 예측 모형 자체의 오차나 여러 지표를 비교한 영향은 포함하지 않습니다. 자료 적음은 4경기·3시리즈·3상대·20기록 중 하나라도 부족한 경우입니다. 맞대결 1회는 같은 상대와의 한 시리즈이며 단판도 포함합니다.',
    },
    en:{network:'Player connections',growth:'Growth after solo starts',phases:{early:'Early · 2–15 min',middle:'Middle · 15–25 min',late:'Late · 25+ min'},states:{all:'All states',ahead:'Ahead · +2,000 gold',even:'Even · less than 2,000 apart',behind:'Behind · −2,000 gold'},networkSub:'Select an edge for evidence, or a player for growth after unaccompanied starts.',networkMethod:'Edges measure proximity within about 2,250 units at minute frames with all five active outside base. Width is observed frequency; purple/orange means above/below the reference. This is not a movement path or shot-calling network.',actual:'Observed',expected:'Reference',difference:'Vs reference',limited:'Limited sample',observed:'Across opponents',games:n=>`${n} games`,series:n=>`${n} series`,opponents:n=>`${n} opponents`,rows:n=>`${n} observations`,trios:'Frequently observed trios',triadNote:'Every pair must satisfy the distance threshold; chains do not count.',details:'All edge values',missing:'Connection and growth coverage is being prepared.',empty:'No eligible games have at least three observations here.',growthSub:'What happens in the minute after a player is observed without a nearby teammate?',growthMethod:'The player starts alive outside base, with no active teammate within about 2,250 units. Subsequent deaths and base returns stay in the sample. The player may receive company during the minute.',solo:'Unaccompanied starts',cs:'CS in next minute',xp:'XP in next minute',death:'Death in next minute',perMin:'CS/min',xpUnit:'XP/min',ci:'95% interval for difference',unseen:'Champion absent from training',weak:'The reference did not beat the phase average out of sample. Interpret differences cautiously.',scatter:'Players in the same position',scatterX:'Unaccompanied starts (%)',scatterY:'Next-minute CS vs reference',scatterNote:'Hollow circles have limited samples. The x-axis uses all eligible starts; CS requires three unaccompanied observations per game.',teamLink:'Back to team connections',examples:'Example starting points',method:'Method and limits',caveat:'Proximity and subsequent growth do not identify assistance, sacrifice, shot-calling or individual causal contribution.',longMethod:'Equal game weights; last three minutes excluded. Nested series validation selects a phase average or a regularized context model. Growth context includes role, position, neighbors, level, economy and champions; network context uses draft proxies. A selected average is not full adjustment. Wave opportunities, matchup and opponent strength are not fully controlled. Series intervals omit model-estimation uncertainty and multiple-comparison correction. Coverage requires 4 games, 3 series, 3 opponents and 20 observations.'},
  };
  Object.assign(COPY.en,{rows:(n,unit='position records')=>`${n} ${unit}`,networkCaveat:'Proximity does not identify joint movement, assistance, sacrifice or shot-calling.',growthCaveat:'Wave opportunities, matchups and opponents still affect growth differences. These are not isolated estimates of skill or winning contribution.',networkMethod:'Thicker lines mean more frequent proximity. Purple means at least 8 percentage points above the reference, orange at least 8 below, and grey between. Larger circles mean more nearby teammates. Node positions are a graph layout, not map positions.',pp:'pp',frameRecords:'position records',minuteRecords:'one-minute windows',startRecords:'starting records',read:'How to read this',growthRead:'Differences subtract the reference from observed growth. +1 CS means one more CS in the next minute, including jungle CS. Lower death rates mean fewer subsequent deaths. References use same-event, same-role records and can be a phase average rather than a context model.'});
  const POS={top:[88,75],jungle:[270,60],mid:[385,205],bot:[252,345],support:[65,265]};
  const pct=v=>`${Number(v).toFixed(1)}%`;
  const signed=(v,dec=1)=>`${v>0?'+':''}${Number(v).toFixed(dec)}`;
  function create(options={}){
    let data=null,pending=null;
    const lang=()=>options.getLanguage?.()||'ko',copy=()=>COPY[lang()]||COPY.en,role=r=>(ROLE[lang()]||ROLE.en)[r]||r;
    const sample=(p,unit=copy().frameRecords)=>{const c=copy();return `${c.games(p.n_games)} · ${c.series(p.n_series)} · ${c.opponents(p.n_opponents)} · ${c.rows(p.n_observations,unit)}`;};
    const warning=(p,unit=copy().frameRecords)=>`<span class="relation-coverage ${p.enough_sample?'':'limited'}">${esc(p.enough_sample?copy().observed:copy().limited)} · ${esc(sample(p,unit))}</span>`;
    const evidence=items=>items.filter(e=>/^https:\/\/www\.youtube\.com\/watch\?/.test(e.video_url||'')).map(e=>`<a href="${esc(e.video_url)}" target="_blank" rel="noopener">${esc(e.opponent)} · ${Math.floor(e.t/60)}:${String(Math.floor(e.t%60)).padStart(2,'0')} ↗</a>`).join('');
    const controls=(phase,state)=>`<div class="relation-controls"><div class="seg">${Object.entries(copy().phases).map(([k,v])=>`<button type="button" data-relation-phase="${k}" class="${phase===k?'on':''}">${esc(v)}</button>`).join('')}</div><div class="seg">${Object.entries(copy().states).map(([k,v])=>`<button type="button" data-relation-state="${k}" class="${state===k?'on':''}">${esc(v)}</button>`).join('')}</div></div>`;
    async function load(){if(pending)return pending;pending=(async()=>{try{const r=await fetch('./data/team-player-relations-v1.json',{cache:'no-cache'});if(r.ok)data=await r.json();}catch(e){data=null;}})();return pending;}
    function graph(profile,selected){
      const lines=profile.edges.map(e=>{
        const [a,b]=e.roles.map(r=>POS[r]);const color=e.difference>=8?'var(--accent)':e.difference<=-8?'#b56530':'var(--text-muted)';
        const title=`${e.roles.map(role).join('–')} · ${copy().actual} ${pct(e.raw)} · ${copy().expected} ${pct(e.expected)} · ${sample(e)}`;
        return `<g role="button" tabindex="0" data-relation-edge="${e.metric}" aria-label="${esc(title)}"><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="transparent" stroke-width="22"/><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="${1+e.raw/100*8}" opacity="${e.metric===selected?1:.5}"/><title>${esc(title)}</title></g>`;
      }).join('');
      const nodes=profile.nodes.map(n=>{
        const [x,y]=POS[n.role],name=n.players[0]||role(n.role);
        return `<g role="button" tabindex="0" data-relation-player="${esc(name)}" aria-label="${esc(name)} · ${esc(copy().growth)}"><circle cx="${x}" cy="${y}" r="${20+n.raw*3}" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/><text x="${x}" y="${y+4}" text-anchor="middle" class="relation-role">${esc(role(n.role))}</text><text x="${x}" y="${y+46}" text-anchor="middle" class="relation-name">${esc(n.players.join(' / '))}</text><title>${lang()==='ko'?'가까운 동료의 평균 수 · 실제':'Mean nearby teammates · observed'} ${n.raw.toFixed(2)} / ${esc(copy().expected)} ${n.expected.toFixed(2)}</title></g>`;
      }).join('');
      return `<svg class="relation-network" viewBox="0 0 470 410" role="group" aria-label="${esc(copy().network)}">${lines}${nodes}</svg>`;
    }
    function teamHtml(tournament,team,phase='middle',state='all',pair='pair_jungle_support'){
      const c=copy(),purpose=window.PlayValueExplore?.purposeHtml('connections',lang())||'',p=data?.team_profiles.find(p=>p.tournament===tournament&&p.team===team&&p.phase===phase&&p.state===state);
      if(!data?.teams[tournament]?.includes(team))return `<section class="card"><h2>${esc(c.network)}</h2>${purpose}<p>${esc(c.missing)}</p></section>`;
      if(!p||!p.edges.length)return `<section class="card"><h2>${esc(c.network)} · ${esc(team)}</h2>${purpose}${controls(phase,state)}<p>${esc(c.empty)}</p></section>`;
      const e=p.edges.find(e=>e.metric===pair)||p.edges[0];
      const trios=[...p.trios].sort((a,b)=>b.raw-a.raw).slice(0,3);
      return `<section class="card player-relations"><h2>${esc(c.network)} <span class="sub">${esc(team)}</span></h2>${purpose||`<p class="relation-intro">${esc(c.networkSub)}</p>`}${controls(phase,state)}<p class="relation-method">${esc(c.networkMethod)}</p>${p.reference_kind==='phase'?`<p class="relation-method">${esc(c.phaseReference||'Reference: event and phase averages. Gold, draft and opponents are not fully adjusted.')}</p>`:''}
        <div class="relation-layout">${graph(p,e.metric)}<article class="relation-edge-card"><h3>${e.roles.map(r=>esc(role(r))).join('–')}</h3><div class="relation-values"><span>${esc(c.actual)}<b>${pct(e.raw)}</b></span><span>${esc(c.expected)}<b>${pct(e.expected)}</b></span><span>${esc(c.difference)}<b>${signed(e.difference)} ${esc(c.pp)}</b></span></div>${warning(e)}<p class="relation-opponents">${esc(e.opponents.join(' · '))}</p><div class="relation-evidence">${evidence(e.examples)}</div><p class="relation-method">${esc(c.networkCaveat)}</p></article></div>
        <h3>${esc(c.trios)}</h3><p class="relation-method">${esc(c.triadNote)}</p><div class="relation-trios">${trios.map(t=>`<article><strong>${t.roles.map(r=>esc(role(r))).join(' · ')}</strong><b>${pct(t.raw)}</b><small>${esc(c.expected)} ${pct(t.expected)}</small>${warning(t)}</article>`).join('')}</div>
        <details class="relation-details"><summary>${esc(c.details)}</summary><div class="scroll-x"><table class="xt"><thead><tr><th></th><th>${esc(c.actual)}</th><th>${esc(c.expected)}</th><th>${esc(c.difference)}</th></tr></thead><tbody>${p.edges.map(e=>`<tr><th scope="row">${e.roles.map(r=>esc(role(r))).join('–')}</th><td>${pct(e.raw)}</td><td>${pct(e.expected)}</td><td>${signed(e.difference)} ${esc(c.pp)}</td></tr>`).join('')}</tbody></table></div></details><details class="relation-details"><summary>${esc(c.method)}</summary><p class="relation-method">${esc(c.longMethod)}</p></details></section>`;
    }
    function scatter(rows,selected){
      const c=copy(),points=rows.filter(p=>p.solo_outcomes.cs_per_min),W=740,H=320,L=65,R=660,T=35,B=255;
      if(!points.length)return '';
      const extent=Math.max(1,...points.map(p=>Math.abs(p.solo_outcomes.cs_per_min.difference)))*1.2;
      const x=v=>L+v/100*(R-L),y=v=>B-(v+extent)/(2*extent)*(B-T);
      const placed=[],labels={};
      for(const p of [...points].sort((a,b)=>(b.player===selected)-(a.player===selected))){
        const px=x(p.solo_rate.raw),py=y(p.solo_outcomes.cs_per_min.difference),width=p.player.length*7+4;
        const candidates=[[11,-9],[11,20],[-width-11,-9],[-width-11,20],[11,-28],[-width-11,-28]];
        let pick=candidates[0];
        for(const offset of candidates){
          const rect={x:px+offset[0],y:py+offset[1]-12,w:width,h:16};
          if(rect.x<4||rect.x+rect.w>W-4||rect.y<18||rect.y+rect.h>B+13)continue;
          if(placed.some(r=>rect.x<r.x+r.w&&rect.x+rect.w>r.x&&rect.y<r.y+r.h&&rect.y+rect.h>r.y))continue;
          if(points.some(other=>other.player!==p.player&&x(other.solo_rate.raw)>rect.x-10&&x(other.solo_rate.raw)<rect.x+rect.w+10&&y(other.solo_outcomes.cs_per_min.difference)>rect.y-10&&y(other.solo_outcomes.cs_per_min.difference)<rect.y+rect.h+10))continue;
          pick=offset;placed.push(rect);break;
        }
        labels[p.player]=[px+pick[0],py+pick[1]];
      }
      const mobile=`<div class="relation-peers-mobile">${points.map(p=>`<button type="button" class="relation-peer ${p.player===selected?'on':''}" data-relation-player="${esc(p.player)}"><b>${esc(p.player)}</b><span>${pct(p.solo_rate.raw)} · ${signed(p.solo_outcomes.cs_per_min.difference)} ${esc(c.perMin)}${p.solo_outcomes.cs_per_min.enough_sample?'':` · ${esc(c.limited)}`}</span></button>`).join('')}</div>`;
      return `<svg class="relation-scatter" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(c.scatter)}"><line x1="${L}" x2="${R}" y1="${y(0)}" y2="${y(0)}" stroke="var(--border-color)"/>
        ${[-extent,0,extent].map(v=>`<text x="${L-10}" y="${y(v)+4}" text-anchor="end">${signed(v)}</text>`).join('')}
        ${[0,25,50,75,100].map(v=>`<text x="${x(v)}" y="${B+22}" text-anchor="middle">${v}</text>`).join('')}
        ${points.map(p=>{const m=p.solo_outcomes.cs_per_min,on=p.player===selected;return `<g role="button" tabindex="0" data-relation-player="${esc(p.player)}" aria-label="${esc(p.player)} · ${pct(p.solo_rate.raw)} · ${signed(m.difference)} CS"><circle cx="${x(p.solo_rate.raw)}" cy="${y(m.difference)}" r="${on?8:6}" fill="${m.enough_sample?'var(--accent)':'var(--bg-card)'}" stroke="var(--accent)" stroke-width="${on?3:1.5}" opacity="${on?1:.6}"/><text x="${labels[p.player][0]}" y="${labels[p.player][1]}" class="${on?'selected':''}">${esc(p.player)}</text></g>`;}).join('')}<text x="${(L+R)/2}" y="${H-12}" text-anchor="middle">${esc(c.scatterX)}</text><text x="${L}" y="16">${esc(c.scatterY)}</text></svg>${mobile}`;
    }
    function playerHtml(tournament,player,phase='middle',state='all'){
      const c=copy(),purpose=window.PlayValueExplore?.purposeHtml('growth',lang())||'',p=data?.player_profiles.find(p=>p.tournament===tournament&&p.player===player&&p.phase===phase&&p.state===state);
      if(!data?.player_profiles.some(p=>p.tournament===tournament&&p.player===player))return `<section class="card"><h2>${esc(c.growth)}</h2>${purpose}<p>${esc(c.missing)}</p></section>`;
      if(!p)return `<section class="card"><h2>${esc(c.growth)} · ${esc(player)}</h2>${purpose}${controls(phase,state)}<p>${esc(c.empty)}</p></section>`;
      const peers=data.player_profiles.filter(q=>q.tournament===tournament&&q.role===p.role&&q.phase===phase&&q.state===state);
      const tiles=[['cs_per_min','cs',c.perMin,1],['xp_per_min','xp',c.xpUnit,0],['death_next','death','%',1]].map(([metric,label,unit,dec])=>{
        const m=p.solo_outcomes[metric];if(!m)return `<article><h3>${esc(c[label])}</h3><p>${esc(c.empty)}</p></article>`;
        return `<article><h3>${esc(c[label])}</h3><strong>${m.raw.toFixed(dec)}<small> ${esc(unit)}</small></strong><p>${esc(c.expected)} ${m.expected.toFixed(dec)} · ${esc(c.difference)} ${signed(m.difference,dec)}${metric==='death_next'?' '+esc(c.pp):''}</p>${warning(m,c.minuteRecords)}${m.ci95?`<p class="relation-method">${esc(c.ci)} ${signed(m.ci95[0],dec)} ~ ${signed(m.ci95[1],dec)} ${esc(metric==='death_next'?c.pp:unit)}</p>`:''}${m.baseline_not_worse_than_phase_mean===false?`<p class="relation-method">${esc(c.weak)}</p>`:''}</article>`;
      }).join('');
      return `<section class="card player-relations"><div class="explore-head"><div><h2>${esc(c.growth)} <span class="sub">${esc(player)} · ${esc(p.team)} · ${esc(role(p.role))}</span></h2>${purpose?'':`<p class="relation-intro">${esc(c.growthSub)}</p>`}</div><button class="btn" type="button" data-relation-team="${esc(p.team)}">${esc(c.teamLink)}</button></div>${purpose}${controls(phase,state)}<p class="relation-method">${esc(c.growthMethod)}</p><div class="relation-solo-rate"><b>${esc(c.solo)} ${pct(p.solo_rate.raw)}</b>${warning(p.solo_rate,c.startRecords)}</div><aside class="analysis-guide"><b>${esc(c.read)}</b><p>${esc(c.growthRead)}</p></aside><div class="relation-growth-tiles">${tiles}</div><h3>${esc(c.scatter)}</h3>${scatter(peers,player)}<p class="relation-method">${esc(c.scatterNote)}</p><h3>${esc(c.examples)}</h3><div class="relation-evidence">${evidence(p.examples)}</div><p class="note-box">${esc(c.growthCaveat)}</p><details class="relation-details"><summary>${esc(c.method)}</summary><p class="relation-method">${esc(c.longMethod)}</p><p class="relation-method">${esc(c.unseen)} ${p.unseen_champion_pct==null?'—':pct(p.unseen_champion_pct)}</p></details></section>`;
    }
    function wire(root){
      root.querySelectorAll('[data-relation-phase]').forEach(b=>b.onclick=()=>options.onChange?.({phase:b.dataset.relationPhase}));
      root.querySelectorAll('[data-relation-state]').forEach(b=>b.onclick=()=>options.onChange?.({state:b.dataset.relationState}));
      for(const [attribute,callback] of [['relationEdge',v=>options.onChange?.({pair:v})],['relationPlayer',v=>options.onPlayer?.(v)],['relationTeam',v=>options.onTeam?.(v)]]){
        const selector=attribute.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
        root.querySelectorAll(`[data-${selector}]`).forEach(el=>{el.onclick=()=>callback(el.dataset[attribute]);el.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&el.tagName.toLowerCase()==='g'){e.preventDefault();callback(el.dataset[attribute]);}};});
      }
    }
    return {load,teamHtml,playerHtml,wire};
  }
  window.PlayValueRelations={create};
})();
