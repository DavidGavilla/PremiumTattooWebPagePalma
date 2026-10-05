// Pure HTML renderers. Used at build time (vite.config.ts pre-renders Spanish)
// and in the browser (main.ts re-renders on language change). No DOM access here.
import { artists, faqs, openingHours, reviews, studio, works, type Artist, type ArtistId, type Lang, type Work } from './data/content.ts';
import manifest from './data/image-manifest.json';
import { strings, type Strings } from './i18n.ts';

interface ImageEntry {
  readonly width: number;
  readonly height: number;
  readonly widths: readonly number[];
  /** Dominant colour, painted behind the image while it loads. */
  readonly color: string;
}

interface ImageOptions {
  readonly alt: string;
  readonly sizes: string;
  readonly eager?: boolean;
  /** 'high' for the LCP image; 'low' for eager images that must not compete with it. */
  readonly priority?: 'high' | 'low';
  readonly className?: string;
}

const images: Readonly<Record<string, ImageEntry>> = manifest;
const SECTION_IDS = { works: 'trabajos', artists: 'artistas', studio: 'estudio', booking: 'cita', faq: 'preguntas', contact: 'contacto' } as const;
const LOGO_IMAGE = 'logo-premium-tattoo-perfil';
const MAP_IMAGE = 'mapa-plaza-sant-antoni';
const HERO_IMAGE = 'steven-enriquez-aguila-realismo';
/** Gallery pieces loaded eagerly (first rows on every breakpoint). */
const EAGER_WORKS = 6;
/** Pieces shown on mobile before "show more"; keep in sync with style.css. */
export const MOBILE_INITIAL_WORKS = 6;
/** Gallery tile widths: 4 columns >=1100px (~300px), 3 columns >=700px, 2 below. */
const GALLERY_SIZES = '(min-width: 1100px) 300px, (min-width: 700px) 30vw, 46vw';
const OSM_COPYRIGHT_URL = 'https://www.openstreetmap.org/copyright';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const e = escapeHtml;

function imageUrl(name: string, width: number): string {
  return `/images/${name}-${width}.webp`;
}

export function responsiveImage(name: string, opts: ImageOptions): string {
  const entry = images[name];
  if (!entry) throw new Error(`Image not found in manifest: ${name}`);
  const largest = entry.widths[entry.widths.length - 1];
  const fallback = entry.widths.find((w) => w >= 960) ?? largest;
  const srcset = entry.widths.map((w) => `${imageUrl(name, w)} ${w}w`).join(', ');
  const loading = opts.eager ? `loading="eager"${opts.priority ? ` fetchpriority="${opts.priority}"` : ''}` : 'loading="lazy"';
  const cls = opts.className ? ` class="${opts.className}"` : '';
  // Placeholder: the photo's dominant colour behind the real image (no blur).
  const style = `background-color:${entry.color}`;
  return `<img${cls} src="${imageUrl(name, fallback)}" srcset="${srcset}" sizes="${opts.sizes}" width="${entry.width}" height="${entry.height}" alt="${e(opts.alt)}" ${loading} decoding="async" style="${style}">`;
}

function formatDate(isoDate: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', { dateStyle: 'long', timeZone: 'Europe/Madrid' }).format(new Date(`${isoDate}T12:00:00Z`));
}

function workAlt(image: string, lang: Lang): string {
  return works.find((w) => w.image === image)?.alt[lang] ?? '';
}

function stars(value: number, label: string): string {
  // Visual stars; the numeric value is announced through the label.
  const pct = Math.round((value / 5) * 100);
  return `<span class="stars" role="img" aria-label="${e(label)}"><span class="stars__fill" style="width:${pct}%" aria-hidden="true">★★★★★</span><span aria-hidden="true">★★★★★</span></span>`;
}

function externalLink(href: string, label: string, t: Strings, className = ''): string {
  const cls = className ? ` class="${className}"` : '';
  return `<a${cls} href="${href}" target="_blank" rel="noopener noreferrer">${label}<span class="visually-hidden"> ${e(t.newTab)}</span></a>`;
}

