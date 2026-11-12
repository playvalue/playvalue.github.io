/* Observed tournament signatures: independent of selected WPS horizon and result. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clock = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2,'0')}`;
  const TEXT = {
    ko: { heading:'상위권 팀의 Signature', sub:'이번 대회에서 반복된 배치를, 서로 다른 경기의 장면으로 확인하세요.', scope:'대회 전체 · 관측 특징', rank:n=>`${n}위`, semi:'4강', candidate:'시그니처 후보', phases:{early:'초반 · 2–15분',middle:'중반 · 15–25분',late:'후반 · 25분 이후'}, observed:'관측 빈도', expected:'비슷한 경기 상태의 기대치', evidence:(g,o,s)=>`${g}경기 · ${o}상대 · ${s}시리즈`, recurrence:(g,n)=>`${n}개 유효 경기 중 ${g}경기에서 관측`, choose:t=>`${t}를 팀 A로 선택`, sparse:'반복 근거를 더 모으고 있습니다.', sparseBody:(g,s,o)=>`현재 공개된 자료는 ${g}경기·${s}시리즈·${o}상대입니다. 여러 상대에게 반복된 특징을 구분하려면 자료가 더 필요합니다.`, pending:'상위권 팀부터 시그니처를 준비하고 있습니다.', note:'이번 대회에서 관측된 배치 후보입니다. 빈도는 승률이나 성공률이 아니며, 조합의 영향도 포함돼 있습니다.', method:'관측 기준 보기', methodBody:'선수 전원의 Riot 분 단위 좌표로 비교했습니다. 시간·골드·직전 모형 승률·진영을 고려한 기대치이며, 관측점은 경기별로 동일 가중합니다. 본진·사망 등으로 비교할 수 없는 선수는 지표의 분모에서 제외합니다. 대표 장면은 경기 상태가 전형적이고 다른 상대에게 반복된 것을 우선하며, 승패나 이후 승률 변화로 고르지 않습니다.', close:'닫기', frame:'분 단위 동시 좌표', center:'대표 시점', previous:'이전 분', next:'다음 분', vod:'YouTube에서 이 시각 보기', game:'경기 플레이 목록', gold:'팀 골드 차이', wp:'직전 모형 승률', blue:'블루 진영', red:'레드 진영', mapNote:'선택한 분의 실제 좌표입니다. 프레임 사이 이동은 보간하지 않습니다.', example:'대표 장면', viewExample:'대표 장면 보기' },
    en: { heading:'Top teams’ signatures', sub:'See recurring formations across different games in this tournament.', scope:'Whole tournament · observed patterns', rank:n=>`#${n}`, semi:'Semifinalist', candidate:'Signature candidate', phases:{early:'Early · 2–15 min',middle:'Middle · 15–25 min',late:'Late · 25+ min'}, observed:'Observed frequency', expected:'Expected in similar game states', evidence:(g,o,s)=>`${g} games · ${o} opponents · ${s} series`, recurrence:(g,n)=>`Observed in ${g} of ${n} eligible games`, choose:t=>`Select ${t} as Team A`, sparse:'More repeated evidence needed.', sparseBody:(g,s,o)=>`Published coverage: ${g} games, ${s} series and ${o} opponents. More coverage is needed to distinguish recurring traits.`, pending:'Signatures are starting with the top teams.', note:'Observed formation candidates for this tournament. Frequency is not win or success probability; draft effects remain included.', method:'How this is measured', methodBody:'Based on synchronous Riot minute frames. Expectations account for time, gold, prior model WP and side, with equal game weighting. Dead or base-bound players are excluded where a metric needs active positions. Examples prioritize typical states and different opponents, never final results or subsequent WP changes.', close:'Close', frame:'Synchronous minute frame', center:'Selected moment', previous:'Previous minute', next:'Next minute', vod:'Watch this time on YouTube', game:'Open game plays', gold:'Team gold difference', wp:'Prior model WP', blue:'Blue side', red:'Red side', mapNote:'Actual positions at the selected minute. Movement between frames is not interpolated.', example:'Example', viewExample:'View example' },
    zh: { heading:'强队的标志性站位', sub:'通过不同比赛的画面，查看本届赛事反复出现的站位。', scope:'赛事全样本 · 观测特征', rank:n=>`第${n}名`, semi:'四强', candidate:'风格候选', phases:{early:'前期 · 2–15分钟',middle:'中期 · 15–25分钟',late:'后期 · 25分钟后'}, observed:'观测频率', expected:'相似比赛状态下的预期', evidence:(g,o,s)=>`${g}局 · ${o}个对手 · ${s}个系列赛`, recurrence:(g,n)=>`在${n}局有效比赛中的${g}局出现`, choose:t=>`选择${t}为队伍A`, sparse:'需要更多重复观测。', sparseBody:(g,s,o)=>`目前公开数据为${g}局、${s}个系列赛、${o}个对手。仍需更多数据来区分稳定特征。`, pending:'正在从强队开始整理风格。', note:'本届赛事中的站位候选特征。频率并非胜率或成功率，阵容影响仍包含其中。', method:'查看观测方法', methodBody:'使用Riot每分钟同步坐标，考虑时间、经济、此前模型胜率和阵营，各局等权。死亡或回城导致站位无效时，不计入相关指标的分母。示例优先选择典型状态及不同对手，不以最终胜负或后续胜率变化筛选。', close:'关闭', frame:'每分钟同步坐标', center:'代表时刻', previous:'上一分钟', next:'下一分钟', vod:'在YouTube观看此时刻', game:'打开本局战术列表', gold:'本队经济差', wp:'此前模型胜率', blue:'蓝色方', red:'红色方', mapNote:'所选分钟的实际坐标，不对帧间移动进行插值。', example:'代表画面', viewExample:'查看代表画面' },
    ja: { heading:'上位チームのシグネチャー', sub:'今大会で繰り返された配置を、異なる試合の場面で確認。', scope:'大会全体 · 観測された特徴', rank:n=>`${n}位`, semi:'ベスト4', candidate:'スタイル候補', phases:{early:'序盤 · 2–15分',middle:'中盤 · 15–25分',late:'終盤 · 25分以降'}, observed:'観測頻度', expected:'似た試合状況での期待値', evidence:(g,o,s)=>`${g}試合 · ${o}対戦相手 · ${s}シリーズ`, recurrence:(g,n)=>`有効な${n}試合中${g}試合で観測`, choose:t=>`${t}をチームAに選択`, sparse:'反復の根拠を収集中です。', sparseBody:(g,s,o)=>`公開データは${g}試合・${s}シリーズ・${o}対戦相手です。繰り返す特徴を判断するには、さらに資料が必要です。`, pending:'上位チームから順に準備しています。', note:'今大会で観測された配置の候補です。頻度は勝率や成功率ではなく、構成の影響も含みます。', method:'観測方法', methodBody:'Riotの毎分同時座標を使用。時間・ゴールド・直前のモデル勝率・陣営を考慮し、試合を等しく加重しています。死亡や帰還で無効な位置は該当指標の分母から除外。代表場面は典型的な状況と異なる相手を優先し、最終結果やその後の勝率変化では選びません。', close:'閉じる', frame:'毎分の同時座標', center:'代表時点', previous:'前の分', next:'次の分', vod:'YouTubeでこの時刻を見る', game:'試合のプレー一覧', gold:'チームのゴールド差', wp:'直前のモデル勝率', blue:'ブルー側', red:'レッド側', mapNote:'選択した分の実際の座標です。フレーム間の移動は補間していません。', example:'代表場面', viewExample:'代表場面を見る' }
  };
  const TITLES = {
    isolated_side:['サイド分離','사이드 분리','Separated side lanes','边线分离'],
    support_away_bot:['サポートとADCの分離','서포터–원딜 분리','Support away from ADC','辅助与ADC分离'],
    near_bot:['ボットデュオの近接','바텀 듀오 근접','Bot duo staying close','下路双人靠近'],
    support_near_jungle:['ジャングルとサポートの近接','정글–서포터 근접','Jungle–support proximity','野辅靠近'],
    two_sides:['両サイドへの分散','양쪽 사이드 분산','Opposite-side deployment','双边线分散'],
    compact_four:['4人の密集','4인 밀집','Four players grouped','四人聚集'],
    fewer_four:['4人密集が少ない','4인 밀집이 적음','Less four-player grouping','较少四人聚集'],
    adc_mid_axis:['ADCのミッド軸配置','원딜의 미드 축 배치','ADC on the mid axis','ADC位于中路轴线']
  };
  const DESCS = {
    isolated_side:['トップかミッドが外側のレーンで味方から離れた配置。','탑 또는 미드가 외곽 라인에서 동료들과 떨어져 있는 배치입니다.','Top or mid is separated from teammates on an outer lane.','上单或中单在外侧边线与队友分开。'],
    support_away_bot:['サポートとADCが離れている時点。','서포터와 원딜이 서로 떨어져 있는 시점입니다.','Snapshots where support and ADC are separated.','辅助与ADC相互分离的时刻。'],
    near_bot:['サポートとADCが近くにいる時点。','서포터와 원딜이 가까이 있는 시점입니다.','Snapshots where support and ADC are close together.','辅助与ADC相互靠近的时刻。'],
    support_near_jungle:['ジャングルとサポートが近くにいる時点。','정글과 서포터가 가까이 있는 시점입니다.','Snapshots where jungle and support are close together.','打野与辅助相互靠近的时刻。'],
    two_sides:['両サイドの2人と、密集した残り3人の配置。','서로 다른 사이드의 두 선수와 밀집한 나머지 세 선수로 나뉜 배치입니다.','Two players occupy opposite outer lanes, separated from a compact three.','两名选手位于不同边线，与聚集的另外三人分开。'],
    compact_four:['4人の全ペアが一定の距離内にいる配置。','네 선수의 모든 쌍이 일정 거리 안에 모여 있는 배치입니다.','Four players are all within a compact maximum pair distance.','四名选手的任意两人均位于限定距离内。'],
    fewer_four:['4人が密集する頻度が期待値より低い。個別の分散形状は異なります。','네 명이 밀집한 빈도가 기대치보다 낮습니다. 구체적인 분산 모양은 장면마다 다릅니다.','Four-player grouping is less frequent than expected; the dispersed shapes vary.','四人聚集的频率低于预期，具体分散形状因场面而异。'],
    adc_mid_axis:['ADCがマップ中央の対角軸付近にいる時点。','원딜이 맵 중앙의 대각선 축 부근에 있는 시점입니다.','The ADC is near the map’s central diagonal axis.','ADC处于地图中央对角轴线附近。']
  };
  function family(p) { return p.direction < 0 ? (p.metric === 'support_away_bot' ? 'near_bot' : 'fewer_four') : p.metric; }
  function localized(table,key,lang) { return (table[key] || [key,key,key,key])[({ja:0,ko:1,en:2,zh:3})[lang] ?? 2]; }
  function create(options) {
    let data=null,pending=null,dialog=null,activePattern=null,activeExample=0,activeFrame=0;
    const lang=()=>TEXT[options.getLanguage()] ? options.getLanguage() : 'en';
    const text=()=>TEXT[lang()];
    const title=p=>localized(TITLES,family(p),lang());
    const description=p=>localized(DESCS,family(p),lang());
    const entries=tid=>data?.tournaments?.[tid]?.teams || [];
    const selectedTeam=(tid,preferred)=>entries(tid).some(e=>e.team===preferred) ? preferred : entries(tid)[0]?.team || '';
    const patternById=id=>Object.values(data?.tournaments || {}).flatMap(t=>t.teams.flatMap(x=>x.patterns)).find(p=>p.id===id);
    const placement=entry=>typeof entry.place==='number' ? text().rank(entry.place) : text().semi;
    async function load() {
      if (!pending) pending=fetch('./data/team-signatures-v1.json',{cache:'no-cache'}).then(r=>r.ok ? r.json() : null)
        .then(x=>{data=x?.schema==='team_signatures_v1' ? x : null;return data;}).catch(()=>null);
      return pending;
    }
    function patternHtml(p) {
      const t=text();
      return `<div class="signature-pattern"><span class="signature-phase">${esc(t.phases[p.phase])}</span>
        <h4>${esc(title(p))}</h4><p>${esc(description(p))}</p>
        <div class="signature-rate"><div><strong>${p.observed_pct.toFixed(1)}%</strong> <span>${esc(t.observed)}</span></div><span>${esc(t.expected)} ${p.expected_pct.toFixed(1)}%</span></div>
        <div class="signature-rail" aria-hidden="true"><i style="width:${p.observed_pct}%"></i><b style="left:${p.expected_pct}%"></b></div>
        <div class="signature-evidence">${esc(t.evidence(p.n_games,p.n_opponents,p.n_series))} · ${esc(t.recurrence(p.games_with_pattern,p.n_games))}</div>
        <div class="signature-examples">${p.examples.map((e,i)=>`<button type="button" data-signature-open="${esc(p.id)}" data-example="${i}" aria-label="${esc(`${t.viewExample}: ${e.team} vs ${e.opponent}, ${clock(e.t)}`)}">vs ${esc(e.opponent)} · ${clock(e.t)}</button>`).join('')}</div></div>`;
    }
    function teamHtml(tid,team,side) {
      const t=text(),entry=entries(tid).find(x=>x.team===team);
      return `<article class="signature-team side-${side}"><div class="signature-team-head"><h3>${esc(team)}</h3><small>${esc(entry ? placement(entry) : '')}</small></div>
        ${!entry ? `<p class="signature-note">${esc(t.pending)}</p>` : !entry.patterns.length ? `<h4>${esc(t.sparse)}</h4><p class="signature-note">${esc(t.sparseBody(entry.n_games,entry.n_series,entry.n_opponents))}</p>` : `<div class="signature-patterns">${entry.patterns.map(patternHtml).join('')}</div>`}</article>`;
    }
    function html(tid,preferred,settings={}) {
      if (!entries(tid).length) return '';
      const t=text(),team=settings.allowAnyTeam ? preferred : selectedTeam(tid,preferred);
      const choose={ko:t=>`${t} 시그니처 보기`,en:t=>`View ${t} signatures`,ja:t=>`${t}のシグネチャーを見る`,zh:t=>`查看${t}的风格`}[lang()];
      const scope={ko:'선택한 팀의 대회 전체 기록입니다. 기대 빈도는 대회 전체의 비슷한 경기 상태를 기준으로 합니다.',en:'These are the selected team’s tournament-wide records. Expected frequency uses similar game states across this tournament.',ja:'選択したチームの大会全体の記録です。期待頻度は大会全体の似た試合状況を基準とします。',zh:'显示所选队伍的赛事全样本记录。预期频率以全赛事的相似比赛状态为基准。'}[lang()];
      const heading=settings.heading || t.heading;
      return `<section class="card signature-section" aria-label="${esc(heading)}"><div class="signature-heading"><div><h2>${esc(heading)}</h2><p>${esc(t.sub)}</p></div><span class="signature-scope">${esc(t.scope)}</span></div>
        ${settings.picker===false?'':`<div class="signature-teams">${entries(tid).map(e=>`<button type="button" class="signature-team-pick ${e.team===team?'on':''}" data-signature-pick="${esc(e.team)}" aria-pressed="${e.team===team}" title="${esc(choose(e.team))}">${esc(e.team)}<small>${esc(placement(e))}</small></button>`).join('')}</div>`}
        <p class="signature-selection-note">${esc(scope)}</p>
        <div class="signature-grid">${teamHtml(tid,team,'single')}</div>
        <p class="signature-note">${esc(t.note)}</p><details class="signature-method"><summary>${esc(t.method)}</summary><p>${esc(t.methodBody)}</p></details></section>`;
    }
    function mapHtml(e,frame,p) {
      const roles=p.metric==='support_near_jungle' ? ['jungle','support'] : p.metric==='support_away_bot' ? ['bot','support'] : p.metric==='adc_mid_axis' ? ['bot'] : ['top','jungle','mid','bot','support'];
      const dd=`./assets/ddragon/${encodeURIComponent(e.ddragon)}`;
      const players=[...frame.players].sort((a,b)=>(a.team===e.team && roles.includes(a.role))-(b.team===e.team && roles.includes(b.role)));
      return `<svg viewBox="0 0 1000 1000" role="img" aria-label="${esc(`${text().frame} ${clock(frame.t)}`)}"><defs><clipPath id="sigRound"><circle r="36"/></clipPath></defs>
        <rect width="1000" height="1000" fill="var(--bg-pill)"/><image href="${dd}/img/map/map11.png" width="1000" height="1000"/>
        ${players.map(x=>{const focus=x.team===e.team && roles.includes(x.role),color=x.side==='blue'?'#3898ff':'#fa586c';
          return `<g transform="translate(${x.x},${1000-x.y})" opacity="${x.alive?1:.45}"><title>${esc(`${x.team} · ${x.player} · ${x.role} · ${lang()==='ko'?x.champion_ko:x.champion}`)}</title>
            ${focus?'<circle r="47" fill="#fff"/>':''}<circle r="41" fill="${color}"/><image href="${dd}/img/champion/${encodeURIComponent(x.icon)}.png" x="-36" y="-36" width="72" height="72" clip-path="url(#sigRound)"/>
            ${x.alive?'':'<path d="M-24-24L24 24M24-24L-24 24" stroke="#fff" stroke-width="12"/>'}</g>`;}).join('')}</svg>`;
    }
    function updateFrame() {
      const e=activePattern.examples[activeExample],f=e.frames[activeFrame];
      dialog.querySelector('.signature-map').innerHTML=mapHtml(e,f,activePattern);
      dialog.querySelector('[data-frame-clock]').textContent=clock(f.t);
      dialog.querySelector('[data-video-clock]').textContent=clock(f.t);
      dialog.querySelector('[data-frame-gold]').textContent=Math.round(f.gold_k*1000).toLocaleString();
      dialog.querySelector('[data-frame-wp]').textContent=f.pre_p==null ? '—' : `${(f.pre_p*100).toFixed(1)}%`;
      const video=dialog.querySelector('iframe'),link=dialog.querySelector('[data-frame-video]');
      video.hidden=f.video_start_s==null;link.hidden=!f.video_url;
      if (f.video_start_s!=null) video.src=`https://www.youtube.com/embed/${encodeURIComponent(e.video_id)}?start=${f.video_start_s}`;
      if (f.video_url) link.href=f.video_url;
      dialog.querySelectorAll('[data-signature-frame]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.signatureFrame===activeFrame)));
    }
    function renderDialog() {
      const t=text(),p=activePattern,e=p.examples[activeExample],f=e.frames[activeFrame];
      const videoNote={ko:'영상이 재생되지 않으면 아래의 YouTube 링크로 열어 주세요.',en:'If playback is unavailable, use the YouTube link below.',ja:'再生できない場合は、下のYouTubeリンクから開いてください。',zh:'如无法播放，请使用下方的YouTube链接。'}[lang()];
      dialog.innerHTML=`<div class="signature-dialog-head"><div><span class="signature-phase">${esc(t.phases[p.phase])}</span><h2 id="signature-dialog-title">${esc(e.team)} · ${esc(title(p))}</h2></div><button class="signature-close" type="button" data-signature-close>${esc(t.close)}</button></div>
        <div class="signature-dialog-body"><div class="signature-tabs">${p.examples.map((x,i)=>`<button type="button" data-signature-example="${i}" aria-pressed="${i===activeExample}">vs ${esc(x.opponent)} · ${clock(x.t)}</button>`).join('')}</div>
        <div class="signature-view"><div><div class="signature-frame-head"><span>${esc(t.frame)}</span><b data-frame-clock>${clock(f.t)}</b></div><div class="signature-map">${mapHtml(e,f,p)}</div>
          <div class="signature-tabs signature-frame-buttons">${e.frames.map((x,i)=>`<button type="button" data-signature-frame="${i}" aria-pressed="${i===activeFrame}">${clock(x.t)}${i===e.center_frame?` · ${esc(t.center)}`:''}</button>`).join('')}</div><p class="signature-note">${esc(t.mapNote)}</p></div>
          <div><h3>${esc(e.team)} vs ${esc(e.opponent)} · <span data-video-clock>${clock(f.t)}</span></h3><div class="signature-context"><span>${esc(e.side==='blue'?t.blue:t.red)}</span><span>${esc(t.gold)} <b data-frame-gold>${Math.round(f.gold_k*1000).toLocaleString()}</b></span><span>${esc(t.wp)} <b data-frame-wp>${f.pre_p==null?'—':`${(f.pre_p*100).toFixed(1)}%`}</b></span></div>
          <iframe class="signature-video" loading="lazy" title="${esc(`${e.team} vs ${e.opponent} VOD`)}" ${f.video_start_s==null?'hidden':''} src="https://www.youtube.com/embed/${encodeURIComponent(e.video_id)}?start=${f.video_start_s ?? e.video_start_s}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
          <p class="signature-note">${esc(videoNote)}</p>
          <div class="signature-context"><a data-frame-video href="${esc(f.video_url || e.video_url)}" ${f.video_url?'':'hidden'} target="_blank" rel="noopener noreferrer">${esc(t.vod)} ↗</a><button type="button" class="linkbtn" data-signature-game="${esc(e.game_id)}">${esc(t.game)}</button></div>
          <div class="signature-roster">${f.players.map(x=>`<div><img src="./assets/ddragon/${encodeURIComponent(e.ddragon)}/img/champion/${encodeURIComponent(x.icon)}.png" alt=""><span><b>${esc(x.player)}</b> · ${esc(x.team)} · ${esc(x.role)}</span></div>`).join('')}</div></div></div></div>`;
    }
    function open(id,index) {
      const p=patternById(id);if (!p || !p.examples[index]) return;
      activePattern=p;activeExample=index;activeFrame=p.examples[index].center_frame;
      if (!dialog) {
        dialog=document.createElement('dialog');dialog.className='signature-dialog';dialog.setAttribute('aria-labelledby','signature-dialog-title');document.body.append(dialog);
        dialog.addEventListener('close',()=>{dialog.innerHTML='';});
        dialog.addEventListener('click',event=>{
          const b=event.target.closest('button');if (!b) return;
          if (b.hasAttribute('data-signature-close')) dialog.close();
          else if (b.hasAttribute('data-signature-example')) {activeExample=+b.dataset.signatureExample;activeFrame=activePattern.examples[activeExample].center_frame;renderDialog();dialog.querySelector(`[data-signature-example="${activeExample}"]`)?.focus();}
          else if (b.hasAttribute('data-signature-frame')) {activeFrame=+b.dataset.signatureFrame;updateFrame();}
          else if (b.hasAttribute('data-signature-game')) {dialog.close();options.onGame(b.dataset.signatureGame);}
        });
      }
      renderDialog();dialog.showModal();
    }
    function wire(root) {
      root.querySelectorAll('[data-signature-open]').forEach(b=>b.onclick=()=>open(b.dataset.signatureOpen,+b.dataset.example));
      root.querySelectorAll('[data-signature-pick]').forEach(b=>b.onclick=()=>options.onPick(b.dataset.signaturePick));
    }
    return {load,html,wire,teamHtml,selectedTeam};
  }
  window.PlayValueSignatures={create};
})();
