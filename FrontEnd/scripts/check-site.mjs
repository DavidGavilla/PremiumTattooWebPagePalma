// End-to-end check with Playwright. Run `npm run dev` first, then `npm run check:e2e`.
// Never submits anything to external services: the consult form only builds text.
import { chromium, firefox, webkit } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.SITE_URL ?? 'http://localhost:5175/';
const OUT = path.resolve(import.meta.dirname, '..', 'screenshots');
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

async function newPage(browser, viewport, options = {}) {
  const context = await browser.newContext({ viewport, locale: 'es-ES', ...options });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') problems.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => problems.push(`requestfailed: ${req.url()}`));
  const externalPosts = [];
  page.on('request', (req) => {
    if (req.method() !== 'GET' && !req.url().startsWith(BASE)) externalPosts.push(req.url());
  });
  return { context, page, problems, externalPosts };
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

async function shoot(page, name, fullPage = false) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
}

async function revealAll(page) {
  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')));
}

async function scrollThrough(page, step) {
  await page.evaluate(async (s) => {
    for (let y = 0; y < document.body.scrollHeight; y += s) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  }, step);
  await page.waitForLoadState('networkidle');
}

async function desktopChecks(browser) {
  const { context, page, problems } = await newPage(browser, VIEWPORTS.desktop);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await shoot(page, 'desktop-hero');

  check('desktop: html lang es', (await page.getAttribute('html', 'lang')) === 'es');
  check('desktop: single h1', (await page.locator('h1').count()) === 1);
  check('desktop: nav on one line', await page.evaluate(() => {
    const items = [...document.querySelectorAll('.site-nav__list li')];
    return new Set(items.map((li) => Math.round(li.getBoundingClientRect().top))).size === 1;
  }));
  const ctaBox = await page.locator('.hero__actions').boundingBox();
  check('desktop: hero CTAs in first viewport', ctaBox !== null && ctaBox.y + ctaBox.height <= VIEWPORTS.desktop.height);
  check('desktop: no horizontal overflow', (await overflow(page)) <= 0);

  const missing = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h && h.length > 1 && !document.querySelector(h)),
  );
  check('desktop: internal anchors resolve', missing.length === 0, missing.join(', '));

  await revealAll(page);
  await scrollThrough(page, 700);
  // Force lazy images to load, then wait for each to settle before asserting.
  const broken = await page.evaluate(async () => {
    const imgs = [...document.images];
    imgs.forEach((i) => (i.loading = 'eager'));
    await Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
    return imgs.filter((i) => i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
  });
  check('desktop: all images load', broken.length === 0, broken.join(', '));
  const noAlt = await page.evaluate(() => [...document.images].filter((i) => !i.hasAttribute('alt')).length);
  check('desktop: all images have alt', noAlt === 0);
  const unsafe = await page.evaluate(() => [...document.querySelectorAll('a[target="_blank"]')].filter((a) => !a.rel.includes('noopener')).length);
  check('desktop: target=_blank links use noopener', unsafe === 0);

  await page.click('[data-filter="steven"]');
  await page.waitForTimeout(500);
  const visibleSteven = await page.locator('[data-works] > li:not([hidden])').count();
  check('desktop: filter Steven shows 5 works', visibleSteven === 5, String(visibleSteven));
  await page.locator('#trabajos').scrollIntoViewIfNeeded();
  await shoot(page, 'desktop-filter-steven');
  await page.click('[data-filter="all"]');
  await page.waitForTimeout(500);
  check('desktop: filter all shows 11 works', (await page.locator('[data-works] > li:not([hidden])').count()) === 11);

  const firstWork = page.locator('[data-open-work]').first();
  await firstWork.click();
  const dialog = page.locator('[data-lightbox]');
  check('desktop: lightbox opens', await dialog.evaluate((d) => d.open));
  const title1 = await page.locator('[data-lightbox-title]').textContent();
  await page.keyboard.press('ArrowRight');
  const title2 = await page.locator('[data-lightbox-title]').textContent();
  check('desktop: lightbox arrow navigation', title1 !== title2, `${title1} -> ${title2}`);
  await page.waitForTimeout(400);
  await shoot(page, 'desktop-lightbox');
  await page.keyboard.press('Escape');
  check('desktop: Escape closes lightbox', !(await dialog.evaluate((d) => d.open)));
  check('desktop: focus returns to trigger', await firstWork.evaluate((el) => el === document.activeElement));
  await firstWork.click();
  await page.mouse.click(200, 30);
  check('desktop: click outside image closes lightbox', !(await dialog.evaluate((d) => d.open)));

  await page.locator('#cita').scrollIntoViewIfNeeded();
  await page.click('[data-consult-form] button[type="submit"]');
  check('desktop: empty form shows errors', await page.locator('[data-form-error]').isVisible());
  check('desktop: invalid fields flagged', (await page.locator('[aria-invalid="true"]').count()) === 3);
  await page.locator('.booking__panel').scrollIntoViewIfNeeded();
  await shoot(page, 'desktop-form-errors');
  await page.fill('#c-idea', 'Prueba de diseño: rosa black & grey');
  await page.fill('#c-zone', 'Antebrazo');
  await page.selectOption('#c-size', { index: 2 });
  check('desktop: error summary clears once fields are fixed', await page.locator('[data-form-error]').isHidden());
  await page.click('[data-consult-form] button[type="submit"]');
  const message = await page.inputValue('[data-consult-message]');
  check('desktop: form builds message', message.includes('Antebrazo') && message.includes('rosa'));
  await page.locator('.consult-result').scrollIntoViewIfNeeded();
  await shoot(page, 'desktop-form-message');

  await page.click('[data-lang-switch]');
  check('desktop: switch to EN', (await page.getAttribute('html', 'lang')) === 'en' && (await page.locator('h1').textContent()).includes('Black & grey tattoos'));
  check('desktop: EN title', (await page.title()).includes('Tattoo studio'));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1400);
  await shoot(page, 'desktop-hero-en');
  await page.click('[data-lang-switch]');
  check('desktop: back to ES', (await page.getAttribute('html', 'lang')) === 'es');

  check('desktop: console clean', problems.length === 0, problems.join(' | '));
  await context.close();
}

