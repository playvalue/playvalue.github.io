/* Observed operational timing. Separate questions, denominators and clocks. */
(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const COPY={
    ko:{title:'운영 분석',views:{trades:'오브젝트 교환',series:'세트별 변화'},
      phases:{early:'초반 · 2~15분',middle:'중반 · 15~25분',late:'후반 · 25분 이후'},states:{all:'모든 상황',ahead:'유리 · +2,000골드 이상',even:'균형 · 골드 차이 2,000 미만',behind:'불리 · −2,000골드 이하'},
      tradeTitle:'상대 오브젝트 전후의 획득',
      tradeMethod:'상대가 에픽 오브젝트를 얻은 시각의 앞뒤 90초를 봅니다. 그동안 우리 팀이 타워·억제기·다른 에픽 오브젝트를 얻었다면 함께 셉니다.',
      tradeRead:'첫 비율은 우리 팀도 무언가 얻은 경우, 두 번째는 상·하단 반대편에서 얻은 경우입니다. 비율은 경기마다 구해 평균했습니다. 예를 들어 상대가 위쪽에서 바론을 얻고 우리 팀이 아래쪽 타워를 얻으면 두 비율에 모두 들어갑니다. 중앙에서 얻은 것은 반대편으로 세지 않습니다.',
      kinds:{all:'모든 에픽 오브젝트',DRAGON:'드래곤',BARON_NASHOR:'바론',other:'유충·전령·아타칸 등'},
      modes:{all:'근처 킬 여부 전체',no_nearby_kill:'근처에서 킬이 없었던 경우',nearby_kill:'근처에서 킬이 있었던 경우'},
      any:'앞뒤 90초에 우리 팀도 무언가 얻은 비율',opposite:'상·하단 반대편에서 얻은 비율',
      tradeLimit:'우리 팀도 얻은 것이 있다는 기록입니다. 일부러 내줬거나 같은 가치로 교환했다는 뜻은 아닙니다. 근처에 킬이 없어도 오브젝트를 놓고 경합했을 수 있습니다.',
      counts:'상대가 얻은 오브젝트별 횟수',examples:'실제 장면 보기',noCounter:'앞뒤 90초에 우리 팀의 다른 획득 없음',
      seriesTitle:'세트 사이의 배치 변화',seriesMethod:'같은 맞대결의 연속 세트에서 선택한 시간대의 배치를 비교합니다. 전체 기록의 변화와, 비슷한 경기 상황끼리 좁혀 본 변화를 나란히 보여 줍니다.',
      seriesRead:'전체 기록의 차이는 각 세트에서 확인한 기록을 모두 쓴 값입니다. 비슷한 상황끼리의 차이는 시간·골드·직전 예측 승률·활동 인원이 비슷한 기록만 골라 비교한 값입니다. +는 다음 세트에서 늘었다는 뜻입니다. 40% → 60%의 차이는 +20%p입니다.',
      seriesBlank:'—는 비슷한 상황의 기록이 각 세트에 4개씩 모이지 않아 계산하지 못했다는 뜻입니다. 변화가 없다는 뜻은 아닙니다.',
      seriesLimit:'한 맞대결에서 나타난 변화입니다. 조합·진영·상대 대응의 영향이 남아 있어 팀의 학습이나 적응력으로 단정할 수는 없습니다.',
      noRepeat:'여러 상대와의 맞대결에서 반복된 패배 후 변화로 요약하기에는 자료가 부족합니다.',
      sideChange:'두 세트의 진영이 달라 그 영향도 포함됩니다.',sameSide:'두 세트의 진영이 같습니다.',draft:'조합 특성 거리',draftTooFar:'챔피언 조합 차이가 비교 기준보다 커, 비슷한 상황끼리의 차이는 계산하지 않았습니다.',
      composition:'이 세트의 챔피언 보기',before:'이전 세트',after:'다음 세트',rawChange:'전체 기록의 차이',matched:'비슷한 상황끼리의 차이',pairs:'각 세트에서 비교한 기록',
      missing:'이 팀·선수의 운영 자료를 더 모으고 있습니다.',empty:'이 조건에 해당하는 기록이 없습니다.',sample:'자료 적음',observed:'자료 범위',
      n:(m,unit='기록')=>`${m.n_games}경기 · 맞대결 ${m.n_series}회 · 상대 ${m.n_opponents}팀 · ${unit} ${m.n_events}개`,
      win:'승',loss:'패',gold:'골드',seconds:'초',watchFrom:'부터 보기',scrollHint:'표를 좌우로 밀어 나머지 열을 확인하세요.',more:'계산 방법과 자료 범위',read:'숫자 읽는 법',pp:'%p',interval:'95% 범위',records:'기록',tradeRecords:'상대 획득',
      game:n=>`${n}세트`,side:s=>s==='blue'?'블루 진영':s==='red'?'레드 진영':s,recordCount:n=>`기록 ${n}개`,pairCount:n=>`${n}개씩`,relativeTime:s=>s===0?'상대 획득과 같은 시각':`상대 획득 ${Math.abs(s).toFixed(1).replace(/\.0$/,'')}초 ${s<0?'전':'뒤'}`,
      metrics:{pair_jungle_support:'정글–서포터가 가까이 있는 비율',pair_jungle_mid:'정글–미드가 가까이 있는 비율',pair_mid_bot:'미드–원딜이 가까이 있는 비율',pair_bot_support:'원딜–서포터가 가까이 있는 비율',compact_four:'네 명이 모여 있는 비율',isolated_side:'탑 또는 미드가 사이드에 떨어져 있는 비율',enemy_half_share:'상대 진영에 있는 인원 비중',gold_share_top:'팀의 다음 1분 골드 증가 중 탑의 몫',gold_share_bot:'팀의 다음 1분 골드 증가 중 원딜의 몫'},
      zones:{top:'상단',mid:'중앙',bot:'하단',unknown:'구역 미상'},
      assets:{DRAGON:'드래곤',BARON_NASHOR:'바론',HORDE:'유충',RIFTHERALD:'전령',ATAKHAN:'아타칸',TOWER_BUILDING:'타워',INHIBITOR_BUILDING:'억제기'},
      tradeDetails:'우리 팀의 한 획득은 가장 가까운 상대 획득에 한 번만 연결합니다. 앞뒤 90초를 집계하되, 시간 범위를 바꾼 점검에도 쓸 수 있도록 앞뒤 120초 기록이 모두 있는 상대 획득만 사용합니다. 근처 킬은 획득 위치 3,500유닛 이내에서 획득 전 45초~후 30초에 난 킬입니다. 이 기준은 교전 전체나 경합 여부를 포착하지 못합니다.',
      seriesDetails:'비슷한 상황은 시간 차이 90초 이내, 팀 골드 차이의 차이 1,500 이내, 직전 모형 승률 차이 10%p 이내, 활동 인원 일치로 정합니다. 조합 특성 거리 0.4 이하인 세트끼리 기록을 일대일로 짝짓습니다. 챔피언의 조합 특성을 요약한 거리이며 실제 상성을 완전히 통제한 값은 아닙니다. 지표마다 쓸 수 있는 기록이 다르며 각 세트에 4개씩 이상 있어야 비교 차이를 표시합니다. 배치는 같은 시각의 위치 기록이며 두 선수는 약 2,250유닛 이내일 때 가깝다고 봅니다. 상대 진영 인원 비중과 골드 증가의 몫은 행동의 빈도와 다른 지표입니다.',
      seriesScope:'이 표는 한 맞대결 안의 두 세트를 비교합니다. 자료 적음은 각 세트에서 짝지어 비교할 기록이 4개 미만이라는 뜻입니다. 기록 수는 지표에 따라 위치 기록 또는 다음 1분의 골드 증가를 확인할 수 있는 구간 수입니다.',
      commonDetails:'비율·평균은 경기마다 계산한 뒤 경기끼리 같은 비중으로 평균합니다. 95% 범위는 시리즈를 묶음으로 다시 뽑아 계산한 범위입니다. 범위가 넓으면 추정값의 불확실성도 큽니다. 자료 적음은 4경기·3시리즈·3상대·12기록 중 하나라도 부족한 경우입니다. 맞대결 1회는 같은 상대와 치른 한 시리즈이며, 단판도 포함합니다.',
    },
    en:{title:'Operational timing',views:{trades:'Objective exchanges',series:'Between games'},phases:{early:'Early · 2–15 min',middle:'Middle · 15–25 min',late:'Late · 25+ min'},states:{all:'All states',ahead:'Ahead · +2,000 gold',even:'Even · less than 2,000 apart',behind:'Behind · −2,000 gold'},tradeTitle:'What did this team acquire around an enemy objective?',tradeMethod:'Link towers, inhibitors and other epics within ±90 seconds of an enemy epic. Each own asset is assigned once to the nearest enemy acquisition. All denominators have complete ±120-second coverage; games receive equal weight.',kinds:{all:'All epics',DRAGON:'Dragon',BARON_NASHOR:'Baron',other:'Other epics'},modes:{all:'All nearby-kill states',no_nearby_kill:'No nearby kill observed',nearby_kill:'Nearby kill observed'},any:'Any linked acquisition within ±90 s',opposite:'Linked acquisition on opposite top/bottom side',tradeLimit:'This does not identify deliberate concessions or equal-value trades. No nearby kill means none within 3,500 units from −45 to +30 s, not no contest.',counts:'Objective mix',examples:'Example observations',noCounter:'No linked acquisition within ±90 s',seriesTitle:'What changed across consecutive games against the same opponent?',seriesMethod:'Same-phase comparisons. One-to-one state matching uses ±90 s, ±1,500 gold, ±0.10 past model WP, equal active counts and draft-proxy distance ≤0.4. Eligible observations differ by metric.',seriesLimit:'Retrospective shifts do not identify learning. Draft matchups, waves and opponent response remain. Side changes are included when the side switches.',noRepeat:'Insufficient repeated series/opponents to summarize a general post-loss adaptation pattern.',sideChange:'Side change included',sameSide:'Same side',draft:'Draft-proxy distance',draftTooFar:'Draft-proxy distance exceeds the caliper; no state-matched comparison.',composition:'Champions by game',before:'Before',after:'After',rawChange:'Observed change',matched:'State-matched change',pairs:'Pairs',missing:'Operational coverage is being prepared.',empty:'No observations match this condition.',sample:'Limited sample',observed:'Across opponents',n:m=>`${m.n_games} games · ${m.n_series} series · ${m.n_opponents} opponents · ${m.n_events} observations`,win:'W',loss:'L',gold:'gold',seconds:'s',more:'Method and limits',metrics:{pair_jungle_support:'JG–SUP proximity',pair_jungle_mid:'JG–MID proximity',pair_mid_bot:'MID–ADC proximity',pair_bot_support:'ADC–SUP proximity',compact_four:'Four-player grouping',isolated_side:'Isolated side formation',enemy_half_share:'Enemy-half player share',gold_share_top:'TOP share of next-minute gold gain',gold_share_bot:'ADC share of next-minute gold gain'},zones:{top:'Top side',mid:'Middle',bot:'Bottom side',unknown:'Unknown zone'},assets:{DRAGON:'Dragon',BARON_NASHOR:'Baron',HORDE:'Grubs',RIFTHERALD:'Herald',ATAKHAN:'Atakhan',TOWER_BUILDING:'Tower',INHIBITOR_BUILDING:'Inhibitor'}},
  };
  Object.assign(COPY.en,{n:(m,unit='records')=>`${m.n_games} games · ${m.n_series} series · ${m.n_opponents} opponents · ${m.n_events} ${unit}`,
    tradeRead:'The first rate includes any own acquisition. The second requires opposite top/bottom sides; middle acquisitions do not qualify. An enemy Baron at the top and an own tower at the bottom count in both.',
    seriesRead:'All-record change uses every eligible record in the selected phase. Similar-state change uses only matched records. Positive means more in the next game. A rise from 40% to 60% is +20 percentage points.',
    seriesBlank:'— means fewer than four matched records per game, not zero change.',
    watchFrom:' · watch from here',scrollHint:'Swipe the table to see more columns.',read:'How to read this',pp:'pp',interval:'95% interval',records:'records',tradeRecords:'enemy acquisitions',
    game:n=>`G${n}`,side:s=>s==='blue'?'Blue side':s==='red'?'Red side':s,recordCount:n=>`${n} records`,pairCount:n=>`${n} per game`,relativeTime:s=>s===0?'At the enemy acquisition':`${Math.abs(s).toFixed(1)} s ${s<0?'before':'after'} enemy acquisition`,
    rawChange:'All-record change',matched:'Similar-state change',pairs:'Matched records per game',
    tradeDetails:COPY.en.tradeMethod+' '+COPY.en.tradeLimit,seriesDetails:COPY.en.seriesMethod+' '+COPY.en.seriesLimit,
    tradeTitle:'Acquisitions around enemy objectives',seriesTitle:'Positioning between games',
    tradeMethod:'Look 90 seconds before and after an enemy epic acquisition. Count own towers, inhibitors or other epics acquired in that window.',
    seriesMethod:'Compare consecutive games against the same opponent in the selected phase. See both the full eligible record and a smaller set of similar-state records.',
    seriesScope:'This table compares two games within one encounter. Limited coverage means fewer than four matched records per game. Counts refer to position records or windows with observable next-minute gold growth, depending on the metric.',
    commonDetails:'Rates and means average games equally. Intervals resample whole series. Wider intervals indicate more uncertainty. Limited coverage means fewer than 4 games, 3 series, 3 opponents or 12 records. A series is one encounter with an opponent, including single-game encounters.',
  });
  const signed=v=>`${v>0?'+':''}${Number(v).toFixed(1)}`;
  const clock=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  function create(options={}){
    let data=null,pending=null;
    const c=()=>COPY[options.getLanguage?.()||'ko']||COPY.en;
    const coverage=(m,unit=c().records)=>`<small class="op-coverage ${m.enough_sample?'':'limited'}">${esc(m.enough_sample?c().observed:c().sample)} · ${esc(c().n(m,unit))}</small>`;
    const controls=(phase,state,includeState=true)=>`<div class="op-controls"><div class="seg">${Object.entries(c().phases).map(([k,v])=>`<button type="button" data-op-phase="${k}" class="${k===phase?'on':''}">${esc(v)}</button>`).join('')}</div>${includeState?`<div class="seg">${Object.entries(c().states).map(([k,v])=>`<button type="button" data-op-state="${k}" class="${k===state?'on':''}">${esc(v)}</button>`).join('')}</div>`:''}</div>`;
    const tile=(label,m,unit='%',dec=1,recordUnit=c().records)=>`<article><h3>${esc(label)}</h3>${m?`<strong>${m.value.toFixed(dec)}<small> ${esc(unit)}</small></strong>${coverage(m,recordUnit)}${m.ci95?`<p class="op-note">${esc(c().interval)}: ${m.ci95[0].toFixed(dec)} ~ ${m.ci95[1].toFixed(dec)} ${esc(unit)}</p>`:''}`:`<p class="op-note">${esc(c().empty)}</p>`}</article>`;
    const video=e=>/^https:\/\/www\.youtube\.com\/watch\?/.test(e.video_url||'')?`<a href="${esc(e.video_url)}" target="_blank" rel="noopener">${esc(e.opponent)} · ${clock(e.video_game_t??e.t)}${esc(c().watchFrom)} ↗</a>`:`<span class="op-note">${esc(e.opponent)} · ${clock(e.video_game_t??e.t)} · ${options.getLanguage?.()==='ko'?'영상 시점 미확인':'VOD time unavailable'}</span>`;
    const guide=body=>`<aside class="analysis-guide"><b>${esc(c().read)}</b><p>${esc(body)}</p></aside>`;
    const foot=(view,extra='')=>`<details class="op-details"><summary>${esc(c().more)}</summary><p class="op-note">${esc(c()[view+'Details'])}</p>${extra}<p class="op-note">${esc(view==='series'?c().seriesScope:c().commonDetails)}</p></details>`;
    async function load(){if(pending)return pending;pending=(async()=>{try{const r=await fetch('./data/team-operations-timing-v1.json',{cache:'no-cache'});if(r.ok)data=await r.json();}catch(e){data=null;}})();return pending;}
    function tradesHtml(tid,team,o){
      const {phase='middle',state='all',mode='all',objective='all'}=o,copy=c(),purpose=window.PlayValueExplore?.purposeHtml('trades',options.getLanguage?.()||'ko')||'';
      const p=data?.trades.find(p=>p.tournament===tid&&p.team===team&&p.phase===phase&&p.state===state&&p.mode===mode&&p.objective_group===objective);
      const picks=`<div class="op-controls"><select id="opObjective" aria-label="${esc(copy.counts)}">${Object.entries(copy.kinds).map(([k,v])=>`<option value="${k}" ${k===objective?'selected':''}>${esc(v)}</option>`).join('')}</select><select id="opMode" aria-label="${esc(copy.modes.all)}">${Object.entries(copy.modes).map(([k,v])=>`<option value="${k}" ${k===mode?'selected':''}>${esc(v)}</option>`).join('')}</select></div>`;
      return `<h2>${esc(copy.tradeTitle)}</h2>${purpose}${controls(phase,state)}${picks}<p class="op-note">${esc(copy.tradeMethod)}</p>${guide(copy.tradeRead)}${p?`<div class="op-tiles">${tile(copy.any,p.metrics.any_counter,'%',1,copy.tradeRecords)}${tile(copy.opposite,p.metrics.opposite_counter,'%',1,copy.tradeRecords)}</div><p class="op-note">${esc(copy.counts)}: ${Object.entries(p.objective_counts).map(([k,v])=>`${esc(copy.assets[k]||k)} ${v}`).join(' · ')}</p><h3>${esc(copy.examples)}</h3><div class="op-examples">${p.examples.map(e=>`<article><b>${esc(copy.assets[e.objective]||e.objective)} · ${clock(e.t)}</b> ${video(e)}<ul>${e.counter_assets?.length?e.counter_assets.map(a=>`<li>${esc(copy.assets[a.kind]||a.kind)} · ${esc(copy.zones[a.zone]||a.zone)} · ${esc(copy.relativeTime(a.delta_s))}</li>`).join(''):`<li>${esc(copy.noCounter)}</li>`}</ul></article>`).join('')}</div>`:`<p>${esc(copy.empty)}</p>`}<p class="note-box">${esc(copy.tradeLimit)}</p>${foot('trade')}`;
    }
    function seriesHtml(tid,team,o){
      const copy=c(),purpose=window.PlayValueExplore?.purposeHtml('series',options.getLanguage?.()||'ko')||'',phase=o.phase||'middle',series=data?.series.filter(s=>s.tournament===tid&&s.team===team).sort((a,b)=>b.date.localeCompare(a.date)||b.series.localeCompare(a.series))||[];
      const selected=series.find(s=>s.series===o.series)||series[0];
      if(!selected)return `<h2>${esc(copy.seriesTitle)}</h2>${purpose}<p>${esc(copy.empty)}</p>`;
      const comparisons=data.comparisons.filter(p=>p.tournament===tid&&p.team===team&&p.series===selected.series&&p.phase===phase);
      const chosen=comparisons.find(p=>p.before_game===o.before)||comparisons.find(p=>p.metrics.some(m=>m.matched_coverage_sufficient))||comparisons[0];
      return `<h2>${esc(copy.seriesTitle)}</h2>${purpose}${controls(phase,'all',false)}<div class="op-controls"><select id="opSeries" aria-label="${esc(copy.views.series)}">${series.map(s=>`<option value="${esc(s.series)}" ${s.series===selected.series?'selected':''}>${esc(s.date)} · vs ${esc(s.opponent)}</option>`).join('')}</select></div><div class="op-series-games">${selected.games.map(g=>`<article><b>${esc(copy.game(g.game_num))} · ${esc(g.won?copy.win:copy.loss)}</b><small>${esc(copy.side(g.side))}</small><details><summary>${esc(copy.composition)}</summary><p>${g.champions.map(p=>esc(options.getLanguage?.()==='ko'?(p.champion_ko||p.champion):p.champion)).join(' · ')}</p></details></article>`).join('')}</div><p class="op-note">${esc(copy.seriesMethod)}</p>${guide(copy.seriesRead)}
        <div class="seg op-pair-tabs">${comparisons.map(p=>`<button type="button" data-op-before="${esc(p.before_game)}" class="${p===chosen?'on':''}">${esc(copy.game(p.before_num))} → ${esc(copy.game(p.after_num))}</button>`).join('')}</div>
        ${chosen?`<p class="op-note">${esc(chosen.side_changed?copy.sideChange:copy.sameSide)}${chosen.draft_distance>.4?` · ${esc(copy.draftTooFar)}`:''}</p><p class="analysis-scroll-hint">${esc(copy.scrollHint)}</p><div class="scroll-x"><table class="xt op-series-table"><thead><tr><th></th><th>${esc(copy.game(chosen.before_num))}</th><th>${esc(copy.game(chosen.after_num))}</th><th>${esc(copy.rawChange)}</th><th>${esc(copy.matched)}</th><th>${esc(copy.pairs)}</th></tr></thead><tbody>${chosen.metrics.map(m=>`<tr><th scope="row">${esc(copy.metrics[m.metric]||m.metric)}</th><td>${m.before.toFixed(1)}%<small>${esc(copy.recordCount(m.n_before))}</small></td><td>${m.after.toFixed(1)}%<small>${esc(copy.recordCount(m.n_after))}</small></td><td>${signed(m.raw_change_pp)} ${esc(copy.pp)}</td><td>${m.matched_coverage_sufficient?signed(m.matched_change_pp)+' '+esc(copy.pp):'—'}</td><td>${esc(copy.pairCount(m.n_pairs))}${m.matched_coverage_sufficient?'':` · ${esc(copy.sample)}`}</td></tr>`).join('')}</tbody></table></div><p class="op-note">${esc(copy.seriesBlank)}</p>`:`<p>${esc(copy.empty)}</p>`}<p class="note-box">${esc(copy.seriesLimit)} ${esc(copy.noRepeat)}</p>${foot('series',chosen?`<p class="op-note">${esc(copy.draft)}: ${chosen.draft_distance.toFixed(2)}</p>`:'')}`;
    }
    function teamHtml(tid,team,o={}){
      const copy=c();if(!data?.teams[tid]?.includes(team))return `<section class="card team-operations"><h2>${esc(copy.title)}</h2><p>${esc(copy.missing)}</p></section>`;
      const view=o.view==='series'?'series':'trades';
      return `<section class="card team-operations"><h2>${esc(copy.title)} <span class="sub">${esc(team)}</span></h2><div class="op-controls"><div class="seg">${Object.entries(copy.views).map(([k,v])=>`<button type="button" data-op-view="${k}" class="${k===view?'on':''}">${esc(v)}</button>`).join('')}</div></div>${view==='series'?seriesHtml(tid,team,o):tradesHtml(tid,team,o)}</section>`;
    }
    function wire(root){
      for(const key of ['view','phase','state','before'])root.querySelectorAll(`[data-op-${key}]`).forEach(b=>b.onclick=()=>options.onChange?.({[key]:b.dataset['op'+key[0].toUpperCase()+key.slice(1)]}));
      for(const [id,key] of [['opObjective','objective'],['opMode','mode'],['opSeries','series']]){
        const el=root.querySelector('#'+id);if(el)el.onchange=()=>options.onChange?.({[key]:el.value,...(key==='series'?{before:''}:{})});
      }
    }
    return {load,teamHtml,wire};
  }
  window.PlayValueOperations={create};
})();
