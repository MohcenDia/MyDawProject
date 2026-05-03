/* ============================================================
   index.js — Home Page JavaScript  |  Part 3 Gym Management
   Features : Sticky nav active link · Scroll animations ·
              Membership cart (sessionStorage) · Toast notices
   Tech : Vanilla ES6+ — no external libraries
   ============================================================ */

'use strict';

/* ── 1. ACTIVE NAV LINK ─────────────────────────────────────
   Marks the current page link so the user always knows
   where they are. Works by comparing the nav href to
   window.location.pathname. */
(function setActiveNav() {
  const links = document.querySelectorAll('nav a');
  links.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (
      window.location.pathname.endsWith(linkPath) ||
      (window.location.pathname.endsWith('/') && linkPath === 'index.html')
    ) {
      link.classList.add('active');
    }
  });
})();


/* ── 2. SCROLL-TRIGGERED FADE-IN ANIMATIONS ────────────────
   Observes sections & articles. Adds .visible when they
   enter the viewport — CSS handles the actual animation.
   Uses IntersectionObserver (no scroll event spam). */
(function initScrollReveal() {
  const targets = document.querySelectorAll('main section, article');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once only
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(el => {
    el.classList.add('reveal'); // initial hidden state (CSS)
    observer.observe(el);
  });
})();


/* ── 3. MEMBERSHIP CART  (sessionStorage) ──────────────────
   Spec: only one plan selected at a time.
         Selecting a new plan replaces the current one.
         Shows a sticky mini-cart bar with plan name + price.
         "Proceed to Register" opens Membership.html pre-filled.
         Clears on manual dismiss or form submission.

   Prices are defined here; Membership.html reads the same key. */

const PLANS = {
  Bronze: { price: '29€/month', color: '#cd7f32' },
  Silver: { price: '49€/month', color: '#a8a9ad' },
  Gold:   { price: '79€/month', color: '#c9a227' },
};

/* Build the sticky mini-cart bar once */
function buildMiniCart() {
  if (document.getElementById('mini-cart')) return; // already exists

  const bar = document.createElement('div');
  bar.id = 'mini-cart';
  bar.innerHTML = `
    <span id="mc-label">No plan selected</span>
    <div class="mc-actions">
      <a id="mc-proceed" href="Membership.html" class="btn" style="padding:10px 22px;font-size:13px;">
        Proceed to Register
      </a>
      <button id="mc-clear" aria-label="Clear selection">✕</button>
    </div>
  `;
  document.body.appendChild(bar);

  // Clear button
  document.getElementById('mc-clear').addEventListener('click', () => {
    sessionStorage.removeItem('selectedPlan');
    updateMiniCart();
    showToast('Plan selection cleared.');
  });
}

/* Sync mini-cart UI with sessionStorage */
function updateMiniCart() {
  const stored = sessionStorage.getItem('selectedPlan');
  const bar    = document.getElementById('mini-cart');
  const label  = document.getElementById('mc-label');
  if (!bar) return;

  if (stored) {
    const plan = JSON.parse(stored);
    bar.classList.add('visible');
    label.innerHTML =
      `Selected plan: <strong style="color:${PLANS[plan.name]?.color ?? '#fff'}">${plan.name}</strong>
       — <em>${plan.price}</em>`;
  } else {
    bar.classList.remove('visible');
    label.textContent = 'No plan selected';
  }
}

/* Wire "Join Now" buttons on the membership cards */
function initMembershipButtons() {
  const articles = document.querySelectorAll('main article');
  articles.forEach((card, idx) => {
    const planNames = Object.keys(PLANS);
    const planName  = planNames[idx];
    if (!planName) return;

    const btn = card.querySelector('.btn');
    if (!btn) return;

    // Restore visual selection on page load
    const stored = sessionStorage.getItem('selectedPlan');
    if (stored && JSON.parse(stored).name === planName) {
      card.classList.add('selected');
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();

      // Save to sessionStorage
      sessionStorage.setItem('selectedPlan', JSON.stringify({
        name:  planName,
        price: PLANS[planName].price,
      }));

      // Update card highlight
      document.querySelectorAll('main article').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      updateMiniCart();
      showToast(`✔ ${planName} plan selected!`);
    });
  });
}


/* ── 4. TOAST NOTIFICATION ──────────────────────────────────
   Spec: auto-dismisses after 4 seconds.
   One singleton toast — calling again resets the timer. */
let _toastTimer = null;

function showToast(msg) {
  let toast = document.getElementById('gym-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gym-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}


/* ── 5. SMOOTH HERO BUTTON ──────────────────────────────────
   "Start Your Journey" scrolls to the membership section. */
(function initHeroBtn() {
  const heroBtn = document.querySelector('.hero .btn');
  if (!heroBtn) return;
  heroBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const membership = document.querySelector('main section:nth-of-type(3)');
    if (membership) membership.scrollIntoView({ behavior: 'smooth' });
  });
})();


/* ── 6. INIT ────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  buildMiniCart();
  initMembershipButtons();
  updateMiniCart();
});
