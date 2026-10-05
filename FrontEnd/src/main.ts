import './style.css';
import { artists, works, type Lang } from './data/content.ts';
import { strings } from './i18n.ts';
import { renderApp, responsiveImage } from './render.ts';
import { setupConsultForm } from './consult.ts';

const LANG_KEY = 'premium-tattoo-lang';
const FILTER_PARAM = 'artista';
const SPANISH_LOCALES = ['es', 'ca'];
const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app container missing');
const root: HTMLDivElement = app;

let lang: Lang = 'es';
let lastLightboxTrigger: HTMLElement | null = null;
let lightboxOrder: number[] = [];
let lightboxPosition = 0;
const observers: IntersectionObserver[] = [];

function isLang(value: unknown): value is Lang {
  return value === 'es' || value === 'en';
}

function readStoredLang(): Lang | null {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    return isLang(stored) ? stored : null;
  } catch {
    return null;
  }
}

function storeLang(value: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, value);
  } catch {
    // Storage unavailable (private mode): the URL still carries the language.
  }
}

function browserLang(): Lang {
  const preferred = navigator.languages?.[0] ?? navigator.language ?? 'es';
  return SPANISH_LOCALES.some((code) => preferred.toLowerCase().startsWith(code)) ? 'es' : 'en';
}

function initialLang(): Lang {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  return readStoredLang() ?? browserLang();
}

function isFilter(value: string | null): value is string {
  return value === 'all' || artists.some((a) => a.id === value);
}

function syncFilterToUrl(filter: string): void {
  const url = new URL(location.href);
  if (filter === 'all') url.searchParams.delete(FILTER_PARAM);
  else url.searchParams.set(FILTER_PARAM, filter);
  history.replaceState(null, '', url);
}

function setMeta(selector: string, value: string): void {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value);
}

function applyDocumentLang(): void {
  const t = strings[lang];
  document.documentElement.lang = lang;
  document.title = t.meta.title;
  setMeta('meta[name="description"]', t.meta.description);
  setMeta('meta[property="og:title"]', t.meta.title);
  setMeta('meta[property="og:locale"]', lang === 'es' ? 'es_ES' : 'en_GB');
}

// ---------- Mobile menu ----------
function setMenu(open: boolean): void {
  const header = root.querySelector<HTMLElement>('[data-header]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const label = root.querySelector<HTMLElement>('[data-menu-label]');
  if (!header || !toggle || !label) return;
  header.toggleAttribute('data-menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  label.textContent = open ? strings[lang].closeMenu : strings[lang].menu;
  document.body.classList.toggle('menu-open', open);
}

// ---------- Portfolio filter ----------
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Runs a DOM update inside a View Transition when supported (Chrome, Safari 18+),
 *  otherwise instantly. Skipped under reduced motion. */
function withTransition(update: () => void): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !prefersReducedMotion()) doc.startViewTransition(update);
  else update();
}

function updateFilter(filter: string): void {
  const grid = root.querySelector<HTMLElement>('[data-works]');
  const items = [...root.querySelectorAll<HTMLLIElement>('[data-works] > li')];
  let visible = 0;
  for (const item of items) {
    const show = filter === 'all' || item.dataset.artist === filter;
    item.hidden = !show;
    if (show) visible += 1;
  }
  if (grid) grid.dataset.activeFilter = filter;
  for (const chip of root.querySelectorAll<HTMLButtonElement>('button[data-filter]')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter));
  }
  const empty = root.querySelector<HTMLElement>('[data-works-empty]');
  if (empty) empty.hidden = visible > 0;
  const status = root.querySelector<HTMLElement>('[data-filter-status]');
  if (status) status.textContent = strings[lang].works.shown(visible);
}

function applyFilter(filter: string, sync = true): void {
  if (sync) syncFilterToUrl(filter);
  withTransition(() => updateFilter(filter));
}

/** Mobile shows the first pieces only; this reveals the rest and moves focus to the first new one. */
function showMoreWorks(button: HTMLButtonElement): void {
  const grid = root.querySelector<HTMLElement>('[data-works]');
  if (!grid) return;
  withTransition(() => grid.toggleAttribute('data-expanded', true));
  button.setAttribute('aria-expanded', 'true');
  button.hidden = true;
  grid.querySelector<HTMLElement>('[data-extra]:not([hidden]) [data-open-work]')?.focus();
}

// ---------- Lightbox ----------
function visibleWorkIndexes(): number[] {
  return [...root.querySelectorAll<HTMLLIElement>('[data-works] > li')]
    .filter((li) => !li.hidden)
    .map((li) => Number(li.querySelector<HTMLElement>('[data-open-work]')?.dataset.openWork));
}

function showLightboxItem(position: number): void {
  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!dialog || lightboxOrder.length === 0) return;
  const count = lightboxOrder.length;
  lightboxPosition = (position + count) % count;
  const work = works[lightboxOrder[lightboxPosition]];
  const t = strings[lang];
  const media = dialog.querySelector<HTMLElement>('[data-lightbox-media]');
  const title = dialog.querySelector<HTMLElement>('[data-lightbox-title]');
  const credit = dialog.querySelector<HTMLElement>('[data-lightbox-credit]');
  const source = dialog.querySelector<HTMLAnchorElement>('[data-lightbox-source]');
  const pos = dialog.querySelector<HTMLElement>('[data-lightbox-position]');
  if (media) media.innerHTML = responsiveImage(work.image, { alt: work.alt[lang], sizes: '(min-width: 900px) 70vw, 100vw', eager: true });
  if (title) title.textContent = work.title[lang];
  if (credit) credit.textContent = artists.find((a) => a.id === work.artist)?.name ?? t.works.studioCredit;
  if (source) source.href = work.source;
  if (pos) pos.textContent = t.lightbox.position(lightboxPosition + 1, count);
  const single = count < 2;
  dialog.querySelectorAll<HTMLButtonElement>('[data-lightbox-prev], [data-lightbox-next]').forEach((b) => (b.hidden = single));
}

