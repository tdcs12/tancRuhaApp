/* Mintázatok – SVG <pattern> / gradiens definíciók */
window.TR = window.TR || {};

TR.patterns = (() => {
  const f = TR.util.f;

  /* Visszaad: { def: '<defs-be kerülő szöveg>', ref: 'fill érték' } */
  function make(id, fill) {
    const p = fill.pattern || 'egyszinu';
    const [c1, c2, c3] = fill.colors || ['#888', '#444', '#fff'];
    const s = Math.max(0.3, fill.scale || 1);
    const rot = fill.rotation || 0;
    const T = 20 * s;
    const pat = (w, h, body, extra) =>
      `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${f(w)}" height="${f(h)}" patternTransform="rotate(${f(rot)})${extra || ''}">${body}</pattern>`;
    const bg = (w, h, c) => `<rect width="${f(w)}" height="${f(h)}" fill="${c}"/>`;
    let def = '';

    switch (p) {
      case 'egyszinu':
        return { def: '', ref: c1 };

      case 'ombre':
        def = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="200" y1="${f(110 + 40 * (s - 1))}" x2="200" y2="${f(640 - 60 * (s - 1))}" gradientTransform="rotate(${f(rot)} 200 380)">
          <stop offset="0" stop-color="${c1}"/><stop offset="0.55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient>`;
        break;

      case 'csikos':
        def = pat(T, T, bg(T, T, c1) + `<rect y="0" width="${f(T)}" height="${f(T * 0.38)}" fill="${c2}"/><rect y="${f(T * 0.55)}" width="${f(T)}" height="${f(T * 0.12)}" fill="${c3}"/>`);
        break;

      case 'pottyos':
        def = pat(T, T, bg(T, T, c1) + `<circle cx="${f(T / 2)}" cy="${f(T / 2)}" r="${f(T * 0.22)}" fill="${c2}"/>` +
          [[0, 0], [T, 0], [0, T], [T, T]].map(q => `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${f(T * 0.09)}" fill="${c3}"/>`).join(''));
        break;

      case 'kockas':
        def = pat(T * 1.4, T * 1.4, bg(T * 1.4, T * 1.4, c1) +
          `<rect width="${f(T * 0.7)}" height="${f(T * 1.4)}" fill="${c2}" opacity=".55"/><rect width="${f(T * 1.4)}" height="${f(T * 0.7)}" fill="${c2}" opacity=".55"/>` +
          `<rect x="${f(T * 1.02)}" width="${f(T * 0.08)}" height="${f(T * 1.4)}" fill="${c3}"/><rect y="${f(T * 1.02)}" width="${f(T * 1.4)}" height="${f(T * 0.08)}" fill="${c3}"/>`);
        break;

      case 'cikcakk': {
        const z = dy => `<path d="M${f(-T * 0.5)} ${f(dy + T * 0.75)} L0 ${f(dy + T * 0.25)} L${f(T / 2)} ${f(dy + T * 0.75)} L${f(T)} ${f(dy + T * 0.25)} L${f(T * 1.5)} ${f(dy + T * 0.75)}" fill="none" stroke="${c2}" stroke-width="${f(T * 0.2)}"/>` +
          `<path d="M${f(-T * 0.5)} ${f(dy + T * 1.05)} L0 ${f(dy + T * 0.55)} L${f(T / 2)} ${f(dy + T * 1.05)} L${f(T)} ${f(dy + T * 0.55)} L${f(T * 1.5)} ${f(dy + T * 1.05)}" fill="none" stroke="${c3}" stroke-width="${f(T * 0.07)}"/>`;
        def = pat(T, T, bg(T, T, c1) + z(-T) + z(0) + z(T));
        break;
      }

      case 'hullam': {
        const w = (dy, c, sw) => `<path d="M0 ${f(dy)} Q${f(T * 0.5)} ${f(dy - T * 0.45)} ${f(T)} ${f(dy)} T${f(T * 2)} ${f(dy)}" fill="none" stroke="${c}" stroke-width="${f(sw)}"/>`;
        def = pat(T * 2, T, bg(T * 2, T, c1) + w(T * 0.4, c2, T * 0.22) + w(T * 0.4 + T, c2, T * 0.22) + w(T * 0.75, c3, T * 0.06) + w(T * 0.75 - T, c3, T * 0.06));
        break;
      }

      case 'haromszog':
        def = pat(T, T, bg(T, T, c1) + `<polygon points="0,${f(T)} ${f(T / 2)},0 ${f(T)},${f(T)}" fill="${c2}"/><polygon points="${f(T * 0.32)},${f(T * 0.9)} ${f(T / 2)},${f(T * 0.55)} ${f(T * 0.68)},${f(T * 0.9)}" fill="${c3}"/>`);
        break;

      case 'rombusz': {
        const W = T * 1.2, H = T * 1.8;
        def = pat(W, H, bg(W, H, c1) + `<polygon points="${f(W / 2)},0 ${f(W)},${f(H / 2)} ${f(W / 2)},${f(H)} 0,${f(H / 2)}" fill="${c2}"/>` +
          `<path d="M0 0 L${f(W)} ${f(H)} M${f(W)} 0 L0 ${f(H)}" stroke="${c3}" stroke-width="${f(T * 0.05)}" stroke-dasharray="${f(T * 0.15)} ${f(T * 0.1)}"/>`);
        break;
      }

      case 'nepi': {
        const S = T * 2.4;
        const flower = (cx, cy, r) => {
          let out = '';
          for (let i = 0; i < 6; i++) {
            out += `<ellipse cx="${f(cx)}" cy="${f(cy - r * 0.55)}" rx="${f(r * 0.26)}" ry="${f(r * 0.5)}" fill="${c2}" transform="rotate(${i * 60} ${f(cx)} ${f(cy)})"/>`;
          }
          return out + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.28)}" fill="${c3}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.12)}" fill="${c1}"/>`;
        };
        const tulip = (cx, cy, r) =>
          `<path d="M${f(cx)} ${f(cy + r)} C${f(cx - r * 0.9)} ${f(cy + r * 0.2)} ${f(cx - r * 0.7)} ${f(cy - r * 0.8)} ${f(cx - r * 0.35)} ${f(cy - r * 0.9)} L${f(cx)} ${f(cy - r * 0.4)} L${f(cx + r * 0.35)} ${f(cy - r * 0.9)} C${f(cx + r * 0.7)} ${f(cy - r * 0.8)} ${f(cx + r * 0.9)} ${f(cy + r * 0.2)} ${f(cx)} ${f(cy + r)}Z" fill="${c3}"/>` +
          `<ellipse cx="${f(cx - r * 0.75)}" cy="${f(cy + r * 0.9)}" rx="${f(r * 0.4)}" ry="${f(r * 0.15)}" fill="${c2}" transform="rotate(-30 ${f(cx - r * 0.75)} ${f(cy + r * 0.9)})"/>` +
          `<ellipse cx="${f(cx + r * 0.75)}" cy="${f(cy + r * 0.9)}" rx="${f(r * 0.4)}" ry="${f(r * 0.15)}" fill="${c2}" transform="rotate(30 ${f(cx + r * 0.75)} ${f(cy + r * 0.9)})"/>`;
        let corners = '';
        [[0, 0], [S, 0], [0, S], [S, S]].forEach(q => { corners += tulip(q[0], q[1], S * 0.18); });
        def = pat(S, S, bg(S, S, c1) + flower(S / 2, S / 2, S * 0.36) + corners);
        break;
      }

      case 'allat': {
        const S = T * 3;
        const spots = [[0.2, 0.2, 0.13, 20], [0.65, 0.15, 0.1, -30], [0.45, 0.5, 0.14, 50], [0.85, 0.55, 0.11, 10], [0.15, 0.75, 0.12, -60], [0.62, 0.85, 0.1, 35], [0.95, 0.95, 0.09, 0], [0.02, 0.45, 0.07, 0]];
        let out = bg(S, S, c1);
        spots.forEach(([x, y, r, a]) => {
          const cx = x * S, cy = y * S, R = r * S;
          out += `<g transform="rotate(${a} ${f(cx)} ${f(cy)})"><path d="M${f(cx - R)} ${f(cy)} C${f(cx - R)} ${f(cy - R * 0.9)} ${f(cx + R * 0.3)} ${f(cy - R)} ${f(cx + R)} ${f(cy - R * 0.3)} C${f(cx + R * 1.1)} ${f(cy + R * 0.6)} ${f(cx)} ${f(cy + R)} ${f(cx - R * 0.6)} ${f(cy + R * 0.7)}" fill="none" stroke="${c2}" stroke-width="${f(R * 0.45)}" stroke-linecap="round"/>` +
            `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(R * 0.45)}" ry="${f(R * 0.35)}" fill="${c3}"/></g>`;
        });
        def = pat(S, S, out);
        break;
      }

      case 'marvany': {
        const S = 260 * s;
        let lines = '';
        for (let i = 0; i < 7; i++) {
          const y = (i + 0.5) * S / 7;
          lines += `<path d="M-20 ${f(y)} C${f(S * 0.25)} ${f(y - 30 * s)} ${f(S * 0.5)} ${f(y + 35 * s)} ${f(S + 20)} ${f(y - 10 * s)}" fill="none" stroke="${i % 2 ? c3 : c2}" stroke-width="${f((i % 3 + 1) * 1.6 * s)}" opacity="${i % 2 ? 0.9 : 0.6}"/>`;
        }
        def = `<filter id="${id}-f" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${f(0.018 / s)}" numOctaves="3" seed="7"/><feDisplacementMap in="SourceGraphic" scale="${f(40 * s)}"/></filter>` +
          pat(S, S, bg(S, S, c1) + `<g filter="url(#${id}-f)">${lines}</g>`);
        break;
      }

      case 'batik': {
        const S = 140 * s;
        def = `<radialGradient id="${id}-g" cx="50%" cy="50%" r="18%" spreadMethod="reflect"><stop offset="0" stop-color="${c1}"/><stop offset="0.45" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></radialGradient>` +
          `<filter id="${id}-f" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${f(0.03 / s)}" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="${f(22 * s)}"/></filter>` +
          pat(S, S, bg(S, S, c2) + `<rect x="-20" y="-20" width="${f(S + 40)}" height="${f(S + 40)}" fill="url(#${id}-g)" filter="url(#${id}-f)"/>`);
        break;
      }

      case 'pikkely': {
        const W = T, H = T * 0.7, r = W / 2;
        const scale = (cx, cy) => `<path d="M${f(cx - r)} ${f(cy)} A${f(r)} ${f(r)} 0 0 0 ${f(cx + r)} ${f(cy)}" fill="${c2}" stroke="${c3}" stroke-width="${f(T * 0.06)}"/>`;
        def = pat(W, H, bg(W, H, c1) + scale(W / 2, 0) + scale(0, H / 2) + scale(W, H / 2) + scale(W / 2, H));
        break;
      }

      case 'konfetti': {
        const S = T * 4, r = TR.util.seeded(11);
        let out = bg(S, S, c1);
        for (let i = 0; i < 18; i++) {
          const x = r() * S, y = r() * S, a = r() * 180, c = i % 2 ? c2 : c3, k = r();
          if (k < 0.4) out += `<rect x="${f(x)}" y="${f(y)}" width="${f(T * 0.5)}" height="${f(T * 0.18)}" fill="${c}" transform="rotate(${f(a)} ${f(x)} ${f(y)})"/>`;
          else if (k < 0.75) out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(T * 0.16)}" fill="${c}"/>`;
          else out += `<polygon points="${f(x)},${f(y - T * 0.22)} ${f(x + T * 0.2)},${f(y + T * 0.15)} ${f(x - T * 0.2)},${f(y + T * 0.15)}" fill="${c}"/>`;
        }
        def = pat(S, S, out);
        break;
      }

      case 'mozaik': {
        const S = T * 3, r = TR.util.seeded(5), g = S / 6;
        let out = bg(S, S, c1);
        for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
          const k = r();
          if (k < 0.3) out += `<rect x="${f(i * g)}" y="${f(j * g)}" width="${f(g * (1 + Math.floor(r() * 2)))}" height="${f(g)}" fill="${c2}"/>`;
          else if (k < 0.45) out += `<rect x="${f(i * g)}" y="${f(j * g + g * 0.3)}" width="${f(g)}" height="${f(g * 0.4)}" fill="${c3}"/>`;
        }
        def = pat(S, S, out);
        break;
      }

      case 'galaxis': {
        const S = 160 * s, r = TR.util.seeded(21);
        let out = bg(S, S, c1);
        out += `<circle cx="${f(S * 0.3)}" cy="${f(S * 0.35)}" r="${f(S * 0.32)}" fill="${c2}" opacity=".45" filter="url(#${id}-b)"/>`;
        out += `<circle cx="${f(S * 0.75)}" cy="${f(S * 0.75)}" r="${f(S * 0.25)}" fill="${c3}" opacity=".35" filter="url(#${id}-b)"/>`;
        for (let i = 0; i < 40; i++) out += `<circle cx="${f(r() * S)}" cy="${f(r() * S)}" r="${f(0.4 + r() * 1.4 * s)}" fill="#fff" opacity="${f(0.4 + r() * 0.6)}"/>`;
        def = `<filter id="${id}-b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${f(14 * s)}"/></filter>` + pat(S, S, out);
        break;
      }

      case 'kep': {
        if (!fill.image) return { def: '', ref: c1 };
        const S = 120 * s;
        def = pat(S, S, bg(S, S, c1) + `<image href="${fill.image}" width="${f(S)}" height="${f(S)}" preserveAspectRatio="xMidYMid slice"/>`);
        break;
      }

      default:
        return { def: '', ref: c1 };
    }
    return { def, ref: `url(#${id})` };
  }

  /* Kis előnézeti minta a mintaválasztóhoz */
  function swatch(name, colors, size = 46, image) {
    const id = 'sw-' + name + '-' + Math.random().toString(36).slice(2, 7);
    if (name === 'kep' && !image) {
      return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><rect width="${size}" height="${size}" rx="8" fill="${colors[0]}" opacity=".25"/><path d="M14 30l7-8 5 5 4-4 6 7z" fill="${colors[1]}"/><circle cx="30" cy="16" r="3.5" fill="${colors[1]}"/><path d="M23 9v-4m-2 2h4" stroke="${colors[1]}" stroke-width="1.5"/></svg>`;
    }
    const m = make(id, { pattern: name, colors, scale: name === 'ombre' ? 1 : name === 'kep' ? 0.38 : 0.6, rotation: 0, image });
    // A színátmenet a teljes alakhoz van méretezve, ezért itt a négyzetre szabjuk
    const def = name === 'ombre'
      ? `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colors[0]}"/><stop offset=".55" stop-color="${colors[1]}"/><stop offset="1" stop-color="${colors[2]}"/></linearGradient>`
      : m.def;
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><defs>${def}</defs><rect width="${size}" height="${size}" rx="8" fill="${m.ref}"/></svg>`;
  }

  return { make, swatch };
})();