async function fullPage(browser, viewport, name, url, extra = {}) {
  const { context, page } = await newPage(browser, viewport, { reducedMotion: 'reduce', ...extra });
  await page.goto(url, { waitUntil: 'networkidle' });
  await scrollThrough(page, 600);
  await shoot(page, name, true);
  await context.close();
}

async function mobileChecks(browser) {
  const { context, page, problems, externalPosts } = await newPage(browser, VIEWPORTS.mobile, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await shoot(page, 'mobile-hero');
  check('mobile: no horizontal overflow', (await overflow(page)) <= 0);
  const box = await page.locator('.hero__actions').boundingBox();
  check('mobile: hero CTAs in first viewport', box !== null && box.y + box.height <= VIEWPORTS.mobile.height, box ? `${Math.round(box.y + box.height)}px` : '');

  const small = await page.evaluate(() =>
    [...document.querySelectorAll('a, button, select, input, textarea, summary')]
      .filter((el) => el.offsetParent !== null && !el.classList.contains('skip-link'))
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && (r.height < 44 || r.width < 44))
      .map(({ el }) => `${el.tagName}.${el.className}:${(el.textContent || '').trim().slice(0, 20)}`),
  );
  check('mobile: touch targets >= 44px', small.length === 0, small.slice(0, 6).join(' | '));

  const toggle = page.locator('[data-menu-toggle]');
  await toggle.click();
  const navHeight = async () => (await page.locator('[data-nav]').boundingBox())?.height ?? 0;
  check('mobile: menu opens full height', (await toggle.getAttribute('aria-expanded')) === 'true' && (await navHeight()) > VIEWPORTS.mobile.height * 0.6, `${Math.round(await navHeight())}px`);
  await page.waitForTimeout(700);
  await shoot(page, 'mobile-menu');
  await page.keyboard.press('Escape');
  check('mobile: Escape closes menu', (await toggle.getAttribute('aria-expanded')) === 'false');
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(500);
  await toggle.click();
  check('mobile: menu full height after scrolling', (await navHeight()) > VIEWPORTS.mobile.height * 0.6, `${Math.round(await navHeight())}px`);
  await toggle.click();
  await toggle.click();
  await page.click('[data-lang-switch]');
  check('mobile: language switch with menu open unlocks scroll', !(await page.evaluate(() => document.body.classList.contains('menu-open'))));
  await page.click('[data-lang-switch]');
  await toggle.click();
  await page.click('[data-nav] a[href="#artistas"]');
  await page.waitForTimeout(900);
  check('mobile: menu link navigates and closes', (await toggle.getAttribute('aria-expanded')) === 'false' && (await page.evaluate(() => window.scrollY > 500)));

  const third = page.locator('[data-open-work]').nth(2);
  await third.scrollIntoViewIfNeeded();
  await third.click();
  await page.waitForTimeout(500);
  await shoot(page, 'mobile-lightbox');
  check('mobile: lightbox no overflow', (await overflow(page)) <= 0);
  await page.click('[data-lightbox-close]');

  await page.goto(`${BASE}?artista=marcos`, { waitUntil: 'networkidle' });
  check('mobile: ?artista=marcos deep-links filter', (await page.locator('[data-works] > li:not([hidden])').count()) === 2);

  await page.goto(`${BASE}?lang=en`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  check('mobile: ?lang=en renders English', (await page.getAttribute('html', 'lang')) === 'en');
  await shoot(page, 'mobile-hero-en');
  check('mobile: console clean', problems.length === 0, problems.join(' | '));
  check('no non-GET requests to external hosts', externalPosts.length === 0, externalPosts.join(', '));
  await context.close();
}

async function noJsCheck(browser) {
  const context = await browser.newContext({ viewport: VIEWPORTS.mobile, locale: 'es-ES', javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  const text = await page.locator('main').innerText();
  check('no-JS: prerendered content present', text.includes('Santino Bartoli') && text.includes('Plaça de Sant Antoni'));
  await context.close();
}

const SECTIONS = ['inicio', 'trabajos', 'artistas', 'estudio', 'cita', 'preguntas', 'opiniones', 'contacto'];
const RESPONSIVE = {
  desktop: { viewport: { width: 1440, height: 900 } },
  tablet: { viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  mobile375: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

async function waitScrollSettled(page) {
  await page.evaluate(() => new Promise((resolve) => {
    let last = -1;
    let stable = 0;
    const tick = () => {
      stable = window.scrollY === last ? stable + 1 : 0;
      last = window.scrollY;
      if (stable >= 6) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
}

// Anchor jumps must show content immediately (no script-gated reveal) and put
// the section title just under the fixed header.
async function anchorChecks(browser) {
  for (const [name, opts] of Object.entries({ desktop: RESPONSIVE.desktop, mobile: RESPONSIVE.mobile375 })) {
    const { context, page } = await newPage(browser, opts.viewport, opts);
    for (const id of ['trabajos', 'artistas', 'estudio', 'contacto']) {
      await page.goto(`${BASE}#${id}`, { waitUntil: 'load' });
      await waitScrollSettled(page);
      const info = await page.evaluate((sectionId) => {
        const visible = [...document.querySelectorAll('[data-reveal]')].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top >= 0 && r.bottom <= innerHeight;
        });
        const faint = visible.filter((el) => Number(getComputedStyle(el).opacity) < 0.95).length;
        // Where the section's content starts (title, or the photo that precedes it).
        const section = document.getElementById(sectionId);
        const contentTop = section ? section.getBoundingClientRect().top + parseFloat(getComputedStyle(section).paddingTop) : -1;
        const header = document.querySelector('[data-header]')?.getBoundingClientRect().height ?? 0;
        const atBottom = Math.ceil(window.scrollY + innerHeight) >= document.documentElement.scrollHeight - 2;
        return { faint, gap: Math.round(contentTop - header), atBottom };
      }, id);
      check(`${name}: #${id} content visible on load`, info.faint === 0, `${info.faint} faint`);
      check(`${name}: #${id} content starts just under header`, (info.gap >= 0 && info.gap <= 48) || (info.atBottom && info.gap >= 0), `${info.gap}px${info.atBottom ? ', end of page' : ''}`);
    }
    // In-page navigation from the menu (not a fresh load).
    await page.goto(BASE, { waitUntil: 'load' });
    if (name === 'mobile') await page.click('[data-menu-toggle]');
    await page.click('[data-nav] a[href="#artistas"]');
    await waitScrollSettled(page);
    const faint = await page.evaluate(() => [...document.querySelectorAll('#artistas [data-reveal]')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight && Number(getComputedStyle(el).opacity) < 0.95;
    }).length);
    check(`${name}: menu jump to Artistas shows content`, faint === 0, `${faint} faint`);
    await context.close();
  }
}

// Each gallery piece has its own photo, and the served file is big enough for the slot.
async function imageChecks(browser) {
  const { context, page } = await newPage(browser, RESPONSIVE.tablet.viewport, RESPONSIVE.tablet);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const files = await page.evaluate(() => [...document.querySelectorAll('[data-works] img')].map((i) => i.getAttribute('src')));
  check('gallery: every piece uses a different photo', new Set(files).size === files.length, `${new Set(files).size}/${files.length}`);
  const stem = (src) => (src ?? '').replace(/-\d+\.webp$/, '');
  const heroSrc = await page.getAttribute('.hero__media img', 'src');
  const eagleSrc = await page.evaluate(() => [...document.querySelectorAll('[data-works] li')].find((li) => li.textContent.includes('Águila'))?.querySelector('img')?.getAttribute('src'));
  check('gallery: eagle tile uses the hero eagle photo', stem(heroSrc) === stem(eagleSrc), `${stem(heroSrc)} vs ${stem(eagleSrc)}`);
  const eager = await page.evaluate(() => [...document.querySelectorAll('[data-works] img')].slice(0, 6).every((i) => i.loading === 'eager'));
  check('gallery: first 6 images load eagerly', eager);
  const placeholders = await page.evaluate(() => [...document.querySelectorAll('main img')].filter((i) => !i.style.backgroundColor || i.style.backgroundImage).length);
  check('images: dominant-colour placeholder, no blur', placeholders === 0, String(placeholders));
  const repeated = await page.evaluate(() => {
    const stem = (src) => (src ?? '').replace(/-\d+\.webp$/, '');
    const gallery = new Set([...document.querySelectorAll('[data-works] img')].map((i) => stem(i.getAttribute('src'))));
    return [...document.querySelectorAll('.artist__media img, .studio__map img')].map((i) => stem(i.getAttribute('src'))).filter((x) => gallery.has(x));
  });
  check('artists/studio: photos not repeated from the gallery', repeated.length === 0, repeated.join(', '));
  await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('main img')];
    imgs.forEach((i) => (i.loading = 'eager'));
    await Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
  });
  const undersized = await page.evaluate(() => [...document.querySelectorAll('[data-works] img, .artist__media img')]
    .map((i) => ({
      src: i.currentSrc.split('/').pop(),
      need: Math.round(i.clientWidth * devicePixelRatio),
      // With w-descriptors naturalWidth is density-corrected, so read the served file width.
      got: parseInt(i.currentSrc.match(/-(\d+)\.webp$/)?.[1] ?? '0', 10),
      max: Math.max(...i.srcset.split(',').map((x) => parseInt(x.trim().split(' ')[1], 10))),
    }))
    .filter((x) => x.got < x.need * 0.9 && x.got < x.max));
  check('images: srcset serves enough pixels at 2x (or the largest available)', undersized.length === 0, undersized.map((x) => `${x.src} ${x.got}<${x.need}`).join(', '));
  await context.close();
}

async function responsiveChecks(browser) {
  for (const [name, opts] of Object.entries({ tablet: RESPONSIVE.tablet, mobile375: RESPONSIVE.mobile375 })) {
    const { context, page, problems } = await newPage(browser, opts.viewport, opts);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await scrollThrough(page, 500);
    check(`${name}: no horizontal overflow`, (await overflow(page)) <= 0);
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('a, button, select, input, textarea, summary')]
        .filter((el) => el.offsetParent !== null && !el.classList.contains('skip-link') && !el.closest('dialog'))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && (r.height < 44 || r.width < 44))
        .map(({ el }) => `${el.tagName}.${el.className}:${(el.textContent || '').trim().slice(0, 18)}`),
    );
    check(`${name}: touch targets >= 44x44`, small.length === 0, small.slice(0, 5).join(' | '));
    const toggle = page.locator('[data-menu-toggle]');
    await page.evaluate(() => window.scrollTo(0, 0));
    await toggle.click();
    check(`${name}: menu opens`, (await toggle.getAttribute('aria-expanded')) === 'true');
    await page.waitForTimeout(600);
    await shoot(page, `${name}-menu`);
    await toggle.click();
    check(`${name}: console clean`, problems.length === 0, problems.join(' | '));
    await context.close();
  }
}

