/* ============================================================
   membership.js — Membership Page JavaScript  |  Part 3
   Features : Active nav · Scroll reveal · sessionStorage pre-fill
              · Real-time form validation (blur + submit)
              · Green/red border feedback · Toast on success
              · Cart plan selection from index.html
   Tech : Vanilla ES6+ — no external libraries
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   1. ACTIVE NAV LINK
   ══════════════════════════════════════════════════════════════ */
(function setActiveNav() {
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('href') === 'Membership.html') {
      link.classList.add('active');
    }
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
  }, { threshold: 0.08 });

  document.querySelectorAll('main > section').forEach((sec, i) => {
    sec.classList.add('reveal');
    sec.style.transitionDelay = `${i * 0.07}s`;
    io.observe(sec);
  });
})();

/* ══════════════════════════════════════════════════════════════
   3. PRE-FILL PLAN FROM sessionStorage
   Spec: "Proceed to Register" on index.html saves plan to
         sessionStorage → membership page reads it and pre-selects
         the correct radio button.
   ══════════════════════════════════════════════════════════════ */
(function prefillPlanFromCart() {
  const stored = sessionStorage.getItem('selectedPlan');
  if (!stored) return;

  try {
    const { name } = JSON.parse(stored);
    // Radio buttons have id: Plan-Bronze / Plan-Silver / Plan-Gold
    const radio = document.getElementById(`Plan-${name}`);
    if (radio) {
      radio.checked = true;
      // Scroll form into view smoothly
      const form = document.querySelector('form');
      if (form) setTimeout(() => form.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
      showToast(`✔ ${name} plan pre-selected from your cart!`);
    }
  } catch (_) { /* ignore parse errors */ }
})();

/* ══════════════════════════════════════════════════════════════
   4. PLAN CARD HIGHLIGHT on radio selection
   Clicking a plan card also checks the matching radio.
   ══════════════════════════════════════════════════════════════ */
(function initPlanCards() {
  // Plan sections are nth-child 2,3,4 in main
  const planSections = [
    document.querySelector('main > section:nth-child(2)'),
    document.querySelector('main > section:nth-child(3)'),
    document.querySelector('main > section:nth-child(4)'),
  ];
  const planNames = ['Bronze', 'Silver', 'Gold'];

  function highlightSelected() {
    planSections.forEach((sec, i) => {
      if (!sec) return;
      const radio = document.getElementById(`Plan-${planNames[i]}`);
      sec.classList.toggle('plan-selected', radio ? radio.checked : false);
    });
  }

  planSections.forEach((sec, i) => {
    if (!sec) return;
    sec.style.cursor = 'pointer';
    sec.addEventListener('click', () => {
      const radio = document.getElementById(`Plan-${planNames[i]}`);
      if (radio) { radio.checked = true; highlightSelected(); }
    });
  });

  // Also listen for radio changes (keyboard navigation)
  planNames.forEach(name => {
    const r = document.getElementById(`Plan-${name}`);
    if (r) r.addEventListener('change', highlightSelected);
  });

  highlightSelected(); // apply on load (in case sessionStorage pre-filled)
})();

/* ══════════════════════════════════════════════════════════════
   5. REAL-TIME FORM VALIDATION
   Spec:
   - Full Name : required, min 3 chars, letters only
   - Email     : required, valid email regex
   - Phone     : required, numeric, 8–15 digits
   - Date of Birth : required, member must be ≥ 16 years old
   - Plan selection : at least one must be chosen
   - Terms checkbox : must be accepted before submission
   - Show inline error messages next to each invalid field on blur
   - Highlight invalid → red border, valid → green border
   - Prevent submission if any field is invalid
   - Show success modal on valid submission
   ══════════════════════════════════════════════════════════════ */

/* ── Validation rules ────────────────────────────────────── */
const RULES = {
  fname: {
    validate(v) {
      if (!v) return 'Full name is required.';
      if (v.length < 3) return 'Name must be at least 3 characters.';
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(v)) return 'Name must contain letters only.';
      return null;
    },
  },
  email: {
    validate(v) {
      if (!v) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address.';
      return null;
    },
  },
  phone: {
    validate(v) {
      const digits = v.replace(/\D/g, '');
      if (!v) return 'Phone number is required.';
      if (!/^\d[\d\s\-().+]{6,}$/.test(v)) return 'Please enter a valid phone number.';
      if (digits.length < 8 || digits.length > 15) return 'Phone must be 8–15 digits.';
      return null;
    },
  },
  dob: {
    validate(v) {
      if (!v) return 'Date of birth is required.';
      const birth = new Date(v);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (age < 16) return 'You must be at least 16 years old to register.';
      return null;
    },
  },
};

