/**
 * Boot Island — Ahmed Sattar Portfolio CMS
 *
 * Full boot sequence:
 * 1. Splash
 * 2. Theme
 * 3. Cursor
 * 4. Reveal
 * 5. Lightbox
 * 6. Mobile menu
 * 7. Footer year
 * 8. Apply cached settings
 * 9. Auth.getUser()
 * 10. Load Settings + SiteContent
 * 11. applySettings()
 * 12. applyNavContent()
 * 13. applyFooterContent()
 */

import { supabase } from '../lib/supabaseClient';

// ── Module-scope social link state ─────────────────────────
let _igUrl: string | undefined;
let _liUrl: string | undefined;

// ── Settings cache key ──────────────────────────────────────
const SETTINGS_CACHE_KEY = 'as_settings_cache';
const CONTENT_CACHE_KEY = 'as_content_cache';

// ── 1. SPLASH ───────────────────────────────────────────────
function bootSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        splash.classList.add('hidden');
      }, 400);
    });
    // Fallback in case load already fired
    setTimeout(() => splash.classList.add('hidden'), 1200);
  }
}

// ── 2. THEME ────────────────────────────────────────────────
function bootTheme(darkDefault = false) {
  const stored = localStorage.getItem('as_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark = stored ? stored === 'dark' : (darkDefault || prefersDark);
  applyTheme(useDark ? 'dark' : 'light');

  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('as_theme', next);
    });
  }
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
}

// ── 3. CURSOR ────────────────────────────────────────────────
function bootCursor() {
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isTouch) return;

  document.body.classList.add('has-custom-cursor');

  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  function animateRing() {
    const speed = 0.12;
    rx += (mx - rx) * speed;
    ry += (my - ry) * speed;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Expand on interactive elements
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if (target.matches('a, button, [role="button"], input, textarea, select, label')) {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      ring.style.width = '52px';
      ring.style.height = '52px';
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target as HTMLElement;
    if (target.matches('a, button, [role="button"], input, textarea, select, label')) {
      cursor.style.width = '12px';
      cursor.style.height = '12px';
      ring.style.width = '36px';
      ring.style.height = '36px';
    }
  });

  document.addEventListener('mousedown', () => {
    cursor.style.transform += ' scale(0.8)';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.transform = cursor.style.transform.replace(' scale(0.8)', '');
  });
}

// ── 4. REVEAL ANIMATIONS ────────────────────────────────────
function bootReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Re-observe dynamically added elements
  const mutationObserver = new MutationObserver(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => observer.observe(el));
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

// ── 5. LIGHTBOX ──────────────────────────────────────────────
function bootLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img') as HTMLImageElement;
  const lbClose = document.getElementById('lightbox-close');
  const lbPrev = document.getElementById('lightbox-prev');
  const lbNext = document.getElementById('lightbox-next');
  if (!lightbox || !lbImg) return;

  let images: string[] = [];
  let currentIndex = 0;

  function openLightbox(src: string, allImages: string[]) {
    images = allImages;
    currentIndex = allImages.indexOf(src);
    lbImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir: number) {
    currentIndex = (currentIndex + dir + images.length) % images.length;
    lbImg.src = images[currentIndex];
  }

  // Wire up
  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', () => navigate(-1));
  lbNext?.addEventListener('click', () => navigate(1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Delegate clicks on [data-lightbox]
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-lightbox]') as HTMLElement;
    if (!target) return;
    e.preventDefault();
    const src = target.getAttribute('data-lightbox') || (target as HTMLImageElement).src;
    const group = target.getAttribute('data-lightbox-group');
    let groupImages: string[] = [src];
    if (group) {
      groupImages = Array.from(
        document.querySelectorAll(`[data-lightbox-group="${group}"]`)
      ).map((el) => el.getAttribute('data-lightbox') || (el as HTMLImageElement).src);
    }
    openLightbox(src, groupImages);
  });
}

// ── 6. MOBILE MENU ──────────────────────────────────────────
function bootMobileMenu() {
  const toggle = document.getElementById('mob-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('open')) closeMenu();
    else openMenu();
  });

  // Close on nav link click
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).tagName === 'A') closeMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });
}

// ── 7. FOOTER YEAR ──────────────────────────────────────────
function bootFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = String(new Date().getFullYear());
}

