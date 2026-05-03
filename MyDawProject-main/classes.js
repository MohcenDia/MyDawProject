/* ============================================================
   classes.js — Classes Page JavaScript  |  Part 3 Gym Management
   Features : Active nav · Scroll reveal · Filter (Trainer/Day/
              Difficulty) · Sort columns ▲▼ · Row count display
   Tech : Vanilla ES6+ — no external libraries
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   DATA — mirrors the HTML table rows.
   All filtering & sorting operates on this array;
   the DOM is re-rendered on every change.
   ══════════════════════════════════════════════════════════════ */
const CLASSES = [
  { name: 'Fitness Class',         trainer: 'Coach Sara',  day: 'Sunday',    time: '13:00', duration: 60,  difficulty: 'Beginner' },
  { name: 'Swimming Pool Class',   trainer: 'Coach John',  day: 'Monday',    time: '17:00', duration: 120, difficulty: 'Beginner' },
  { name: 'Fitness Class',         trainer: 'Coach Lyly',  day: 'Tuesday',   time: '12:00', duration: 60,  difficulty: 'Advanced' },
  { name: 'WaterPolo Class',       trainer: 'Coach Jack',  day: 'Wednesday', time: '19:00', duration: 150, difficulty: 'Beginner' },
  { name: 'Fitness Class',         trainer: 'Coach Jack',  day: 'Wednesday', time: '18:00', duration: 45,  difficulty: 'Beginner' },
  { name: 'Zumba Class',           trainer: 'Coach Lyly',  day: 'Thursday',  time: '14:00', duration: 60,  difficulty: 'Beginner' },
  { name: 'Fitness Class',         trainer: 'Coach John',  day: 'Friday',    time: '20:00', duration: 60,  difficulty: 'Advanced' },
  { name: 'WaterPolo Class',       trainer: 'Coach Lyly',  day: 'Friday',    time: '16:00', duration: 150, difficulty: 'Beginner' },
  { name: 'Swimming Pool Class',   trainer: 'Coach John',  day: 'Monday',    time: '19:00', duration: 120, difficulty: 'Advanced' },
];

/* Day order for sorting */
const DAY_ORDER = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/* ── State ───────────────────────────────────────────────── */
let state = {
  trainerFilter:    'All',
  dayFilter:        [], // multi-select
  difficultyFilter: 'All',
  sortKey:          null,   // 'name' | 'time' | 'duration'
  sortDir:          'asc',
};

/* ══════════════════════════════════════════════════════════════
   1. ACTIVE NAV LINK
   ══════════════════════════════════════════════════════════════ */
(function setActiveNav() {
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === 'classes.html') {
      link.classList.add('active');
    }
  });
})();

/* ══════════════════════════════════════════════════════════════
   2. SCROLL REVEAL
   ══════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const targets = document.querySelectorAll('main img, #filter-bar, #classes-table-wrap');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }});
  }, { threshold: 0.08 });
  targets.forEach(el => { el.classList.add('reveal'); io.observe(el); });
})();

/* ══════════════════════════════════════════════════════════════
   3. BUILD FILTER BAR (injected before the table)
   ══════════════════════════════════════════════════════════════ */
