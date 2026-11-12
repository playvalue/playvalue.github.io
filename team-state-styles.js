/* Full-game state-conditioned geometry, separate from commentary-play values. */
(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const COPY={
    ko:{title:'상황별 행동',sub:'유리할 때와 불리할 때, 이 팀은 어디에 누구를 배치하나요?',
      phases:{early:'초반 · 2~15분',middle:'중반 · 15~25분',late:'후반 · 25분 이후'},
      states:{ahead:'유리 · +2,000골드 이상',even:'균형 · 골드 차이 2,000 미만',behind:'불리 · −2,000골드 이하'},
      method:'유리·불리는 그 시점의 팀 골드 차이로 나눴습니다. 아래는 다섯 명 모두 살아서 본진 밖에 있던 때의 배치입니다.',
      scrollHint:'표를 좌우로 밀어 나머지 열을 확인하세요.',read:'숫자 읽는 법',readBody:'실제 비율은 해당 배치가 나타난 빈도를 경기마다 구해 평균한 값입니다. 상대 진영 인원 비중은 상대편 맵에 있던 인원의 몫입니다. 비교 기준은 이 대회의 비슷한 경기 상황에서 예상한 비율입니다. 차이가 +면 예상보다 높고, −면 낮았다는 뜻입니다. 40% → 60%의 차이는 +20%p입니다.',
      metric:'배치',raw:'실제 비율',expected:'비슷한 상황의 예상',difference:'예상과의 차이',sample:'자료 범위',examples:'실제 장면',video:'영상',pp:'%p',
      limited:'자료 적음',observed:'자료 범위',games:n=>`${n}경기`,series:n=>`맞대결 ${n}회`,opponents:n=>`상대 ${n}팀`,rows:n=>`위치 기록 ${n}개`,
      transitions:'그다음 1분에는 어떻게 달라졌나요?',transitionNote:'예를 들어 사이드에 떨어져 있던 다음 분에 네 명이 모였는지 봅니다. 모이거나 떨어진 배치의 유지는 두 시점 모두 필요한 선수의 위치가 있을 때만 셉니다. 그 사이에 어떤 경로로 움직였는지는 알 수 없습니다.',
      caveat:'자주 보인 배치가 승리에 더 도움이 됐다는 뜻은 아닙니다. 유리할 때와 불리할 때의 자료에는 서로 다른 경기·상대가 포함될 수 있습니다.',
      overlap:'같은 경기·시간대 안에서 유리와 불리를 직접 비교할 자료는 아직 부족합니다.',
      missing:'이 팀의 상황별 자료는 아직 준비 중입니다.',empty:'이 조건에서 한 경기당 위치 기록이 2개 이상인 자료가 없습니다.',
      more:'계산 방법과 자료 범위',extra:'비율은 경기마다 구한 뒤 경기끼리 같은 비중으로 평균했습니다. 종료 3분 전까지만 집계합니다. 예상 비율은 시간·골드·직전 모형 승률·진영·조합 특성을 사용한 예측값이며, 예측할 시리즈는 학습에서 제외했습니다. 조합 상성이나 상대 실력이 모두 통제된 값은 아닙니다. 자료 적음은 4경기·3시리즈·3상대·위치 기록 20개 중 하나라도 부족한 경우입니다. 맞대결 1회는 같은 상대와의 한 시리즈이며 단판도 포함합니다. 가까움의 기준은 약 2,250유닛입니다. 배치는 분 단위 동시 좌표로 판단하며 정확한 플레이 실행·콜·시야 위험을 뜻하지 않습니다. 전환에서 밀집·사이드 유지는 양끝 시점의 활동이 필요하고, 본진 복귀·사망은 시작 시 다섯 명 모두 생존·본진 밖인 구간을 셉니다. 대표 장면은 현재 상태와 배치만으로 골랐으며 이후의 결과로 고르지 않았습니다.',
    },
    en:{title:'Behavior by game state',sub:'How does this team position when ahead or behind?',phases:{early:'Early · 2–15 min',middle:'Middle · 15–25 min',late:'Late · 25+ min'},states:{ahead:'Ahead · +2,000 gold or more',even:'Even · less than 2,000 apart',behind:'Behind · −2,000 gold or less'},method:'Groups use current gold. Living, outside-base observations end three minutes before game end and receive equal weight per game. Expected rates reuse held-out-series predictions with time, gold, past model WP, side and draft proxies.',metric:'Observed formation',raw:'Observed rate',expected:'Expected rate',difference:'Vs expected',sample:'Coverage',examples:'Example times',video:'Video',limited:'Limited sample',observed:'Observed across opponents',games:n=>`${n} games`,series:n=>`${n} series`,opponents:n=>`${n} opponents`,rows:n=>`${n} observations`,transitions:'What happens in the next minute?',transitionNote:'Grouping and side persistence require observed activity at the necessary endpoints. Base and death observations require all five active at the start. Movement between minute frames is not reconstructed.',caveat:'Frequency differences do not identify intention or winning contribution. Ahead and behind samples may contain different games and opponents. Draft matchups and opponent strength are not fully controlled.',overlap:'There is insufficient shared-game/phase support for a direct ahead-versus-behind contrast.',missing:'State coverage for this team is being prepared.',empty:'No eligible games have at least two observations under this condition.',more:'Method and limits',extra:'These are coarse observed positions, not exact execution, team calls or vision risk. Limited samples have fewer than 4 games, 3 series, 3 opponents or 20 observations. Minutes are not independent games. Examples use current state and behavior only.'},
  };
  Object.assign(COPY.en,{scrollHint:'Swipe the table to see more columns.',read:'How to read this',readBody:'Observed rates describe this team. The reference predicts rates in similar game states across this event. Positive differences mean more frequent, negative less frequent. A rise from 40% to 60% is +20 percentage points.',pp:'pp',method:'States use the current team gold gap. These formations are measured when all five players are alive and outside base.',extra:COPY.en.extra+' Rates average games equally and exclude the final three minutes. Expected rates are held-out-series predictions using time, gold, past model WP, side and draft proxies. A series is one encounter, including single-game encounters.'});
  const LABELS_KO={
    support_near_jungle:['서포터와 정글이 가까이 있음','두 선수 사이 약 2,250유닛 이내'],
    support_away_bot:['서포터와 원딜이 떨어져 있음','두 선수 사이 약 2,250유닛 초과'],
    compact_four:['네 명이 모여 있음','네 명의 모든 쌍이 약 2,700유닛 이내'],
    isolated_side:['탑 또는 미드가 사이드에 떨어져 있음','탑 또는 미드가 외곽 라인에서 동료들과 분리'],
    two_sides:['위·아래 사이드에 나뉘어 있음','양쪽 사이드에 한 명씩, 나머지 세 명은 모인 배치'],
    enemy_half_share:['상대 진영에 있는 인원 비중','배치의 빈도가 아니라, 다섯 명 중 상대편 맵에 있는 인원의 평균 비중'],
    adc_mid_axis:['원딜이 맵 중앙 대각선 부근에 있음','좌표 기준이며 미드 라인에서 파밍했다는 뜻은 아님'],
    side_to_group:['사이드 분리 뒤, 다음 분에 네 명이 모임','시작 때 탑·미드가 사이드에 떨어져 있던 경우 중'],
    side_persist:['다음 분에도 사이드 분리 배치 유지','시작 때 탑·미드가 사이드에 떨어져 있던 경우 중'],
    group_persist:['다음 분에도 네 명이 모인 배치 유지','시작 때 네 명이 모여 있던 경우 중'],
    support_rejoin:['떨어져 있던 서포터와 원딜이 다음 분에 가까워짐','시작 때 두 선수가 떨어져 있던 경우 중'],
    base_next:['다음 분에 살아서 본진에 있는 선수 발생','시작 때 다섯 명 모두 생존·본진 밖인 경우 중'],
    death_next:['다음 분에 사망 상태인 선수 발생','시작 때 다섯 명 모두 생존·본진 밖인 경우 중'],
  };
  COPY.ja={...COPY.en,title:'状況別の行動',sub:'有利・不利な状況でどう配置するか。',phases:{early:'序盤 · 2～15分',middle:'中盤 · 15～25分',late:'終盤 · 25分以降'},states:{ahead:'有利 · +2,000ゴールド以上',even:'均衡 · ±2,000未満',behind:'不利 · −2,000ゴールド以下'},metric:'観測した配置',raw:'観測頻度',expected:'期待頻度',difference:'期待との差',sample:'資料範囲',examples:'代表時点',limited:'標本が限定的',observed:'複数相手で観測',transitions:'次の1分の変化',games:n=>`${n}試合`,series:n=>`${n}シリーズ`,opponents:n=>`${n}相手`,rows:n=>`${n}観測`};
  COPY.zh={...COPY.en,title:'不同局势下的行为',sub:'领先或落后时，这支队伍如何站位？',phases:{early:'前期 · 2–15分钟',middle:'中期 · 15–25分钟',late:'后期 · 25分钟后'},states:{ahead:'领先 · 至少2,000经济',even:'均衡 · 经济差小于2,000',behind:'落后 · 至少2,000经济'},metric:'观察站位',raw:'实际频率',expected:'预期频率',difference:'相对预期',sample:'样本范围',examples:'代表时点',limited:'样本有限',observed:'在多个对手中观察',transitions:'下一分钟如何变化',games:n=>`${n}局`,series:n=>`${n}系列赛`,opponents:n=>`${n}对手`,rows:n=>`${n}观察`};
  const PLACEMENT=['support_near_jungle','support_away_bot','compact_four','isolated_side','two_sides','enemy_half_share','adc_mid_axis'];
  const TRANSITIONS=['side_to_group','side_persist','group_persist','support_rejoin','base_next','death_next'];
  function create(options={}) {
    let data=null,pending=null;
    const lang=()=>options.getLanguage?.()||'ko';
    const copy=()=>COPY[lang()]||COPY.en;
    async function load(){
      if(pending)return pending;
      pending=(async()=>{try{const r=await fetch('./data/team-state-styles-v1.json',{cache:'no-cache'});if(r.ok)data=await r.json();}catch(e){data=null;}})();
      return pending;
    }
    function html(tournament,team,phase='middle',state='behind'){
      const c=copy(),purpose=window.PlayValueExplore?.purposeHtml('state',lang())||'';
      if(!data?.teams?.[tournament]?.includes(team))return `<section class="card"><h2>${esc(c.title)}</h2>${purpose}<p>${esc(c.missing)}</p></section>`;
      const rows=data.rows.filter(p=>p.tournament===tournament&&p.team===team&&p.phase===phase&&p.state===state);
      const percent=n=>`${Number(n).toFixed(1)}%`;
      const table=metrics=>`<p class="analysis-scroll-hint">${esc(c.scrollHint)}</p><div class="scroll-x"><table class="xt state-behavior-table"><thead><tr>${['metric','raw','expected','difference','sample','examples'].map(k=>`<th>${esc(c[k])}</th>`).join('')}</tr></thead><tbody>${metrics.map(metric=>{
        const p=rows.find(p=>p.metric===metric),name=lang()==='ko'?(LABELS_KO[metric]?.[0]||metric):(data.metrics[metric]?.en||metric),hint=lang()==='ko'?LABELS_KO[metric]?.[1]:'';
        if(!p)return `<tr><th scope="row">${esc(name)}${hint?`<small class="analysis-metric-hint">${esc(hint)}</small>`:''}</th><td colspan="5" class="state-no-data">${esc(c.empty)}</td></tr>`;
        return `<tr><th scope="row">${esc(name)}${hint?`<small class="analysis-metric-hint">${esc(hint)}</small>`:''}</th><td><b>${percent(p.raw_pct)}</b></td><td>${percent(p.expected_pct)}</td><td>${p.adjusted_pp>0?'+':''}${p.adjusted_pp.toFixed(1)} ${esc(c.pp)}</td><td class="state-evidence"><span>${esc(c.games(p.n_games))} · ${esc(c.series(p.n_series))} · ${esc(c.opponents(p.n_opponents))}</span><small>${esc(c.rows(p.n_observations))} · ${esc(p.enough_sample?c.observed:c.limited)}</small><small>${esc(p.opponents.join(' · '))}</small></td><td>${p.examples.filter(e=>/^https:\/\/www\.youtube\.com\/watch\?/.test(e.video_url||'')).map(e=>`<a class="state-video" href="${esc(e.video_url)}" target="_blank" rel="noopener">${esc(e.opponent)} · ${Math.floor(e.t/60)}:${String(Math.floor(e.t%60)).padStart(2,'0')} ↗</a>`).join('')}</td></tr>`;
      }).join('')}</tbody></table></div>`;
      return `<section class="card state-behavior"><h2>${esc(c.title)} <span class="sub">${esc(team)}</span></h2>${purpose||`<p class="state-intro">${esc(c.sub)}</p>`}
        <div class="state-controls"><div class="seg">${Object.entries(c.phases).map(([key,label])=>`<button type="button" data-state-phase="${key}" class="${key===phase?'on':''}">${esc(label)}</button>`).join('')}</div><div class="seg">${Object.entries(c.states).map(([key,label])=>`<button type="button" data-state-condition="${key}" class="${key===state?'on':''}">${esc(label)}</button>`).join('')}</div></div>
        <p class="state-method">${esc(c.method)}</p><aside class="analysis-guide"><b>${esc(c.read)}</b><p>${esc(c.readBody)}</p></aside>${table(PLACEMENT)}
        <details class="state-transitions"><summary>${esc(c.transitions)}</summary><p class="state-method">${esc(c.transitionNote)}</p>${table(TRANSITIONS)}</details>
        <p class="note-box">${esc(c.caveat)} ${esc(c.overlap)}</p><details class="stats-how"><summary>${esc(c.more)}</summary><p>${esc(c.extra)}</p></details></section>`;
    }
    function wire(root){
      root.querySelectorAll('[data-state-phase]').forEach(b=>b.onclick=()=>options.onChange?.({phase:b.dataset.statePhase}));
      root.querySelectorAll('[data-state-condition]').forEach(b=>b.onclick=()=>options.onChange?.({state:b.dataset.stateCondition}));
    }
    return {load,html,wire};
  }
  window.PlayValueTeamStates={create};
})();
