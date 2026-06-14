// Fetches finished 2026 World Cup matches and writes results.json
// Data source: football-data.org (free tier covers the World Cup).
// Needs a free API token in the env var FOOTBALL_DATA_TOKEN (GitHub secret).
//
// Output shape (consumed by index.html):
//   { "updated": "<ISO>", "source": "...", "matches": [ {home, away, hg, ag, winner?}, ... ] }
// hg/ag = final score (incl. extra time). winner (team name) is only set when a
// knockout match was level after ET and decided on penalties.

const fs = require("fs");

const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
const COMP = "WC"; // World Cup competition code

function writeOut(matches, note) {
  const out = {
    updated: new Date().toISOString(),
    source: "football-data.org",
    note: note || undefined,
    matches,
  };
  fs.writeFileSync("results.json", JSON.stringify(out, null, 2));
  console.log(`Wrote results.json with ${matches.length} finished match(es)${note ? " — " + note : ""}`);
}

async function main() {
  if (!TOKEN) {
    // No token yet: write an empty (but valid) file so the app still loads.
    writeOut([], "no FOOTBALL_DATA_TOKEN set");
    return;
  }
  let data;
  try {
    const res = await fetch(`https://api.football-data.org/v4/competitions/${COMP}/matches`, {
      headers: { "X-Auth-Token": TOKEN },
    });
    if (!res.ok) {
      console.error(`API error ${res.status} ${res.statusText}`);
      process.exit(0); // don't fail the workflow; just skip this run
    }
    data = await res.json();
  } catch (e) {
    console.error("Fetch failed:", e.message);
    process.exit(0);
  }

  const matches = (data.matches || [])
    .filter((m) => m.status === "FINISHED")
    .map((m) => {
      const ft = m.score.fullTime; // final score incl. extra time
      const out = { home: m.homeTeam.name, away: m.awayTeam.name, hg: ft.home, ag: ft.away };
      // Penalty shootout winner (only relevant when level after extra time)
      if (ft.home === ft.away) {
        if (m.score.winner === "HOME_TEAM") out.winner = m.homeTeam.name;
        else if (m.score.winner === "AWAY_TEAM") out.winner = m.awayTeam.name;
      }
      return out;
    })
    .filter((m) => m.hg != null && m.ag != null);

  writeOut(matches);
}

main().catch((e) => {
  console.error(e);
  process.exit(0);
});