const ARROW = ' <span aria-hidden="true">↗</span>';

function artistName(id: ArtistId | null, t: Strings): string {
  return artists.find((a) => a.id === id)?.name ?? t.works.studioCredit;
}

function renderHeader(lang: Lang, t: Strings): string {
  const otherLang: Lang = lang === 'es' ? 'en' : 'es';
  const links = (Object.keys(SECTION_IDS) as (keyof typeof SECTION_IDS)[])
    .map((key) => `<li><a href="#${SECTION_IDS[key]}">${e(t.nav[key])}</a></li>`)
    .join('');
  return `
<header class="site-header" data-header>
  <div class="site-header__inner">
    <a class="brand" href="#inicio" aria-label="${e(t.home)}">
      ${responsiveImage(LOGO_IMAGE, { alt: '', sizes: '44px', eager: true, className: 'brand__logo' })}
      <span class="brand__name" aria-hidden="true" translate="no">Premium <span>Tattoo</span></span>
    </a>
    <nav class="site-nav" id="site-nav" aria-label="${e(t.navLabel)}" data-nav>
      <ul class="site-nav__list">${links}</ul>
      <div class="site-nav__contact">
        ${externalLink(studio.instagramDmUrl, e(t.contact.write), t, 'button button--primary')}
        <a class="button button--ghost" href="${studio.phoneHref}">${e(t.booking.call)}</a>
      </div>
    </nav>
    <div class="site-header__actions">
      <a class="lang-switch" href="${t.langSwitch.href}" hreflang="${otherLang}" lang="${otherLang}" data-lang-switch="${otherLang}">${t.langSwitch.label}<span class="visually-hidden">, ${e(t.langSwitch.aria)}</span></a>
      <a class="button button--primary button--small header-cta" href="#${SECTION_IDS.booking}">${e(t.cta)}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-toggle>
        <span class="menu-toggle__bars" aria-hidden="true"></span>
        <span class="visually-hidden" data-menu-label>${e(t.menu)}</span>
      </button>
    </div>
  </div>
</header>`;
}

function renderHero(lang: Lang, t: Strings): string {
  return `
<section class="hero" id="inicio" aria-labelledby="hero-title">
  <div class="hero__copy">
    <p class="eyebrow">${e(t.hero.eyebrow)}</p>
    <h1 class="hero__title" id="hero-title">${e(t.hero.title)}</h1>
    <p class="hero__sub">${e(t.hero.sub)}</p>
    <div class="hero__actions">
      <a class="button button--primary" href="#${SECTION_IDS.works}">${e(t.hero.works)}</a>
      <a class="button button--ghost" href="#${SECTION_IDS.booking}">${e(t.hero.idea)}</a>
    </div>
  </div>
  <figure class="hero__media">
    ${responsiveImage(HERO_IMAGE, { alt: workAlt(HERO_IMAGE, lang), sizes: '(min-width: 900px) 46vw, 100vw', eager: true, priority: 'high' })}
    <figcaption>${e(t.hero.caption)}</figcaption>
  </figure>
</section>`;
}

