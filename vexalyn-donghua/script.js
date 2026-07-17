const API_BASE = "https://api.vexalynapi.my.id";
const cache = new Map();

const state = {
  heroItems: [],
  heroIndex: 0,
  heroTimer: null,
  searchTimer: null,
};

const endpoints = {
  home: "/anichin/home",
  genres: "/anichin/genres",
  ongoing: "/anichin/ongoing-series",
  popular: (filter = "weekly") => `/anichin/popular-series?filter=${encodeURIComponent(filter)}`,
  movies: "/anichin/new-movie",
  search: (query) => `/anichin/search?q=${encodeURIComponent(query)}`,
};

const selectors = {
  navbar: document.querySelector("[data-navbar]"),
  navLinks: document.querySelector("[data-nav-links]"),
  menuButton: document.querySelector("[data-menu-button]"),
  heroStage: document.querySelector("[data-hero-stage]"),
  heroDots: document.querySelector("[data-hero-dots]"),
  heroPrev: document.querySelector("[data-hero-prev]"),
  heroNext: document.querySelector("[data-hero-next]"),
  searchForm: document.querySelector("[data-search-form]"),
  searchInput: document.querySelector("[data-search-input]"),
  searchPanel: document.querySelector("[data-search-panel]"),
  searchResults: document.querySelector("[data-search-results]"),
  searchClear: document.querySelector("[data-search-clear]"),
  popularTabs: document.querySelector("[data-popular-tabs]"),
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?auto=format&fit=crop&w=1400&q=80",
];

document.addEventListener("DOMContentLoaded", init);

function init() {
  createIcons();
  bindNavigation();
  bindHeroControls();
  bindSearch();
  bindPopularTabs();
  setupRevealObserver();
  hydratePage();
}

async function hydratePage() {
  renderSkeleton("[data-section='trending']", 6);
  renderSkeleton("[data-section='latest']", 6);
  renderSkeleton("[data-section='popular']", 6);
  renderOngoingSkeleton();

  await Promise.allSettled([
    loadHero(),
    loadHome(),
    loadPopular("weekly"),
    loadOngoing(),
    loadGenres(),
  ]);

  createIcons();
}

async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  if (cache.has(url)) return cache.get(url);

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  cache.set(url, data);
  return data;
}

async function loadHero() {
  try {
    const data = await apiGet(endpoints.movies);
    state.heroItems = normalizeList(data).slice(0, 6);
    if (!state.heroItems.length) throw new Error("No new movie data available");
    renderHero();
    startHeroAutoplay();
  } catch (error) {
    renderHeroError(error);
  }
}

async function loadHome() {
  try {
    const data = await apiGet(endpoints.home);
    const sections = extractHomeSections(data);
    renderCards("[data-section='trending']", sections.trending, {
      emptyTitle: "Trending belum tersedia",
      retry: loadHome,
    });
    renderCards("[data-section='latest']", sections.latest, {
      emptyTitle: "Latest update belum tersedia",
      retry: loadHome,
    });
  } catch (error) {
    renderError("[data-section='trending']", "Trending gagal dimuat", error, loadHome);
    renderError("[data-section='latest']", "Latest update gagal dimuat", error, loadHome);
  }
}

async function loadPopular(filter) {
  const target = "[data-section='popular']";
  renderSkeleton(target, 6);
  try {
    const data = await apiGet(endpoints.popular(filter));
    renderCards(target, normalizeList(data), {
      emptyTitle: "Popular series belum tersedia",
      retry: () => loadPopular(filter),
    });
  } catch (error) {
    renderError(target, "Popular series gagal dimuat", error, () => loadPopular(filter));
  }
}

async function loadOngoing() {
  const target = "[data-section='ongoing']";
  try {
    const data = await apiGet(endpoints.ongoing);
    renderOngoingList(normalizeList(data));
  } catch (error) {
    renderError(target, "Ongoing series gagal dimuat", error, loadOngoing);
  }
}

