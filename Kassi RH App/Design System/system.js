/* kassirh design system — living style guide driver.
   Reads live CSS custom properties so every swatch is the real token. */
(function () {
  const root = document.documentElement;
  const cs = () => getComputedStyle(root);
  const val = (name) => cs().getPropertyValue(name).trim();
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  /* ---------- 1. Primitive palettes ---------- */
  const SCALES = {
    'Primary — #f76626': 'primary',
    'Grey (Zinc) neutrals': 'grey',
    'Red — error': 'red',
    'Green — success': 'green',
    'Amber — warning': 'amber',
    'Blue — info': 'blue',
  };
  const STEPS = [50,100,200,300,400,500,600,700,800,900,950];
  function renderScales(mount) {
    for (const [title, fam] of Object.entries(SCALES)) {
      mount.appendChild(el('div', 'gd-scale__name', title));
      const grid = el('div', 'gd-scale');
      STEPS.forEach(step => {
        const v = val(`--kx-${fam}-${step}`);
        if (!v) return;
        const cell = el('div', 'gd-scale__step');
        cell.style.background = v;
        cell.appendChild(el('span', null, String(step)));
        cell.title = `--kx-${fam}-${step}  ${v}`;
        grid.appendChild(cell);
      });
      mount.appendChild(grid);
    }
  }

  /* ---------- 2. Semantic role swatches ---------- */
  const SEMANTIC = {
    'Surfaces': ['--bg','--bg-subtle','--bg-muted','--surface','--surface-hover','--surface-sunken'],
    'Text / foreground': ['--fg','--fg-secondary','--fg-muted','--fg-subtle','--fg-disabled'],
    'Borders': ['--border','--border-subtle','--border-strong'],
    'Brand': ['--brand','--brand-hover','--brand-pressed','--brand-subtle','--brand-fg','--brand-navy'],
    'Status': ['--danger','--danger-subtle','--warning','--warning-subtle','--success','--success-subtle','--info','--info-subtle'],
  };
  function renderSemantic(mount) {
    for (const [group, names] of Object.entries(SEMANTIC)) {
      mount.appendChild(el('div', 'gd-scale__name', group));
      const grid = el('div', 'gd-swatches');
      names.forEach(n => {
        const v = val(n);
        const card = el('div', 'gd-swatch');
        const chip = el('div', 'gd-swatch__chip'); chip.style.background = v;
        card.appendChild(chip);
        const meta = el('div', 'gd-swatch__meta');
        meta.appendChild(el('div', 'gd-swatch__name', n));
        meta.appendChild(el('div', 'gd-swatch__val', v || '—'));
        card.appendChild(meta);
        grid.appendChild(card);
      });
      mount.appendChild(grid);
    }
  }

  /* ---------- 3. Type scale ---------- */
  const TYPE = [
    ['h1','Manrope Bold','kx-h1'], ['h2','Manrope Bold','kx-h2'], ['h3','Manrope Semibold','kx-h3'],
    ['h4','Manrope Semibold','kx-h4'], ['headline','Manrope Semibold','kx-headline'],
    ['body','Manrope Regular','kx-body'], ['subtitle','Manrope Regular','kx-subtitle'],
    ['caption','Manrope Regular','kx-caption'], ['footnote','Manrope Medium','kx-footnote'],
  ];
  function renderType(mount) {
    TYPE.forEach(([tier, desc, cls]) => {
      const size = val(`--kx-fs-${tier}`), lh = val(`--kx-lh-${tier}`);
      const row = el('div', 'gd-type');
      row.appendChild(el('div', 'gd-type__meta', `${tier} · ${size} / ${lh} · ${desc}`));
      const spec = el('div', cls, 'Manage your human resources');
      spec.style.color = 'var(--fg)';
      row.appendChild(spec);
      mount.appendChild(row);
    });
  }

  /* ---------- 4. Radius ---------- */
  function renderRadius(mount) {
    [['xs','--r-xs'],['sm','--r-sm'],['md','--r-md'],['lg','--r-lg'],['xl','--r-xl'],['full','--r-full']].forEach(([name, v]) => {
      const t = el('div', 'gd-tile');
      const box = el('div', 'gd-tile__box'); box.style.borderRadius = `var(${v})`;
      t.appendChild(box);
      t.appendChild(el('div', 'gd-tile__label', `<b>radius-${name}</b>${val(v)}`));
      mount.appendChild(t);
    });
  }

  /* ---------- 5. Elevation ---------- */
  function renderShadows(mount) {
    [['sm','--shadow-sm'],['md','--shadow-md'],['lg','--shadow-lg'],['xl','--shadow-xl']].forEach(([name, v]) => {
      const t = el('div', 'gd-tile');
      const box = el('div', 'gd-tile__shadow'); box.style.boxShadow = `var(${v})`;
      t.appendChild(box);
      t.appendChild(el('div', 'gd-tile__label', `<b>shadow-${name}</b>`));
      mount.appendChild(t);
    });
  }

  /* ---------- 6. Spacing ---------- */
  function renderSpacing(mount) {
    [1,2,3,4,5,6,8,10,12].forEach(k => {
      const v = val(`--sp-${k}`);
      const t = el('div', 'gd-tile');
      const bar = el('div', 'gd-tile__sp'); bar.style.width = v;
      const wrap = el('div'); wrap.style.width = '100%'; wrap.appendChild(bar);
      t.appendChild(wrap);
      t.appendChild(el('div', 'gd-tile__label', `<b>sp-${k}</b>${v}`));
      mount.appendChild(t);
    });
  }

  /* ---------- Icons (Fluent regular) ---------- */
  function renderIcons(mount) {
    const names = Object.keys(window.KX_ICONS || {});
    const grid = el('div', 'gd-icons');
    names.forEach(n => {
      const cell = el('div', 'gd-icon-cell');
      const g = el('span', 'kx-icon'); g.style.color = 'var(--fg-secondary)'; g.innerHTML = window.kxIcon(n, 20);
      cell.appendChild(g);
      cell.appendChild(el('span', 'gd-icon-cell__name', n));
      grid.appendChild(cell);
    });
    mount.appendChild(grid);
  }

  /* ---------- Theme toggle ---------- */
  const KEY = 'kx-theme';
  function applyTheme(dark) {
    root.classList.toggle('dark', dark);
    const btn = document.getElementById('gd-toggle');
    if (btn) btn.querySelector('.gd-toggle__label').textContent = dark ? 'Light' : 'Dark';
    try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch (e) {}
    // repaint live swatches (values change in dark)
    document.querySelectorAll('[data-live]').forEach(m => { m.innerHTML = ''; window.__kxRender[m.dataset.live](m); });
  }
  function initTheme() {
    let dark = false;
    try { dark = localStorage.getItem(KEY) === 'dark'; } catch (e) {}
    applyTheme(dark);
    const btn = document.getElementById('gd-toggle');
    if (btn) btn.addEventListener('click', () => applyTheme(!root.classList.contains('dark')));
  }

  /* ---------- Accordion ---------- */
  function initAccordions() {
    document.querySelectorAll('.kx-accordion').forEach(acc => {
      const single = acc.hasAttribute('data-single');
      acc.querySelectorAll('.kx-accordion__trigger').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = btn.closest('.kx-accordion__item');
          const willOpen = !item.classList.contains('is-open');
          if (single && willOpen) {
            acc.querySelectorAll('.kx-accordion__item.is-open').forEach(i => {
              i.classList.remove('is-open');
              i.querySelector('.kx-accordion__trigger').setAttribute('aria-expanded', 'false');
            });
          }
          item.classList.toggle('is-open', willOpen);
          btn.setAttribute('aria-expanded', String(willOpen));
        });
      });
    });
  }

  /* ---------- Slider ---------- */
  function initSliders() {
    document.querySelectorAll('.kx-slider').forEach(s => {
      const paint = () => {
        const min = +s.min || 0, max = +s.max || 100;
        const pct = ((s.value - min) / (max - min)) * 100;
        s.style.setProperty('--pct', pct + '%');
      };
      paint();
      s.addEventListener('input', paint);
    });
  }

  /* ---------- Dialog (modal) ---------- */
  function initDialogs() {
    let last = null;
    const open = (ov) => { if (!ov) return; last = document.activeElement; ov.classList.add('is-open');
      const f = ov.querySelector('.kx-btn, [autofocus]'); if (f) f.focus(); };
    const close = (ov) => { if (!ov) return; ov.classList.remove('is-open'); if (last && last.focus) last.focus(); };
    document.querySelectorAll('[data-open-dialog]').forEach(btn => {
      btn.addEventListener('click', () => open(document.querySelector(btn.getAttribute('data-open-dialog'))));
    });
    document.querySelectorAll('.kx-dialog-overlay').forEach(ov => {
      ov.addEventListener('click', e => { if (e.target === ov) close(ov); });
      ov.querySelectorAll('[data-close-dialog]').forEach(b => b.addEventListener('click', () => close(ov)));
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') document.querySelectorAll('.kx-dialog-overlay.is-open').forEach(close);
    });
  }

  /* ---------- Scroll-spy ---------- */
  function initSpy() {
    const links = [...document.querySelectorAll('.gd-nav a')];
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.remove('is-active'));
          const a = map.get(e.target.id); if (a) a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-70px 0px -75% 0px' });
    document.querySelectorAll('.gd-section').forEach(s => obs.observe(s));
  }

  window.__kxRender = { scales: renderScales, semantic: renderSemantic, type: renderType, radius: renderRadius, shadows: renderShadows, spacing: renderSpacing, icons: renderIcons };

  document.addEventListener('DOMContentLoaded', () => {
    if (window.kxHydrateIcons) window.kxHydrateIcons();
    document.querySelectorAll('input[data-indeterminate]').forEach(i => { i.indeterminate = true; });
    document.querySelectorAll('[data-live]').forEach(m => window.__kxRender[m.dataset.live](m));
    initTheme();
    initAccordions();
    initDialogs();
    initSliders();
    initSpy();
  });
})();
