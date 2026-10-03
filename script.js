const DEFAULT_IMG = 'default.png';
let DATA = null;
let currentWpFilter = 'all';

const imgOr = (url) => (url && url.trim() !== '') ? url: DEFAULT_IMG;
const paragraphs = (arr) => arr.map(p => `<p>${p}</p>`).join('');

/* =========================================================
       SVG ICON LIBRARY (Sosmed)
       ========================================================= */
const SVG_ICONS = {
  whatsapp: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.4"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>',
  github: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  discord: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
  link: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>'
};

const WP_ICONS = {
  download: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg>',
  document: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 13h8v2H8v-2zm0 4h8v2H8v-2zm0-8h3v2H8V9z"/></svg>',
  external: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6zm3 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>'
};

function getIcon(key) {
  if (!key) return SVG_ICONS.link;
  const k = String(key).toLowerCase().trim();
  return SVG_ICONS[k] || SVG_ICONS.link;
}

/* =========================================================
       RENDER: HOME
       ========================================================= */
function renderHome() {
  const a = DATA.armc,
  ar = DATA.arcon,
  im = DATA.imcc;
  const totalOwners = (im.owners || []).length;
  const totalCreators = (DATA.creators || []).length;
  const totalWp = (DATA.whitepapers || []).length;

  return `
  <div class="landing-hero">
  <div class="hero-content">
  <div class="hero-badge">
  <span class="dot"></span>
  ${a.kepanjangan}
  </div>

  <div class="hero-logo-wrap">
  <img src="${imgOr(a.logo)}" class="hero-logo" alt="ARMC"
  onerror="this.src='${DEFAULT_IMG}'">
  </div>

  <h1 class="hero-title">${a.nama}</h1>
  <p class="hero-subtitle">
  Wadah kolaborasi para <strong>creator & owner saluran Minecraft</strong> Indonesia.
  Berbagi pengalaman, tips, dan update seputar addon.
  </p>

  <div class="hero-cta">
  <button class="btn btn-primary" data-page="arcon">
  <span>Jelajahi Komunitas →</span>
  </button>
  <button class="btn btn-ghost" data-page="creator">
  Lihat Creator
  </button>
  </div>
  </div>

  <div class="scroll-hint">
  <div class="mouse"></div>
  <span>Scroll</span>
  </div>
  </div>

  <section>
  <div class="container">
  <div class="section-head reveal">
  <div class="section-eyebrow">Tentang Kami</div>
  <h2 class="section-title">Membangun Ekosistem Creator yang Solid</h2>
  <div class="divider"></div>
  </div>

  <div class="glass content-card reveal">
  <h3><span class="icon-box">📖</span> Tentang Komunitas</h3>
  ${paragraphs(a.deskripsi)}
  </div>

  <div class="stats-grid reveal">
  <div class="glass stat-card">
  <div class="stat-value" style="font-size:1.4rem">${a.sejak}</div>
  <div class="stat-label">Berdiri Sejak</div>
  </div>
  <div class="glass stat-card">
  <div class="stat-value">2</div>
  <div class="stat-label">Sub-Komunitas</div>
  </div>
  <div class="glass stat-card">
  <div class="stat-value">${totalOwners}+</div>
  <div class="stat-label">Owner Aktif</div>
  </div>
  <div class="glass stat-card">
  <div class="stat-value">${totalCreators}</div>
  <div class="stat-label">Creator</div>
  </div>
  <div class="glass stat-card">
  <div class="stat-value">${totalWp}</div>
  <div class="stat-label">Whitepaper</div>
  </div>
  </div>
  </div>
  </section>

  <section class="compact">
  <div class="container">
  <div class="section-head reveal">
  <div class="section-eyebrow">Sub-Komunitas</div>
  <h2 class="section-title">Dua Divisi Utama</h2>
  <div class="divider"></div>
  <p class="section-desc">
  A.R.M.C menaungi dua aliansi yang saling mendukung satu sama lain.
  </p>
  </div>

  <div class="group-grid">
  <a class="glass group-card reveal" data-page="arcon">
  <div class="logo-wrap">
  <img src="${imgOr(ar.logo)}" alt="ARCON"
  onerror="this.src='${DEFAULT_IMG}'">
  </div>
  <h4>${ar.nama}</h4>
  <p class="tagline">${ar.kepanjangan}</p>
  <span class="arrow">Selengkapnya →</span>
  </a>

  <a class="glass group-card reveal" data-page="imcc">
  <div class="logo-wrap">
  <img src="${imgOr(im.logo)}" alt="IMCC"
  onerror="this.src='${DEFAULT_IMG}'">
  </div>
  <h4>${im.nama}</h4>
  <p class="tagline">${im.kepanjangan}</p>
  <span class="arrow">Selengkapnya →</span>
  </a>
  </div>
  </div>
  </section>

  <section class="compact">
  <div class="container">
  <div class="glass cta-box reveal">
  <h3>Siap Bergabung dengan Komunitas?</h3>
  <p>
  Jadilah bagian dari aliansi creator Minecraft Indonesia
  yang solid, aktif, dan saling mendukung.
  </p>
  <button class="btn btn-primary" onclick="window.location.href='/daftar/'">
  <span>Daftar →</span>
  </button>
  </div>
  </div>
  </section>
  `;
}