async function loadGenres() {
  const target = document.querySelector("[data-section='genres']");
  target.innerHTML = Array.from({ length: 14 }, () => `<span class="genre-chip skeleton-line">&nbsp;</span>`).join("");

  try {
    const data = await apiGet(endpoints.genres);
    const genres = normalizeList(data).map((item) => item.title || item.name || item.genre || String(item)).filter(Boolean);
    if (!genres.length) {
      target.innerHTML = emptyMarkup("Genres belum tersedia", "Coba muat ulang setelah API mengirim daftar genre.");
      return;
    }

    target.innerHTML = genres
      .slice(0, 40)
      .map((genre) => `<a class="genre-chip" href="#genres"><i data-lucide="tag"></i>${escapeHtml(genre)}</a>`)
      .join("");
  } catch (error) {
    target.innerHTML = errorMarkup("Genres gagal dimuat", error, loadGenres.name);
    wireRetryButtons();
  }
}

function extractHomeSections(data) {
  const root = data?.data || data?.result || data;
  return {
    trending: pickList(root, ["trending", "trending_series", "popular", "featured", "recommendation", "recommendations"]).slice(0, 12),
    latest: pickList(root, ["latest", "latest_update", "latestUpdate", "recent", "updates", "newest"]).slice(0, 12),
  };
}

function pickList(root, keys) {
  if (!root) return [];
  for (const key of keys) {
    if (Array.isArray(root[key])) return normalizeList(root[key]);
    if (Array.isArray(root?.data?.[key])) return normalizeList(root.data[key]);
  }
  return normalizeList(root).slice(0, 12);
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload.map(normalizeItem);
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.data,
    payload.result,
    payload.results,
    payload.items,
    payload.anime,
    payload.series,
    payload.movies,
    payload.genres,
    payload.list,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.map(normalizeItem);
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) return value.map(normalizeItem);
  }

  return [];
}

function normalizeItem(item) {
  if (typeof item === "string") return { title: item };
  const title = item.title || item.name || item.judul || item.series_name || item.anime_title || "Untitled Donghua";
  const image = item.image || item.thumbnail || item.poster || item.cover || item.img || item.thumb || item.banner;
  return {
    ...item,
    title,
    image,
    description: item.description || item.synopsis || item.desc || item.excerpt || "A cinematic donghua selection curated for premium discovery.",
    rating: item.rating || item.score || item.rate || "HD",
    genre: item.genre || item.genres || item.category || item.type || "Donghua",
    status: item.status || item.release_status || item.episode || item.latest_episode || "Available",
    url: item.url || item.link || item.href || "#",
  };
}

function renderHero() {
  selectors.heroStage.innerHTML = state.heroItems.map(heroSlideMarkup).join("");
  selectors.heroDots.innerHTML = state.heroItems
    .map((_, index) => `<button class="hero-dot ${index === 0 ? "active" : ""}" type="button" data-hero-dot="${index}" aria-label="Show slide ${index + 1}"></button>`)
    .join("");
  setHeroIndex(0);
  createIcons();
}

function heroSlideMarkup(item, index) {
  const image = item.image || fallbackImages[index % fallbackImages.length];
  const genres = Array.isArray(item.genre) ? item.genre.slice(0, 2).join(", ") : item.genre;
  return `
    <article class="hero-slide ${index === 0 ? "active" : ""}" data-hero-slide>
      <img class="hero-backdrop" src="${escapeAttribute(image)}" alt="" loading="${index === 0 ? "eager" : "lazy"}" />
      <div class="hero-content">
        <p class="eyebrow">New Movie Premiere</p>
        <h1>${escapeHtml(item.title)}</h1>
        <p class="hero-description">${escapeHtml(item.description)}</p>
        <div class="hero-meta">
          <span class="meta-pill"><i data-lucide="star"></i>${escapeHtml(String(item.rating))}</span>
          <span class="meta-pill"><i data-lucide="clapperboard"></i>${escapeHtml(String(genres || "Donghua"))}</span>
          <span class="meta-pill"><i data-lucide="signal"></i>${escapeHtml(String(item.status))}</span>
        </div>
        <div class="hero-actions">
          <a class="primary-button" href="${escapeAttribute(item.url)}"><i data-lucide="play"></i>Watch Now</a>
          <a class="secondary-button" href="${escapeAttribute(item.url)}"><i data-lucide="info"></i>More Info</a>
        </div>
      </div>
    </article>
  `;
}

