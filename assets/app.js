/**
 * MOSCOW MEDIA PLAYBOOK // CLIENT APPLICATION CONTROLLER (2026)
 * Handles clipboard toast notifications, multi-page state sync, and active navigation.
 */

// 1. Interactive Checklist Master Data (Single Source of Truth)
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
    desc: 'Send Script #2 to russia@gov.krd / @krgrus and visit Trekhprudny Pereulok, 11/13 to connect with Rudaw & Kurdistan 24.' 
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

// 2. Clipboard & Toast Management
let toastTimeoutId = null;

function showToast(message, label = 'Copied to Clipboard') {
  let toast = document.getElementById('toast');
  let toastText = document.getElementById('toast-text');
  let toastLabel = document.getElementById('toast-label');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-3 bg-ink-900/95 border border-signal-amber/70 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md max-w-sm';
    toast.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-signal-amber/15 border border-signal-amber/40 flex items-center justify-center shrink-0 text-signal-amber">
        <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <div class="overflow-hidden">
        <p id="toast-label" class="font-mono text-[10px] uppercase tracking-wider text-signal-amber font-bold"></p>
        <p id="toast-text" class="text-xs sm:text-sm font-medium text-zinc-200 truncate mt-0.5"></p>
      </div>
    `;
    document.body.appendChild(toast);
    toastText = document.getElementById('toast-text');
    toastLabel = document.getElementById('toast-label');
  }

  if (toastLabel) toastLabel.textContent = label;
  if (toastText) toastText.textContent = message;

  toast.classList.remove('translate-y-20', 'opacity-0');

  if (toastTimeoutId) clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2600);
}

function copyText(text, label = 'Copied') {
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(text, label);
    }).catch(() => {
      fallbackCopyText(text, label);
    });
  } else {
    fallbackCopyText(text, label);
  }
}

function fallbackCopyText(text, label) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(text, label);
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textarea);
}

function copyElementText(elementId, label = 'Copied Text') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const rawText = el.innerText || el.textContent;
  copyText(rawText.trim(), label);
}

// 3. Checklist State & Storage Persistence
function loadChecklistState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading localStorage', err);
    return {};
  }
}

function saveChecklistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error writing to localStorage', err);
  }
}

function updateGlobalProgressBadge() {
  const state = loadChecklistState();
  const completedCount = CHECKLIST_ITEMS.filter(item => Boolean(state[item.id])).length;
  const total = CHECKLIST_ITEMS.length;

  const badges = document.querySelectorAll('#progress-badge, .progress-badge');
  badges.forEach(badge => {
    badge.textContent = `${completedCount}/${total}`;
  });

  const progressBar = document.getElementById('progress-bar-fill');
  if (progressBar) {
    const percentage = Math.round((completedCount / total) * 100);
    progressBar.style.width = `${percentage}%`;
  }
}

function toggleItem(id) {
  const state = loadChecklistState();
  state[id] = !state[id];
  saveChecklistState(state);
  renderChecklist();
  updateGlobalProgressBadge();
}

function resetChecklist() {
  localStorage.removeItem(STORAGE_KEY);
  renderChecklist();
  updateGlobalProgressBadge();
  showToast('All 8 steps reset to 0/8', 'Action Tracker Reset');
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

    const card = document.createElement('div');
    card.className = `p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5 select-none ${
      isChecked 
        ? 'bg-emerald-950/25 border-signal-emerald/60 text-zinc-400' 
        : 'bg-ink-950/90 border-ink-700 hover:border-ink-600 hover:bg-ink-900/60 text-white'
    }`;
    card.setAttribute('role', 'checkbox');
    card.setAttribute('aria-checked', isChecked ? 'true' : 'false');
    card.onclick = () => toggleItem(item.id);

    card.innerHTML = `
      <div class="mt-0.5 w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors ${
        isChecked 
          ? 'bg-signal-emerald border-signal-emerald text-black shadow-[0_0_10px_rgba(16,185,129,0.35)]' 
          : 'border-zinc-600 bg-ink-900'
      }">
        ${isChecked ? '<svg class="w-3.5 h-3.5 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-[11px] uppercase tracking-wider ${isChecked ? 'text-signal-emerald line-through' : 'text-signal-amber font-bold'}">
            STEP 0${index + 1}
          </span>
          ${isChecked ? '<span class="text-[10px] font-mono text-signal-emerald font-semibold uppercase bg-signal-emerald/15 px-1.5 py-0.5 rounded">DONE</span>' : ''}
        </div>
        <div class="font-display font-bold text-sm mt-0.5 ${isChecked ? 'line-through text-zinc-400' : 'text-white'}">
          ${item.title}
        </div>
        <p class="text-xs text-zinc-400 mt-1 leading-relaxed ${isChecked ? 'opacity-80' : ''}">${item.desc}</p>
      </div>
    `;
    container.appendChild(card);
  });

  updateGlobalProgressBadge();
}

// 4. Navigation & Active Tab Highlighter
function highlightActiveNav() {
  const path = window.location.pathname;
  let filename = path.substring(path.lastIndexOf('/') + 1);
  if (!filename || filename === '') {
    filename = 'index.html';
  }

  // Desktop Header Links
  const desktopLinks = document.querySelectorAll('header nav a[data-nav]');
  desktopLinks.forEach(link => {
    const target = link.getAttribute('data-nav');
    const isCurrent = (target === filename) || (target === 'index.html' && filename === '');
    if (isCurrent) {
      link.classList.add('nav-active');
      link.classList.remove('text-zinc-300', 'hover:text-white');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('nav-active');
      link.removeAttribute('aria-current');
    }
  });

  // Mobile Bottom Bar Links
  const mobileLinks = document.querySelectorAll('.mobile-bottom-nav a[data-nav]');
  mobileLinks.forEach(link => {
    const target = link.getAttribute('data-nav');
    const isCurrent = (target === filename) || (target === 'index.html' && filename === '');
    if (isCurrent) {
      link.classList.add('mobile-nav-active');
      link.classList.remove('text-zinc-400');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('mobile-nav-active');
      link.classList.add('text-zinc-400');
      link.removeAttribute('aria-current');
    }
  });
}

// 5. Studio & Category Filtering
function filterStudios(category, buttonElement) {
  const cards = document.querySelectorAll('[data-studio-category]');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardCat = card.getAttribute('data-studio-category');
    if (category === 'all' || cardCat === category) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Update button active styling
  const buttons = document.querySelectorAll('[data-filter-btn]');
  buttons.forEach(btn => {
    btn.classList.remove('bg-signal-amber', 'text-black', 'border-signal-amber', 'font-bold');
    btn.classList.add('bg-ink-900', 'text-zinc-400', 'border-ink-700');
    btn.setAttribute('aria-pressed', 'false');
  });

  if (buttonElement) {
    buttonElement.classList.remove('bg-ink-900', 'text-zinc-400', 'border-ink-700');
    buttonElement.classList.add('bg-signal-amber', 'text-black', 'border-signal-amber', 'font-bold');
    buttonElement.setAttribute('aria-pressed', 'true');
  }

  const counterEl = document.getElementById('studios-visible-counter');
  if (counterEl) {
    counterEl.textContent = `Showing ${visibleCount} of ${cards.length} locations`;
  }
}

// 6. Cross-tab Synchronization
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    updateGlobalProgressBadge();
    if (document.getElementById('checklist-container')) {
      renderChecklist();
    }
  }
});

// 6. Application Lifecycle Initialization
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
  highlightActiveNav();
  updateGlobalProgressBadge();
  if (document.getElementById('checklist-container')) {
    renderChecklist();
  }
});