// ── SOCIAL LINKS (BUG-PROOF) ─────────────────────────────────
export function applySocialLinks(ig?: string, li?: string) {
  if (ig !== undefined) _igUrl = ig;
  if (li !== undefined) _liUrl = li;

  const footerIg = document.getElementById('footer-social-instagram') as HTMLAnchorElement;
  const footerLi = document.getElementById('footer-social-linkedin') as HTMLAnchorElement;
  const mobIg = document.getElementById('mob-social-instagram') as HTMLAnchorElement;
  const mobLi = document.getElementById('mob-social-linkedin') as HTMLAnchorElement;

  if (footerIg) {
    if (_igUrl) {
      footerIg.href = _igUrl;
      footerIg.style.display = 'inline-flex';
    } else {
      footerIg.style.display = 'none';
    }
  }
  if (footerLi) {
    if (_liUrl) {
      footerLi.href = _liUrl;
      footerLi.style.display = 'inline-flex';
    } else {
      footerLi.style.display = 'none';
    }
  }
  if (mobIg) {
    if (_igUrl) {
      mobIg.href = _igUrl;
      mobIg.style.display = 'inline-flex';
    } else {
      mobIg.style.display = 'none';
    }
  }
  if (mobLi) {
    if (_liUrl) {
      mobLi.href = _liUrl;
      mobLi.style.display = 'inline-flex';
    } else {
      mobLi.style.display = 'none';
    }
  }
}

export function reapplySocialLinks() {
  applySocialLinks();
}

// ── APPLY SETTINGS ──────────────────────────────────────────
export function applySettings(settings: Record<string, unknown>) {
  const root = document.documentElement;

  if (settings.accent_color) {
    root.style.setProperty('--accent', settings.accent_color as string);
    // Parse hex to RGB for rgba usage
    const hex = (settings.accent_color as string).replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      root.style.setProperty('--accent-rgb', `${r},${g},${b}`);
    }
  }

  if (settings.logo_text) {
    const logoText = document.getElementById('nav-logo-text');
    const splashLogo = document.getElementById('splash-logo-text');
    const footerLogo = document.getElementById('footer-logo');
    if (logoText) logoText.textContent = settings.logo_text as string;
    if (splashLogo) splashLogo.textContent = (settings.logo_text as string).slice(0, 2).toUpperCase();
    if (footerLogo) footerLogo.textContent = settings.logo_text as string;
    const logoMark = document.getElementById('nav-logo-mark');
    if (logoMark) logoMark.textContent = (settings.logo_text as string).slice(0, 2).toUpperCase();
  }

  if (settings.logo_mark_color) {
    root.style.setProperty('--logo-mark', settings.logo_mark_color as string);
  }

  if (settings.font_display) {
    root.style.setProperty('--font-display', `'${settings.font_display}', system-ui, sans-serif`);
  }

  if (settings.font_body) {
    root.style.setProperty('--font-body', `'${settings.font_body}', system-ui, sans-serif`);
  }

  if (settings.dark_default !== undefined) {
    const stored = localStorage.getItem('as_theme');
    if (!stored) {
      applyTheme(settings.dark_default ? 'dark' : 'light');
    }
  }

  if (settings.hero_size) root.style.setProperty('--hero-size', settings.hero_size as string);
  if (settings.body_size) root.style.setProperty('--body-size', settings.body_size as string);
  if (settings.radius) root.style.setProperty('--radius', settings.radius as string);
  if (settings.nav_h) root.style.setProperty('--nav-h', settings.nav_h as string);
  if (settings.section_pad) root.style.setProperty('--section-pad', settings.section_pad as string);
  if (settings.card_gap) root.style.setProperty('--card-gap', settings.card_gap as string);

  // Social links
  applySocialLinks(
    settings.instagram_url as string | undefined,
    settings.linkedin_url as string | undefined
  );
}

