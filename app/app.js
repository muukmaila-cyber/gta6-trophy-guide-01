// GTA VI trophy guide & tracker: checklist saved in localStorage, export/import,
// filters by kind (story, mission, stranger, missable, collectible, activity,
// combat, exploration, money, online) and grade, spoiler setting that hides
// story trophies until earned, and a roadmap to the platinum built from the
// official trophy descriptions. Fully offline: the only fetch is the app's
// own data/trophies.json. Shareable view state via URL (?kind=, ?grade=,
// ?spoiler=, ?earned=1,2,3, ?open=17) — earned= only seeds an empty checklist.
const KEY = 'gta6-trophy-guide-v1';
const SPOILER_KEY = 'gta6-trophy-spoiler-v1';
const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]').filter((id) => trophies.some((t) => t.id === id)));
if (earned.size === 0 && params.get('earned')) {
  for (const n of params.get('earned').split(',')) {
    const id = Number(n);
    if (trophies.some((t) => t.id === id)) earned.add(id);
  }
  save();
}
let spoiler = params.get('spoiler') ? params.get('spoiler') === 'on'
  : (localStorage.getItem(SPOILER_KEY) ?? 'off') === 'on';
let kind = params.get('kind') ?? 'all';
let grade = params.get('grade') ?? 'all';
let status = 'all';
let query = params.get('q') ?? '';
if (query) document.getElementById('search').value = query;
if (params.get('view') === 'roadmap') document.body.classList.add('view-roadmap');
let open = new Set(params.get('open') ? [Number(params.get('open'))] : []);
let openAll = false;

const rowsEl = document.getElementById('rows');
const emptyEl = document.getElementById('empty');
const noteEl = document.getElementById('filterNote');
const spoilerBox = document.getElementById('spoiler');
spoilerBox.checked = spoiler;
document.getElementById('grade').value = grade;

function save() { localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b))); }
function isStory(t) { return t.kind === 'story' || t.kind === 'mission' || t.kind === 'stranger'; }
function isHidden(t) { return spoiler && isStory(t) && !earned.has(t.id); }

function counts() {
  const byGrade = {};
  for (const t of trophies) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + (earned.has(t.id) ? 1 : 0);
  return byGrade;
}

function renderProgress() {
  document.getElementById('progressText').textContent = `${earned.size} of ${trophies.length} earned — ${Math.round((earned.size / trophies.length) * 100)}%`;
  document.getElementById('barFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  const c = counts();
  document.getElementById('gradeCounts').textContent =
    `Platinum ${c.platinum ?? 0}/1 · Gold ${c.gold ?? 0}/2 · Silver ${c.silver ?? 0}/6 · Bronze ${c.bronze ?? 0}/46 · Missable earned ${trophies.filter((t) => t.missable && earned.has(t.id)).length}/21`;
}

function renderRoadmap() {
  const stages = [
    [1, 'Story first — Chapters 1–4 and the finale', 'Play the story in order. Every chapter trophy and named-mission trophy lands here; clear the missable ones on your first pass, before the final mission.'],
    [2, 'Strangers — 8 strands across Leonida', 'Talk to every stranger you meet and follow each strand to its finale (Andy, Kenton, Billy, Randy, Tyrone, Bret and more). Strands can move on as the story advances.'],
    [3, 'Activities & skills', 'Shooting Range golds (42), drone races (14), races (20), fishing, arcade, bowling, meditation (18), challenges (50) — one attempt at each activity type also lands Master of None.'],
    [4, 'Leonida cleanup', 'Explore all 52 areas, discover 100 vehicles, WAiNK 100 spots, finish 3 card sets, rob vaults, trucks and gang operations, and catch the one-off moments.'],
    [5, 'Money, 100% and the platinum', 'Launder $250,000, spend $100,000, buy all 8 garages, register 10 vehicles — then 100% completion (A Long Road) unlocks the platinum, Vice Got a Price!'],
  ];
  const host = document.getElementById('roadmapStages');
  host.replaceChildren();
  for (const [n, title, blurb] of stages) {
    const div = document.createElement('div');
    div.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = `Stage ${n} — ${title}`;
    const p = document.createElement('p');
    p.textContent = blurb;
    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const t of trophies.filter((x) => x.stage === n)) {
      const s = document.createElement('span');
      s.className = 'chip' + (earned.has(t.id) ? ' done' : '') + (t.missable ? ' miss' : '');
      s.textContent = (earned.has(t.id) ? '✓ ' : '') + t.name + (t.missable ? ' ⚠' : '');
      chips.append(s);
    }
    div.append(h, p, chips);
    host.append(div);
  }
}