function setHeroIndex(index) {
  if (!state.heroItems.length) return;
  state.heroIndex = (index + state.heroItems.length) % state.heroItems.length;

  document.querySelectorAll("[data-hero-slide]").forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === state.heroIndex);
  });
  document.querySelectorAll("[data-hero-dot]").forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === state.heroIndex);
  });
}

function startHeroAutoplay() {
  window.clearInterval(state.heroTimer);
  state.heroTimer = window.setInterval(() => setHeroIndex(state.heroIndex + 1), 5000);
}

function renderHeroError(error) {
  selectors.heroStage.innerHTML = `
    <div class="hero-slide active">
      <img class="hero-backdrop" src="${fallbackImages[0]}" alt="" />
      <div class="hero-content">
        <p class="eyebrow">Connection Notice</p>
        <h1>Vexalyn Donghua</h1>
        <p class="hero-description">The cinematic shell is ready, but the movie API could not be reached. Retry when the service is online.</p>
        <div class="hero-meta">
          <span class="meta-pill"><i data-lucide="wifi-off"></i>${escapeHtml(error.message)}</span>
        </div>
        <div class="hero-actions">
          <button class="primary-button" type="button" data-retry="loadHero"><i data-lucide="refresh-cw"></i>Retry</button>
        </div>
      </div>
    </div>
  `;
  selectors.heroDots.innerHTML = "";
  wireRetryButtons();
  createIcons();
}

function renderCards(targetSelector, items, options = {}) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  if (!items.length) {
    target.innerHTML = emptyMarkup(options.emptyTitle || "No titles found", "Data belum tersedia dari API untuk section ini.");
    return;
  }

  target.innerHTML = items.slice(0, 12).map(cardMarkup).join("");
  createIcons();
}

function cardMarkup(item, index) {
  const image = item.image || fallbackImages[index % fallbackImages.length];
  const genre = Array.isArray(item.genre) ? item.genre[0] : item.genre;
  return `
    <article class="title-card">
      <a href="${escapeAttribute(item.url)}" aria-label="${escapeAttribute(item.title)}">
        <div class="poster-wrap">
          <img src="${escapeAttribute(image)}" alt="${escapeAttribute(item.title)} poster" loading="lazy" />
          <span class="card-badge">${escapeHtml(String(genre || "Donghua"))}</span>
          <span class="card-play"><i data-lucide="play"></i></span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          <div class="card-meta">
            <span>${escapeHtml(String(item.rating || "HD"))}</span>
            <span class="status">${escapeHtml(String(item.status || "Available"))}</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

function renderOngoingList(items) {
  const target = document.querySelector("[data-section='ongoing']");
  if (!target) return;

  if (!items.length) {
    target.innerHTML = emptyMarkup("Ongoing series belum tersedia", "Data ongoing belum tersedia dari API.");
    return;
  }

  target.innerHTML = items.slice(0, 18).map(ongoingItemMarkup).join("");
  createIcons();
}

function ongoingItemMarkup(item, index) {
  const genre = Array.isArray(item.genre) ? item.genre.slice(0, 2).join(", ") : item.genre;
  return `
    <article class="ongoing-item">
      <a href="${escapeAttribute(item.url)}" aria-label="${escapeAttribute(item.title)}">
        <span class="ongoing-rank">${String(index + 1).padStart(2, "0")}</span>
        <span class="ongoing-copy">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(String(genre || "Donghua"))}</span>
        </span>
        <span class="ongoing-status">${escapeHtml(String(item.status || item.episode || "Ongoing"))}</span>
        <span class="ongoing-action"><i data-lucide="arrow-up-right"></i></span>
      </a>
    </article>
  `;
}

function renderOngoingSkeleton() {
  const target = document.querySelector("[data-section='ongoing']");
  if (!target) return;
  target.innerHTML = Array.from({ length: 8 }, () => `<div class="ongoing-skeleton skeleton-line"></div>`).join("");
}

function renderSkeleton(targetSelector, count) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  target.innerHTML = Array.from({ length: count }, () => `<div class="skeleton-card"></div>`).join("");
}

function renderError(targetSelector, title, error, retry) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  const retryName = registerRetry(retry);
  target.innerHTML = errorMarkup(title, error, retryName);
  wireRetryButtons();
  createIcons();
}

const retryRegistry = new Map([
  ["loadHero", loadHero],
  ["loadGenres", loadGenres],
]);

function registerRetry(callback) {
  const name = `retry_${Math.random().toString(36).slice(2)}`;
  retryRegistry.set(name, callback);
  return name;
}

function wireRetryButtons() {
  document.querySelectorAll("[data-retry]").forEach((button) => {
    button.addEventListener("click", () => {
      const callback = retryRegistry.get(button.dataset.retry);
      if (callback) callback();
    }, { once: true });
  });
}

function emptyMarkup(title, message) {
  return `
    <div class="empty-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function errorMarkup(title, error, retryName) {
  return `
    <div class="error-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(error.message || "Terjadi kendala saat mengambil data.")}</p>
      <button class="ghost-button" type="button" data-retry="${escapeAttribute(retryName)}">
        <i data-lucide="refresh-cw"></i>
        Retry
      </button>
    </div>
  `;
}