function renderWorks(lang: Lang, t: Strings): string {
  const filters = [
    `<button type="button" class="chip" aria-pressed="true" data-filter="all">${e(t.works.all)}</button>`,
    ...artists.map((a) => `<button type="button" class="chip" aria-pressed="false" data-filter="${a.id}" translate="no">${e(a.name)}</button>`),
  ].join('');
  const extra = Math.max(0, works.length - MOBILE_INITIAL_WORKS);
  const items = works
    .map((work: Work, index) => `
      <li class="work" style="view-transition-name:work-${index}" data-artist="${work.artist ?? 'studio'}"${index >= MOBILE_INITIAL_WORKS ? ' data-extra' : ''}>
        <button type="button" class="work__open" data-open-work="${index}" aria-label="${e(`${t.works.open}: ${work.title[lang]}`)}">
          ${responsiveImage(work.image, { alt: work.alt[lang], sizes: GALLERY_SIZES, eager: index < EAGER_WORKS, priority: index < EAGER_WORKS ? 'low' : undefined })}
        </button>
        <p class="work__caption"><span class="work__title">${e(work.title[lang])}</span><span class="work__credit" translate="no">${e(artistName(work.artist, t))}</span></p>
      </li>`)
    .join('');
  return `
<section class="section works" id="${SECTION_IDS.works}" aria-labelledby="works-title">
  <div class="section__head">
    <h2 class="section__title" id="works-title">${e(t.works.title)}</h2>
    <p class="section__intro">${e(t.works.intro)}</p>
  </div>
  <div class="filters" role="group" aria-label="${e(t.works.filterLabel)}">${filters}</div>
  <p class="visually-hidden" role="status" data-filter-status></p>
  <ul class="works__grid" id="works-grid" data-works data-active-filter="all">${items}</ul>
  <p class="works__empty" data-works-empty hidden>${e(t.works.empty)}</p>
  <div class="works__footer">
    ${extra > 0 ? `<button type="button" class="button button--ghost works__show-more" aria-controls="works-grid" aria-expanded="false" data-show-more>${e(t.works.showMore(extra))}</button>` : ''}
    ${externalLink(studio.instagramUrl, `${e(t.works.more)}${ARROW}`, t, 'text-link')}
  </div>
</section>
<dialog class="lightbox" aria-label="${e(t.lightbox.label)}" data-lightbox>
  <div class="lightbox__frame">
    <figure class="lightbox__figure">
      <div class="lightbox__media" data-lightbox-media></div>
      <figcaption class="lightbox__caption">
        <span class="visually-hidden" data-lightbox-position></span>
        <span class="lightbox__title" data-lightbox-title></span>
        <span class="lightbox__credit" data-lightbox-credit></span>
        <a class="text-link" href="${studio.instagramUrl}" data-lightbox-source target="_blank" rel="noopener noreferrer">${e(t.lightbox.source)}<span class="visually-hidden"> ${e(t.newTab)}</span></a>
      </figcaption>
    </figure>
    <button type="button" class="lightbox__nav lightbox__nav--prev" data-lightbox-prev aria-label="${e(t.lightbox.prev)}"><span aria-hidden="true">←</span></button>
    <button type="button" class="lightbox__nav lightbox__nav--next" data-lightbox-next aria-label="${e(t.lightbox.next)}"><span aria-hidden="true">→</span></button>
    <button type="button" class="lightbox__close" data-lightbox-close aria-label="${e(t.lightbox.close)}"><span aria-hidden="true">×</span></button>
  </div>
</dialog>`;
}

function renderArtist(artist: Artist, lang: Lang, t: Strings): string {
  return `
    <li class="artist" data-reveal>
      <div class="artist__media">
        ${responsiveImage(artist.image, { alt: artist.imageAlt[lang], sizes: '(min-width: 1000px) 420px, (min-width: 700px) 45vw, 100vw' })}
      </div>
      <div class="artist__body">
        <p class="artist__role">${e(artist.role[lang])}</p>
        <h3 class="artist__name" translate="no">${e(artist.name)}</h3>
        <p class="artist__styles">${e(artist.styles[lang])}</p>
        <p class="artist__bio">${e(artist.bio[lang])}</p>
        <div class="artist__links">
          <a class="button button--ghost button--small" href="#${SECTION_IDS.works}" data-show-artist="${artist.id}">${e(t.artists.seeWork)}</a>
          ${externalLink(artist.instagram, `${e(artist.handle)}${ARROW}`, t, 'text-link')}
        </div>
      </div>
    </li>`;
}

function renderArtists(lang: Lang, t: Strings): string {
  return `
<section class="section artists" id="${SECTION_IDS.artists}" aria-labelledby="artists-title">
  <div class="section__head">
    <h2 class="section__title" id="artists-title">${e(t.artists.title)}</h2>
    <p class="section__intro">${e(t.artists.intro)}</p>
  </div>
  <ul class="artists__list">${artists.map((a) => renderArtist(a, lang, t)).join('')}</ul>
</section>`;
}