function row(t) {
  const li = document.createElement('li');
  li.id = `trophy-${t.id}`;
  if (earned.has(t.id)) li.className = 'earned';
  const hidden = isHidden(t);
  const head = document.createElement('div');
  head.className = 'head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    save(); render();
  });
  const body = document.createElement('div');
  const h = document.createElement('h3');
  h.textContent = hidden ? 'Hidden story trophy — earn it to reveal' : t.name;
  if (hidden) h.className = 'hiddenName';
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'Spoiler protection is on: the name and description stay hidden until this trophy is earned.' : t.description;
  const badges = document.createElement('div');
  badges.className = 'badges';
  const g = document.createElement('span');
  g.className = `badge grade-${t.grade}`;
  g.textContent = t.grade;
  badges.append(g);
  const k = document.createElement('span');
  k.className = 'badge kind';
  k.textContent = t.kind === 'platinum' ? 'trophy set' : t.kind;
  badges.append(k);
  if (t.count) {
    const c = document.createElement('span');
    c.className = 'badge count';
    c.textContent = `count: ${t.count.toLocaleString('en-US')}`;
    badges.append(c);
  }
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'badge miss';
    m.textContent = '⚠ Missable';
    badges.append(m);
  }
  body.append(h, desc, badges);
  if (!hidden) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'guideBtn';
    const isOpen = openAll || open.has(t.id);
    btn.textContent = isOpen ? 'Hide guide ▲' : 'Show guide ▼';
    btn.addEventListener('click', () => {
      if (open.has(t.id)) open.delete(t.id); else open.add(t.id);
      render();
    });
    body.append(btn);
    if (isOpen) {
      const gEl = document.createElement('div');
      gEl.className = 'guide';
      const p = document.createElement('p');
      p.textContent = t.guide;
      gEl.append(p);
      if (t.missable && t.missable_note) {
        const mn = document.createElement('p');
        mn.className = 'missnote';
        mn.textContent = `Missable — ${t.missable_note}`;
        gEl.append(mn);
      }
      const src = document.createElement('p');
      src.className = 'src';
      src.textContent = `Source: ${t.source}`;
      gEl.append(src);
      body.append(gEl);
    }
  }
  head.append(box, body);
  li.append(head);
  return li;
}

function render() {
  renderProgress();
  renderRoadmap();
  const q = query.trim().toLowerCase();
  let list = trophies.filter((t) => {
    if (kind === 'missable' && !t.missable) return false;
    if (kind === 'online') return false;
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (status === 'earned' && !earned.has(t.id)) return false;
    if (status === 'remaining' && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
  rowsEl.replaceChildren(...list.map(row));
  if (kind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No online trophies: 0 of the 55 official trophies need online play — everything in this guide is single-player.';
    noteEl.textContent = 'Filter: online — the official list has no online trophies.';
  } else if (list.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No trophies match these filters. Clear the search or pick another kind.';
    noteEl.textContent = '';
  } else {
    emptyEl.hidden = true;
    noteEl.textContent = `Showing ${list.length} of ${trophies.length} trophies` +
      (kind !== 'all' ? ` · kind: ${kind}` : '') +
      (spoiler ? ' · spoiler protection ON (story trophies hidden until earned)' : ' · spoiler protection off');
  }
  document.querySelectorAll('#kinds button').forEach((b) => b.classList.toggle('on', b.dataset.kind === kind));
  document.getElementById('expandAll').textContent = openAll ? 'Close all guides' : 'Open all guides';
}

document.getElementById('search').addEventListener('input', (e) => { query = e.target.value; render(); });
document.getElementById('grade').addEventListener('change', (e) => { grade = e.target.value; render(); });
document.getElementById('status').addEventListener('change', (e) => { status = e.target.value; render(); });
document.getElementById('kinds').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-kind]');
  if (b) { kind = b.dataset.kind; render(); }
});
spoilerBox.addEventListener('change', () => {
  spoiler = spoilerBox.checked;
  localStorage.setItem(SPOILER_KEY, spoiler ? 'on' : 'off');
  render();
});
document.getElementById('expandAll').addEventListener('click', () => { openAll = !openAll; open.clear(); render(); });
document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const next = new Set(ids.filter((id) => trophies.some((t) => t.id === id)));
    earned = next; save(); render();
  } catch { alert('That file is not valid trophy progress JSON.'); }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned ticks?')) { earned = new Set(); save(); render(); }
});
render();
// Deep-link: the list and roadmap are rendered by script, so scroll to the
// fragment target only after the first render (plain anchor scrolling fires
// before the content exists).
if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