function openLightbox(index: number, trigger: HTMLElement): void {
  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!dialog) return;
  lightboxOrder = visibleWorkIndexes();
  lastLightboxTrigger = trigger;
  showLightboxItem(Math.max(0, lightboxOrder.indexOf(index)));
  dialog.showModal();
  dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]')?.focus();
}

function closeLightbox(): void {
  root.querySelector<HTMLDialogElement>('[data-lightbox]')?.close();
}

function bindLightboxDialog(): void {
  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!dialog) return;
  dialog.addEventListener('close', () => {
    lastLightboxTrigger?.focus();
    lastLightboxTrigger = null;
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') showLightboxItem(lightboxPosition + 1);
    if (event.key === 'ArrowLeft') showLightboxItem(lightboxPosition - 1);
  });
  // Clicking the empty area around the image (dialog or frame itself) closes it.
  const frame = dialog.querySelector('.lightbox__frame');
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target === frame) closeLightbox();
  });
}

// ---------- Header state ----------
function disconnectObservers(): void {
  observers.splice(0).forEach((o) => o.disconnect());
}

// Entrance animations are pure CSS (scroll-driven, see style.css): content is
// never hidden by script, so anchor jumps and screenshots always show it.
function observeHeader(): void {
  const header = root.querySelector<HTMLElement>('[data-header]');
  const hero = root.querySelector<HTMLElement>('.hero');
  if (!header || !hero) return;
  const quickBar = root.querySelector<HTMLElement>('[data-quick-bar]');
  // Same signal drives the solid header and the mobile quick-contact bar (shown after the hero).
  const headerState = new IntersectionObserver(
    ([entry]) => {
      const pastHero = !entry.isIntersecting;
      header.toggleAttribute('data-scrolled', pastHero);
      quickBar?.toggleAttribute('data-visible', pastHero);
    },
    { rootMargin: '-72px 0px 0px 0px', threshold: 0.6 },
  );
  headerState.observe(hero);
  observers.push(headerState);
}

// ---------- Rendering ----------
function render(): void {
  disconnectObservers();
  root.innerHTML = renderApp(lang);
  afterRender();
}

function afterRender(): void {
  applyDocumentLang();
  bindLightboxDialog();
  setupConsultForm(root, lang);
  observeHeader();
  const filter = new URLSearchParams(location.search).get(FILTER_PARAM);
  if (isFilter(filter) && filter !== 'all') applyFilter(filter, false);
}

function switchLang(next: Lang): void {
  if (next === lang) return;
  setMenu(false);
  lang = next;
  storeLang(next);
  const url = new URL(location.href);
  url.searchParams.set('lang', next);
  history.replaceState(null, '', url);
  render();
  root.querySelector<HTMLElement>('[data-lang-switch]')?.focus();
}

// One delegated listener survives re-renders.
root.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  const langLink = target.closest<HTMLAnchorElement>('[data-lang-switch]');
  if (langLink) {
    event.preventDefault();
    const next = langLink.dataset.langSwitch;
    if (isLang(next)) switchLang(next);
    return;
  }
  if (target.closest('[data-menu-toggle]')) {
    setMenu(!root.querySelector('[data-header]')?.hasAttribute('data-menu-open'));
    return;
  }
  if (target.closest('[data-nav] a')) setMenu(false);

  const chip = target.closest<HTMLButtonElement>('button[data-filter]');
  if (chip?.dataset.filter) {
    applyFilter(chip.dataset.filter);
    return;
  }
  const more = target.closest<HTMLButtonElement>('[data-show-more]');
  if (more) {
    showMoreWorks(more);
    return;
  }
  const showArtist = target.closest<HTMLElement>('[data-show-artist]');
  if (showArtist?.dataset.showArtist) applyFilter(showArtist.dataset.showArtist);

  const workButton = target.closest<HTMLElement>('[data-open-work]');
  if (workButton) {
    openLightbox(Number(workButton.dataset.openWork), workButton);
    return;
  }
  if (target.closest('[data-lightbox-close]')) closeLightbox();
  if (target.closest('[data-lightbox-prev]')) showLightboxItem(lightboxPosition - 1);
  if (target.closest('[data-lightbox-next]')) showLightboxItem(lightboxPosition + 1);
});

// Hide the fixed quick bar while typing (mobile keyboards would push it over the fields).
root.addEventListener('focusin', (event) => {
  const typing = (event.target as HTMLElement).matches('input, textarea, select');
  document.body.classList.toggle('is-typing', typing);
});
root.addEventListener('focusout', () => document.body.classList.remove('is-typing'));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && root.querySelector('[data-header]')?.hasAttribute('data-menu-open')) {
    setMenu(false);
    root.querySelector<HTMLButtonElement>('[data-menu-toggle]')?.focus();
  }
});

window.matchMedia('(min-width: 960px)').addEventListener('change', (mq) => {
  if (mq.matches) setMenu(false);
});

document.documentElement.classList.add('js');
lang = initialLang();
if (lang === 'es') afterRender();
else render();
