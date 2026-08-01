import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const catalogNumber = "66666";
const sourceUrl = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${catalogNumber}&FORMAT=JSON`;
const destination = resolve("public/data/formosat-8a.json");

const response = await fetch(sourceUrl, {
  headers: { "User-Agent": "orbitalradar-zh-tw/1.0 (scheduled GP refresh)" },
});

if (!response.ok) {
  throw new Error(`CelesTrak request failed: ${response.status} ${response.statusText}`);
}

const records = await response.json();
const record = records.find((item) => String(item.NORAD_CAT_ID) === catalogNumber) ?? records[0];
if (!record) throw new Error("CelesTrak returned no GP record for NORAD 66666.");

const meanMotion = Number(record.MEAN_MOTION);
const payload = {
  name: record.OBJECT_NAME ?? "FORMOSAT-8A",
  noradId: String(record.NORAD_CAT_ID ?? catalogNumber),
  epoch: record.EPOCH,
  inclinationDeg: Number(record.INCLINATION),
  eccentricity: Number(record.ECCENTRICITY),
  meanMotionRevPerDay: meanMotion,
  periodMinutes: Number((1440 / meanMotion).toFixed(2)),
  source: "CelesTrak GP Data",
  sourceUrl,
  refreshedAt: new Date().toISOString(),
};

await mkdir(dirname(destination), { recursive: true });
let previous;
try { previous = JSON.parse(await readFile(destination, "utf8")); } catch { /* First refresh. */ }

const { refreshedAt: _previousRefresh, ...previousOrbit } = previous ?? {};
const { refreshedAt: _nextRefresh, ...nextOrbit } = payload;
if (JSON.stringify(previousOrbit) !== JSON.stringify(nextOrbit)) {
  await writeFile(destination, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log("GP record changed; wrote updated data.");
} else {
  console.log("GP record is unchanged; no data file update needed.");
}
