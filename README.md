# World Cup 2026 — Predictions Tracker (always-on)

A self-contained predictions app (`index.html`) plus an automatic results filler.

## How the auto-fill works
- A GitHub Actions cron job (`.github/workflows/results.yml`) runs every ~30 min on
  GitHub's servers — independent of your PC.
- It runs `scripts/fetch-results.js`, which pulls finished match scores and writes
  `results.json`.
- GitHub Pages serves the repo; `index.html` fetches `results.json` on load (and every
  5 minutes while open) and fills in the real scores, recomputing standings + bracket.
- Manual scores you type always override the auto-filled ones (for corrections).

## One-time setup
1. **Enable GitHub Pages**: Settings → Pages → Source = `Deploy from a branch`, branch
   `main`, folder `/ (root)`.
2. **Add the results API token** (free): create an account at
   https://www.football-data.org/client/register, copy your API token, then in this repo
   go to Settings → Secrets and variables → Actions → New repository secret:
   - Name: `FOOTBALL_DATA_TOKEN`
   - Value: your token
3. **Enable Actions**: the Actions tab → enable workflows. Run "Fetch World Cup results"
   once via *Run workflow* to verify.

Until the token is set (or before matches start on June 11), `results.json` stays empty
and the app simply shows predictions — nothing breaks.

## Files
- `index.html` — the app (predictions model + score entry + auto-fill)
- `results.json` — auto-maintained finished results (do not edit by hand)
- `scripts/fetch-results.js` — the fetcher
- `.github/workflows/results.yml` — the cron job