async function focusChecks(browser) {
  const { context, page } = await newPage(browser, VIEWPORTS.desktop);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const targets = ['.site-nav__list a', '[data-filter="santino"]', '.faq__item summary', '#c-idea', '#c-size', '.lang-switch'];
  for (const sel of targets) {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await el.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const ring = await el.evaluate((node) => {
      const cs = getComputedStyle(node);
      return document.activeElement === node && cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
    });
    check(`focus ring visible: ${sel}`, ring);
  }
  const faq = page.locator('.faq__item summary').first();
  await faq.press('Enter');
  check('faq: Enter toggles details', await page.locator('.faq__item').first().evaluate((d) => d.open));
  const langName = await page.locator('.lang-switch').evaluate((a) => a.textContent.trim());
  check('lang switch accessible name includes visible label', /^EN\b/.test(langName) && langName.length > 3, langName);
  const ext = await page.evaluate(() => [...document.querySelectorAll('a[target="_blank"]')].filter((a) => !a.textContent.trim().endsWith('(se abre en otra pestaña)')).length);
  check('external links announce new tab', ext === 0, String(ext));
  await context.close();
}

// Section-by-section screenshots for review.
async function sectionShots(browser) {
  for (const [name, opts] of Object.entries({ desktop: RESPONSIVE.desktop, mobile: RESPONSIVE.mobile375 })) {
    const { context, page } = await newPage(browser, opts.viewport, { ...opts, reducedMotion: 'reduce' });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await scrollThrough(page, 600);
    for (const id of SECTIONS) {
      // The fixed header would be painted over element screenshots; keep it only on the hero.
      await page.evaluate((show) => {
        document.querySelector('[data-header]').style.visibility = show ? '' : 'hidden';
        document.querySelector('[data-quick-bar]').style.visibility = 'hidden';
      }, id === 'inicio');
      const section = page.locator(id === 'opiniones' ? '.reviews' : `#${id}`);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await section.screenshot({ path: path.join(OUT, 'sections', `${name}-${id}.png`) });
    }
    await context.close();
  }
}

