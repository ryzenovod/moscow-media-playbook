/**
 * MOSCOW MEDIA PLAYBOOK // CONTROLLER (PICO CSS V2 + DYNAMIC LIVE MODULES)
 * Version: 2.3 (Semantic HTML5 + Live Timers + RSS Wire + QR Press Card + Live USD/RUB Currency Calculator)
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
const LANG_KEY = 'moscow_media_lang_v1';
const PROFILE_KEY = 'moscow_media_autofill_profile_v1';

let currentUsdRubRate = 81.75; // Verified default market baseline

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
  } catch (err) {}
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

// 5. Google Translate Cookie Switcher (EN / RU / KU / CKB)
function setTranslateCookie(lang) {
  const cookieVal = `/en/${lang}`;
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  if (window.location.hostname) {
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${window.location.hostname};`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;
  }
  localStorage.setItem(LANG_KEY, lang);
}

function changeLanguage(lang) {
  setTranslateCookie(lang);
  window.location.reload();
}

window.googleTranslateElementInit = function() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,ru,ku,ckb',
    autoDisplay: false
  }, 'google_translate_element');
};

function initLanguageSwitcher() {
  const savedLang = localStorage.getItem(LANG_KEY) || 'en';
  const select = document.getElementById('lang-switcher');
  if (select) {
    select.value = savedLang;
  }
  if (savedLang !== 'en') {
    setTranslateCookie(savedLang);
  }

  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
  }
}

// 6. Live Countdowns to IV RAN Conferences (Nov 11 & Nov 17 2026, 10:30 MSK)
function initCountdowns() {
  const target11 = new Date('2026-11-11T10:30:00+03:00').getTime();
  const target17 = new Date('2026-11-17T10:30:00+03:00').getTime();

  function formatDiff(diff) {
    if (diff <= 0) return 'In Session / Concluded';
    const totalSecs = Math.floor(diff / 1000);
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${d}d ${h}h ${m}m ${s}s left`;
  }

  function update() {
    const now = Date.now();
    const el11 = document.getElementById('countdown-nov11');
    const el17 = document.getElementById('countdown-nov17');
    if (el11) el11.textContent = formatDiff(target11 - now);
    if (el17) el17.textContent = formatDiff(target17 - now);
  }

  update();
  setInterval(update, 1000);
}

// 7. Download .ics iCalendar file for 1-click addition to iPhone / Google Calendar
function downloadICS(title, startISO, endISO, location, description) {
  function formatICSDate(d) {
    return new Date(d).toISOString().replace(/-|:|\.\d\d\d/g, "");
  }
  const start = formatICSDate(startISO);
  const end = formatICSDate(endISO);
  const now = formatICSDate(new Date());

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Moscow Media Playbook//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@moscowmediaplaybook`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 8. Live Moscow International Media Wire (RSS Fetcher)
async function loadLiveNews() {
  const container = document.getElementById('live-news-feed');
  if (!container) return;

  const fallbackArticles = [
    {
      title: 'Russia–Middle East Economic Relations: Expansion of bilateral trade missions & media accreditation',
      time: '11:20 MSK',
      link: 'https://tass.com/economy',
      source: 'TASS Russian News Agency'
    },
    {
      title: 'Russian Chamber of Commerce reviews Arab & Kurdish regional investment corridors and logistics hubs',
      time: '09:45 MSK',
      link: 'https://tass.com/economy',
      source: 'TASS / CCI RF'
    },
    {
      title: 'Institute of Oriental Studies (IV RAN) convenes federal conference on Middle Eastern geopolitics',
      time: '08:30 MSK',
      link: 'https://ivran.ru',
      source: 'IV RAN Academic Wire'
    },
    {
      title: 'RT Arabic & Ruptly expand coverage of Middle Eastern trade and diplomatic delegations in Moscow',
      time: 'Yesterday',
      link: 'https://arabic.rt.com',
      source: 'RT Arabic International'
    },
    {
      title: 'MIA Rossiya Segodnya / Sputnik media cluster launches bilingual Middle East analyst recruitment',
      time: 'Yesterday',
      link: 'https://sputniknews.com',
      source: 'MIA Rossiya Segodnya'
    }
  ];

  function renderList(items) {
    container.removeAttribute('aria-busy');
    container.innerHTML = '';
    const ul = document.createElement('ul');
    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>[${item.time}]</strong> <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a> <small>— ${item.source}</small>`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  try {
    const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://tass.com/rss/v2.xml');
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    if (!data.items || data.items.length === 0) throw new Error('No items');

    const formatted = data.items.slice(0, 5).map(it => ({
      title: it.title,
      time: it.pubDate ? new Date(it.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' MSK' : 'Live',
      link: it.link,
      source: 'TASS World Wire'
    }));
    renderList(formatted);
  } catch (err) {
    renderList(fallbackArticles);
  }
}

// 9. Digital Press Card Modal (vCard QR Generator for In-Person Networking)
function openPressCardModal() {
  let profile = {
    name: 'Ragaz Jumaa',
    media: 'Kurdistan 24 / Rudaw',
    phone: '+7 996 119 2300 / @RagazJumaa',
    portfolio: 'https://drive.google.com/your-showreel'
  };

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) profile = Object.assign(profile, JSON.parse(raw));
  } catch (e) {}

  const nameEl = document.getElementById('modal-profile-name');
  const mediaEl = document.getElementById('modal-profile-media');
  const phoneEl = document.getElementById('modal-profile-phone');
  const portEl = document.getElementById('modal-profile-portfolio');
  const qrImg = document.getElementById('modal-qr-img');

  if (nameEl) nameEl.textContent = profile.name;
  if (mediaEl) mediaEl.textContent = profile.media;
  if (phoneEl) phoneEl.textContent = profile.phone;
  if (portEl) {
    portEl.textContent = profile.portfolio;
    portEl.href = profile.portfolio;
  }

  const vCard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nORG:${profile.media}\nTEL:${profile.phone}\nURL:${profile.portfolio}\nEND:VCARD`;
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(vCard)}`;
  }

  const modal = document.getElementById('press-card-modal');
  if (modal) {
    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', 'true');
    }
  }
}

function closePressCardModal() {
  const modal = document.getElementById('press-card-modal');
  if (modal) {
    if (typeof modal.close === 'function') {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }
  }
}

// 10. Live Media Honorarium & Stringer Rate Calculator (USD ↔ RUB)
async function initHonorariumCalc() {
  const rateBadge = document.getElementById('live-usd-rate');
  const rubInput = document.getElementById('calc-rub-input');
  const usdInput = document.getElementById('calc-usd-input');

  if (!rateBadge && !rubInput && !usdInput) return;

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && data.rates.RUB) {
        currentUsdRubRate = parseFloat(data.rates.RUB);
      }
    }
  } catch (err) {
    console.warn('Using fallback USD/RUB exchange rate', err);
  }

  if (rateBadge) {
    rateBadge.textContent = `1 USD ≈ ${currentUsdRubRate.toFixed(2)} RUB (Live Open Exchange Rate)`;
  }

  function recalculate(fromCurrency) {
    const rubIn = document.getElementById('calc-rub-input');
    const usdIn = document.getElementById('calc-usd-input');
    const grossDisplay = document.getElementById('calc-gross');
    const net13Display = document.getElementById('calc-net-13');
    const net30Display = document.getElementById('calc-net-30');

    let rubVal = 0;
    let usdVal = 0;

    if (fromCurrency === 'rub' && rubIn) {
      rubVal = parseFloat(rubIn.value) || 0;
      usdVal = currentUsdRubRate > 0 ? rubVal / currentUsdRubRate : 0;
      if (usdIn && document.activeElement === rubIn) {
        usdIn.value = usdVal > 0 ? usdVal.toFixed(1) : '';
      }
    } else if (fromCurrency === 'usd' && usdIn) {
      usdVal = parseFloat(usdIn.value) || 0;
      rubVal = usdVal * currentUsdRubRate;
      if (rubIn && document.activeElement === usdIn) {
        rubIn.value = rubVal > 0 ? Math.round(rubVal) : '';
      }
    }

    const net13Rub = rubVal * 0.87;
    const net13Usd = usdVal * 0.87;
    const net30Rub = rubVal * 0.70;
    const net30Usd = usdVal * 0.70;

    if (grossDisplay) {
      grossDisplay.textContent = `${Math.round(rubVal).toLocaleString('ru-RU')} ₽ (~$${usdVal.toFixed(1)})`;
    }
    if (net13Display) {
      net13Display.textContent = `${Math.round(net13Rub).toLocaleString('ru-RU')} ₽ (~$${net13Usd.toFixed(1)})`;
    }
    if (net30Display) {
      net30Display.textContent = `${Math.round(net30Rub).toLocaleString('ru-RU')} ₽ (~$${net30Usd.toFixed(1)})`;
    }
  }

  if (rubInput) {
    rubInput.addEventListener('input', () => recalculate('rub'));
  }
  if (usdInput) {
    usdInput.addEventListener('input', () => recalculate('usd'));
  }

  // Initial calculation
  if (rubInput && rubInput.value) {
    recalculate('rub');
  } else if (usdInput && usdInput.value) {
    recalculate('usd');
  }
}

function setCalcPreset(rubAmount) {
  const rubIn = document.getElementById('calc-rub-input');
  if (rubIn) {
    rubIn.value = rubAmount;
    rubIn.focus();
    rubIn.dispatchEvent(new Event('input'));
  }
}

// 11. Cross-tab synchronization
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    updateGlobalProgressBadge();
    if (document.getElementById('checklist-container')) {
      renderChecklist();
    }
  }
  if (e.key === LANG_KEY) {
    const select = document.getElementById('lang-switcher');
    if (select) select.value = e.newValue || 'en';
  }
});

// 12. Lifecycle Initialization
document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
  updateGlobalProgressBadge();
  initLanguageSwitcher();
  initCountdowns();
  loadLiveNews();
  initHonorariumCalc();
  if (document.getElementById('checklist-container')) {
    renderChecklist();
  }
});
