/**
 * MOSCOW MEDIA PLAYBOOK // PURE SEMANTIC CONTROLLER (PICO CSS V2)
 * Handles clipboard copying, state synchronization, and navigation.
 */

// 1. Checklist Master Data
const CHECKLIST_ITEMS = [
  { 
    id: 'step1', 
    title: 'Package Portfolio + QR Code', 
    desc: 'Put your best TV reports/reels into 1 clean link (Notion/Drive) and generate a QR code for your phone lockscreen.' 
  },
  { 
    id: 'step2', 
    title: 'Email IV RAN for Nov 17–18 Conference', 
    desc: 'Send Script #1 to mitrofanenkova.olga@bk.ru and pr@ivran.ru to register for the Middle East conference.' 
  },
  { 
    id: 'step3', 
    title: 'Book Free Studio at «Molodezh Moskvy»', 
    desc: 'Pick a slot at Tulskaya (Kholodilny, 3) or Vernadskogo, 14 on mosmolodezh.ru (I can book under my account).' 
  },
  { 
    id: 'step4', 
    title: 'Send HSE Media Center Pitch', 
    desc: 'Email Anna Krasnovskaya (akrasnovskaya@hse.ru) & Roman Dyakonov (rdyakonov@hse.ru) for Khitrovka studio access.' 
  },
  { 
    id: 'step5', 
    title: 'Contact / Visit KRG Office (Danar Mustafa)', 
    desc: 'Send Script #3 to russia@gov.krd / @krgrus and visit Trekhprudny Pereulok, 11/13 to connect with Rudaw & Kurdistan 24.' 
  },
  { 
    id: 'step6', 
    title: 'Approach Vladislav Flyarkovsky & RGGU.LIVE', 
    desc: 'Bypass RGGU admins by showing your reel in person to Director Flyarkovsky or Anastasia Gavrilova (RGGU.LIVE).' 
  },
  { 
    id: 'step7', 
    title: 'Coffee with Rami El-Kalyubi at HSE', 
    desc: 'Visit Malaya Ordynka, 17 (Office 316) to get a direct referral to RT Arabic / Sputnik editors.' 
  },
  { 
    id: 'step8', 
    title: 'Attend IV RAN on Nov 17–18 in Person', 
    desc: 'Meet Vadim Makarenko (Editor-in-Chief, Kurdistan.ru) & Kirill Vertyaev during the coffee break at Rozhdestvenka, 12.' 
  }
];

const STORAGE_KEY = 'moscow_media_playbook_2026_v1';

// 2. Clipboard Helper with in-button feedback
function copyText(text, btnElement) {
  if (!text) return;

  function provideFeedback() {
    const btn = btnElement || (window.event && window.event.target ? window.event.target.closest('button') : null);
    if (btn) {
      const originalText = btn.dataset.originalText || btn.textContent;
      btn.dataset.originalText = originalText;
      btn.textContent = 'Copied!';
      btn.setAttribute('disabled', 'true');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.removeAttribute('disabled');
      }, 1500);
    }
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      provideFeedback();
    }).catch(() => {
      fallbackCopy(text);
      provideFeedback();
    });
  } else {
    fallbackCopy(text);
    provideFeedback();
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textarea);
}

function copyElementText(elementId, btnElement) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const rawText = el.value !== undefined ? el.value : (el.innerText || el.textContent);
  copyText(rawText.trim(), btnElement);
}

// 3. Checklist State Persistence & Rendering
function loadChecklistState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

function saveChecklistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {}
}

function updateGlobalProgressBadge() {
  const state = loadChecklistState();
  const completedCount = CHECKLIST_ITEMS.filter(item => Boolean(state[item.id])).length;
  const total = CHECKLIST_ITEMS.length;

  const badges = document.querySelectorAll('#progress-badge, .progress-badge');
  badges.forEach(badge => {
    badge.textContent = `${completedCount}/${total}`;
  });

  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.value = completedCount;
    progressBar.max = total;
  }
}

function toggleItem(id) {
  const state = loadChecklistState();
  state[id] = !state[id];
  saveChecklistState(state);
  renderChecklist();
  updateGlobalProgressBadge();
}

function resetChecklist(btnElement) {
  localStorage.removeItem(STORAGE_KEY);
  renderChecklist();
  updateGlobalProgressBadge();
  if (btnElement) {
    const orig = btnElement.textContent;
    btnElement.textContent = 'Reset Done!';
    setTimeout(() => {
      btnElement.textContent = orig;
    }, 1500);
  }
}

function renderChecklist() {
  const container = document.getElementById('checklist-container');
  if (!container) return;

  const state = loadChecklistState();
  container.innerHTML = '';
  let completedCount = 0;

  CHECKLIST_ITEMS.forEach((item, index) => {
    const isChecked = Boolean(state[item.id]);
    if (isChecked) completedCount++;

    const label = document.createElement('label');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isChecked;
    checkbox.onchange = () => toggleItem(item.id);
    label.appendChild(checkbox);

    const strong = document.createElement('strong');
    strong.textContent = ` STEP 0${index + 1}: ${item.title}`;
    label.appendChild(strong);

    const desc = document.createElement('small');
    desc.textContent = ` — ${item.desc}`;
    label.appendChild(desc);

    container.appendChild(label);
  });

  updateGlobalProgressBadge();
}

// 4. Navigation Active Page Highlighter (Pico CSS uses aria-current="page")
function highlightActiveNav() {
  const path = window.location.pathname;
  let filename = path.substring(path.lastIndexOf('/') + 1);
  if (!filename || filename === '') {
    filename = 'index.html';
  }

  const links = document.querySelectorAll('header nav a');
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    const cleanHref = href.replace('./', '').split('#')[0];
    if (cleanHref === filename || (filename === 'index.html' && (cleanHref === '' || cleanHref === 'index.html'))) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// 5. Cross-tab synchronization
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    updateGlobalProgressBadge();
    if (document.getElementById('checklist-container')) {
      renderChecklist();
    }
  }
});

// 6. DOM Lifecycle
document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
  updateGlobalProgressBadge();
  if (document.getElementById('checklist-container')) {
    renderChecklist();
  }
});
