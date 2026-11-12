/* Navigation describes the subject being explored; comparisons are explicit views. */
(() => {
  'use strict';
  const COPY = {
    ko: {
      domains:{games:'경기',moments:'장면',teams:'팀',players:'선수'},
      gamesTitle:'경기 찾기', gamesSub:'대회와 상대를 고르고, 접전·역전 정도로 볼 경기를 찾아보세요.',
      recent:'최근 경기', close:'접전 정도', comeback:'승자의 최대 골드 열세', sort:'정렬', stage:'대회 단계', team:'팀', allStages:'모든 단계', allTeams:'모든 팀', details:'자세한 흐름 지표', count:n=>`${n}경기`,
      moments:'주요 전환 장면', types:'유형별 집계', backGames:'경기 목록',
      teamTitle:'팀 탐색',teamSub:'자주 보이는 배치, 상황에 따른 운영, 경기 목록을 한 팀씩 살펴보세요.',style:'스타일',records:'경기 목록',recordsSub:'선택한 대회에서 이 팀이 참여한 경기 목록입니다.',statistics:'통계',
      compareTeam:'다른 팀과 비교',comparePlayer:'다른 선수와 비교',backTeam:'팀으로 돌아가기',backPlayer:'선수로 돌아가기',
      compareTeamsTitle:'팀 비교',comparePlayersTitle:'선수 비교',compareSub:'비교할 두 대상과 기준을 선택하세요.',
      playerTitle:'선수 탐색',playerSub:'선수가 관여한 주요 장면과 동료 없이 시작한 구간의 성장·생존을 살펴보세요.',
      plays:'플레이 관여',time:'시간·상황',lead:'리드 전개',leadSub:'방송 골드로 본 리드의 확대와 회복',
      outcome:'결과',opponent:'상대',win:'승',loss:'패',date:'날짜',open:'경기 열기',
      signatureHeading:'반복되는 배치',signatureMissing:'시그니처 자료를 준비 중입니다. 경기 목록과 통계를 먼저 살펴볼 수 있습니다.',
      group:'분석 항목',flow:'경기 흐름',noGames:'조건에 맞는 경기가 없습니다. 팀이나 대회 단계를 바꿔 보세요.',
    },
    en: {
      domains:{games:'Games',moments:'Moments',teams:'Teams',players:'Players'},
      gamesTitle:'Find a game',gamesSub:'Browse the event and opponents, then sort by how close the game was or how far the winner came back.',
      recent:'Latest games',close:'Closeness',comeback:'Winner’s largest gold deficit',sort:'Sort',stage:'Stage',team:'Team',allStages:'All stages',allTeams:'All teams',details:'Detailed flow metrics',count:n=>`${n} games`,
      moments:'Key turning points',types:'By play type',backGames:'Game list',
      teamTitle:'Explore a team',teamSub:'Explore one team’s recurring formations, operational choices and game list.',style:'Style',records:'Game list',recordsSub:'Games this team played in the selected tournament.',statistics:'Statistics',
      compareTeam:'Compare with another team',comparePlayer:'Compare with another player',backTeam:'Back to team',backPlayer:'Back to player',
      compareTeamsTitle:'Team comparison',comparePlayersTitle:'Player comparison',compareSub:'Choose two subjects and a comparison basis.',
      playerTitle:'Explore a player',playerSub:'Explore a player’s key moments, growth and survival after solo starts.',
      plays:'Play involvement',time:'Time & situation',lead:'Lead development',leadSub:'Extending and recovering leads in broadcast gold',
      outcome:'Result',opponent:'Opponent',win:'W',loss:'L',date:'Date',open:'Open game',
      signatureHeading:'Recurring formations',signatureMissing:'Signature coverage is being prepared. The game list and statistics are available.',group:'Analysis',flow:'Game flow',noGames:'No games match these filters. Try another team or stage.',
    },
    ja: {
      domains:{games:'試合',moments:'場面',teams:'チーム',players:'選手'},
      gamesTitle:'試合を探す',gamesSub:'大会・相手を選び、接戦度や逆転の大きさで試合を探します。',recent:'最近の試合',close:'接戦度',comeback:'勝者の最大ゴールド劣勢',sort:'並び順',stage:'ステージ',team:'チーム',allStages:'全ステージ',allTeams:'全チーム',details:'詳しい展開指標',count:n=>`${n}試合`,moments:'主な転換場面',types:'種類別集計',backGames:'試合一覧',teamTitle:'チームを見る',teamSub:'1チームの繰り返す配置と試合一覧。',style:'スタイル',records:'試合一覧',recordsSub:'選択した大会でこのチームが出場した試合の一覧です。',statistics:'統計',compareTeam:'別のチームと比較',comparePlayer:'別の選手と比較',backTeam:'チームに戻る',backPlayer:'選手に戻る',compareTeamsTitle:'チーム比較',comparePlayersTitle:'選手比較',compareSub:'2つの対象と比較基準を選択。',playerTitle:'選手を見る',playerSub:'選手・ポジションを選び、関与場面と記録を確認。',plays:'プレー関与',time:'時間・状況',lead:'リード展開',leadSub:'放送ゴールドで見るリード拡大と回復',outcome:'結果',opponent:'相手',win:'勝',loss:'敗',date:'日付',open:'試合を開く',signatureHeading:'繰り返す配置',signatureMissing:'特徴の資料を準備中です。試合一覧と統計をご覧いただけます。',group:'分析項目',flow:'試合展開',noGames:'条件に合う試合がありません。チームまたはステージを変更してください。',
    },
    zh: {
      domains:{games:'比赛',moments:'片段',teams:'队伍',players:'选手'},
      gamesTitle:'寻找比赛',gamesSub:'选择赛事与对手，再按胶着程度或逆转幅度寻找比赛。',recent:'最近比赛',close:'胶着程度',comeback:'胜方最大经济劣势',sort:'排序',stage:'阶段',team:'队伍',allStages:'所有阶段',allTeams:'所有队伍',details:'详细走势指标',count:n=>`${n}局`,moments:'关键转折片段',types:'按战术类型汇总',backGames:'比赛列表',teamTitle:'查看队伍',teamSub:'查看一支队伍的重复站位与比赛列表。',style:'风格',records:'比赛列表',recordsSub:'所选赛事中这支队伍参加的比赛列表。',statistics:'统计',compareTeam:'与其他队伍比较',comparePlayer:'与其他选手比较',backTeam:'返回队伍',backPlayer:'返回选手',compareTeamsTitle:'队伍比较',comparePlayersTitle:'选手比较',compareSub:'选择两个对象及比较基准。',playerTitle:'查看选手',playerSub:'选择选手与位置，查看参与片段及记录。',plays:'战术参与',time:'时间与局势',lead:'领先走势',leadSub:'以转播经济观察优势扩大与追回',outcome:'结果',opponent:'对手',win:'胜',loss:'负',date:'日期',open:'打开比赛',signatureHeading:'重复出现的站位',signatureMissing:'正在准备风格资料，可先查看比赛列表与统计。',group:'分析项目',flow:'比赛走势',noGames:'没有符合筛选条件的比赛，请更换队伍或阶段。',
    },
  };
  // Editorial purpose, kept separate from calculation instructions and findings.
  const PURPOSE = {
    ko: {
      signature:{kind:'스타일의 단서',question:'이 팀은 어떤 배치를 반복할까?',why:'서로 다른 경기에서 되풀이되는 배치는 이 팀의 기본적인 판짜기를 그려 볼 단서입니다. 누가 사이드에 남고 누가 함께 모이는지 보면 팀 스타일을 구체적인 장면으로 이야기할 수 있습니다.',watch:'예상보다 자주 나타난 배치를 고른 뒤, 서로 다른 상대를 만난 실제 장면을 열어 보세요.',scope:'다른 팀도 쓰는 배치일 수 있습니다. 이 팀만의 고유 전술인지보다 얼마나 자주, 얼마나 여러 경기에서 반복됐는지를 봅니다.'},
      state:{kind:'상황별 스타일',question:'불리해지면 모일까, 흩어질까?',why:'평소 배치가 비슷한 팀도 앞설 때와 뒤질 때의 모습은 다를 수 있습니다. 골드 상황을 나눠 보면 한데 모이는 배치가 늘어나는지, 사이드에 선수를 남기는 배치가 유지되는지 살펴볼 수 있습니다.',watch:'시간대는 고정하고 유리·균형·불리를 바꿔 보세요. 다음 1분에도 그 배치가 이어지는지 함께 확인하면 좋습니다.',scope:'유리·불리의 자료에 서로 다른 경기와 상대가 섞여 있어, 상황이 바뀐 효과만 분리한 비교는 아닙니다.'},
      connections:{kind:'동료 관계',question:'누가 누구와 자주 붙어 있을까?',why:'정글–서포터가 자주 가까이 있는 팀과 원딜 주변에 여러 선수가 모이는 팀은 맵을 쓰는 모양이 다릅니다. 선수 사이의 거리를 보면 한 팀 안에서도 어떤 짝과 세 명의 조합이 자주 함께 있는지 드러납니다.',watch:'선을 눌러 두 선수의 기록을 보고, 시간대·유불리를 바꿔 관계가 달라지는지 살펴보세요. 선수 이름을 누르면 단독 구간 성장으로 이어집니다.',scope:'같은 시각에 가까이 있었던 관계입니다. 함께 이동한 경로나 누가 누구를 지원했는지는 영상으로 확인해야 합니다.'},
      trades:{kind:'맵 전체의 운영',question:'상대가 챙길 때, 이 팀은 어디서 챙길까?',why:'상대의 오브젝트 획득 전후에 우리 팀의 획득을 함께 놓으면 맵 양쪽에서 맞물린 운영 장면을 찾을 수 있습니다. 바론 근처의 결과와 반대편 타워의 결과를 한 장면으로 읽는 데 도움이 됩니다.',watch:'우리 팀도 무언가 얻은 비율과 상·하단 반대편에서 얻은 비율을 비교하고, 어떤 오브젝트였는지 실제 사례를 열어 보세요.',scope:'서로 가까운 시각에 얻었다는 기록입니다. 의도적인 교환인지, 어느 쪽이 더 이득이었는지는 장면과 가치를 더 봐야 합니다.'},
      series:{kind:'한 맞대결의 사례',question:'다음 세트에서 달라진 배치는 무엇일까?',why:'같은 상대와 연속으로 경기한 기록은 세트 사이의 변화를 찾아보기 좋은 출발점입니다. 패배 뒤 정글–서포터가 더 자주 붙었는지, 사이드 배치가 늘었는지 같은 질문을 구체적인 두 세트로 좁힐 수 있습니다.',watch:'이전·다음 세트의 승패와 챔피언을 보고, 전체 기록의 차이가 비슷한 상황끼리 비교해도 남는지 확인하세요.',scope:'현재는 한 맞대결의 사례 탐색입니다. 여러 상대에게 반복된 변화의 자료가 부족해 팀의 적응력 순위로 읽기는 어렵습니다.'},
      teamPlays:{kind:'장면 속 팀 역할',question:'어느 포지션이 관여한 장면에서 흐름이 움직였을까?',why:'팀의 이득과 손실을 포지션별 관여 장면으로 나눠 보면 어떤 선수들이 경기의 전환 장면에 자주 등장했는지 알 수 있습니다. 이득이 큰 포지션과 손실이 큰 포지션을 함께 보면 확인할 장면이 구체적이 됩니다.',watch:'이득·손실 양쪽을 보고, 해당 선수나 플레이의 실제 장면으로 이어서 확인하세요.',scope:'해설이 짚은 장면의 팀 골드·예측 승률 변화입니다. 한 장면에 여러 선수가 포함되므로 개인별 기여도를 나눠 준 점수는 아닙니다.'},
      time:{kind:'흐름의 분포',question:'이득과 손실은 어느 시간대·상황에 몰릴까?',why:'대회 전체의 합계가 비슷해도 초반에 벌고 후반에 잃는 팀과 그 반대인 팀의 경기 흐름은 다릅니다. 시간대와 출발 상황을 나누면 전체 평균에 가려졌던 차이를 찾아볼 수 있습니다.',watch:'시간대별 이득과 손실을 살펴보세요. 승률 지표에서는 열세·접전·우세로 시작한 장면의 결과도 함께 볼 수 있습니다.',scope:'해설이 짚은 장면의 분포입니다. 승률별 표의 상황 구분은 직전 예측 승률 기준이며, 상황별 배치 탭의 골드 기준과 다릅니다.'},
      lead:{kind:'리드의 전개',question:'잡은 리드는 얼마나 커지고, 열세는 얼마나 줄어들까?',why:'비슷한 시간에 비슷한 크기의 리드를 가진 구간과 비교하면 앞선 뒤 격차가 더 벌어졌는지, 뒤진 뒤 상대의 확대를 덜 허용했는지 볼 수 있습니다. 처음 잡은 리드가 어떤 흐름으로 이어졌는지 살펴보는 지표입니다.',watch:'앞설 때의 리드 확대와 뒤질 때의 상대 리드 확대를 따로 보세요. 경기별 차이와 불확실성도 함께 읽으세요.',scope:'비슷한 시간·골드 격차와 비교한 경기 흐름입니다. 경기별 결과가 엇갈리는 경우에는 팀의 일관된 특징으로 단정하기 어렵습니다.'},
      growth:{kind:'성장과 생존',question:'혼자 있을 때, 성장과 위험은 어떻게 이어질까?',why:'동료와 떨어져 있던 뒤의 CS·경험치·사망을 함께 보면 성장과 위험이 어떻게 나타났는지 살펴볼 수 있습니다. 혼자 시작한 비율이 비슷한 선수들 사이에서도 이후 1분의 결과가 다른지 찾아볼 수 있습니다.',watch:'CS가 비교 기준보다 많았는지와 사망 비율도 높았는지를 함께 보세요. 차이의 범위가 0을 포함하는지도 확인하세요.',scope:'시작할 때 혼자였던 구간의 후속 기록입니다. 웨이브·상성의 영향과 예측의 불확실성이 남아 있어 독립 수행 능력 순위로 읽기는 어렵습니다.'},
      playerPlays:{kind:'전환 장면의 관여',question:'이 선수는 어떤 전환 장면에 관여했을까?',why:'행동을 시작한 장면, 타깃이 된 장면, 대응한 장면을 나눠 보면 선수가 경기 속에서 어떤 역할로 등장했는지 살펴볼 수 있습니다. 팀에 유리했던 장면과 불리했던 장면을 함께 확인할 수 있습니다.',watch:'자주 등장한 행동 유형과 관여 역할을 보고, 이득·손실 장면을 각각 열어 보세요.',scope:'방송 해설에 이름이 나온 중요 장면에 한정됩니다. 전체 플레이의 성공률이나 선수의 종합 실력 점수는 아닙니다.'},
      comparePlayers:{kind:'장면의 비교',question:'두 선수의 차이는 어떤 장면에서 나타났을까?',why:'경기당 이득·손실과 관여 역할을 나란히 보면 합계의 차이가 어떤 장면들에서 생겼는지 찾아볼 수 있습니다. 같은 맞대결만 볼 때와 대회 전체를 볼 때 결과가 달라지는지도 확인할 수 있습니다.',watch:'비교 범위를 먼저 고르고, 수치 차이가 큰 항목에서 두 선수의 실제 장면을 각각 확인하세요.',scope:'장면과 출전 경기의 차이를 비교합니다. 팀 상황·상대·챔피언의 영향을 모두 제거한 개인 실력 비교는 아닙니다.'},
      moments:{kind:'볼 장면 찾기',question:'경기 흐름이 크게 바뀐 순간은 어디일까?',why:'예측 승률이 크게 움직인 장면을 모으면 긴 경기에서 먼저 확인할 전환점을 찾을 수 있습니다. 영상을 열어 그때 전투·오브젝트·다른 지역의 사건이 어떻게 겹쳤는지 살펴보세요.',watch:'즉시 변화와 15·30·60초 뒤의 변화를 바꿔 보세요. 짧게 유리했던 장면이 이후에도 이어졌는지 확인할 수 있습니다.',scope:'변화가 큰 장면의 목록입니다. 선택한 플레이 하나가 그 변화 전체를 만들었다는 뜻은 아닙니다.'},
      types:{kind:'시도의 결과 비교',question:'같은 유형의 시도도 성공과 실패 뒤에 얼마나 달랐을까?',why:'행동 유형과 결과를 함께 나누면 같은 이름의 플레이 안에 어떤 이득·손실 장면이 있었는지 볼 수 있습니다. 숫자를 눌러 집계가 실제로 어떤 시도들로 이루어졌는지 확인할 수 있습니다.',watch:'유형 × 결과로 나눠 보고, 변화 구간을 바꿔 결과가 어떻게 이어졌는지 살펴보세요.',scope:'해설이 짚은 시도의 골드 변화 집계입니다. 빈도가 곧 전체 경기의 시도율이나 성공률은 아닙니다.'},
    },
    en: {
      signature:{kind:'Style clues',question:'Which formations does this team repeat?',why:'Recurring formations across games make team style concrete: who stays on a side lane, and who groups together?',watch:'Choose a formation that differs from its reference, then open examples against different opponents.',scope:'These are tournament style candidates, not necessarily tactics unique to this team.'},
      state:{kind:'Style by situation',question:'Does this team group or spread when behind?',why:'Teams with similar overall positioning may look different when ahead or behind. Splitting gold states reveals those differences.',watch:'Keep the phase fixed, switch gold states, and check whether the formation persists into the next minute.',scope:'States may contain different games and opponents; this does not isolate the effect of becoming ahead or behind.'},
      connections:{kind:'Teammate relationships',question:'Who stays close to whom?',why:'Jungle–support proximity and groups around the ADC describe different shapes on the map. See which pairs and trios appear together.',watch:'Select a line, vary phase and state, or select a player to explore growth after solo starts.',scope:'These are simultaneous positions, not movement paths or identified assistance.'},
      trades:{kind:'Across the map',question:'What does this team acquire around an enemy objective?',why:'Own acquisitions around an enemy objective help connect events on both sides of the map, such as Baron and an opposite-side tower.',watch:'Compare any acquisition with opposite-side acquisition, then open concrete examples.',scope:'Timing alone does not identify deliberate trades or which side gained more value.'},
      series:{kind:'One encounter',question:'What looks different in the next game?',why:'Consecutive games against the same opponent offer concrete cases to inspect changes in grouping and side-lane positioning.',watch:'Check results and champions, then see whether all-record differences remain among similar-state records.',scope:'Repeated post-loss evidence is still limited; this is case exploration, not an adaptability ranking.'},
      teamPlays:{kind:'Roles in key moments',question:'Which positions appear when the game shifts?',why:'Breaking team gains and losses down by involvement helps locate the players and moments behind the aggregate.',watch:'Look at both gains and losses, then open the relevant players and plays.',scope:'These are team changes in commentary-selected moments, not individual contribution scores.'},
      time:{kind:'When shifts occur',question:'When do gains and losses concentrate?',why:'Similar totals can hide early gains and late losses. Phase and starting-state splits reveal different distributions.',watch:'Inspect phase patterns. With the win-probability metric, also compare moments starting behind, even or ahead.',scope:'This summarizes commentary-selected moments. Starting-state tables use predicted win probability, unlike gold-based formation states.'},
      lead:{kind:'Lead dynamics',question:'How do leads expand and deficits evolve?',why:'Comparisons at similar times and gold gaps help describe what followed a lead or deficit.',watch:'Read lead expansion and the opponent’s expansion separately, with game variation and uncertainty.',scope:'Use this to describe game flow; small or inconsistent samples do not support an execution ranking.'},
      growth:{kind:'Growth and survival',question:'How do growth and risk follow a solo start?',why:'CS, XP and subsequent death together describe what followed being apart from teammates.',watch:'Read CS differences alongside death rates, and check whether the difference interval crosses zero.',scope:'Wave opportunities, matchups and predictive uncertainty remain. This is not an independent-play skill ranking.'},
      playerPlays:{kind:'Key-moment involvement',question:'What turning points involve this player?',why:'Acting, being targeted and responding show different roles in moments that favored or hurt the team.',watch:'Inspect frequent play types and involvement roles, then open both gain and loss examples.',scope:'Only commentary-named moments are included; this is not an overall success rate or skill score.'},
      comparePlayers:{kind:'Comparing moments',question:'Which moments account for the player difference?',why:'Per-game gains, losses and involvement roles help trace aggregate differences back to concrete moments.',watch:'Choose head-to-head or event-wide coverage first, then open examples for both players.',scope:'Team situation, opponents and champions are not fully controlled in this individual comparison.'},
      moments:{kind:'Find moments to watch',question:'Where did the game take a sharp turn?',why:'Large predicted win-probability changes help locate turning points in a long match.',watch:'Switch instant and 15/30/60-second changes, then inspect concurrent fights and objectives.',scope:'A large change is not the isolated effect of the selected play.'},
      types:{kind:'Attempts and outcomes',question:'How do outcomes differ within a play type?',why:'Split play types by outcomes to find the gain and loss moments behind each category.',watch:'Choose type × outcome and vary the followup window; select a count to inspect its plays.',scope:'These are gold changes in commentary-selected attempts, not complete attempt or success rates.'},
    },
  };
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function purposeHtml(key,lang='ko') {
    const p=(PURPOSE[lang]||PURPOSE.en)[key];
    if(!p)return '';
    const labels=lang==='ko'?['이 탭의 질문','이렇게 살펴보세요','해석의 범위']:['The question','Start here','Scope'];
    return `<aside class="analysis-purpose" data-analysis-purpose="${escapeHtml(key)}"><div class="analysis-purpose-top"><span>${labels[0]}</span><span class="analysis-purpose-kind">${escapeHtml(p.kind)}</span></div><h3>${escapeHtml(p.question)}</h3><p class="analysis-purpose-why">${escapeHtml(p.why)}</p><p class="analysis-purpose-watch"><b>${labels[1]}</b> ${escapeHtml(p.watch)}</p>${p.scope?`<p class="analysis-purpose-scope"><b>${labels[2]}</b> ${escapeHtml(p.scope)}</p>`:''}</aside>`;
  }
  function domain(view,tab) {
    if (['moments','xtab'].includes(view)) return 'moments';
    if (view==='teams' || view==='compare' && tab!=='player') return 'teams';
    if (view==='players' || view==='compare' && tab==='player') return 'players';
    return 'games';
  }
  function resolveRoute(q) {
    const v=q.get('view');
    if (v==='swings') return q.get('list')==='moments' ? 'moments' : 'games';
    if (v==='stats') return ['all','h2h'].includes(q.get('scope')) ? 'compare' : 'stats';
    if (v==='compare' && q.get('signature') && q.get('tab')!=='player') return 'teams';
    if (['set','games','moments','xtab','teams','players','compare'].includes(v)) return v;
    return q.get('game') || q.get('play') ? 'set' : 'games';
  }
  window.PlayValueExplore={domain,resolveRoute,purposeHtml,copy:lang=>COPY[lang] || COPY.en};
})();