// Gallery structure, mobile "show more", quick bar, menu actions, legal pages, JSON-LD.
async function featureChecks(browser) {
  {
    const { context, page } = await newPage(browser, VIEWPORTS.desktop);
    await page.goto(BASE, { waitUntil: 'load' });
    const captions = await page.evaluate(() => [...document.querySelectorAll('.work__caption')].every((c) => {
      const [title, credit] = c.children;
      return title?.classList.contains('work__title') && credit?.classList.contains('work__credit') && credit.getBoundingClientRect().top > title.getBoundingClientRect().top;
    }));
    check('gallery: title above artist in every caption', captions);
    const before = await page.locator('#trabajos').evaluate((el) => el.getBoundingClientRect().height);
    await page.evaluate(async () => {
      const imgs = [...document.querySelectorAll('#trabajos img')];
      imgs.forEach((i) => (i.loading = 'eager'));
      await Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
    });
    const after = await page.locator('#trabajos').evaluate((el) => el.getBoundingClientRect().height);
    check('gallery: section height stable while images load (no CLS)', Math.abs(after - before) < 2, `${Math.round(before)} -> ${Math.round(after)}`);
    await page.click('button[data-filter="marcos"]');
    await page.waitForTimeout(500);
    const centred = await page.evaluate(() => {
      const grid = document.querySelector('[data-works]').getBoundingClientRect();
      const tiles = [...document.querySelectorAll('[data-works] > li:not([hidden])')].map((li) => li.getBoundingClientRect());
      const left = Math.min(...tiles.map((t) => t.left)) - grid.left;
      const right = grid.right - Math.max(...tiles.map((t) => t.right));
      return Math.abs(left - right) < 4;
    });
    check('gallery: few results are centred', centred);
    const ld = await page.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
    check('JSON-LD: TattooParlor with address, geo, hours, telephone', ld['@type'] === 'TattooParlor' && !!ld.address?.streetAddress && !!ld.geo?.latitude && ld.openingHoursSpecification?.length === 3 && ld.telephone === '+34683192892', ld.telephone);
    const footerLinks = await page.evaluate(() => [...document.querySelectorAll('.site-footer a')].map((a) => a.getAttribute('href')));
    check('footer: nav, artists, phone and legal links', ['#trabajos', 'tel:+34683192892', '/aviso-legal.html', '/privacidad.html', '/cookies.html'].every((h) => footerLinks.includes(h)) && footerLinks.filter((h) => h.includes('instagram.com/')).length >= 4);
    for (const legal of ['aviso-legal', 'privacidad', 'cookies']) {
      const res = await page.goto(`${BASE}${legal}.html`, { waitUntil: 'load' });
      const pending = await page.locator('.legal__pending').count();
      check(`legal page ${legal} served and marked pending`, res?.status() === 200 && pending === 1);
    }
    await context.close();
  }
  for (const [name, vp] of [['mobile390', { width: 390, height: 844 }], ['mobile375', { width: 375, height: 812 }]]) {
    const { context, page } = await newPage(browser, vp, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(BASE, { waitUntil: 'load' });
    const shown = await page.locator('[data-works] > li:visible').count();
    check(`${name}: gallery shows 6 pieces first`, shown === 6, String(shown));
    await page.locator('[data-show-more]').click();
    await page.waitForTimeout(500);
    check(`${name}: "show more" reveals all 11`, (await page.locator('[data-works] > li:visible').count()) === 11);
    const bar = page.locator('[data-quick-bar]');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const hiddenOnHero = await bar.evaluate((el) => el.getBoundingClientRect().top >= innerHeight - 1);
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(700);
    const shownAfter = await bar.evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight + 1);
    check(`${name}: quick bar hidden on hero, shown after`, hiddenOnHero && shownAfter);
    await shoot(page, `${name}-quick-bar`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click('[data-menu-toggle]');
    await page.waitForTimeout(500);
    const menuButtons = await page.locator('.site-nav__contact .button:visible').count();
    check(`${name}: menu has Instagram and call buttons`, menuButtons === 2);
    await page.click('[data-menu-toggle]');
    check(`${name}: no horizontal overflow`, (await overflow(page)) <= 0);
    await context.close();
  }
}

// Firefox and WebKit (Safari): scroll-driven animations may be unsupported; content must always show.
async function crossBrowserChecks() {
  for (const [name, engine] of [['firefox', firefox], ['webkit', webkit]]) {
    const browser = await engine.launch();
    try {
      for (const [vpName, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
        const context = await browser.newContext({ viewport: vp, locale: 'es-ES' });
        const page = await context.newPage();
        const problems = [];
        page.on('pageerror', (err) => problems.push(err.message));
        page.on('console', (msg) => { if (msg.type() === 'error') problems.push(msg.text()); });
        await page.goto(BASE, { waitUntil: 'load' });
        const supports = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
        let faint = 0;
        for (const id of ['trabajos', 'artistas', 'estudio', 'opiniones', 'contacto']) {
          await page.evaluate((target) => document.getElementById(target)?.scrollIntoView({ behavior: 'instant' }), id);
          await page.waitForTimeout(250);
          faint += await page.evaluate(() => [...document.querySelectorAll('main *')].filter((el) => {
            const r = el.getBoundingClientRect();
            return r.top >= 0 && r.bottom <= innerHeight && r.height > 0 && Number(getComputedStyle(el).opacity) < 0.95;
          }).length);
        }
        check(`${name} ${vpName}: content visible at every section (animation-timeline ${supports ? 'supported' : 'not supported'})`, faint === 0, `${faint} faint`);
        check(`${name} ${vpName}: no horizontal overflow`, (await overflow(page)) <= 0);
        await page.evaluate(() => document.getElementById('trabajos')?.scrollIntoView({ behavior: 'instant' }));
        await page.locator('[data-open-work]').first().click();
        check(`${name} ${vpName}: lightbox opens`, await page.locator('[data-lightbox]').evaluate((d) => d.open));
        await page.keyboard.press('Escape');
        await page.evaluate(() => document.getElementById('trabajos')?.scrollIntoView({ behavior: 'instant' }));
        await page.waitForTimeout(200);
        await shoot(page, `${name}-${vpName}-trabajos`);
        check(`${name} ${vpName}: no script errors`, problems.length === 0, problems.join(' | '));
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
}

async function main() {
  await mkdir(path.join(OUT, 'sections'), { recursive: true });
  const browser = await chromium.launch();
  try {
    await desktopChecks(browser);
    await fullPage(browser, VIEWPORTS.desktop, 'desktop-full', `${BASE}?lang=es`);
    await fullPage(browser, VIEWPORTS.desktop, 'desktop-full-en', `${BASE}?lang=en`);
    await mobileChecks(browser);
    await fullPage(browser, VIEWPORTS.mobile, 'mobile-full', `${BASE}?lang=es`, { isMobile: true, hasTouch: true });
    await noJsCheck(browser);
    await anchorChecks(browser);
    await imageChecks(browser);
    await responsiveChecks(browser);
    await focusChecks(browser);
    await featureChecks(browser);
    await sectionShots(browser);
  } finally {
    await browser.close();
  }
  await crossBrowserChecks();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots in ${OUT}`);
  if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error('E2E check crashed:', err);
  process.exit(1);
});