function buildFilterBar() {
  // Unique trainers from data
  const trainers = ['All', ...new Set(CLASSES.map(c => c.trainer))].sort();
  const days     = ['All', ...DAY_ORDER];
  const diffs    = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const bar = document.createElement('div');
  bar.id = 'filter-bar';
  bar.innerHTML = `
    <div class="filter-group">
      <label>Trainer</label>
      <select id="f-trainer">
        ${trainers.map(t => `<option>${t}</option>`).join('')}
      </select>
    </div>

    <div class="filter-group">
      <label>Day of Week</label>
      <div class="btn-group" id="f-day">
        ${days.map(d => `<button class="fbtn${d === 'All' ? ' active' : ''}" data-day="${d}">${d}</button>`).join('')}
      </div>
    </div>

    <div class="filter-group">
      <label>Difficulty</label>
      <div class="btn-group" id="f-diff">
        ${diffs.map(d => `<button class="fbtn${d === 'All' ? ' active' : ''}" data-diff="${d}">${d}</button>`).join('')}
      </div>
    </div>

    <div class="filter-group">
      <button id="f-reset" class="reset-btn">Reset Filters</button>
      <span id="row-count"></span>
    </div>
  `;

  // Insert before the table wrapper
  const wrap = document.getElementById('classes-table-wrap');
  wrap.parentNode.insertBefore(bar, wrap);

  /* Events */
  document.getElementById('f-trainer').addEventListener('change', e => {
    state.trainerFilter = e.target.value;
    render();
  });

  document.getElementById('f-day').addEventListener('click', e => {
    const btn = e.target.closest('.fbtn');
    if (!btn) return;
    const day = btn.dataset.day;

    if (day === 'All') {
      state.dayFilter = [];
    } else {
      const idx = state.dayFilter.indexOf(day);
      if (idx === -1) state.dayFilter.push(day);
      else            state.dayFilter.splice(idx, 1);
    }
    // Update button highlight
    document.querySelectorAll('#f-day .fbtn').forEach(b => {
      const d = b.dataset.day;
      if (d === 'All') b.classList.toggle('active', state.dayFilter.length === 0);
      else             b.classList.toggle('active', state.dayFilter.includes(d));
    });
    render();
  });

  document.getElementById('f-diff').addEventListener('click', e => {
    const btn = e.target.closest('.fbtn');
    if (!btn) return;
    state.difficultyFilter = btn.dataset.diff;
    document.querySelectorAll('#f-diff .fbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });

  document.getElementById('f-reset').addEventListener('click', () => {
    state.trainerFilter    = 'All';
    state.dayFilter        = [];
    state.difficultyFilter = 'All';
    state.sortKey          = null;
    state.sortDir          = 'asc';

    document.getElementById('f-trainer').value = 'All';
    document.querySelectorAll('#f-day .fbtn').forEach(b  => b.classList.toggle('active', b.dataset.day  === 'All'));
    document.querySelectorAll('#f-diff .fbtn').forEach(b => b.classList.toggle('active', b.dataset.diff === 'All'));
    document.querySelectorAll('thead th[data-sort]').forEach(th => th.dataset.dir = '');
    render();
  });
}

/* ══════════════════════════════════════════════════════════════
   4. BUILD SORTABLE TABLE
   ══════════════════════════════════════════════════════════════ */
function buildTable() {
  // Replace static HTML table with a fully JS-controlled one
  const main = document.querySelector('main');

  // Remove original table if present
  const oldTable = main.querySelector('table');
  if (oldTable) oldTable.remove();

  // Create wrapper
  const wrap = document.createElement('div');
  wrap.id = 'classes-table-wrap';

  wrap.innerHTML = `
    <table id="classes-table">
      <caption>Weekly Classes</caption>
      <thead>
        <tr>
          <th data-sort="name" data-dir="">Class Name <span class="sort-icon"></span></th>
          <th>Trainer</th>
          <th>Day</th>
          <th data-sort="time" data-dir="">Time <span class="sort-icon"></span></th>
          <th data-sort="duration" data-dir="">Duration <span class="sort-icon"></span></th>
          <th>Difficulty</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody id="classes-tbody"></tbody>
    </table>
  `;

  // Insert: first image → wrap → second image
  const imgs = main.querySelectorAll('img');
  if (imgs[1]) main.insertBefore(wrap, imgs[1]);
  else         main.appendChild(wrap);

  // Sort events on column headers
  document.querySelectorAll('thead th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = key;
        state.sortDir = 'asc';
      }
      // Clear all indicators
      document.querySelectorAll('thead th[data-sort]').forEach(t => {
        t.dataset.dir = '';
        t.querySelector('.sort-icon').textContent = '';
      });
      th.dataset.dir = state.sortDir;
      th.querySelector('.sort-icon').textContent = state.sortDir === 'asc' ? ' ▲' : ' ▼';
      render();
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   5. FILTER + SORT + RENDER
   ══════════════════════════════════════════════════════════════ */
function formatDuration(mins) {
  if (mins < 60)  return `${mins} min`;
  if (mins === 60) return '1 hour';
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}min` : `${h} hours`;
}

function diffColor(diff) {
  return { Beginner: '#4ade80', Intermediate: '#facc15', Advanced: '#ff1e33' }[diff] ?? '#fff';
}

function render() {
  /* ── Filter ── */
  let rows = CLASSES.filter(c => {
    if (state.trainerFilter !== 'All' && c.trainer !== state.trainerFilter) return false;
    if (state.dayFilter.length > 0   && !state.dayFilter.includes(c.day))  return false;
    if (state.difficultyFilter !== 'All' && c.difficulty !== state.difficultyFilter) return false;
    return true;
  });

  /* ── Sort ── */
  if (state.sortKey) {
    rows = [...rows].sort((a, b) => {
      let va = a[state.sortKey], vb = b[state.sortKey];
      // numeric sort for duration
      if (state.sortKey === 'duration') { va = Number(va); vb = Number(vb); }
      // time sort: "13:00" → comparable string
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return state.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  /* ── Render rows ── */
  const tbody = document.getElementById('classes-tbody');
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--wd);font-style:italic;">
      No classes match your filters.
    </td></tr>`;
  } else {
    tbody.innerHTML = rows.map(c => `
      <tr>
        <td class="td-name">${c.name}</td>
        <td>${c.trainer}</td>
        <td>${c.day}</td>
        <td>${c.time}</td>
        <td>${formatDuration(c.duration)}</td>
        <td><span class="diff-badge" style="color:${diffColor(c.difficulty)}">${c.difficulty}</span></td>
        <td><a href="#" class="detail-link">More Details</a></td>
      </tr>
    `).join('');
  }

  /* ── Row count ── */
  const count = document.getElementById('row-count');
  if (count) count.textContent = `${rows.length} class${rows.length !== 1 ? 'es' : ''} found`;
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildTable();
  buildFilterBar();
  render();
});