/* ── Helpers ─────────────────────────────────────────────── */
function getError(fieldId) {
  return document.getElementById(`err-${fieldId}`);
}

function setFieldState(input, errorEl, errorMsg) {
  if (errorMsg) {
    input.classList.add('input-invalid');
    input.classList.remove('input-valid');
    errorEl.textContent = errorMsg;
    errorEl.style.display = 'block';
  } else {
    input.classList.remove('input-invalid');
    input.classList.add('input-valid');
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}

function validateField(id) {
  const input   = document.getElementById(id);
  const errorEl = getError(id);
  if (!input || !errorEl || !RULES[id]) return true;
  const msg = RULES[id].validate(input.value.trim());
  setFieldState(input, errorEl, msg);
  return !msg;
}

/* ── Inject error <span> elements after each input ────────── */
function injectErrorSpans() {
  ['fname','email','phone','dob'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    if (document.getElementById(`err-${id}`)) return; // already exists
    const span = document.createElement('span');
    span.id = `err-${id}`;
    span.className = 'field-error';
    span.setAttribute('role', 'alert');
    input.parentNode.insertBefore(span, input.nextSibling);
  });

  // Plan error
  const planGroup = document.querySelector('fliedset, fieldset:nth-of-type(2)');
  if (planGroup && !document.getElementById('err-plan')) {
    const span = document.createElement('span');
    span.id = 'field-error';
    span.className = 'field-error';
    span.id = 'err-plan';
    planGroup.appendChild(span);
  }

  // Terms error
  const termsInput = document.getElementById('terms');
  if (termsInput && !document.getElementById('err-terms')) {
    const span = document.createElement('span');
    span.id = 'err-terms';
    span.className = 'field-error';
    termsInput.parentNode.appendChild(span);
  }
}

/* ── Blur listeners (validate on leave) ──────────────────── */
function initBlurValidation() {
  ['fname','email','phone','dob'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur',  () => validateField(id));
    input.addEventListener('input', () => {
      // Re-validate on every keystroke after first blur
      if (input.classList.contains('input-invalid') || input.classList.contains('input-valid')) {
        validateField(id);
      }
    });
  });
}

/* ── Submit handler ──────────────────────────────────────── */
function initFormSubmit() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;

    // Text fields
    ['fname','email','phone','dob'].forEach(id => {
      if (!validateField(id)) valid = false;
    });

    // Plan selection
    const planRadios = document.querySelectorAll('input[name="Plan-Selection"]');
    const planChosen = [...planRadios].some(r => r.checked);
    const planErr    = document.getElementById('err-plan');
    if (planErr) {
      planErr.textContent  = planChosen ? '' : 'Please select a membership plan.';
      planErr.style.display = planChosen ? 'none' : 'block';
    }
    if (!planChosen) valid = false;

    // Terms
    const terms    = document.getElementById('terms');
    const termsErr = document.getElementById('err-terms');
    const termsOk  = terms && terms.checked;
    if (termsErr) {
      termsErr.textContent  = termsOk ? '' : 'You must accept the Terms and Conditions.';
      termsErr.style.display = termsOk ? 'none' : 'block';
    }
    if (!termsOk) valid = false;

    if (!valid) {
      // Scroll to first error
      const firstBad = form.querySelector('.input-invalid, .field-error:not(:empty)');
      if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // ── Success ──
    sessionStorage.removeItem('selectedPlan'); // clear cart
    showSuccessModal();
  });

  // Terms checkbox live feedback

}

/* ══════════════════════════════════════════════════════════════
   6. SUCCESS MODAL
   ══════════════════════════════════════════════════════════════ */
function showSuccessModal() {
  const nameVal = document.getElementById('fname')?.value.trim().split(' ')[0] || 'Member';
  const planEl  = document.querySelector('input[name="Plan-Selection"]:checked');
  const plan    = planEl ? planEl.id.replace('Plan-','') : '';

  let modal = document.getElementById('success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'success-modal';
    modal.innerHTML = `
      <div id="success-box">
        <div id="success-icon">✔</div>
        <h3 id="success-title">Registration Successful!</h3>
        <p id="success-body"></p>
        <button id="success-close">Back to Home</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('success-close').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  document.getElementById('success-body').textContent =
    `Welcome, ${nameVal}! Your ${plan} membership has been registered. We'll send a confirmation to your email shortly.`;

  modal.classList.add('open');
  document.body.classList.add('modal-open');
}

/* ══════════════════════════════════════════════════════════════
   7. TOAST NOTIFICATION
   ══════════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  injectErrorSpans();
  initBlurValidation();
  initFormSubmit();
});
