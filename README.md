[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/muukmaila-cyber/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/muukmaila-cyber/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# GTA VI Trophy Guide & Tracker — gta6-trophy-guide-01

Built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

An offline, open-source web app that guides and tracks all **55 official
PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver,
46 bronze): a checklist saved in the browser with export/import, filters by
kind (story, missable, collectibles, activities, online — the official list
has no online trophies), a spoiler setting that hides story trophies until
earned, a 5-stage roadmap to the platinum, and a guide in the author's own
words for every trophy, each citing its source.

## Run it offline

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Or open `app/index.html` from any static file server with `app/` at its
root. No build step, no network: the only fetch is the app's own
`app/data/trophies.json`.

## What is inside

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker.
- `app/data/trophies.json` — all 55 trophies with official name, description
  and grade, plus kind, stage, count, missable flag, and a guide + source
  per trophy.
- `screenshots/` — 4 real renders of the app (checklist, open guide,
  roadmap, missable filter + spoiler mode).
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json` via the vendored make.fun library.

## Method

Built from the rules alone, from the official trophy descriptions:
names, descriptions and grades are PlayStation's, as listed by Exophase and
PSNProfiles on 18 Nov 2026 (they agree on all 55). Missable flags are read
from those descriptions — anything tied to one story beat, mission or choice
is flagged (21 trophies) so you do it on your first pass. Every guide is
written in the author's own words and names its source beside it; nothing is
copied from another guide, and no Rockstar logo or official artwork is used.

## License

MIT — see `LICENSE`.
