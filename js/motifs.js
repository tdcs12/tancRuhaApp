/* Motívumok: alakzatkönyvtár és a motívumréteg kirajzolása */
window.TR = window.TR || {};

TR.motifs = (() => {
  const f = n => (Math.round(n * 100) / 100).toString();

  function starPath(n, R, r, rot = -90) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + f(Math.cos(a) * rr) + ' ' + f(Math.sin(a) * rr);
    }
    return d + 'Z';
  }
  function rotatePath(base, k, total) {
    // egyszerű pontforgatás „M/C/L x y” formátumú útvonalra
    const a = k * 2 * Math.PI / total, c = Math.cos(a), s = Math.sin(a);
    return base.replace(/(-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)/g, (m, x, y) => {
      x = +x; y = +y; return f(x * c - y * s) + ' ' + f(x * s + y * c);
    });
  }
  const petal = 'M0 0C-22 -14 -16 -46 0 -49C16 -46 22 -14 0 0Z';
  const flower = Array.from({ length: 6 }, (_, k) => rotatePath(petal, k, 6)).join('');
  const rays = Array.from({ length: 12 }, (_, k) => rotatePath('M-6 -26L0 -50L6 -26Z', k, 12)).join('') + 'M0 -24A24 24 0 1 0 0.01 -24Z';
  const wingL = 'M0 -4C-14 -48 -52 -50 -46 -16C-42 0 -18 0 0 -4ZM0 2C-16 4 -46 14 -34 40C-24 52 -6 28 0 2Z';
  const wingR = wingL.replace(/(-?\d+(?:\.\d+)?)([ ,])(-?\d+(?:\.\d+)?)/g, (m, x, sp, y) => f(-x) + sp + y);
  const spiral = (() => {
    let d = '';
    for (let i = 0; i <= 80; i++) {
      const t = i / 80, a = t * Math.PI * 4.2, r = 3 + t * 44;
      d += (i ? 'L' : 'M') + f(Math.cos(a) * r) + ' ' + f(Math.sin(a) * r);
    }
    return d;
  })();

  /* d: kitöltött alak, stroke: körvonalas alak, deco: második színnel rajzolt részlet */
  const SHAPES = {
    strassz: { name: 'Strassz', d: 'M0 -50A50 50 0 1 0 0.01 -50Z', deco: 'M0 -50L0 50M-50 0L50 0M-35 -35L35 35M35 -35L-35 35', gem: true },
    kor: { name: 'Kör', d: 'M0 -50A50 50 0 1 0 0.01 -50Z' },
    csillag: { name: 'Csillag', d: starPath(5, 50, 21) },
    szikra: { name: 'Szikra', d: starPath(4, 50, 11, -90) },
    sziv: { name: 'Szív', d: 'M0 45C-70 0 -50 -55 0 -25C50 -55 70 0 0 45Z' },
    kristaly: { name: 'Kristály', d: 'M0 -50L35 -12L0 50L-35 -12Z', deco: 'M-35 -12L35 -12M0 -50L-12 -12L0 50L12 -12Z' },
    csepp: { name: 'Csepp', d: 'M0 -50C30 -10 40 20 0 50C-40 20 -30 -10 0 -50Z' },
    virag: { name: 'Virág', d: flower, deco: 'M0 -13A13 13 0 1 0 0.01 -13Z', decoFill: true },
    level: { name: 'Levél', d: 'M0 -50Q42 -5 0 50Q-42 -5 0 -50Z', deco: 'M0 -42L0 46' },
    villam: { name: 'Villám', d: 'M10 -50L-30 5L-2 5L-12 50L30 -8L2 -8Z' },
    hold: { name: 'Hold', d: 'M12 -48A50 50 0 1 0 12 48A38 38 0 1 1 12 -48Z' },
    nap: { name: 'Napsugár', d: rays },
    pillango: { name: 'Pillangó', d: wingL + wingR, deco: 'M0 -22L0 26' },
    haromszog: { name: 'Háromszög', d: 'M0 -48L46 40L-46 40Z' },
    iv: { name: 'Ív (swoosh)', d: 'M-50 35C-25 -30 25 -45 50 -30C20 -25 -15 -5 -50 35Z' },
    sav: { name: 'Sáv', d: 'M-50 -9H50V9H-50Z' },
    hullam: { name: 'Hullám', stroke: 'M-50 0Q-37.5 -22 -25 0T0 0T25 0T50 0' },
    spiral: { name: 'Spirál', stroke: spiral }
  };

  const REPEATS = { egy: 'Egy darab', sor: 'Sor', iv: 'Ív', kor: 'Kör (koszorú)', szort: 'Szórt' };
  const TARGETS = { top: 'A felsőre', bottom: 'Az alsóra', szabad: 'Szabadon (bárhová)' };

  function newMotif(type, x, y) {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type, x, y, size: type === 'strassz' ? 9 : 36, rot: 0,
      color: type === 'strassz' ? '#e8f4ff' : '#ffd166', color2: type === 'strassz' ? '#9fc6ff' : '#ffffff',
      opacity: 1, outline: type !== 'strassz', target: 'top',
      repeat: type === 'strassz' ? 'sor' : 'egy', count: type === 'strassz' ? 9 : 5, gap: 1.4, mirror: false
    };
  }

  /* Ismétlések helyei a motívum saját koordinátarendszerében (px) */
  function instances(m) {
    const n = Math.max(1, Math.min(60, m.count | 0)), s = m.size, g = m.gap || 1.3, out = [];
    switch (m.repeat) {
      case 'sor':
        for (let i = 0; i < n; i++) out.push([(i - (n - 1) / 2) * s * g, 0, 0, 1]);
        break;
      case 'iv': {
        const R = s * g * n / 2.1;
        for (let i = 0; i < n; i++) {
          const a = (-60 + 120 * (n === 1 ? 0.5 : i / (n - 1))) * Math.PI / 180;
          out.push([Math.sin(a) * R, R - Math.cos(a) * R, a * 180 / Math.PI, 1]);
        }
        break;
      }
      case 'kor': {
        const R = Math.max(s * 0.6, s * g * n / (2 * Math.PI));
        for (let i = 0; i < n; i++) {
          const a = i / n * 2 * Math.PI;
          out.push([Math.sin(a) * R, -Math.cos(a) * R, a * 180 / Math.PI, 1]);
        }
        break;
      }
      case 'szort': {
        let seed = 0; for (const ch of m.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
        const r = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        const R = s * g * Math.sqrt(n) * 0.9;
        for (let i = 0; i < n; i++) {
          const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R;
          out.push([Math.cos(a) * d, Math.sin(a) * d, r() * 360, 0.55 + r() * 0.6]);
        }
        break;
      }
      default: out.push([0, 0, 0, 1]);
    }
    return out;
  }

  function shapeBody(m, customs, p) {
    if (m.type.startsWith('custom:')) {
      const c = customs.find(x => 'custom:' + x.id === m.type);
      return c ? `<image href="${c.data}" x="-50" y="-50" width="100" height="100"/>` : '';
    }
    const sh = SHAPES[m.type] || SHAPES.kor;
    const ol = m.outline ? `stroke="#2b2233" stroke-width="1.3" vector-effect="non-scaling-stroke"` : '';
    if (sh.stroke) {
      return (m.outline ? `<path d="${sh.stroke}" fill="none" stroke="#2b2233" stroke-width="15" stroke-linecap="round"/>` : '') +
        `<path d="${sh.stroke}" fill="none" stroke="${m.color}" stroke-width="11" stroke-linecap="round"/>`;
    }
    let out = `<path d="${sh.d}" fill="${m.color}" ${ol}/>`;
    if (sh.gem) out += `<path d="${sh.d}" fill="url(#${p}-gem)"/>`;
    if (sh.deco) {
      out += sh.decoFill ? `<path d="${sh.deco}" fill="${m.color2}"/>`
        : `<path d="${sh.deco}" fill="none" stroke="${m.color2}" stroke-width="${sh.gem ? 5 : 3}" opacity="${sh.gem ? 0.7 : 0.9}"/>`;
    }
    if (sh.gem) out += `<circle r="22" fill="${m.color2}" opacity=".45"/><circle cx="-16" cy="-16" r="11" fill="#fff" opacity=".9"/>`;
    return out;
  }

  function single(m, customs, p) {
    const body = shapeBody(m, customs, p);
    const sc = m.size / 100;
    const inst = instances(m).map(([dx, dy, a, k]) =>
      `<g transform="translate(${f(dx)} ${f(dy)}) rotate(${f(a)}) scale(${f(sc * k)})">${body}</g>`).join('');
    return `<g transform="translate(${f(m.x)} ${f(m.y)}) rotate(${f(m.rot)})" opacity="${m.opacity}">${inst}</g>`;
  }

  /* A motívumréteg egy célterülethez (top / bottom / szabad) */
  function layer(design, target, p) {
    const list = (design.motifs || []).filter(m => (m.target || 'top') === target);
    if (!list.length) return '';
    const customs = design.customMotifs || [];
    return list.map(m => {
      const g = single(m, customs, p);
      return g + (m.mirror ? `<g transform="translate(400 0) scale(-1 1)">${g}</g>` : '');
    }).join('');
  }

  function gemDef(p) {
    return `<radialGradient id="${p}-gem" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".45" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient>`;
  }

  /* Szerkesztéshez: kattintható pontok és a kiválasztás jelölése */
  function editLayer(design, selected) {
    return (design.motifs || []).map(m => {
      const inst = instances(m);
      const R = Math.max(10, ...inst.map(([dx, dy]) => Math.hypot(dx, dy))) + m.size * 0.6;
      const sel = m.id === selected;
      const hit = `<circle cx="${f(m.x)}" cy="${f(m.y)}" r="${f(Math.max(9, m.size * 0.6))}" fill="#fff" fill-opacity="0.001" data-mid="${m.id}" style="cursor:move"/>`;
      const ring = sel ? `<circle cx="${f(m.x)}" cy="${f(m.y)}" r="${f(R)}" fill="none" stroke="#b5179e" stroke-width="1.4" stroke-dasharray="4 3" pointer-events="none"/>
        <circle cx="${f(m.x)}" cy="${f(m.y)}" r="3" fill="#b5179e" pointer-events="none"/>` : '';
      return ring + hit;
    }).join('');
  }

  /* Kicsi előnézet a könyvtárhoz */
  function preview(type, customs, color = '#b5179e', color2 = '#ffffff') {
    const m = Object.assign(newMotif(type, 0, 0), { size: 80, repeat: 'egy', color, color2, outline: true });
    return `<svg viewBox="-50 -50 100 100" width="40" height="40" aria-hidden="true"><defs>${gemDef('pv')}</defs>${single(m, customs || [], 'pv')}</svg>`;
  }

  return { SHAPES, REPEATS, TARGETS, newMotif, layer, editLayer, gemDef, preview, instances };
})();