/* =========================================================
       RENDER: ARCON
       ========================================================= */
function renderArcon() {
  const ar = DATA.arcon;
  return `
  <div class="page-header">
  <div class="logo-circle">
  <img src="${imgOr(ar.logo)}" alt="ARCON"
  onerror="this.src='${DEFAULT_IMG}'">
  </div>
  <h1>${ar.nama}</h1>
  <p class="long-name">${ar.kepanjangan}</p>
  <span class="pill">Sejak ${ar.sejak}</span>
  </div>

  <section class="compact">
  <div class="container">
  <div class="glass content-card reveal">
  <h3><span class="icon-box">📖</span> Tentang ARCON</h3>
  ${paragraphs(ar.deskripsi)}
  </div>
  </div>
  </section>
  `;
}

/* =========================================================
       RENDER: IMCC
       ========================================================= */
function renderImcc() {
  const im = DATA.imcc;
  return `
  <div class="page-header">
  <div class="logo-circle">
  <img src="${imgOr(im.logo)}" alt="IMCC"
  onerror="this.src='${DEFAULT_IMG}'">
  </div>
  <h1>${im.nama}</h1>
  <p class="long-name">${im.kepanjangan}</p>
  <span class="pill">Sejak ${im.sejak}</span>
  </div>

  <section class="compact">
  <div class="container">
  <div class="glass content-card reveal">
  <h3><span class="icon-box">📖</span> Tentang IMCC</h3>
  ${paragraphs(im.deskripsi)}
  </div>
  </div>
  </section>
  `;
}

/* =========================================================
       RENDER: CREATOR
       ========================================================= */
function renderCreator() {
  const list = DATA.creators || [];
  if (list.length === 0) {
    return `<div class="loading">Belum ada creator.</div>`;
  }

  const cards = list.map(c => {
    const sosmedValid = (c.sosmed || []).filter(s => s.url && s.url.trim() !== '');
    return `
    <div class="glass creator-card reveal">
    <img src="${imgOr(c.foto)}" alt="${c.nama}" class="creator-avatar"
    onerror="this.src='${DEFAULT_IMG}'">
    <h4>${c.nama}</h4>
    <span class="role">${c.role}</span>
    <p class="bio">${c.bio}</p>
    <div class="sosmed-wrap">
    ${sosmedValid.map(s => `
      <a href="${s.url}" target="_blank" rel="noopener" class="sosmed-btn">
      ${getIcon(s.icon)}
      <span>${s.nama}</span>
      </a>
      `).join('')}
    </div>
    </div>
    `;
  }).join('');

  return `
  <div class="page-header">
  <div class="logo-circle">
  <img src="${imgOr(DATA.armc.logo)}" alt="A.R.M.C"
  onerror="this.src='${DEFAULT_IMG}'">
  </div>
  <h1>Para Creator</h1>
  <p class="long-name">Orang-orang di balik komunitas A.R.M.C</p>
  <span class="pill">${list.length} Creator</span>
  </div>

  <section class="compact">
  <div class="container">
  <div class="creator-grid">
  ${cards}
  </div>
  </div>
  </section>
  `;
}

/* =========================================================
       RENDER: WHITEPAPER
       ========================================================= */
function getWpButton(wp) {
  const hasUrl = wp.url && wp.url.trim() !== '' && wp.url !== '#';
  const tipe = (wp.tipe || 'pdf').toLowerCase();

  if (!hasUrl) {
    return `<span class="wp-btn wp-btn-disabled">${WP_ICONS.lock}<span>Coming Soon</span></span>`;
  }

  if (tipe === 'pdf') {
    return `<a href="${wp.url}" target="_blank" rel="noopener" class="wp-btn wp-btn-primary">
    ${WP_ICONS.download}<span>Download PDF</span>
    </a>`;
  }

  if (tipe === 'internal') {
    return `<a href="${wp.url}" class="wp-btn wp-btn-primary">
    ${WP_ICONS.document}<span>Buka di Web</span>
    </a>`;
  }

  return `<a href="${wp.url}" target="_blank" rel="noopener" class="wp-btn wp-btn-primary">
  ${WP_ICONS.external}<span>Buka Link</span>
  </a>`;
}

