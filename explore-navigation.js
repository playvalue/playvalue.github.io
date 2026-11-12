/* Navigation describes the subject being explored; comparisons are explicit views. */
(() => {
  'use strict';
  const COPY = {
    ko: {
      domains:{games:'경기',moments:'장면',teams:'팀',players:'선수'},
      gamesTitle:'경기 찾기', gamesSub:'대회와 상대를 고르고, 접전·역전 정도로 볼 경기를 찾아보세요.',
      recent:'최근 경기', close:'접전 정도', comeback:'승자의 최대 골드 열세', sort:'정렬', stage:'대회 단계', team:'팀', allStages:'모든 단계', allTeams:'모든 팀', details:'자세한 흐름 지표', count:n=>`${n}경기`,
      moments:'주요 전환 장면', types:'유형별 집계', backGames:'경기 목록',
      teamTitle:'팀 탐색',teamSub:'한 팀의 반복 배치와 경기 기록을 살펴보세요.',style:'스타일',records:'경기 기록',statistics:'통계',
      compareTeam:'다른 팀과 비교',comparePlayer:'다른 선수와 비교',backTeam:'팀으로 돌아가기',backPlayer:'선수로 돌아가기',
      compareTeamsTitle:'팀 비교',comparePlayersTitle:'선수 비교',compareSub:'비교할 두 대상과 기준을 선택하세요.',
      playerTitle:'선수 탐색',playerSub:'선수와 포지션을 고르고 관여 장면과 기록을 살펴보세요.',
      plays:'플레이 관여',time:'시간·상황',lead:'리드 전개',leadSub:'방송 골드로 본 리드의 확대와 회복',
      outcome:'결과',opponent:'상대',win:'승',loss:'패',date:'날짜',open:'경기 열기',
      signatureHeading:'반복되는 배치',signatureMissing:'시그니처 자료를 준비 중입니다. 경기 기록과 통계를 먼저 살펴볼 수 있습니다.',
      group:'분석 항목',flow:'경기 흐름',noGames:'조건에 맞는 경기가 없습니다. 팀이나 대회 단계를 바꿔 보세요.',
    },
    en: {
      domains:{games:'Games',moments:'Moments',teams:'Teams',players:'Players'},
      gamesTitle:'Find a game',gamesSub:'Browse the event and opponents, then sort by how close the game was or how far the winner came back.',
      recent:'Latest games',close:'Closeness',comeback:'Winner’s largest gold deficit',sort:'Sort',stage:'Stage',team:'Team',allStages:'All stages',allTeams:'All teams',details:'Detailed flow metrics',count:n=>`${n} games`,
      moments:'Key turning points',types:'By play type',backGames:'Game list',
      teamTitle:'Explore a team',teamSub:'See one team’s recurring formations and game record.',style:'Style',records:'Game record',statistics:'Statistics',
      compareTeam:'Compare with another team',comparePlayer:'Compare with another player',backTeam:'Back to team',backPlayer:'Back to player',
      compareTeamsTitle:'Team comparison',comparePlayersTitle:'Player comparison',compareSub:'Choose two subjects and a comparison basis.',
      playerTitle:'Explore a player',playerSub:'Choose a player and position to explore their moments and records.',
      plays:'Play involvement',time:'Time & situation',lead:'Lead development',leadSub:'Extending and recovering leads in broadcast gold',
      outcome:'Result',opponent:'Opponent',win:'W',loss:'L',date:'Date',open:'Open game',
      signatureHeading:'Recurring formations',signatureMissing:'Signature coverage is being prepared. Game records and statistics are available.',group:'Analysis',flow:'Game flow',noGames:'No games match these filters. Try another team or stage.',
    },
    ja: {
      domains:{games:'試合',moments:'場面',teams:'チーム',players:'選手'},
      gamesTitle:'試合を探す',gamesSub:'大会・相手を選び、接戦度や逆転の大きさで試合を探します。',recent:'最近の試合',close:'接戦度',comeback:'勝者の最大ゴールド劣勢',sort:'並び順',stage:'ステージ',team:'チーム',allStages:'全ステージ',allTeams:'全チーム',details:'詳しい展開指標',count:n=>`${n}試合`,moments:'主な転換場面',types:'種類別集計',backGames:'試合一覧',teamTitle:'チームを見る',teamSub:'1チームの繰り返す配置と試合記録。',style:'スタイル',records:'試合記録',statistics:'統計',compareTeam:'別のチームと比較',comparePlayer:'別の選手と比較',backTeam:'チームに戻る',backPlayer:'選手に戻る',compareTeamsTitle:'チーム比較',comparePlayersTitle:'選手比較',compareSub:'2つの対象と比較基準を選択。',playerTitle:'選手を見る',playerSub:'選手・ポジションを選び、関与場面と記録を確認。',plays:'プレー関与',time:'時間・状況',lead:'リード展開',leadSub:'放送ゴールドで見るリード拡大と回復',outcome:'結果',opponent:'相手',win:'勝',loss:'敗',date:'日付',open:'試合を開く',signatureHeading:'繰り返す配置',signatureMissing:'特徴の資料を準備中です。試合記録と統計をご覧いただけます。',group:'分析項目',flow:'試合展開',noGames:'条件に合う試合がありません。チームまたはステージを変更してください。',
    },
    zh: {
      domains:{games:'比赛',moments:'片段',teams:'队伍',players:'选手'},
      gamesTitle:'寻找比赛',gamesSub:'选择赛事与对手，再按胶着程度或逆转幅度寻找比赛。',recent:'最近比赛',close:'胶着程度',comeback:'胜方最大经济劣势',sort:'排序',stage:'阶段',team:'队伍',allStages:'所有阶段',allTeams:'所有队伍',details:'详细走势指标',count:n=>`${n}局`,moments:'关键转折片段',types:'按战术类型汇总',backGames:'比赛列表',teamTitle:'查看队伍',teamSub:'查看一支队伍的重复站位与比赛记录。',style:'风格',records:'比赛记录',statistics:'统计',compareTeam:'与其他队伍比较',comparePlayer:'与其他选手比较',backTeam:'返回队伍',backPlayer:'返回选手',compareTeamsTitle:'队伍比较',comparePlayersTitle:'选手比较',compareSub:'选择两个对象及比较基准。',playerTitle:'查看选手',playerSub:'选择选手与位置，查看参与片段及记录。',plays:'战术参与',time:'时间与局势',lead:'领先走势',leadSub:'以转播经济观察优势扩大与追回',outcome:'结果',opponent:'对手',win:'胜',loss:'负',date:'日期',open:'打开比赛',signatureHeading:'重复出现的站位',signatureMissing:'正在准备风格资料，可先查看比赛记录与统计。',group:'分析项目',flow:'比赛走势',noGames:'没有符合筛选条件的比赛，请更换队伍或阶段。',
    },
  };
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
  window.PlayValueExplore={domain,resolveRoute,copy:lang=>COPY[lang] || COPY.en};
})();