function renderStudio(t: Strings): string {
  const facts = t.studio.facts.map((f) => `<div><dt>${e(f.label)}</dt><dd>${e(f.value)}</dd></div>`).join('');
  // TODO(studio photos): add a real photo of the premises (facade, room) once the studio provides it.
  return `
<section class="section studio" id="${SECTION_IDS.studio}" aria-labelledby="studio-title">
  <figure class="studio__map" data-reveal>
    <a class="studio__map-link" href="${studio.mapsUrl}" target="_blank" rel="noopener noreferrer">
      ${responsiveImage(MAP_IMAGE, { alt: t.studio.mapAlt, sizes: '(min-width: 900px) 560px, 100vw' })}
      <span class="studio__map-cta">${e(t.studio.maps)}${ARROW}<span class="visually-hidden"> ${e(t.newTab)}</span></span>
    </a>
    <figcaption>${externalLink(OSM_COPYRIGHT_URL, e(t.studio.mapCredit), t, 'studio__map-credit')}</figcaption>
  </figure>
  <div class="studio__body">
    <h2 class="section__title" id="studio-title">${e(t.studio.title)}</h2>
    <p class="studio__text">${e(t.studio.text)}</p>
    <dl class="facts">${facts}</dl>
  </div>
</section>`;
}

function renderField(id: string, label: string, control: string, help?: string, optionalLabel?: string): string {
  const helpHtml = help ? `<p class="field__help" id="${id}-help">${e(help)}</p>` : '';
  const optional = optionalLabel ? ` <span class="field__optional">(${e(optionalLabel)})</span>` : '';
  return `
      <div class="field" data-field="${id}">
        <label class="field__label" for="${id}">${e(label)}${optional}</label>
        ${control}
        ${helpHtml}
        <p class="field__error" id="${id}-error" data-error-for="${id}" hidden></p>
      </div>`;
}

function renderBooking(t: Strings): string {
  const b = t.booking;
  const f = b.fields;
  const steps = b.steps.map((s) => `<li><h3>${e(s.title)}</h3><p>${e(s.text)}</p></li>`).join('');
  const artistOptions = [`<option value="">${e(f.artistAny)}</option>`, ...artists.map((a) => `<option value="${e(a.name)}">${e(a.name)}</option>`)].join('');
  const sizeOptions = [`<option value="" disabled selected>${e(f.sizePlaceholder)}</option>`, ...f.sizes.map((s) => `<option>${e(s)}</option>`)].join('');
  return `
<section class="section booking" id="${SECTION_IDS.booking}" aria-labelledby="booking-title">
  <div class="booking__intro">
    <h2 class="section__title" id="booking-title">${e(b.title)}</h2>
    <p class="section__intro">${e(b.intro)}</p>
    <ol class="steps">${steps}</ol>
    <div class="booking__direct">
      ${externalLink(studio.instagramDmUrl, e(t.contact.write), t, 'button button--primary')}
      <a class="button button--ghost" href="${studio.phoneHref}">${e(b.call)}</a>
    </div>
  </div>
  <div class="booking__panel">
    <h3 class="booking__form-title">${e(b.formTitle)}</h3>
    <p class="booking__form-intro">${e(b.formIntro)}</p>
    <p class="form-error" role="alert" data-form-error hidden>${e(b.errorSummary)}</p>
    <form class="consult-form" novalidate data-consult-form>
      ${renderField('c-idea', f.idea, `<textarea id="c-idea" name="idea" rows="4" required aria-describedby="c-idea-help" autocomplete="off"></textarea>`, f.ideaHelp)}
      ${renderField('c-artist', f.artist, `<select id="c-artist" name="artist">${artistOptions}</select>`)}
      ${renderField('c-size', f.size, `<select id="c-size" name="size" required>${sizeOptions}</select>`)}
      ${renderField('c-zone', f.zone, `<input id="c-zone" name="zone" type="text" required aria-describedby="c-zone-help" autocomplete="off">`, f.zoneHelp)}
      ${renderField('c-dates', f.dates, `<input id="c-dates" name="dates" type="text" aria-describedby="c-dates-help" autocomplete="off">`, f.datesHelp, f.optional)}
      <button class="button button--primary button--block" type="submit">${e(b.submit)}</button>
    </form>
    <div class="consult-result" data-consult-result hidden>
      <label class="field__label" for="c-message">${e(b.previewTitle)}</label>
      <p class="field__help" id="c-message-help">${e(b.previewHelp)}</p>
      <textarea id="c-message" rows="8" readonly aria-describedby="c-message-help" data-consult-message></textarea>
      <div class="consult-result__actions">
        <button class="button button--primary" type="button" data-copy-message>${e(b.copy)}</button>
        ${externalLink(studio.instagramDmUrl, e(b.openInstagram), t, 'button button--ghost')}
      </div>
      <p class="consult-result__status" role="status" data-copy-status></p>
      <p class="consult-result__reminder">${e(b.reminder)}</p>
    </div>
  </div>
</section>`;
}