function renderWpCards(list) {
  if (list.length === 0) {
    return `
    <div class="wp-empty">
    <div class="wp-empty-icon">📄</div>
    <div>Belum ada whitepaper untuk kategori ini.</div>
    </div>`;
  }

  return list.map(wp => `
    <div class="glass wp-card reveal">
    <div class="wp-top">
    <span class="wp-version">${wp.versi}</span>
    ${wp.tag ? `<span class="wp-tag">${wp.tag}</span>`: ''}
    </div>

    <h4 class="wp-title">${wp.judul}</h4>
    <p class="wp-desc">${wp.deskripsi}</p>

    <div class="wp-meta">
    ${WP_ICONS.clock}
    <span>${wp.tanggal}</span>
    </div>

    <div class="wp-actions">
    ${getWpButton(wp)}
    </div>
    </div>
    `).join('');
}

function renderWhitepaper() {
  const list = DATA.whitepapers || [];

  if (list.length === 0) {
    return `
    <div class="page-header">
    <h1>Whitepaper</h1>
    <p class="long-name">Dokumentasi resmi perjalanan komunitas A.R.M.C</p>
    </div>
    <section class="compact">
    <div class="container">
    <div class="wp-grid">
    <div class="wp-empty">
    <div class="wp-empty-icon">📄</div>
    <div>Belum ada whitepaper yang dipublikasikan.</div>
    </div>
    </div>
    </div>
    </section>
    `;
  }

  const tags = ['all',
    ...new Set(list.map(w => w.tag).filter(Boolean))];

  const filterBar = tags.length > 2
  ? `<div class="wp-filter">
  ${tags.map(t => `
    <button data-wp-filter="${t}" class="${currentWpFilter === t ? 'active': ''}">
    ${t === 'all' ? 'Semua': t}
    </button>
    `).join('')}
  </div>`: '';

  const filtered = currentWpFilter === 'all'
  ? list: list.filter(w => w.tag === currentWpFilter);

  return `
  <div class="page-header">
  <div class="logo-circle">
  <img src="${imgOr(DATA.armc.logo)}" alt="A.R.M.C"
  onerror="this.src='${DEFAULT_IMG}'">
  </div>
  <h1>Whitepaper</h1>
  <p class="long-name">Dokumentasi resmi perjalanan komunitas A.R.M.C</p>
  <span class="pill">${list.length} Dokumen</span>
  </div>

  <section class="compact">
  <div class="container">
  ${filterBar}
  <div class="wp-grid" id="wp-grid">
  ${renderWpCards(filtered)}
  </div>
  </div>
  </section>
  `;
}

/* =========================================================
       NAVIGATION
       ========================================================= */
function gotoPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav a[data-page]').forEach(a => a.classList.remove('active'));

  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');

  const navLink = document.querySelector(`nav a[data-page="${name}"]`);
  if (navLink) navLink.classList.add('active');

  requestAnimationFrame(() => {
    setupReveal();
  });

  window.scrollTo({
    top: 0, behavior: 'smooth'
  });
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-page]');
  if (el) {
    e.preventDefault();
    gotoPage(el.dataset.page);
  }
});

/* Event filter whitepaper */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-wp-filter]');
  if (!btn) return;

  currentWpFilter = btn.dataset.wpFilter;

  document.querySelectorAll('[data-wp-filter]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const list = DATA.whitepapers || [];
  const filtered = currentWpFilter === 'all'
  ? list: list.filter(w => w.tag === currentWpFilter);

  const grid = document.getElementById('wp-grid');
  if (grid) {
    grid.innerHTML = renderWpCards(filtered);
    setupReveal();
  }
});

/* =========================================================
       NAVBAR SCROLL
       ========================================================= */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}, {
  passive: true
});

/* =========================================================
       SCROLL REVEAL
       ========================================================= */
let observer = null;
function setupReveal() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.page.active .reveal:not(.visible)').forEach(el => {
    observer.observe(el);
  });
}

/* =========================================================
       INIT
       ========================================================= */
async function init() {
  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    DATA = await res.json();

    document.getElementById('page-home').innerHTML = renderHome();
    document.getElementById('page-arcon').innerHTML = renderArcon();
    document.getElementById('page-imcc').innerHTML = renderImcc();
    document.getElementById('page-creator').innerHTML = renderCreator();
    document.getElementById('page-whitepaper').innerHTML = renderWhitepaper();

    setupReveal();
  } catch (err) {
    document.querySelectorAll('.page').forEach(p => {
      p.innerHTML = `<div class="loading">
      <div>Gagal memuat data: ${err.message}</div>
      </div>`;
    });
  }
}

init();