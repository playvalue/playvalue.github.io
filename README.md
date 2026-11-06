# PlayValue

**https://playvalue.github.io**

[![The PlayValue dashboard: the MSI 2026 final, game 5, with the gold timeline, the play list, and the selected play's gold change and map positions](assets/screenshot.png)](https://playvalue.github.io)

PlayValue looks at the plays that League of Legends casters call out in professional matches and shows both how the gold gap moved and how a frozen model's win probability moved in the 15, 30 and 60 seconds after each one.

- Plays are picked from the commentary first, without looking at gold.
- The gold gap is then read off the broadcast, once a second.
- The public-beta WPS layer applies the frozen v312 family to the same broadcast-gold seconds plus causally available Riot event state. It is precomputed for the static site; the model does not run in the browser.
- WPS values are computed from the one-second research curve. The browser-facing line uses a two-second display grid while retaining endpoints, play anchors and both sides of abrupt moves; no smoothing is applied.
- Each play is coded (what kind of play, who made it, which objective it led to) by three independent language-model coders and settled by majority vote, with an adjudicator where they split.

The number is what the team went through in that window, everything else on the map included. It is not the share of one play. The [methodology page](https://playvalue.github.io/methodology.html) sets out the procedure, the checks and the limits.

## What is here

This repository is the published site. It is built from a separate research repository and deployed here; changes made here directly are overwritten on the next deploy.

| Path | What it is |
|---|---|
| `index.html` | The dashboard: per-game view and totals by play type |
| `methodology.html` | How plays are picked, measured and coded (Korean and English) |
| `data/index.json` | Tournaments, games and site-wide counts |
| `data/<tournament>/plays.json` | Plays of every game in a tournament |
| `data/<tournament>/games/<game>.json` | One game: teams, roster, gold timeline, plays, map positions |
| `data/wps-v312/` | Frozen v312 beta curves and play-level WPS overlays |
| `assets/ddragon/` | Map and champion images from Riot's Data Dragon |

Tournaments covered so far: MSI 2026 (all 71 games) and Worlds 2026 (41 games through the first three quarterfinal series). As of 6 November 2026 the site holds 112 games and 5,613 plays.

## Questions and data

Questions, corrections and offers of finer match data for research (per-second events, player positions) are welcome as [issues](https://github.com/playvalue/playvalue.github.io/issues).

PlayValue is part of a wider line of research on games and esports data, for example [When the Rule-Maker Runs the World Championship](https://arxiv.org/abs/2610.07427) (Haewoon Kwak, 2026).

## 한국어

PlayValue는 프로 경기에서 해설이 짚은 플레이마다, 그 뒤 15·30·60초 동안 두 팀의 골드 차이와 동결된 모델의 승률이 어떻게 움직였는지 보여 줍니다. 플레이는 골드와 승률을 보지 않고 해설에서 먼저 고릅니다. 공개 베타 WPS는 방송에서 읽은 초 단위 골드와 해당 시점까지의 Riot 이벤트 상태에 동결된 v312 계열을 적용한 값이며, 한 플레이만의 인과효과를 뜻하지 않습니다. WPS 계산은 1초 단위 연구 곡선을 쓰고, 웹 선 그래프만 2초 간격을 기본으로 하되 시작·끝, 플레이 시점과 급변 전후를 보존하며 smoothing하지 않습니다. 자세한 방법과 한계는 [방법론 페이지](https://playvalue.github.io/methodology.html)에 있습니다.

## Notes

Visits are counted with [Umami](https://umami.is) without cookies.

PlayValue isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