function renderFaq(lang: Lang, t: Strings): string {
  const items = faqs.map((f) => `<details class="faq__item"><summary>${e(f.q[lang])}</summary><p>${e(f.a[lang])}</p></details>`).join('');
  return `
<section class="section faq" id="${SECTION_IDS.faq}" aria-labelledby="faq-title">
  <h2 class="section__title" id="faq-title">${e(t.faq.title)}</h2>
  <div class="faq__list">${items}</div>
</section>`;
}

function renderReviews(lang: Lang, t: Strings): string {
  const rating = lang === 'es' ? studio.googleRating.value : studio.googleRating.valueEn;
  const published = reviews.filter((r) => r.approved);
  const quotes = published
    .map((r) => {
      const translated = r.original !== lang;
      const text = translated ? r.translation : r.text;
      const note = translated ? `<span class="review__note">${e(t.reviews.translated)}</span>` : '';
      return `<figure class="review">${stars(r.rating, t.reviews.stars(String(r.rating)))}<blockquote><p>“${e(text)}”</p></blockquote><figcaption>${e(r.author)}, ${e(r.when[lang])}${note}</figcaption></figure>`;
    })
    .join('');
  return `
<section class="section reviews" id="opiniones" aria-labelledby="reviews-title">
  <div class="reviews__head">
    <h2 class="section__title" id="reviews-title">${e(t.reviews.title)}</h2>
    <p class="reviews__score"><span class="reviews__value">${e(rating)}</span>${stars(Number(studio.googleRating.valueEn), t.reviews.stars(rating))}</p>
    <p class="reviews__rating">${e(t.reviews.rating(rating, studio.googleRating.count))}</p>
    <p class="reviews__checked">${e(t.reviews.checked(formatDate(studio.googleRating.checkedOn, lang)))}</p>
    ${externalLink(studio.mapsUrl, `${e(t.reviews.all)}${ARROW}`, t, 'text-link')}
  </div>
  <div class="reviews__list" data-count="${published.length}">${quotes}</div>
</section>`;
}

function renderContact(lang: Lang, t: Strings): string {
  const c = t.contact;
  const hours = openingHours
    .map((h) => `<tr><th scope="row">${e(h.days[lang])}</th><td>${h.opens} ${e(c.to)} ${h.closes}</td></tr>`)
    .join('');
  return `
<section class="section contact" id="${SECTION_IDS.contact}" aria-labelledby="contact-title">
  <h2 class="section__title" id="contact-title">${e(c.title)}</h2>
  <div class="contact__grid">
    <div class="contact__block">
      <h3>${e(c.address)}</h3>
      <address>${e(studio.street)}<br>${studio.postalCode} ${e(studio.locality)}, ${e(studio.region)}</address>
      <p class="contact__links">
        ${externalLink(studio.mapsUrl, `${e(c.openMaps)}${ARROW}`, t, 'text-link')}
        ${externalLink(studio.directionsUrl, `${e(c.directions)}${ARROW}`, t, 'text-link')}
      </p>
    </div>
    <div class="contact__block">
      <h3>${e(c.hours)}</h3>
      <table class="hours"><tbody>${hours}</tbody></table>
    </div>
    <div class="contact__block">
      <h3>${e(c.instagram)}</h3>
      <p>${externalLink(studio.instagramUrl, e(studio.instagramHandle), t, 'contact__big')}</p>
      <h3>${e(c.phone)}</h3>
      <p><a class="contact__big" href="${studio.phoneHref}">${e(studio.phoneDisplay)}</a></p>
    </div>
  </div>
</section>`;
}

