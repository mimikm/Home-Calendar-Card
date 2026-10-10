#!/usr/bin/env node
/*
 * Repository checks for Home Calendar Card (no dependencies – plain Node 18+).
 *
 *   node scripts/check-card.mjs            # normal checks
 *   node scripts/check-card.mjs --tag v1.6.4   # also check the version matches a release tag
 *
 * On GitHub Actions the tag is picked up automatically from a release/tag build.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const ok = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const pass = (m) => ok.push(m);

// ---------------------------------------------------------------- hacs.json
let hacs = null;
const hacsPath = join(ROOT, "hacs.json");
if (!existsSync(hacsPath)) err("hacs.json is missing from the repository root");
else {
  try {
    hacs = JSON.parse(readFileSync(hacsPath, "utf8"));
    pass("hacs.json is valid JSON");
  } catch (e) { err(`hacs.json is not valid JSON: ${e.message}`); }
}
if (hacs) {
  if (!hacs.name) err('hacs.json: "name" is missing');
  else pass(`hacs.json name: "${hacs.name}"`);
  const allowed = ["name", "filename", "content_in_root", "render_readme", "homeassistant", "hacs", "hide_default_branch", "country", "zip_release", "persistent_directory"];
  Object.keys(hacs).filter((k) => !allowed.includes(k)).forEach((k) => warn(`hacs.json: unknown key "${k}"`));
  if (hacs.homeassistant && !/^\d{4}\.\d{1,2}(\.\d+)?$/.test(hacs.homeassistant)) err(`hacs.json: "homeassistant" should look like 2024.1.0, got "${hacs.homeassistant}"`);
}

// ---------------------------------------------------------------- card file
const repoName = (process.env.GITHUB_REPOSITORY || "").split("/")[1] || "";
const fileName = hacs?.filename || `${repoName.toLowerCase().replace(/^lovelace-/, "")}.js`;
const candidates = [join(ROOT, "dist", fileName), join(ROOT, fileName)];
const cardPath = candidates.find((p) => existsSync(p));
let src = "";
if (!cardPath) {
  err(`card file "${fileName}" not found in dist/ or the repository root (HACS looks there)`);
} else {
  pass(`card file found: ${cardPath.replace(ROOT + "/", "")} (${Math.round(statSync(cardPath).size / 1024)} KB)`);
  src = readFileSync(cardPath, "utf8");

  // syntax
  try {
    execFileSync(process.execPath, ["--check", cardPath], { stdio: "pipe" });
    pass("JavaScript syntax OK");
  } catch (e) {
    err(`JavaScript syntax error:\n${String(e.stderr || e.message).trim()}`);
  }

  // custom elements
  ["home-calendar-card", "home-calendar-card-editor"].forEach((el) => {
    if (new RegExp(`customElements\\.define\\(\\s*["']${el}["']`).test(src)) pass(`defines <${el}>`);
    else err(`custom element <${el}> is not defined in the card file`);
  });
  if (/window\.customCards/.test(src)) pass("registers in the card picker (window.customCards)");
  else warn("card is not registered in window.customCards (won't show in the card picker)");

  // debug leftovers
  const dbg = (src.match(/^\s*(debugger;|console\.log\()/gm) || []).length;
  if (dbg) warn(`${dbg} debugger/console.log statement(s) left in the card`);
}

// ---------------------------------------------------------------- version
const m = src.match(/const CARD_VERSION\s*=\s*["']([^"']+)["']/);
const version = m?.[1];
if (src && !version) err("CARD_VERSION not found in the card file");
else if (version) {
  if (/^\d+\.\d+\.\d+(\.\d+)?([-.][0-9A-Za-z.]+)?$/.test(version)) pass(`card version: ${version}`);
  else err(`CARD_VERSION "${version}" is not a valid version number`);
}

const argTag = (() => { const i = process.argv.indexOf("--tag"); return i > 0 ? process.argv[i + 1] : null; })();
const envTag = process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : null;
const tag = argTag || envTag || process.env.RELEASE_TAG || null;
if (tag && version) {
  const clean = tag.replace(/^v/i, "");
  if (clean === version) pass(`version matches release tag ${tag}`);
  else err(`release tag "${tag}" does not match CARD_VERSION "${version}" – update CARD_VERSION before releasing`);
}

// ---------------------------------------------------------------- README
const readmePath = join(ROOT, "README.md");
if (!existsSync(readmePath)) err("README.md is missing");
else {
  const readme = readFileSync(readmePath, "utf8");
  pass("README.md present");
  // images referenced from this repo must exist
  const refs = new Set();
  const re = /(?:\]\(|src=")([^)"\s]+\.(?:png|jpe?g|gif|webp|svg))/gi;
  let r;
  while ((r = re.exec(readme))) refs.add(r[1]);
  let missing = 0;
  refs.forEach((u) => {
    let local = null;
    const gh = u.match(/github\.com\/[^/]+\/[^/]+\/(?:raw|blob)\/[^/]+\/(.+)$/) || u.match(/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/(.+)$/);
    if (gh) local = gh[1];
    else if (!/^https?:/i.test(u)) local = u.replace(/^\.?\//, "");
    if (local && !existsSync(join(ROOT, decodeURIComponent(local)))) { err(`README image not found in repo: ${local}`); missing++; }
  });
  if (refs.size && !missing) pass(`README images OK (${refs.size})`);
  if (repoName && !readme.includes(repoName)) warn(`README never mentions the repository name "${repoName}" (install links may be wrong)`);
}

// ---------------------------------------------------------------- report
const line = "─".repeat(60);
console.log(line);
ok.forEach((m) => console.log(`✅ ${m}`));
warnings.forEach((m) => console.log(`⚠️  ${m}`));
errors.forEach((m) => console.log(`❌ ${m}`));
console.log(line);
console.log(errors.length ? `FAILED – ${errors.length} problem(s), ${warnings.length} warning(s)` : `PASSED – ${warnings.length} warning(s)`);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import("node:fs");
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
    `### Home Calendar Card checks – ${errors.length ? "❌ failed" : "✅ passed"}`, "",
    ...ok.map((m) => `- ✅ ${m}`), ...warnings.map((m) => `- ⚠️ ${m}`), ...errors.map((m) => `- ❌ ${m.replace(/\n/g, " ")}`), "",
  ].join("\n"));
}
process.exit(errors.length ? 1 : 0);