function bindNavigation() {
  window.addEventListener("scroll", () => {
    selectors.navbar.classList.toggle("scrolled", window.scrollY > 12);
  }, { passive: true });

  selectors.menuButton.addEventListener("click", () => {
    const isOpen = selectors.navLinks.classList.toggle("open");
    selectors.menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  selectors.navLinks.addEventListener("click", (event) => {
    const link = event.target.closest(".nav-link");
    if (!link) return;
    selectors.navLinks.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
    selectors.navLinks.classList.remove("open");
  });
}

function bindHeroControls() {
  selectors.heroPrev.addEventListener("click", () => {
    setHeroIndex(state.heroIndex - 1);
    startHeroAutoplay();
  });

  selectors.heroNext.addEventListener("click", () => {
    setHeroIndex(state.heroIndex + 1);
    startHeroAutoplay();
  });

  selectors.heroDots.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-hero-dot]");
    if (!dot) return;
    setHeroIndex(Number(dot.dataset.heroDot));
    startHeroAutoplay();
  });
}

function bindPopularTabs() {
  selectors.popularTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-filter]");
    if (!tab) return;

    selectors.popularTabs.querySelectorAll(".tab").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });

    loadPopular(tab.dataset.filter);
  });
}

function bindSearch() {
  selectors.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    performSearch(selectors.searchInput.value.trim());
  });

  selectors.searchInput.addEventListener("input", () => {
    window.clearTimeout(state.searchTimer);
    const query = selectors.searchInput.value.trim();
    if (!query) {
      closeSearch();
      return;
    }
    state.searchTimer = window.setTimeout(() => performSearch(query), 420);
  });

  selectors.searchClear.addEventListener("click", () => {
    selectors.searchInput.value = "";
    closeSearch();
    selectors.searchInput.focus();
  });
}

async function performSearch(query) {
  if (!query) return;
  selectors.searchPanel.hidden = false;
  selectors.searchPanel.classList.add("visible");
  selectors.searchResults.innerHTML = Array.from({ length: 4 }, () => `<div class="skeleton-card"></div>`).join("");

  try {
    const data = await apiGet(endpoints.search(query));
    const items = normalizeList(data);
    renderCards("[data-search-results]", items, {
      emptyTitle: "Tidak ada hasil",
    });
    if (!items.length) {
      selectors.searchResults.innerHTML = emptyMarkup("Tidak ada hasil", `Belum ada donghua yang cocok dengan "${query}".`);
    }
  } catch (error) {
    renderError("[data-search-results]", "Search gagal dimuat", error, () => performSearch(query));
  }
}

function closeSearch() {
  selectors.searchPanel.hidden = true;
  selectors.searchResults.innerHTML = "";
}

function setupRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -80px" });

  document.querySelectorAll(".reveal-3d").forEach((element) => observer.observe(element));
}

function createIcons() {
  if (window.lucide) {
    window.lucide.createIcons({ attrs: { "stroke-width": 2 } });
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value || "#");
}