function renderFooter(lang: Lang, t: Strings): string {
  const f = t.footer;
  const nav = (Object.keys(SECTION_IDS) as (keyof typeof SECTION_IDS)[])
    .map((key) => `<li><a href="#${SECTION_IDS[key]}">${e(t.nav[key])}</a></li>`)
    .join('');
  const artistLinks = artists
    .map((a) => `<li>${externalLink(a.instagram, `<span translate="no">${e(a.name)}</span> <span class="site-footer__handle">${e(a.handle)}</span>`, t)}</li>`)
    .join('');
  const legalQuery = lang === 'en' ? '?lang=en' : '';
  return `
<footer class="site-footer">
  <div class="site-footer__grid">
    <div class="site-footer__col">
      <p class="site-footer__brand" translate="no">Premium Tattoo</p>
      <address>${e(studio.street)}<br>${studio.postalCode} ${e(studio.locality)}</address>
    </div>
    <nav class="site-footer__col" aria-label="${e(f.navTitle)}">
      <h2 class="site-footer__title">${e(f.navTitle)}</h2>
      <ul>${nav}</ul>
    </nav>
    <div class="site-footer__col">
      <h2 class="site-footer__title">${e(f.artistsTitle)}</h2>
      <ul>${artistLinks}</ul>
    </div>
    <div class="site-footer__col">
      <h2 class="site-footer__title">${e(f.contactTitle)}</h2>
      <ul>
        <li><a href="${studio.phoneHref}">${e(studio.phoneDisplay)}</a></li>
        <li>${externalLink(studio.instagramUrl, e(studio.instagramHandle), t)}</li>
      </ul>
    </div>
  </div>
  <div class="site-footer__bottom">
    <nav aria-label="${e(f.legalLabel)}">
      <ul class="site-footer__legal">
        <li><a href="/aviso-legal.html${legalQuery}">${e(f.legal.notice)}</a></li>
        <li><a href="/privacidad.html${legalQuery}">${e(f.legal.privacy)}</a></li>
        <li><a href="/cookies.html${legalQuery}">${e(f.legal.cookies)}</a></li>
      </ul>
    </nav>
    <p>${e(f.note)}</p>
    <p>© 2026 ${e(f.rights)}</p>
  </div>
</footer>
<nav class="quick-bar" aria-label="${e(t.quickBar)}" data-quick-bar>
  ${externalLink(studio.instagramDmUrl, e(t.contact.write), t, 'button button--primary')}
  <a class="button button--ghost" href="${studio.phoneHref}">${e(t.booking.call)}</a>
</nav>`;
}

export function renderApp(lang: Lang): string {
  const t = strings[lang];
  return `
<a class="skip-link" href="#main">${e(t.skip)}</a>
${renderHeader(lang, t)}
<main id="main" tabindex="-1">
  ${renderHero(lang, t)}
  ${renderWorks(lang, t)}
  ${renderArtists(lang, t)}
  ${renderStudio(t)}
  ${renderBooking(t)}
  ${renderFaq(lang, t)}
  ${renderReviews(lang, t)}
  ${renderContact(lang, t)}
</main>
${renderFooter(lang, t)}`;
}

export function renderJsonLd(): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'TattooParlor',
    name: studio.name,
    image: '/og-premium-tattoo.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: studio.street,
      postalCode: studio.postalCode,
      addressLocality: studio.locality,
      addressRegion: studio.region,
      addressCountry: studio.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: studio.latitude, longitude: studio.longitude },
    hasMap: studio.mapsUrl,
    telephone: studio.phoneHref.replace('tel:', ''),
    openingHoursSpecification: openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.schemaDays,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: [studio.instagramUrl],
    founder: { '@type': 'Person', name: 'Santino Bartoli', sameAs: 'https://www.instagram.com/santinobartoli/' },
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}