// ── APPLY NAV CONTENT ───────────────────────────────────────
export function applyNavContent(nav: { links?: Array<{ label: string; href: string }> }) {
  const navLinks = document.getElementById('nav-links');
  const mobNavLinks = document.getElementById('mob-nav-links');

  const links = nav?.links ?? [
    { label: 'Work', href: '/work' },
    { label: 'Personal', href: '/personal' },
    { label: 'Photography', href: '/photography' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const current = window.location.pathname;

  if (navLinks) {
    navLinks.innerHTML = links
      .map(
        (l) =>
          `<a href="${l.href}" style="font-size:0.875rem;font-weight:500;color:${current === l.href ? 'var(--accent)' : 'var(--fg)'};text-decoration:none;transition:color 0.15s ease;"
            onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='${current === l.href ? 'var(--accent)' : 'var(--fg)'}'">${l.label}</a>`
      )
      .join('');
  }

  if (mobNavLinks) {
    mobNavLinks.innerHTML = links
      .map(
        (l) =>
          `<a href="${l.href}" style="display:block;padding:14px 0;font-size:1.25rem;font-weight:600;font-family:var(--font-display);color:${current === l.href ? 'var(--accent)' : 'var(--fg)'};text-decoration:none;border-bottom:1px solid var(--border);">${l.label}</a>`
      )
      .join('');
  }

  // Re-apply social links after nav rebuild
  reapplySocialLinks();
}

// ── APPLY FOOTER CONTENT ─────────────────────────────────────
export function applyFooterContent(footer: {
  tagline?: string;
  links?: Array<{ label: string; href: string }>;
}) {
  const taglineEl = document.getElementById('footer-tagline');
  const linksEl = document.getElementById('footer-links');

  if (taglineEl && footer?.tagline) {
    taglineEl.textContent = footer.tagline;
  }

  if (linksEl && footer?.links) {
    linksEl.innerHTML = footer.links
      .map(
        (l) =>
          `<a href="${l.href}" style="font-size:0.8125rem;color:var(--muted);text-decoration:none;transition:color 0.15s ease;"
           onmouseover="this.style.color='var(--fg)'" onmouseout="this.style.color='var(--muted)'">${l.label}</a>`
      )
      .join('');
  }

  // Re-apply social links after footer rebuild
  reapplySocialLinks();
}

// ── HOVER PREVIEW (for list layout) ─────────────────────────
function bootHoverPreview() {
  const preview = document.getElementById('hover-preview');
  const previewImg = document.getElementById('hover-preview-img') as HTMLImageElement;
  if (!preview || !previewImg) return;

  document.addEventListener('mouseover', (e) => {
    const target = (e.target as HTMLElement).closest('[data-preview-img]') as HTMLElement;
    if (!target) return;
    const src = target.getAttribute('data-preview-img');
    if (!src) return;
    previewImg.src = src;
    preview.classList.add('visible');
  });

  document.addEventListener('mouseout', (e) => {
    const target = (e.target as HTMLElement).closest('[data-preview-img]') as HTMLElement;
    if (!target) return;
    preview.classList.remove('visible');
  });

  document.addEventListener('mousemove', (e) => {
    if (!preview.classList.contains('visible')) return;
    const x = e.clientX + 20;
    const y = e.clientY - 60;
    const maxX = window.innerWidth - 240;
    const maxY = window.innerHeight - 180;
    preview.style.left = `${Math.min(x, maxX)}px`;
    preview.style.top = `${Math.max(10, Math.min(y, maxY))}px`;
  });
}

// ── 8–13. ASYNC BOOT ─────────────────────────────────────────
async function bootAsync() {
  // 8. Apply cached settings immediately
  const cachedSettings = localStorage.getItem(SETTINGS_CACHE_KEY);
  const cachedContent = localStorage.getItem(CONTENT_CACHE_KEY);

  if (cachedSettings) {
    try {
      applySettings(JSON.parse(cachedSettings));
    } catch {}
  }

  if (cachedContent) {
    try {
      const content = JSON.parse(cachedContent);
      if (content.nav) applyNavContent(content.nav);
      if (content.footer) applyFooterContent(content.footer);
    } catch {}
  } else {
    // Apply defaults immediately
    applyNavContent({});
    applyFooterContent({ tagline: 'Designer & Digital Marketer' });
  }

  // 9. Auth check
  let isAuthed = false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    isAuthed = !!user;

    // 10. Load Settings + SiteContent in parallel
    const [settingsResult, navResult, footerResult] = await Promise.all([
      supabase.from('settings').select('*').maybeSingle(),
      supabase.from('site_content').select('key,value').in('key', ['nav', 'footer']),
      Promise.resolve(null),
    ]);

    // 11. Apply settings
    if (settingsResult.data) {
      applySettings(settingsResult.data);
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settingsResult.data));
    }

    // Build content cache
    const contentMap: Record<string, unknown> = {};
    if (navResult.data) {
      for (const row of navResult.data) contentMap[row.key] = row.value;
    }
    localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(contentMap));

    // 12. Apply nav content
    if (contentMap.nav) applyNavContent(contentMap.nav as Record<string, unknown>);

    // 13. Apply footer content
    if (contentMap.footer) applyFooterContent(contentMap.footer as Record<string, unknown>);

  } catch (err) {
    // Supabase not configured — use defaults
    applyNavContent({});
    applyFooterContent({ tagline: 'Designer & Digital Marketer' });
  }
}

// ── MAIN BOOT SEQUENCE ───────────────────────────────────────
function boot() {
  bootSplash();            // 1
  bootTheme();             // 2
  bootCursor();            // 3
  bootReveal();            // 4
  bootLightbox();          // 5
  bootMobileMenu();        // 6
  bootFooterYear();        // 7
  bootHoverPreview();

  // Async steps 8–13
  bootAsync().catch(console.warn);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Expose globally for admin usage
(window as Record<string, unknown>).AS = {
  applySettings,
  applyNavContent,
  applyFooterContent,
  applySocialLinks,
  reapplySocialLinks,
  applyTheme,
};
