# PlayValue

**https://playvalue.github.io**

[![The PlayValue dashboard: the MSI 2026 final, game 5, with the play list, map positions, the selected play's win-probability and gold change, and the game-flow chart](assets/screenshot.png)](https://playvalue.github.io)

PlayValue looks at the plays that League of Legends casters call out in professional matches and shows both how the gold gap moved and how a frozen model's win probability moved in the 15, 30 and 60 seconds after each one.

- Plays are picked from the commentary first, without looking at gold.
- The gold gap is then read off the broadcast, once a second.
- The public-beta WPS layer applies the frozen v312 family to the same broadcast-gold seconds plus causally available Riot event state. It is precomputed for the static site; the model does not run in the browser.
- WPS values are computed from the one-second research curve. The browser-facing line uses a two-second display grid while retaining endpoints, play anchors and both sides of abrupt moves; no smoothing is applied.
- Each play is coded (what kind of play, who made it, which objective it led to) by three independent language-model coders and settled by majority vote, with an adjudicator where they split.

The number is what the team went through in that window, everything else on the map included. It is not the share of one play. The [methodology page](https://playvalue.github.io/methodology.html) sets out the procedure, the checks and the limits.

## What is here

This repository is the published site shell. It is built from a separate research repository and deployed here; changes made here directly are overwritten on the next deploy. Runtime JSON lives in the separate [`playvalue/data`](https://github.com/playvalue/data) project Pages repository, which is served on the same origin under `https://playvalue.github.io/data/`.

| Path | What it is |
|---|---|
| `index.html` | The dashboard: per-game view, totals by play type, game and moment swings, and team and player comparison |
| `methodology.html` | How plays are picked, measured and coded (Korean and English) |
| `assets/ddragon/` | Map and champion images from Riot's Data Dragon |

The `playvalue/data` repository provides `index.json`, tournament play and game files, and the frozen v312 WPS overlays at the existing `/data/` URLs.

Tournaments covered so far: MSI 2026 (all 71 games) and Worlds 2026 (52 games, Swiss round 3 through the semifinals). As of 9 November 2026 the site holds 123 games and 6,229 plays.

## Questions and data

Questions, corrections and offers of finer match data for research (per-second events, player positions) are welcome as [issues](https://github.com/playvalue/playvalue.github.io/issues).

PlayValue is part of a wider line of research on games and esports data, for example [When the Rule-Maker Runs the World Championship](https://arxiv.org/abs/2610.07427) (Haewoon Kwak, 2026).

## 한국어

PlayValue는 프로 경기에서 해설이 짚은 플레이마다, 그 뒤 15·30·60초 동안 두 팀의 골드 차이와 동결된 모델의 승률이 어떻게 움직였는지 보여 줍니다. 플레이는 골드와 승률을 보지 않고 해설에서 먼저 고릅니다. 공개 베타 WPS는 방송에서 읽은 초 단위 골드와 해당 시점까지의 Riot 이벤트 상태에 동결된 v312 계열을 적용한 값이며, 한 플레이만의 인과효과를 뜻하지 않습니다. WPS 계산은 1초 단위 연구 곡선을 쓰고, 웹 선 그래프만 2초 간격을 기본으로 하되 시작·끝, 플레이 시점과 급변 전후를 보존하며 smoothing하지 않습니다. 자세한 방법과 한계는 [방법론 페이지](https://playvalue.github.io/methodology.html)에 있습니다.

## Notes

### Navigation

The top navigation follows four subjects: Games, Moments, Teams and Players.
Games owns the stage/team filters and closeness/comeback sorting. Moments offers
turning points and play-type totals. A team profile opens Style, Game record or
Statistics; statistics shows one of Play involvement, Time & situation or Lead
development at a time. Team and player comparisons open through explicit buttons
on their respective profiles, rather than sharing a top-level catch-all view.

`explore-navigation.js` maps old `swings`, contextual `stats` and signature links
to the new views. Existing game/play links still open their game workspace.
Profile links use `view=teams&team=IG&panel=style` or `view=players&entity=...`;
comparison selections remain in `teamA`/`teamB` or `entity`/`compare`.

```sh
node --test tests/test_explore_navigation.cjs tests/test_team_signatures_ui.cjs
```

### Tournament signatures

The team profile's Style tab includes an optional signature layer for MSI's
top four and the four Worlds semifinalists. It describes repeated formations in
each tournament, with typical-state examples from different opponents. GEN stays
explicitly pending because the published sample covers only two opponents
across three series.

`team-signatures.js` and `team-signatures.css` render
`data/team-signatures-v1.json`. The layer is independent of the selected WPS/gold
horizon. Its modal uses actual synchronous Riot minute frames, each linked to its
own broadcast timestamp; it does not interpolate movement or manufacture a
commentary play. YouTube embeds may be unavailable; the direct timed VOD link is
always provided when that broadcast clock is observed.

From the research checkout, after rebuilding `team_style_profiles_v1` when its
inputs change:

```sh
.venv-minimap/bin/python -m src.winprob_value.export_team_signatures
.venv-minimap/bin/python -m unittest tests.test_team_signatures
node --test tests/test_team_signatures_ui.cjs
```

The builder checks source hashes, bracket selection, minimum replication and
opponent sensitivity. The editorial scope is in `config/team_signatures_v1.json`;
source provenance is saved to `data/processed/team_signatures_v1/manifest.json`.
The usual two-repository Pages deployment includes the new runtime JSON and site
assets. A missing signature file does not disable existing comparisons.
The profile team picker shows a single team and keeps its `team` URL parameter
separate from the statistical comparison's `teamA`/`teamB` selections.
Teams outside the signature sample retain their own profile and an explicit
coverage notice. Old comparison links with a `signature` parameter open that
team's Style tab.
Expected frequencies use tournament-wide game-state baselines, not the other
team currently selected in the comparison.

Visits are counted with [Umami](https://umami.is) without cookies.

PlayValue isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
