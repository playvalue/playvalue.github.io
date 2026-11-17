/* What an attempt is worth to a side that is behind. Every estimate keeps its interval and its count. */
(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const SECTIONS=['standing','objectives','time'],OBJECTIVES=['baron','elder'];
  const STATES=['trailing_lt35','even_35_65','leading_ge65'],ROLES=['actor','opponent','neither'];
  const SCOPES=['all_trailing','before_20_min','from_20_min','15_to_35','below_15'];
  const KINDS=['quiet','opponent_play','own_play','contested'],GROUPS=['no_own_play','all'];
  const COPY={
    ko:{gameLine:(m,k,pp)=>`승률 35% 미만이던 쪽의 시간 ${m}분: 상대의 플레이 ${k.opponent_play}(승률 ${pp.opponent_play}), 자기 플레이 ${k.own_play}(${pp.own_play}), 아무 플레이도 없는 시간 ${k.quiet}(${pp.quiet}), 겹친 시간 ${k.contested}(${pp.contested}).`,gameLineNote:'괄호는 그 시간 동안 불리한 쪽의 승률이 움직인 합입니다.',gameLineOpen:'두 대회 전체 보기',
      teamTitle:'불리할 때의 시도',teamScope:n=>`MSI·Worlds 2026 합산 ${n}경기 · 승률 35% 미만이던 시간 기준`,
      teamCoverage:(r)=>`${r.games}경기 · 불리했던 시간 ${r.trailing_minutes}분 · 플레이 ${r.plays}개(걸린 승률이 큰 것 ${r.high_stake_plays}개, 성공·실패로 정리된 것 ${r.resolved_plays}개)`,
      teamThin:(m)=>`이 팀은 ${m.games}경기, 불리했던 시간 ${m.trailing_minutes}분, 정리된 플레이 ${m.resolved_plays}개 가운데 하나 이상이 부족해 추정이 불안정합니다.`,
      teamMissing:'이 팀은 불리했던 시간의 자료가 없습니다.',teamMean:'팀 평균',teamOthers:'다른 팀',
      metrics:{attempt_rate:{title:'걸린 승률이 큰 플레이의 빈도',unit:'개',
          value:(team,v,all)=>`불리한 10분당 ${team}의 플레이 가운데 걸린 승률이 큰 것은 ${v}입니다.${all?` 중계가 짚은 모든 플레이로 세면 10분당 ${all}입니다.`:''}`,
          context:(d,m,rho)=>`걸린 승률은 비슷한 플레이가 성공했을 때 얻은 승률과 실패했을 때 잃은 승률을 더한 값입니다. 불리할 때의 플레이 가운데 이 값이 상위 ${m.top}%(${m.min}%p 이상)인 것만 셉니다. ${d} ${rho.teams}팀에서 역전승 비율과의 순위 상관은 ${rho.rho}입니다(p = ${rho.p}). ${rho.p>=.05?'이런 플레이가 잦은 팀이 더 강하다고 볼 근거는 없습니다.':rho.rho<0?'이런 플레이가 잦은 팀일수록 역전승 비율이 낮았습니다.':'이런 플레이가 잦은 팀일수록 역전승 비율이 높았습니다.'}`},
        selection_margin:{title:'고른 플레이의 여유',unit:'%p',
          value:(team,v)=>`${team}의 플레이는 비슷한 플레이의 기대 성공률이 본전보다 ${v} 높았습니다.`,
          context:d=>`여유가 넓을수록 성공 가능성에 비해 잃을 것이 적은 플레이를 골랐다는 뜻입니다. ${d}`},
        success_over_expected:{title:'기대 대비 수행',unit:'%p',
          value:(team,v)=>`${team}의 실제 성공률에서 비슷한 플레이의 기대를 뺀 값은 ${v}입니다.`,
          context:d=>`${d} 순위로 읽지 마세요. 경기가 늘면 다시 봅니다.`}},
      teamDiffer:m=>`팀 사이의 차이는 우연으로 보기 어렵습니다(${m.teams}팀, p = ${m.heterogeneity_p}).`,teamAlike:m=>`현재 ${m.teams}팀의 차이는 서로 구분되지 않습니다(p = ${m.heterogeneity_p}).`,
      relation:{above:'팀 평균보다 높습니다.',below:'팀 평균보다 낮습니다.',within:'범위가 팀 평균을 포함해, 평균과 구분되지 않습니다.',widest:'현재 표본에서 가장 높은 값입니다.',noInterval:'경기가 적어 범위를 구하지 못했습니다.',caution:'다만 팀 전체를 함께 보면 이 정도 차이는 우연으로도 나올 수 있습니다.'},
      teamLimit:'비교 기준은 다른 팀이 다른 경기에서 한 비슷한 플레이입니다. 중계가 짚은 플레이만 세므로, 빈도는 실제 시도 횟수가 아니라 짚인 횟수입니다. 걸린 승률이 큰 플레이를 가르는 선은 임의로 정한 것입니다. 불리한 쪽은 잃을 승률이 적어서, 걸린 승률의 대부분은 성공했을 때 얻는 쪽입니다.',
      cardLede:team=>`경기를 이 플레이 직전에 멈추고 결말만 바꿨을 때, 모델이 본 ${team}의 승률입니다.`,endings:{hold:'아무 일 없음',take:team=>`${team} 쪽이 인원 손실 없이 획득`,concede:'상대가 인원 손실 없이 획득'},referenceTag:'비교 기준',cardSimilar:(state,role,n)=>`${state}의 ${role} ${n}개가 실제로 끝난 결말로 계산하면`,cardValues:(gain,loss,be)=>`성공으로 끝난 경우 기준 대비 ${gain}, 실패로 끝난 경우 ${loss}, 본전 성공률 ${be}`,cardNoRole:'누가 쳤는지가 한쪽으로 정리되지 않은 플레이라 결말별 승률만 보여 줍니다.',cardLimit:'결말별 승률은 모델이 본 상태이며, 이 플레이가 승률을 바꾼 효과가 아닙니다.',cardOpen:'전체 결과 보기',pp:'%p',title:'불리할 때의 선택',sub:n=>`MSI·Worlds 2026 합산 ${n}경기 · 현재 표본 기준`,
      sections:{standing:'승률 구간별',objectives:'바론·장로',time:'시간의 흐름'},
      breakEven:'본전 성공률',observed:'실제 성공률',legendNote:'막대는 95% 범위, 표시는 추정값입니다.',
      preliminary:'예비',preliminaryTip:n=>`플레이 ${n}개 미만`,gain:'성공 시',loss:'실패 시',plays:n=>`플레이 ${n.toLocaleString('en-US')}개`,read:'숫자 읽는 법',
      standingTitle:'직전 승률에 따라 본전은 얼마나 달라질까?',
      standingMethod:'해설이 성공 또는 실패로 정리한 플레이를 직전 예측 승률로 나눴습니다. 본전 성공률은 실패했을 때 잃는 승률을, 성공했을 때 얻는 승률과 실패했을 때 잃는 승률의 합으로 나눈 값입니다. 실제 성공률이 이보다 높으면 평균적으로 남는 시도였다는 뜻입니다.',
      standingRead:'보라색(실제 성공률)이 주황색(본전)보다 오른쪽에 있을수록 여유가 큽니다. 불리할수록 주황색이 왼쪽으로 옵니다. 실패해도 잃을 승률이 적기 때문입니다.',
      bins:{lt15:'승률 15% 미만','15_35':'승률 15–35%','35_65':'승률 35–65%','65_85':'승률 65–85%',ge85:'승률 85% 이상'},
      matched:(g,r)=>`행동 유형과 경기 시간을 맞춰 비교해도, 가장 불리한 구간의 성공률은 가장 유리한 구간보다 ${g}%p(${r}) 낮습니다.`,
      standingLimit:'중계가 짚은 플레이만 포함합니다. 성공률이 본전보다 높다는 것이 더 자주 시도해야 한다는 뜻은 아닙니다. 시도하지 않기로 한 판단은 자료에 없습니다.',
      objectivesTitle:'바론과 장로: 먼저 칠 때와 방해할 때',objectiveNames:{baron:'바론',elder:'장로 드래곤'},
      objectivesMethod:'플레이마다 누가 오브젝트를 쳤는지 세 코더가 결과를 보지 않고 나눴습니다. 그런 다음 경기를 플레이 직전에 멈추고, 같은 종류의 플레이가 실제로 끝난 결말들을 넣어 동결된 모델로 승률을 다시 계산했습니다.',
      objectivesRead:'먼저 친 플레이와 아무도 치지 않은 플레이는 "아무 일 없음"과 비교하고, 상대를 방해한 플레이는 "상대가 그냥 가져감"과 비교합니다. 본전 0%는 실패해도 비교 기준보다 나빠지지 않았다는 뜻입니다.',
      states:{trailing_lt35:'불리할 때 · 승률 35% 미만',even_35_65:'비슷할 때 · 승률 35–65%',leading_ge65:'유리할 때 · 승률 65% 이상'},
      roles:{actor:'먼저 친 플레이',opponent:'상대를 방해한 플레이',neither:'아무도 치지 않은 플레이'},
      references:{actor:'비교 기준: 아무 일 없음',opponent:'비교 기준: 상대가 그냥 가져감',neither:'비교 기준: 아무 일 없음'},
      counts:(scored,resolved)=>`채점 ${scored}개 · 성공률 근거 ${resolved}개`,referenceProbability:p=>`기준 승률 ${p}`,
      wps:(value,success,failure)=>`관측 승률 변화로 본 본전 ${value} · 성공 ${success}개, 실패 ${failure}개`,
      wpsNote:'상태 편집은 킬과 오브젝트만 반영해서 실패의 비용이 작게 잡힙니다. 그래서 같은 플레이의 관측 승률 변화로 계산한 본전을 함께 적었습니다. 관측값에는 그 구간의 다른 사건도 섞여 있어, 실제 값은 둘 사이에 있습니다.',
      examples:n=>`이 대회의 장면 ${n}개 보기`,outcomes:{success:'성공',failure:'실패',aborted:'중단',mixed:'혼합',unknown:'불명'},
      noEstimate:'이 조건의 장면이 부족해 추정하지 못했습니다.',
      checks:(kills,gap,unscored)=>`편집하지 않고 다시 계산한 곡선은 공개된 곡선과 일치합니다. 실제 바론·장로 처치 ${kills}건을 같은 방법으로 재현하면 실제 변동과 중앙값 ${gap}%p 차이입니다. MSI는 v156, Worlds는 v312 모델로 채점했고, ${unscored}개 플레이는 시각이나 상태가 없어 채점하지 못했습니다.`,
      objectivesLimit:'결말별 승률은 모델이 본 상태이며, 그 플레이가 승률을 바꾼 효과가 아닙니다.',
      timeTitle:'불리한 팀의 승률은 어느 시간에 움직일까?',
      timeMethod:'승률 곡선의 매 초를, 15–30초 전에 승률 35% 미만이던 쪽의 시점에서 봤습니다. 그 순간이 누구의 플레이 구간이었는지에 따라 넷으로 나눕니다. 플레이 구간은 시작 5초 전부터 끝난 뒤 5초까지입니다.',
      timeRead:'분당 변화가 +이면 그 시간에 불리한 팀의 승률이 올랐다는 뜻입니다. 조용한 시간에는 거의 움직이지 않고, 상대의 플레이 시간에 내려갑니다.',
      scopes:{all_trailing:'불리한 시간 전체',before_20_min:'20분 전',from_20_min:'20분 이후','15_to_35':'승률 15–35%',below_15:'승률 15% 미만'},
      kinds:{quiet:'아무 플레이도 없는 시간',opponent_play:'상대의 플레이',own_play:'자기 플레이',contested:'양쪽 플레이가 겹친 시간',no_own_play:'자기 플레이가 없는 시간',all:'불리한 시간 전체'},
      kindHints:{no_own_play:'조용한 시간 + 상대의 플레이'},
      share:'시간 비중',drift:'불리한 팀 승률의 분당 변화',kind:'시간의 종류',minutes:m=>`${m}분`,
      calibration:(standing,won,minutes)=>`불리한 쪽의 평균 예측 승률은 ${standing}, 그 팀들이 실제로 이긴 비율은 ${won}입니다(${minutes}분).`,
      timeLimit:'시간의 종류는 선택이 아니라 결과입니다. 조용한 시간은 상대도 아무것도 하지 못한 시간이고, 중계가 짚는 불리한 팀의 플레이는 통한 플레이 쪽으로 쏠립니다.',
      uncertaintyTitle:'현재 표본 기준의 결과입니다',
      uncertainty:(games,n)=>`${games}경기에서 나온 값이라 범위가 넓은 항목이 많습니다. 괄호 안은 경기를 묶음으로 다시 뽑아 구한 95% 범위이고, 플레이 ${n}개 미만인 항목에는 '예비' 표시를 붙였습니다. 범위가 넓은 항목은 방향만 참고하세요. 경기가 추가되면 같은 방법으로 다시 계산합니다.`,
      missing:'이 분석의 자료를 불러오지 못했습니다.'},
    en:{gameLine:(m,k,pp)=>`${m} minutes with one side below 35%: opponent’s plays ${k.opponent_play} (win probability ${pp.opponent_play}), own plays ${k.own_play} (${pp.own_play}), no narrated play ${k.quiet} (${pp.quiet}), both ${k.contested} (${pp.contested}).`,gameLineNote:'Parentheses give the summed change in the trailing side’s win probability over that time.',gameLineOpen:'See both events',
      teamTitle:'Attempts when behind',teamScope:n=>`${n} games from MSI and Worlds 2026 · time spent below 35%`,
      teamCoverage:(r)=>`${r.games} games · ${r.trailing_minutes} minutes behind · ${r.plays} plays (${r.high_stake_plays} with a large stake, ${r.resolved_plays} resolved as success or failure)`,
      teamThin:(m)=>`This team falls short of ${m.games} games, ${m.trailing_minutes} minutes behind or ${m.resolved_plays} resolved plays, so its estimates are unstable.`,
      teamMissing:'No time behind is recorded for this team.',teamMean:'Team mean',teamOthers:'Other teams',
      metrics:{attempt_rate:{title:'How often it makes a high-stake play',unit:'',
          value:(team,v,all)=>`${team} made ${v} high-stake plays per ten minutes behind.${all?` Counting every narrated play, the rate was ${all}.`:''}`,
          context:(d,m,rho)=>`A play’s stake is the win probability similar plays gained on success plus what they lost on failure. Only plays in the top ${m.top}% of stake among plays made while behind (${m.min} pp or more) are counted. ${d} Across ${rho.teams} teams the rank correlation with comeback rate is ${rho.rho} (p = ${rho.p}). ${rho.p>=.05?'Nothing here shows that teams making more of these plays are stronger.':rho.rho<0?'Teams making more of these plays came back less often.':'Teams making more of these plays came back more often.'}`},
        selection_margin:{title:'Margin of the plays it picks',unit:' pp',
          value:(team,v)=>`For the plays ${team} picked, the expected success rate of similar plays was ${v} above break-even.`,
          context:d=>`A wider margin means plays with little to lose for their chance of success. ${d}`},
        success_over_expected:{title:'Execution against expectation',unit:' pp',
          value:(team,v)=>`${team}’s success rate differed from the expectation for similar plays by ${v}.`,
          context:d=>`${d} Do not read this as a ranking; it will be revisited with more games.`}},
      teamDiffer:m=>`The ${m.teams} teams differ by more than chance (p = ${m.heterogeneity_p}).`,teamAlike:m=>`The ${m.teams} teams cannot be told apart (p = ${m.heterogeneity_p}).`,
      relation:{above:'Above the team mean.',below:'Below the team mean.',within:'The interval includes the team mean, so it cannot be told apart from it.',widest:'The highest value in the current sample.',noInterval:'Too few games for an interval.',caution:'Across all teams together, though, a difference of this size can arise by chance.'},
      teamLimit:'The comparison is similar plays by other teams in other games. Only commentary-selected plays count, so frequency is how often plays were narrated, not how often they were attempted. The line that separates high-stake plays is arbitrary. A side that is behind has little left to lose, so most of the stake is what success would gain.',
      cardLede:team=>`${team}’s modeled win probability if the game is frozen just before this play and only the ending changes.`,endings:{hold:'Nothing happens',take:team=>`${team} takes it without losses`,concede:'The opponent takes it without losses'},referenceTag:'reference',cardSimilar:(state,role,n)=>`Using how ${n} plays of this kind actually ended (${state}; ${role})`,cardValues:(gain,loss,be)=>`ending in success ${gain} against the reference, ending in failure ${loss}, break-even success rate ${be}`,cardNoRole:'The coders did not settle on one side going for it, so only the endings are shown.',cardLimit:'Win probabilities by ending are modeled states, not the effect of this play.',cardOpen:'See all results',pp:'pp',title:'Choices when behind',sub:n=>`${n} games from MSI and Worlds 2026 · current sample`,
      sections:{standing:'By win probability',objectives:'Baron & Elder',time:'Where time goes'},
      breakEven:'Break-even success rate',observed:'Observed success rate',legendNote:'Bars are 95% intervals; markers are estimates.',
      preliminary:'Preliminary',preliminaryTip:n=>`Fewer than ${n} plays`,gain:'On success',loss:'On failure',plays:n=>`${n.toLocaleString('en-US')} plays`,read:'How to read this',
      standingTitle:'How does the break-even change with a team’s standing?',
      standingMethod:'Plays the commentary resolved as a success or a failure are grouped by the acting team’s predicted win probability just before the play. The break-even success rate is the win probability lost on failure divided by the sum of what is gained on success and lost on failure. An observed success rate above it means the attempts paid on average.',
      standingRead:'The further the violet marker (observed) sits to the right of the amber one (break-even), the wider the margin. The amber marker moves left as a team falls behind, because a failure has less left to lose.',
      bins:{lt15:'Below 15%','15_35':'15–35%','35_65':'35–65%','65_85':'65–85%',ge85:'85% or above'},
      matched:(g,r)=>`Matched on play type and game time, the success rate in the lowest group is still ${g} pp (${r}) below the highest.`,
      standingLimit:'Only commentary-selected plays are included. A success rate above break-even does not show that teams should attempt more: decisions not to attempt are not in the data.',
      objectivesTitle:'Baron and Elder: going for it versus contesting it',objectiveNames:{baron:'Baron',elder:'Elder Dragon'},
      objectivesMethod:'Three coders, blind to the result, coded which team went for the objective in each play. The game is then frozen just before the play and replayed under the endings such plays actually had, scored by the frozen model.',
      objectivesRead:'Going for the objective, and plays around an objective nobody is attacking, are compared with nothing happening; contesting the opponent’s attempt is compared with the opponent taking it unopposed. A break-even of 0% means failing was no worse than the reference.',
      states:{trailing_lt35:'Behind · below 35%',even_35_65:'Even · 35–65%',leading_ge65:'Ahead · 65% or above'},
      roles:{actor:'Going for it',opponent:'Contesting the opponent',neither:'Nobody attacking it'},
      references:{actor:'Compared with nothing happening',opponent:'Compared with conceding it',neither:'Compared with nothing happening'},
      counts:(scored,resolved)=>`${scored} scored · success rate from ${resolved}`,referenceProbability:p=>`reference ${p}`,
      wps:(value,success,failure)=>`Break-even from observed swings ${value} · ${success} successes, ${failure} failures`,
      wpsNote:'The replay reflects only kills and objectives, so it understates what a failure costs. The break-even from the same plays’ observed win-probability swings is therefore shown as well. Observed swings include whatever else happened in the window, so the truth lies between the two.',
      examples:n=>`Open ${n} moments from this event`,outcomes:{success:'success',failure:'failure',aborted:'aborted',mixed:'mixed',unknown:'unknown'},
      noEstimate:'Too few moments under this condition for an estimate.',
      checks:(kills,gap,unscored)=>`Replaying a game without edits returns its published curve. Replaying ${kills} real Baron and Elder kills the same way differs from the real swing by a median of ${gap} pp. MSI is scored with v156 and Worlds with v312; ${unscored} plays lack the timing or states to be scored.`,
      objectivesLimit:'Win probabilities by ending are modeled states, not the effect of the play.',
      timeTitle:'When does a trailing team’s win probability move?',
      timeMethod:'Each second of the curve is read from the side that was below 35% 15 to 30 seconds earlier, and sorted by whose play window it falls in. A window runs from five seconds before a play to five seconds after it.',
      timeRead:'A positive change per minute means the trailing side’s win probability rose in that kind of time. It barely moves in quiet time and falls during the opponent’s plays.',
      scopes:{all_trailing:'All trailing time',before_20_min:'Before 20 min',from_20_min:'From 20 min','15_to_35':'At 15–35%',below_15:'Below 15%'},
      kinds:{quiet:'No narrated play',opponent_play:'Opponent’s plays',own_play:'Own plays',contested:'Plays by both sides',no_own_play:'Time without an own play',all:'All trailing time'},
      kindHints:{no_own_play:'quiet time + opponent’s plays'},
      share:'Share of time',drift:'Change in the trailing side’s win probability per minute',kind:'Kind of time',minutes:m=>`${m} min`,
      calibration:(standing,won,minutes)=>`The trailing side’s mean predicted win probability is ${standing}; those sides went on to win ${won} of that time (${minutes} minutes).`,
      timeLimit:'Kinds of time are outcomes, not choices. Quiet time is time in which the opponent also did nothing worth narrating, and narrated plays by a trailing side lean toward the ones that worked.',
      uncertaintyTitle:'Results from the current sample',
      uncertainty:(games,n)=>`These come from ${games} games, so many intervals are wide. Parentheses give 95% intervals from resampling whole games, and cells with fewer than ${n} plays are marked preliminary. Read wide intervals for direction only. The same calculation will be rerun when more games are added.`,
      missing:'The data for this analysis could not be loaded.'},
    ja:{gameLine:(m,k,pp)=>`勝率35%未満だった側の時間${m}分：相手のプレー${k.opponent_play}（勝率${pp.opponent_play}）、自分のプレー${k.own_play}（${pp.own_play}）、プレーのない時間${k.quiet}（${pp.quiet}）、重なる時間${k.contested}（${pp.contested}）。`,gameLineNote:'括弧はその時間に不利な側の勝率が動いた合計です。',gameLineOpen:'両大会の全体を見る',
      teamTitle:'不利なときの試み',teamScope:n=>`MSI・Worlds 2026 合計${n}試合 · 勝率35%未満だった時間`,
      teamCoverage:(r)=>`${r.games}試合 · 不利だった時間${r.trailing_minutes}分 · プレー${r.plays}件（懸かった勝率が大きいもの${r.high_stake_plays}件、成功・失敗と整理されたもの${r.resolved_plays}件）`,
      teamThin:(m)=>`このチームは${m.games}試合、不利だった時間${m.trailing_minutes}分、整理されたプレー${m.resolved_plays}件のいずれかに届かず、推定が不安定です。`,
      teamMissing:'このチームには不利だった時間のデータがありません。',teamMean:'チーム平均',teamOthers:'他のチーム',
      metrics:{attempt_rate:{title:'懸かった勝率が大きいプレーの頻度',unit:'件',
          value:(team,v,all)=>`${team}のプレーのうち、懸かった勝率が大きいものは不利な10分あたり${v}でした。${all?`実況が取り上げたすべてのプレーでは10分あたり${all}でした。`:''}`,
          context:(d,m,rho)=>`懸かった勝率とは、似たプレーが成功したときに得た勝率と、失敗したときに失った勝率を足した値です。不利なときのプレーのうち、この値が上位${m.top}%（${m.min}pp以上）のものだけを数えます。${d}${rho.teams}チームでの逆転勝率との順位相関は${rho.rho}です（p = ${rho.p}）。${rho.p>=.05?'こうしたプレーが多いチームほど強いと言える根拠はありません。':rho.rho<0?'こうしたプレーが多いチームほど逆転勝率は低くなりました。':'こうしたプレーが多いチームほど逆転勝率は高くなりました。'}`},
        selection_margin:{title:'選んだプレーの余裕',unit:'pp',
          value:(team,v)=>`${team}が選んだプレーは、似たプレーの期待成功率が損益分岐より${v}高くなりました。`,
          context:d=>`余裕が大きいほど、成功の見込みに対して失うものが少ないプレーを選んだことを意味します。${d}`},
        success_over_expected:{title:'期待に対する遂行',unit:'pp',
          value:(team,v)=>`${team}の実際の成功率は、似たプレーの期待と${v}の差がありました。`,
          context:d=>`${d}順位として読まないでください。試合が増えたら見直します。`}},
      teamDiffer:m=>`${m.teams}チーム間の差は偶然とは考えにくい大きさです（p = ${m.heterogeneity_p}）。`,teamAlike:m=>`現在${m.teams}チームの差は区別できません（p = ${m.heterogeneity_p}）。`,
      relation:{above:'チーム平均より高い値です。',below:'チーム平均より低い値です。',within:'区間がチーム平均を含むため、平均と区別できません。',widest:'現在のサンプルで最も高い値です。',noInterval:'試合が少なく、区間を求められませんでした。',caution:'ただし全チームを合わせて見ると、この程度の差は偶然でも生じます。'},
      teamLimit:'比較対象は、他のチームが他の試合で行った似たプレーです。実況が取り上げたプレーだけを数えるため、頻度は実際の試みの回数ではなく取り上げられた回数です。懸かった勝率が大きいプレーを分ける線は任意に決めたものです。不利な側は失う勝率が少ないため、懸かった勝率の大半は成功したときに得る分です。',
      cardLede:team=>`試合をこのプレーの直前で止め、結末だけを変えたときにモデルが見た${team}の勝率です。`,endings:{hold:'何も起きない',take:team=>`${team}が損失なく獲得`,concede:'相手が損失なく獲得'},referenceTag:'基準',cardSimilar:(state,role,n)=>`${state}の${role}${n}件が実際に迎えた結末で計算すると`,cardValues:(gain,loss,be)=>`成功で終わった場合は基準比${gain}、失敗で終わった場合は${loss}、損益分岐の成功率${be}`,cardNoRole:'どちらが攻撃したかが一方に定まらなかったプレーのため、結末別の勝率のみを示します。',cardLimit:'結末別の勝率はモデルが見た状態であり、このプレーが勝率を変えた効果ではありません。',cardOpen:'全体の結果を見る',pp:'pp',title:'不利なときの選択',sub:n=>`MSI・Worlds 2026 合計${n}試合 · 現在のサンプル`,
      sections:{standing:'勝率帯別',objectives:'バロン・エルダー',time:'時間の流れ'},
      breakEven:'損益分岐の成功率',observed:'実際の成功率',legendNote:'バーは95%区間、印は推定値です。',
      preliminary:'暫定',preliminaryTip:n=>`プレー${n}件未満`,gain:'成功時',loss:'失敗時',plays:n=>`プレー${n.toLocaleString('en-US')}件`,read:'数値の読み方',
      standingTitle:'直前の勝率で損益分岐はどう変わるか',
      standingMethod:'実況が成功または失敗と整理したプレーを、直前の予測勝率で分けました。損益分岐の成功率は、失敗時に失う勝率を、成功時に得る勝率と失敗時に失う勝率の合計で割った値です。実際の成功率がこれを上回れば、平均して得になった試みです。',
      standingRead:'紫（実際の成功率）がオレンジ（損益分岐）より右にあるほど余裕があります。不利なほどオレンジは左に寄ります。失敗しても失う勝率が少ないためです。',
      bins:{lt15:'勝率15%未満','15_35':'勝率15–35%','35_65':'勝率35–65%','65_85':'勝率65–85%',ge85:'勝率85%以上'},
      matched:(g,r)=>`プレーの種類と試合時間をそろえても、最も不利な帯の成功率は最も有利な帯より${g}pp（${r}）低くなります。`,
      standingLimit:'実況が取り上げたプレーのみです。成功率が損益分岐を上回ることは、もっと試みるべきだという意味ではありません。試みなかった判断はデータにありません。',
      objectivesTitle:'バロンとエルダー：先に仕掛けるときと妨害するとき',objectiveNames:{baron:'バロン',elder:'エルダードラゴン'},
      objectivesMethod:'各プレーでどちらがオブジェクトを攻撃したかを、3つのコーダーが結果を見ずに分類しました。次に試合をプレー直前で止め、同種のプレーが実際に迎えた結末を入れて、凍結したモデルで勝率を再計算しました。',
      objectivesRead:'先に仕掛けたプレーと誰も攻撃していないプレーは「何も起きない」と、相手を妨害したプレーは「相手がそのまま獲得する」と比べます。損益分岐0%は、失敗しても基準より悪くならなかったという意味です。',
      states:{trailing_lt35:'不利 · 勝率35%未満',even_35_65:'互角 · 勝率35–65%',leading_ge65:'有利 · 勝率65%以上'},
      roles:{actor:'先に仕掛けたプレー',opponent:'相手を妨害したプレー',neither:'誰も攻撃していないプレー'},
      references:{actor:'基準：何も起きない',opponent:'基準：相手がそのまま獲得',neither:'基準：何も起きない'},
      counts:(scored,resolved)=>`採点${scored}件 · 成功率の根拠${resolved}件`,referenceProbability:p=>`基準勝率 ${p}`,
      wps:(value,success,failure)=>`観測された勝率変化による損益分岐 ${value} · 成功${success}件、失敗${failure}件`,
      wpsNote:'状態の編集はキルとオブジェクトだけを反映するため、失敗のコストが小さく出ます。そこで同じプレーの観測勝率変化から求めた損益分岐も併記しました。観測値にはその区間の他の出来事も混ざるため、実際の値は両者の間にあります。',
      examples:n=>`この大会の場面${n}件を見る`,outcomes:{success:'成功',failure:'失敗',aborted:'中断',mixed:'混合',unknown:'不明'},
      noEstimate:'この条件の場面が少なく、推定できませんでした。',
      checks:(kills,gap,unscored)=>`編集せずに再計算した曲線は公開曲線と一致します。実際のバロン・エルダー獲得${kills}件を同じ方法で再現すると、実際の変動との差は中央値${gap}ppです。MSIはv156、Worldsはv312で採点し、${unscored}件は時刻や状態がなく採点できませんでした。`,
      objectivesLimit:'結末別の勝率はモデルが見た状態であり、そのプレーが勝率を変えた効果ではありません。',
      timeTitle:'不利なチームの勝率はどの時間に動くか',
      timeMethod:'勝率曲線の各秒を、15–30秒前に勝率35%未満だった側の視点で見て、その瞬間が誰のプレー区間だったかで4つに分けました。プレー区間は開始5秒前から終了5秒後までです。',
      timeRead:'1分あたりの変化が+なら、その時間に不利な側の勝率が上がったという意味です。静かな時間にはほとんど動かず、相手のプレーの時間に下がります。',
      scopes:{all_trailing:'不利な時間全体',before_20_min:'20分より前',from_20_min:'20分以降','15_to_35':'勝率15–35%',below_15:'勝率15%未満'},
      kinds:{quiet:'プレーのない時間',opponent_play:'相手のプレー',own_play:'自分のプレー',contested:'両方のプレーが重なる時間',no_own_play:'自分のプレーがない時間',all:'不利な時間全体'},
      kindHints:{no_own_play:'静かな時間 + 相手のプレー'},
      share:'時間の割合',drift:'不利な側の勝率の1分あたりの変化',kind:'時間の種類',minutes:m=>`${m}分`,
      calibration:(standing,won,minutes)=>`不利な側の平均予測勝率は${standing}、そのチームが実際に勝った割合は${won}です（${minutes}分）。`,
      timeLimit:'時間の種類は選択ではなく結果です。静かな時間は相手も何もできなかった時間であり、実況が取り上げる不利な側のプレーは成功したものに偏ります。',
      uncertaintyTitle:'現在のサンプルに基づく結果です',
      uncertainty:(games,n)=>`${games}試合からの値のため、区間が広い項目が多くあります。括弧内は試合単位で再抽出した95%区間で、プレー${n}件未満の項目には「暫定」を付けました。区間が広い項目は方向だけを参考にしてください。試合が追加されたら同じ方法で再計算します。`,
      missing:'この分析のデータを読み込めませんでした。'},
    zh:{gameLine:(m,k,pp)=>`一方胜率低于35%的时间 ${m} 分钟：对手的操作 ${k.opponent_play}（胜率 ${pp.opponent_play}），己方的操作 ${k.own_play}（${pp.own_play}），没有操作的时间 ${k.quiet}（${pp.quiet}），重叠时间 ${k.contested}（${pp.contested}）。`,gameLineNote:'括号内是该时间里落后一方胜率变动的合计。',gameLineOpen:'查看两项赛事的整体',
      teamTitle:'落后时的尝试',teamScope:n=>`MSI 与 Worlds 2026 合计 ${n} 局 · 胜率低于35%的时间`,
      teamCoverage:(r)=>`${r.games} 局 · 落后时间 ${r.trailing_minutes} 分钟 · ${r.plays} 次操作（其中 ${r.high_stake_plays} 次押上的胜率较大，${r.resolved_plays} 次判定为成功或失败）`,
      teamThin:(m)=>`该队未达到 ${m.games} 局、落后 ${m.trailing_minutes} 分钟或 ${m.resolved_plays} 次已判定操作中的至少一项，估计不稳定。`,
      teamMissing:'该队没有落后时间的数据。',teamMean:'队伍平均',teamOthers:'其他队伍',
      metrics:{attempt_rate:{title:'押上较大胜率的操作频率',unit:' 次',
          value:(team,v,all)=>`${team} 每落后10分钟有 ${v}操作押上了较大的胜率。${all?`若计入解说提到的全部操作，则为每10分钟 ${all}。`:''}`,
          context:(d,m,rho)=>`押上的胜率是同类操作成功时得到的胜率与失败时失去的胜率之和。只统计落后时的操作中该值位于前 ${m.top}%（${m.min}pp 以上）的操作。${d}${rho.teams} 支队伍中，与逆转获胜比例的等级相关为 ${rho.rho}（p = ${rho.p}）。${rho.p>=.05?'没有依据认为这类操作更多的队伍更强。':rho.rho<0?'这类操作更多的队伍，逆转获胜比例更低。':'这类操作更多的队伍，逆转获胜比例更高。'}`},
        selection_margin:{title:'所选操作的余量',unit:'pp',
          value:(team,v)=>`${team} 所选的操作，同类操作的预期成功率比保本高 ${v}。`,
          context:d=>`余量越大，说明所选操作相对其成功机会可损失的越少。${d}`},
        success_over_expected:{title:'相对预期的执行',unit:'pp',
          value:(team,v)=>`${team} 的实际成功率与同类操作的预期相差 ${v}。`,
          context:d=>`${d}请勿当作排名；比赛增加后会重新查看。`}},
      teamDiffer:m=>`${m.teams} 支队伍之间的差异难以用偶然解释（p = ${m.heterogeneity_p}）。`,teamAlike:m=>`目前 ${m.teams} 支队伍的差异无法区分（p = ${m.heterogeneity_p}）。`,
      relation:{above:'高于队伍平均。',below:'低于队伍平均。',within:'区间包含队伍平均，无法与平均区分。',widest:'当前样本中的最高值。',noInterval:'比赛太少，无法给出区间。',caution:'不过把所有队伍放在一起看，这样的差异也可能出于偶然。'},
      teamLimit:'比较对象是其他队伍在其他比赛中的同类操作。只统计解说提到的操作，因此频率是被提到的次数，而不是实际尝试的次数。划分押上胜率大小的界线是人为设定的。落后一方能失去的胜率不多，因此押上的胜率大部分来自成功时的所得。',
      cardLede:team=>`把比赛停在这次操作之前、只改变结局时，模型看到的 ${team} 胜率。`,endings:{hold:'什么都没发生',take:team=>`${team} 无损拿下`,concede:'对手无损拿下'},referenceTag:'基准',cardSimilar:(state,role,n)=>`按 ${n} 次同类操作（${state}；${role}）实际出现的结局计算`,cardValues:(gain,loss,be)=>`以成功结束时相对基准 ${gain}，以失败结束时 ${loss}，保本成功率 ${be}`,cardNoRole:'编码者未能确定是哪一方在打资源，因此只显示各结局的胜率。',cardLimit:'各结局的胜率是模型看到的状态，不是这次操作改变胜率的效果。',cardOpen:'查看全部结果',pp:'pp',title:'落后时的选择',sub:n=>`MSI 与 Worlds 2026 合计 ${n} 局 · 当前样本`,
      sections:{standing:'按胜率区间',objectives:'男爵与远古龙',time:'时间的去向'},
      breakEven:'保本成功率',observed:'实际成功率',legendNote:'条形为95%区间，标记为估计值。',
      preliminary:'初步',preliminaryTip:n=>`少于 ${n} 次操作`,gain:'成功时',loss:'失败时',plays:n=>`${n.toLocaleString('en-US')} 次操作`,read:'如何阅读',
      standingTitle:'保本成功率如何随局势变化？',
      standingMethod:'将解说判定为成功或失败的操作，按操作前的预测胜率分组。保本成功率等于失败时损失的胜率，除以成功时获得的胜率与失败时损失的胜率之和。实际成功率高于它，说明这些尝试平均是划算的。',
      standingRead:'紫色（实际成功率）越在橙色（保本）右侧，余量越大。越落后，橙色越靠左，因为失败时可损失的胜率更少。',
      bins:{lt15:'胜率低于15%','15_35':'胜率15–35%','35_65':'胜率35–65%','65_85':'胜率65–85%',ge85:'胜率85%以上'},
      matched:(g,r)=>`即使匹配操作类型与比赛时间，最落后区间的成功率仍比最领先区间低 ${g}pp（${r}）。`,
      standingLimit:'仅包含解说提到的操作。成功率高于保本并不表示应当更多尝试：没有尝试的决定不在数据中。',
      objectivesTitle:'男爵与远古龙：先手与干扰',objectiveNames:{baron:'男爵',elder:'远古龙'},
      objectivesMethod:'三位编码者在不看结果的情况下，判断每次操作中是哪一方在打资源。随后把比赛停在操作之前，代入同类操作实际出现过的结局，用冻结的模型重新计算胜率。',
      objectivesRead:'先手打资源以及无人打资源的操作，与“什么都没发生”比较；干扰对手的操作，与“对手直接拿下”比较。保本0%表示失败也不比基准更差。',
      states:{trailing_lt35:'落后 · 胜率低于35%',even_35_65:'均势 · 胜率35–65%',leading_ge65:'领先 · 胜率65%以上'},
      roles:{actor:'先手打资源',opponent:'干扰对手',neither:'无人打资源'},
      references:{actor:'基准：什么都没发生',opponent:'基准：对手直接拿下',neither:'基准：什么都没发生'},
      counts:(scored,resolved)=>`已评分 ${scored} 次 · 成功率依据 ${resolved} 次`,referenceProbability:p=>`基准胜率 ${p}`,
      wps:(value,success,failure)=>`按观测胜率变化计算的保本 ${value} · 成功 ${success} 次，失败 ${failure} 次`,
      wpsNote:'状态编辑只反映击杀与资源，因此低估了失败的代价。所以同时给出按同一批操作的观测胜率变化计算的保本值。观测值混有该时间段的其他事件，真实值介于两者之间。',
      examples:n=>`查看本赛事的 ${n} 个片段`,outcomes:{success:'成功',failure:'失败',aborted:'中止',mixed:'混合',unknown:'不明'},
      noEstimate:'该条件下片段太少，无法估计。',
      checks:(kills,gap,unscored)=>`不做编辑重新计算的曲线与公开曲线一致。用同样方法重现 ${kills} 次真实的男爵与远古龙击杀，与真实变动的中位差为 ${gap}pp。MSI 用 v156、Worlds 用 v312 评分；${unscored} 次操作缺少时间或状态，未能评分。`,
      objectivesLimit:'各结局的胜率是模型看到的状态，不是该操作改变胜率的效果。',
      timeTitle:'落后一方的胜率在什么时间变动？',
      timeMethod:'从15–30秒前胜率低于35%的一方的视角，查看胜率曲线的每一秒，并按当时处于谁的操作区间分为四类。操作区间从开始前5秒到结束后5秒。',
      timeRead:'每分钟变化为正，表示该类时间里落后一方的胜率上升。安静的时间几乎不动，对手操作的时间里下降。',
      scopes:{all_trailing:'全部落后时间',before_20_min:'20分钟前',from_20_min:'20分钟后','15_to_35':'胜率15–35%',below_15:'胜率低于15%'},
      kinds:{quiet:'没有操作的时间',opponent_play:'对手的操作',own_play:'己方的操作',contested:'双方操作重叠的时间',no_own_play:'没有己方操作的时间',all:'全部落后时间'},
      kindHints:{no_own_play:'安静时间 + 对手的操作'},
      share:'时间占比',drift:'落后一方胜率的每分钟变化',kind:'时间类型',minutes:m=>`${m} 分钟`,
      calibration:(standing,won,minutes)=>`落后一方的平均预测胜率为 ${standing}，这些队伍实际获胜的比例为 ${won}（${minutes} 分钟）。`,
      timeLimit:'时间类型是结果而非选择。安静时间是对手也没能做成什么的时间，而解说提到的落后方操作偏向成功的那些。',
      uncertaintyTitle:'基于当前样本的结果',
      uncertainty:(games,n)=>`这些数值来自 ${games} 局比赛，许多区间较宽。括号内是按整局重抽样得到的95%区间，少于 ${n} 次操作的项目标为“初步”。区间较宽的项目只宜参考方向。比赛增加后将用同样方法重新计算。`,
      missing:'未能加载此分析的数据。'},
  };
  const percent=v=>`${Math.round(100*v)}%`;
  const percentRange=e=>e?`${percent(e.value)}${e.ci95?` (${Math.round(100*e.ci95[0])}–${Math.round(100*e.ci95[1])})`:''}`:'—';
  const signed=(v,digits=1)=>`${v>0?'+':v<0?'−':''}${Math.abs(v).toFixed(digits)}`;
  function create(options={}){
    let data=null,pending=null;
    const lang=()=>options.getLanguage?.()||'ko';
    const c=()=>COPY[lang()]||COPY.en;
    async function load(){if(pending)return pending;pending=(async()=>{try{const r=await fetch('./data/trailing-choices-v1.json',{cache:'no-cache'});if(r.ok)data=await r.json();}catch(e){data=null;}})();return pending;}
    const points=(e,digits=1,sign=1)=>{
      if(!e)return '—';
      const value=sign*e.value,range=e.ci95?(sign>0?e.ci95:[-e.ci95[1],-e.ci95[0]]):null;
      return `${signed(value,digits)}${c().pp}${range?` (${signed(range[0],digits)}~${signed(range[1],digits)})`:''}`;
    };
    const badge=on=>on?` <span class="tc-badge" title="${esc(c().preliminaryTip(data.preliminary_below_plays))}">${esc(c().preliminary)}</span>`:'';
    const guide=body=>`<aside class="analysis-guide"><b>${esc(c().read)}</b><p>${esc(body)}</p></aside>`;
    const legend=()=>`<p class="tc-legend"><span><i class="tc-key be"></i>${esc(c().breakEven)}</span><span><i class="tc-key ob"></i>${esc(c().observed)}</span><small>${esc(c().legendNote)}</small></p>`;
    const axis=()=>`<div class="tc-row tc-axis" aria-hidden="true"><div></div><div class="tc-scale">${[0,25,50,75,100].map(v=>`<span style="left:${v}%">${v}%</span>`).join('')}</div><div></div></div>`;
    // One lane per series on a shared 0–100% axis: break-even above, observed success below.
    function intervalPlot(breakEven,observed){
      const lane=(e,kind,label)=>{
        if(!e)return '';
        const text=`${label} ${percentRange(e)}`;
        const band=e.ci95?`<span class="tc-band ${kind}" style="left:${(100*e.ci95[0]).toFixed(1)}%;width:${Math.max(.6,100*(e.ci95[1]-e.ci95[0])).toFixed(1)}%" title="${esc(text)}"></span>`:'';
        return `${band}<span class="tc-mark ${kind}" style="left:${(100*e.value).toFixed(1)}%" title="${esc(text)}"></span>`;
      };
      const label=`${c().breakEven} ${percentRange(breakEven)}, ${c().observed} ${percentRange(observed)}`;
      return `<div class="tc-plot" role="img" aria-label="${esc(label)}">${lane(breakEven,'be',c().breakEven)}${lane(observed,'ob',c().observed)}</div>`;
    }
    const values=(breakEven,observed,gain,loss)=>`<div class="tc-values"><p><i class="tc-key be"></i>${esc(c().breakEven)} <b>${esc(percentRange(breakEven))}</b></p><p><i class="tc-key ob"></i>${esc(c().observed)} <b>${esc(percentRange(observed))}</b></p><p class="tc-swing">${esc(c().gain)} ${esc(points(gain))} · ${esc(c().loss)} ${esc(points(loss,1,-1))}</p></div>`;
    function standingHtml(){
      const copy=c(),gap=data.standing.matched_success_gap;
      const rows=data.standing.bins.map(bin=>`<div class="tc-row"><div class="tc-label"><b>${esc(copy.bins[bin.id]||bin.id)}</b>${badge(bin.preliminary)}<small>${esc(copy.plays(bin.plays))}</small></div>${intervalPlot(bin.break_even,bin.success_rate)}${values(bin.break_even,bin.success_rate,bin.gain_pp,bin.loss_pp)}</div>`).join('');
      return `<h2>${esc(copy.standingTitle)}</h2><p class="tc-note">${esc(copy.standingMethod)}</p>${guide(copy.standingRead)}${legend()}<div class="tc-rows">${axis()}${rows}</div>${gap?`<p class="tc-note">${esc(copy.matched(Math.abs(Math.round(100*gap.value)),`${Math.round(100*Math.abs(gap.ci95[1]))}–${Math.round(100*Math.abs(gap.ci95[0]))}`))}</p>`:''}<p class="tc-note tc-limit">${esc(copy.standingLimit)}</p>`;
    }
    function examplesHtml(cell,tournament){
      const copy=c(),plays=cell.plays.filter(p=>p.tournament_id===tournament);
      if(!plays.length)return '';
      const items=plays.map(p=>{
        const label=options.playLabel?.(p.id)||p.id;
        const numbers=p.gain_pp==null?'':` · ${copy.gain} ${signed(p.gain_pp)}${copy.pp} · ${copy.loss} ${signed(-p.loss_pp)}${copy.pp}`;
        return `<li><button type="button" class="tc-play" data-tc-play="${esc(p.id)}">${esc(label)}</button><small>${esc(copy.outcomes[p.outcome]||copy.outcomes.unknown)}${esc(numbers)}</small></li>`;
      }).join('');
      return `<details class="tc-examples"><summary>${esc(copy.examples(plays.length))}</summary><ul>${items}</ul></details>`;
    }
    function objectivesHtml(tournament,objective){
      const copy=c(),cells=data.objectives[objective]?.cells||[],checks=data.objective_checks;
      const picker=`<div class="tc-controls"><div class="seg">${OBJECTIVES.map(k=>`<button type="button" data-tc-objective="${k}" class="${k===objective?'on':''}" aria-pressed="${k===objective}">${esc(copy.objectiveNames[k])}</button>`).join('')}</div></div>`;
      const groups=STATES.map(state=>{
        const rows=ROLES.map(role=>cells.find(cell=>cell.state===state&&cell.role===role)).filter(Boolean).map(cell=>{
          const label=`<div class="tc-label"><b>${esc(copy.roles[cell.role])}</b>${badge(cell.preliminary)}<small>${esc(copy.references[cell.role])}${cell.reference_probability?` · ${esc(copy.referenceProbability(percent(cell.reference_probability.value)))}`:''}</small><small>${esc(copy.counts(cell.scored_plays,cell.resolved_plays))}</small></div>`;
          const body=cell.break_even?`${intervalPlot(cell.break_even,cell.observed_success)}${values(cell.break_even,cell.observed_success,cell.gain_pp,cell.loss_pp)}`:`${intervalPlot(null,cell.observed_success)}<div class="tc-values"><p><i class="tc-key ob"></i>${esc(copy.observed)} <b>${esc(percentRange(cell.observed_success))}</b></p><p class="tc-swing">${esc(copy.noEstimate)}</p></div>`;
          const wps=cell.observed_wps?.break_even?`<p class="tc-wps">${esc(copy.wps(percentRange(cell.observed_wps.break_even),cell.observed_wps.success_plays,cell.observed_wps.failure_plays))}</p>`:'';
          const extra=wps||cell.plays.length?`<div class="tc-extra">${wps}${examplesHtml(cell,tournament)}</div>`:'';
          return `<div class="tc-row">${label}${body}</div>${extra}`;
        }).join('');
        return rows?`<h3 class="tc-group">${esc(copy.states[state])}</h3>${rows}`:'';
      }).join('');
      return `<h2>${esc(copy.objectivesTitle)}</h2><p class="tc-note">${esc(copy.objectivesMethod)}</p>${guide(copy.objectivesRead)}${picker}${legend()}<div class="tc-rows">${axis()}${groups}</div><p class="tc-note">${esc(copy.wpsNote)}</p><p class="tc-note">${esc(copy.checks(checks.replayed_real_kills,checks.replay_median_abs_difference_pp,checks.unscored_plays))}</p><p class="tc-note tc-limit">${esc(copy.objectivesLimit)}</p>`;
    }
    function timeHtml(scope){
      const copy=c(),cells=data.time.scopes[scope]||data.time.scopes.all_trailing;
      const reach=Math.max(1,Math.ceil(Math.max(...[...KINDS,...GROUPS].flatMap(kind=>{const e=cells[kind].pp_per_minute;return e?[Math.abs(e.value),...(e.ci95||[]).map(Math.abs)]:[0];}))));
      const side=v=>50+50*Math.max(-1,Math.min(1,v/reach));
      const driftPlot=e=>{
        if(!e)return '';
        const text=points(e,2),from=Math.min(50,side(e.value)),width=Math.abs(side(e.value)-50);
        const whisker=e.ci95?`<span class="tc-whisker" style="left:${side(e.ci95[0]).toFixed(1)}%;width:${(side(e.ci95[1])-side(e.ci95[0])).toFixed(1)}%"></span>`:'';
        return `<div class="tc-drift" role="img" aria-label="${esc(text)}" title="${esc(text)}"><span class="tc-zero"></span><span class="tc-bar ${e.value<0?'down':'up'}" style="left:${from.toFixed(1)}%;width:${Math.max(.6,width).toFixed(1)}%"></span>${whisker}</div>`;
      };
      const row=(kind,summary=false)=>{
        const cell=cells[kind],share=cell.share_of_minutes,hint=copy.kindHints[kind];
        return `<tr class="${summary?'tc-summary':''}"><th scope="row">${esc(copy.kinds[kind])}${hint?`<small>${esc(hint)}</small>`:''}<small>${esc(copy.minutes(Math.round(cell.minutes).toLocaleString('en-US')))}</small></th><td class="tc-share">${summary&&kind==='all'?'':`<span class="tc-sharebar"><i style="width:${(100*share.value).toFixed(1)}%"></i></span><b>${esc(percentRange(share))}</b>`}</td><td class="tc-driftcell">${driftPlot(cell.pp_per_minute)}<b>${esc(points(cell.pp_per_minute,2))}</b></td></tr>`;
      };
      const picker=`<div class="tc-controls"><div class="seg">${SCOPES.map(k=>`<button type="button" data-tc-scope="${k}" class="${k===scope?'on':''}" aria-pressed="${k===scope}">${esc(copy.scopes[k])}</button>`).join('')}</div></div>`;
      const time=data.time;
      return `<h2>${esc(copy.timeTitle)}</h2><p class="tc-note">${esc(copy.timeMethod)}</p>${guide(copy.timeRead)}${picker}<div class="scroll-x"><table class="xt tc-time"><thead><tr><th>${esc(copy.kind)}</th><th>${esc(copy.share)}</th><th>${esc(copy.drift)} <span class="tc-reach">−${reach} ~ +${reach}${esc(copy.pp)}</span></th></tr></thead><tbody>${KINDS.map(kind=>row(kind)).join('')}${GROUPS.map(kind=>row(kind,true)).join('')}</tbody></table></div><p class="tc-note">${esc(copy.calibration(percentRange(time.mean_standing),percentRange(time.won_share),Math.round(time.trailing_minutes).toLocaleString('en-US')))}</p><p class="tc-note tc-limit">${esc(copy.timeLimit)}</p>`;
    }
    // The card in the game workspace for one Baron or Elder play.
    function playCardHtml(id,actor,opponent){
      const play=data?.objective_plays?.[id];
      if(!play)return '';
      const copy=c(),reference=play.role==='opponent'?'concede':'hold';
      const cell=play.role?data.objectives[play.objective]?.cells.find(x=>x.state===play.state&&x.role===play.role):null;
      const rows=['hold','take','concede'].map(key=>{
        const label=key==='take'?copy.endings.take(actor||'?'):copy.endings[key];
        return `<div class="tc-ending ${key===reference?'ref':''}"><dt>${esc(label)}${key===reference?` <span class="tc-ref">${esc(copy.referenceTag)}</span>`:''}</dt><dd><span class="tc-endbar"><i style="width:${(100*play[key]).toFixed(1)}%"></i></span><b>${esc(percent(play[key]))}</b></dd></div>`;
      }).join('');
      const pp=v=>`${signed(v)}${copy.pp}`;
      const similar=cell&&play.gain_pp!=null?`<p class="tc-card-similar">${esc(copy.cardSimilar(copy.states[play.state],copy.roles[play.role],cell.scored_plays))}: ${esc(copy.cardValues(pp(play.gain_pp),pp(-play.loss_pp),play.break_even==null?'—':percent(play.break_even)))}</p>`:`<p class="tc-card-similar">${esc(copy.cardNoRole)}</p>`;
      const title=`${copy.objectiveNames[play.objective]}${play.role?` · ${copy.roles[play.role]}`:''}`;
      return `<section class="tc-card" data-tc-card="${esc(play.objective)}"><div class="tc-card-top"><strong>${esc(title)}</strong>${badge(cell?.preliminary)}</div><p class="tc-card-lede">${esc(copy.cardLede(actor||'?'))}</p><dl class="tc-endings">${rows}</dl>${similar}<p class="tc-card-limit">${esc(copy.cardLimit)} <button type="button" class="linkbtn" data-tc-open="${esc(play.objective)}">${esc(copy.cardOpen)}</button></p></section>`;
    }
    // One line under the game-flow chart: whose plays filled the time one side spent behind.
    function gameLineHtml(gameId){
      const game=data?.time?.games?.[gameId];
      if(!game||game.trailing_minutes<3)return '';
      const copy=c(),shares={},changes={};
      for(const kind of KINDS){shares[kind]=percent(game[kind].share);changes[kind]=`${signed(game[kind].change_pp)}${copy.pp}`;}
      return `<p class="tc-gameline" data-tc-gameline="${esc(gameId)}">${esc(copy.gameLine(Math.round(game.trailing_minutes),shares,changes))} <span>${esc(copy.gameLineNote)}</span> <button type="button" class="linkbtn" data-tc-open-section="time">${esc(copy.gameLineOpen)}</button></p>`;
    }
    // Team profile: three measures while behind, each as a sentence with its interval and a strip of all teams.
    function teamHtml(team){
      const copy=c(),purpose=window.PlayValueExplore?.purposeHtml('behindTeam',lang())||'';
      const head=`<h2>${esc(copy.teamTitle)}</h2>${purpose}`;
      if(!data)return `<section class="card trailing-choices">${head}<p class="empty">${esc(copy.missing)}</p></section>`;
      const teams=data.teams,row=teams.rows.find(r=>r.team===team);
      if(!row)return `<section class="card trailing-choices">${head}<p class="empty">${esc(copy.teamMissing)}</p></section>`;
      const number=(v,m,sign)=>`${sign?signed(v):v.toFixed(m==='attempt_rate'?1:1)}${copy.metrics[m].unit}`;
      const blocks=Object.keys(teams.metrics).map(m=>{
        const meta=teams.metrics[m],text=copy.metrics[m],e=row[m],sign=m!=='attempt_rate';
        if(!e)return '';
        const range=e.ci95?` (${sign?signed(e.ci95[0]):e.ci95[0].toFixed(1)}~${sign?signed(e.ci95[1]):e.ci95[1].toFixed(1)})`:'';
        const shown=teams.rows.filter(r=>r[m]);
        const best=Math.max(...shown.filter(r=>!r.preliminary).map(r=>r[m].value));
        const relation=!e.ci95?copy.relation.noInterval:e.ci95[0]>meta.mean?copy.relation.above:e.ci95[1]<meta.mean?copy.relation.below:copy.relation.within;
        // One team's interval can clear the mean while the teams as a whole are indistinguishable; say both.
        const caution=e.ci95&&meta.heterogeneity_p>=.05&&(e.ci95[0]>meta.mean||e.ci95[1]<meta.mean)?` ${copy.relation.caution}`:'';
        const widest=m==='selection_margin'&&!row.preliminary&&e.value===best?` ${copy.relation.widest}`:'';
        const low=Math.min(meta.mean,...shown.flatMap(r=>r[m].ci95||[r[m].value])),high=Math.max(meta.mean,...shown.flatMap(r=>r[m].ci95||[r[m].value]));
        const at=v=>(100*(v-low)/(high-low||1)).toFixed(1);
        const strip=shown.map(r=>{
          const x=r[m],label=`${r.team} ${number(x.value,m,sign)}${x.ci95?` (${sign?signed(x.ci95[0]):x.ci95[0].toFixed(1)}~${sign?signed(x.ci95[1]):x.ci95[1].toFixed(1)})`:''}`;
          return `<div class="tc-team ${r.team===team?'on':''}" title="${esc(label)}"><span class="tc-team-name">${esc(r.team)}</span><span class="tc-team-plot">${x.ci95?`<i class="tc-team-band" style="left:${at(x.ci95[0])}%;width:${Math.max(.6,at(x.ci95[1])-at(x.ci95[0])).toFixed(1)}%"></i>`:''}<i class="tc-team-dot" style="left:${at(x.value)}%"></i></span></div>`;
        }).join('');
        // Whether teams differ is read from the heterogeneity test, so the sentence follows the data.
        const differ=(meta.heterogeneity_p<.05?copy.teamDiffer:copy.teamAlike)(meta);
        // Frequency counts high-stake plays only; the rate over every narrated play is given beside it.
        const all=row.all_plays_rate,allText=all?`${number(all.value,m,false)}${all.ci95?` (${all.ci95[0].toFixed(1)}~${all.ci95[1].toFixed(1)})`:''}`:'';
        const context=m==='attempt_rate'?text.context(differ,{top:Math.round(100*meta.top_share),min:meta.min_stake_pp.toFixed(1)},meta.strength.comeback_rate):text.context(differ);
        return `<article class="tc-metric"><h3>${esc(text.title)}${badge(row.preliminary)}</h3><p class="tc-metric-value"><b>${esc(number(e.value,m,sign))}</b>${esc(range)} <small>${esc(copy.teamMean)} ${esc(number(meta.mean,m,sign))}</small></p><p class="tc-note">${esc(text.value(team,`${number(e.value,m,sign)}${range}`,m==='attempt_rate'?allText:''))} ${esc(relation)}${esc(widest)}${esc(caution)}</p><div class="tc-teams" role="img" aria-label="${esc(text.title)}"><div class="tc-team tc-team-axis"><span class="tc-team-name"></span><span class="tc-team-plot"><i class="tc-team-mean" style="left:${at(meta.mean)}%"></i><em style="left:${at(meta.mean)}%">${esc(copy.teamMean)}</em></span></div>${strip}<i class="tc-team-meanline" style="--at:${at(meta.mean)}%"></i></div><p class="tc-note">${esc(context)}</p></article>`;
      }).join('');
      const thin=row.preliminary?`<p class="tc-note tc-thin">${esc(copy.teamThin(teams.minimum))}</p>`:'';
      return `<section class="card trailing-choices">${head}<p class="tc-note">${esc(copy.teamScope(data.coverage.games))}<br>${esc(team)}: ${esc(copy.teamCoverage(row))}</p>${thin}<div class="tc-metrics">${blocks}</div><p class="tc-note tc-limit">${esc(copy.teamLimit)}</p><aside class="tc-uncertainty"><b>${esc(copy.uncertaintyTitle)}</b><p>${esc(copy.uncertainty(data.coverage.games,data.preliminary_below_plays))}</p></aside></section>`;
    }
    function html(tournament,o={}){
      const copy=c();
      if(!data)return `<p class="empty">${esc(copy.missing)}</p>`;
      const section=SECTIONS.includes(o.section)?o.section:'standing',objective=OBJECTIVES.includes(o.objective)?o.objective:'baron',scope=SCOPES.includes(o.scope)?o.scope:'all_trailing';
      const tabs=`<div class="tc-controls"><div class="seg">${SECTIONS.map(k=>`<button type="button" data-tc-section="${k}" class="${k===section?'on':''}" aria-pressed="${k===section}">${esc(copy.sections[k])}</button>`).join('')}</div></div>`;
      const body=section==='objectives'?objectivesHtml(tournament,objective):section==='time'?timeHtml(scope):standingHtml();
      return `<div class="trailing-choices" data-tc-current="${section}">${tabs}${body}<aside class="tc-uncertainty"><b>${esc(copy.uncertaintyTitle)}</b><p>${esc(copy.uncertainty(data.coverage.games,data.preliminary_below_plays))}</p></aside></div>`;
    }
    function wire(root){
      for(const key of ['section','objective','scope'])root.querySelectorAll(`[data-tc-${key}]`).forEach(b=>b.onclick=()=>options.onChange?.({[key]:b.dataset['tc'+key[0].toUpperCase()+key.slice(1)]}));
      root.querySelectorAll('[data-tc-play]').forEach(b=>b.onclick=()=>options.onPlay?.(b.dataset.tcPlay));
      root.querySelectorAll('[data-tc-open]').forEach(b=>b.onclick=()=>options.onOpen?.(b.dataset.tcOpen));
      root.querySelectorAll('[data-tc-open-section]').forEach(b=>b.onclick=()=>options.onSection?.(b.dataset.tcOpenSection));
    }
    return {load,html,teamHtml,playCardHtml,gameLineHtml,wire,available:()=>!!data,title:()=>c().title,subtitle:()=>data?c().sub(data.coverage.games):''};
  }
  window.PlayValueTrailingChoices={create,SECTIONS,OBJECTIVES,SCOPES};
})();
