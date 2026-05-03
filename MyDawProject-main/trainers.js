/* ============================================================
   trainers.js — Trainers Page JavaScript  |  Part 3
   Features : Active nav · Scroll reveal · Live search ·
              Detail Modal (Escape + outside click to close)
   Tech : Vanilla ES6+ — no external libraries
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   DATA — mirrors the HTML cards.
   Each trainer has a classes array (links to classes.html data).
   ══════════════════════════════════════════════════════════════ */
const TRAINERS = [
  {
    id:         'jack',
    name:       'Coach Jack',
    photo:      'imageCOURS/Coach Jack.jpeg',
    specialty:  'Powerlifting',
    experience: '11 years',
    bio:        '8 years of experience in competitive lifting. Coach Jack has competed at regional and national level powerlifting events, and now dedicates his expertise to helping members build raw, functional strength.',
    classes:    ['WaterPolo Class – Wednesday 19:00', 'Fitness Class – Wednesday 18:00'],
  },
  {
    id:         'john',
    name:       'Coach John',
    photo:      'imageCOURS/Coach jhon.jpeg',
    specialty:  'Powerlifting & Weightlifting',
    experience: '10 years',
    bio:        'John is a competitive lifter who specialises in building raw strength and improving compound movements. His sessions blend technique refinement with progressive overload principles.',
    classes:    ['Swimming Pool Class – Monday 17:00', 'Fitness Class – Friday 20:00', 'Swimming Pool Class – Monday 19:00'],
  },
  {
    id:         'lyly',
    name:       'Coach Lyly',
    photo:      'imageCOURS/Coach Lyly.jpeg',
    specialty:  'HIIT & Cardio',
    experience: '5 years',
    bio:        'Lyly is known for her high-energy classes that push cardiovascular endurance to the next level. Her HIIT and Zumba sessions are among the most attended in the gym.',
    classes:    ['Fitness Class – Tuesday 12:00', 'Zumba Class – Thursday 14:00', 'WaterPolo Class – Friday 16:00'],
  },
  {
    id:         'sara',
    name:       'Coach Sara',
    photo:      'imageCOURS/Coach Sara.jpeg',
    specialty:  'Vinyasa Flow & Flexibility',
    experience: '8 years',
    bio:        'Sara focuses on the mind-body connection, helping members improve range of motion and mental clarity. Her yoga and mobility work is the perfect complement to strength training.',
    classes:    ['Fitness Class – Sunday 13:00'],
  },
];

/* ══════════════════════════════════════════════════════════════
   1. ACTIVE NAV LINK
   ══════════════════════════════════════════════════════════════ */
(function setActiveNav() {
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href').toLowerCase();
    if (href === 'trainers.html') link.classList.add('active');
  });
})();

/* ══════════════════════════════════════════════════════════════
   2. SCROLL REVEAL
   ══════════════════════════════════════════════════════════════ */
(function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('main > section').forEach((sec, i) => {
    sec.classList.add('reveal');
    sec.style.transitionDelay = `${i * 0.08}s`;
    io.observe(sec);
  });
})();

/* ══════════════════════════════════════════════════════════════
   3. LIVE SEARCH BAR
   Spec: filters trainer cards by name or specialty.
         Case-insensitive.
         Shows "No trainers found" if empty results.
   ══════════════════════════════════════════════════════════════ */
function buildSearchBar() {
  const main = document.querySelector('main');

  const wrapper = document.createElement('div');
  wrapper.id = 'search-wrap';
  wrapper.innerHTML = `
    <div id="search-box">
      <span id="search-icon">&#9906;</span>
      <input
        type="text"
        id="trainer-search"
        placeholder="Search by name or specialty…"
        autocomplete="off"
        aria-label="Search trainers"
      >
      <button id="search-clear" aria-label="Clear search" title="Clear">✕</button>
    </div>
    <p id="search-count"></p>
  `;

  // Insert before the first section
  const firstSection = main.querySelector('section');
  main.insertBefore(wrapper, firstSection);

  const input     = document.getElementById('trainer-search');
  const clearBtn  = document.getElementById('search-clear');
  const countEl   = document.getElementById('search-count');

  // No-result placeholder (created once, toggled)
  let noResult = document.getElementById('no-trainers');
  if (!noResult) {
    noResult = document.createElement('p');
    noResult.id = 'no-trainers';
    noResult.textContent = 'No trainers found.';
    noResult.style.display = 'none';
    main.appendChild(noResult);
  }

  function doSearch() {
    const q = input.value.trim().toLowerCase();
    clearBtn.style.display = q ? 'flex' : 'none';

    let visible = 0;
    document.querySelectorAll('main > section').forEach((sec, i) => {
      const t = TRAINERS[i];
      if (!t) return;
      const match = !q ||
        t.name.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q);
      sec.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    noResult.style.display  = visible === 0 ? 'block' : 'none';
    countEl.textContent     = q
      ? `${visible} trainer${visible !== 1 ? 's' : ''} found`
      : '';
  }

  input.addEventListener('input', doSearch);
  clearBtn.addEventListener('click', () => { input.value = ''; doSearch(); input.focus(); });
}

/* ══════════════════════════════════════════════════════════════
   4. DETAIL MODAL
   Spec: clicking a trainer card opens a modal with full details:
         photo, name, specialty, bio, class schedule.
         Closes on ✕ button, Escape key, or outside click.
         Data sourced from JS array (TRAINERS).
   ══════════════════════════════════════════════════════════════ */
function buildModal() {
  const modal = document.createElement('div');
  modal.id = 'trainer-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-name');
  modal.innerHTML = `
    <div id="modal-box">
      <button id="modal-close" aria-label="Close modal">✕</button>
      <div id="modal-content"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close handlers
  document.getElementById('modal-close').addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

function openModal(trainer) {
  const modal   = document.getElementById('trainer-modal');
  const content = document.getElementById('modal-content');

  content.innerHTML = `
    <div id="modal-photo-col">
      <img src="${trainer.photo}" alt="${trainer.name}" width="200" height="200">
      <span id="modal-specialty">${trainer.specialty}</span>
    </div>
    <div id="modal-info-col">
      <h3 id="modal-name">${trainer.name}</h3>
      <p><strong>Experience :</strong> ${trainer.experience}</p>
      <p id="modal-bio">${trainer.bio}</p>
      <div id="modal-schedule">
        <p class="schedule-label">Class Schedule</p>
        <ul>
          ${trainer.classes.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.classList.add('modal-open'); // prevent scroll
  document.getElementById('modal-close').focus();
}

function closeModal() {
  document.getElementById('trainer-modal').classList.remove('open');
  document.body.classList.remove('modal-open');
}

/* Wire cards — clicking anywhere on the card (except "View full profile") opens modal */
function wireCards() {
  document.querySelectorAll('main > section').forEach((sec, i) => {
    const card = sec.querySelector('artical');
    if (!card || !TRAINERS[i]) return;

    card.style.cursor = 'pointer';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${TRAINERS[i].name} profile`);

    const openFor = () => openModal(TRAINERS[i]);

    card.addEventListener('click', e => {
      // Let "View full profile" link fall through naturally if it has a real href
      if (e.target.tagName === 'A') return;
      openFor();
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFor(); }
    });

    // Override "View full profile" to also open modal
    const link = card.querySelector('a');
    if (link) {
      link.addEventListener('click', e => { e.preventDefault(); openFor(); });
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildSearchBar();
  buildModal();
  wireCards();
});
