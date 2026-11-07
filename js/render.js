/* Az alak és a jelmez kirajzolása SVG-be */
window.TR = window.TR || {};

TR.render = (() => {
  const U = TR.util, C = TR.color, D = TR.data;
  const { f, pt, lerp, lerpP, rad, smooth, capsule, ribbon } = U;

  const LEN = { upperArm: 98, foreArm: 86, hand: 17, thigh: 155, shin: 150, foot: 30 };
  const ROOT = { shoulderL: [161, 137], shoulderR: [239, 137], hipL: [183, 298], hipR: [217, 298] };
  const FLOOR = 636;
  const SCALE = 0.84; // az alak kicsinyítése a talppont körül, hogy a felemelt karok is beférjenek
  const OUTLINE = '#2b2233';

  /* A törzs bal oldali kontúrja (a jobb oldal ennek tükörképe) */
  const TORSO = [[154, 128], [162, 150], [166, 170], [168, 192], [179, 230], [170, 262], [165, 292], [164, 304]];
  function xL(y) {
    if (y <= TORSO[0][1]) return TORSO[0][0];
    for (let i = 0; i < TORSO.length - 1; i++) {
      const a = TORSO[i], b = TORSO[i + 1];
      if (y >= a[1] && y <= b[1]) return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1]));
    }
    return TORSO[TORSO.length - 1][0];
  }
  const xR = y => 400 - xL(y);

  /* ---------- Póz: szögekből ízületi pontok ---------- */
  function lerpPose(a, b, t) {
    const L = (x, y) => [lerp(x[0], y[0], t), lerp(x[1], y[1], t)];
    return {
      arm: { L: L(a.arm.L, b.arm.L), R: L(a.arm.R, b.arm.R) },
      leg: { L: L(a.leg.L, b.leg.L), R: L(a.leg.R, b.leg.R) },
      air: lerp(a.air || 0, b.air || 0, t)
    };
  }

  function skeleton(pose) {
    const sk = { arm: {}, leg: {} };
    const step = (P, len, ang, dir) => [P[0] + Math.sin(rad(ang)) * len * dir, P[1] + Math.cos(rad(ang)) * len];
    ['L', 'R'].forEach(side => {
      const dir = side === 'L' ? -1 : 1;
      const [ua, la] = pose.arm[side];
      const s = ROOT['shoulder' + side];
      const e = step(s, LEN.upperArm, ua, dir), w = step(e, LEN.foreArm, la, dir), h = step(w, LEN.hand, la, dir);
      sk.arm[side] = { s, e, w, h, ua, la };
      const [ta, sa] = pose.leg[side];
      const hp = ROOT['hip' + side];
      const k = step(hp, LEN.thigh, ta, dir), a = step(k, LEN.shin, sa, dir), t = step(a, LEN.foot, sa + 5, dir);
      sk.leg[side] = { h: hp, k, a, t, ta, sa, lifted: ta > 40 };
    });
    let oy;
    if (pose.air) {
      oy = pose.air;
    } else {
      const support = ['L', 'R'].filter(s => !sk.leg[s].lifted);
      const low = Math.max(...(support.length ? support : ['L', 'R']).map(s => sk.leg[s].t[1]));
      oy = FLOOR - low;
    }
    sk.oy = oy;
    return sk;
  }

  function poseByName(name) { return D.poses[name] || D.poses.alap; }

  /* ---------- Árnyékolás / anyag fényhatások ---------- */
  function shadeDefs(p) {
    return `
    <linearGradient id="${p}-sh-matt" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".12"/><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
    <linearGradient id="${p}-sh-satin" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".28" stop-color="#fff" stop-opacity=".0"/><stop offset=".42" stop-color="#fff" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
    <linearGradient id="${p}-sh-gloss" x1="0" x2="1" y1="0" y2=".25"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".22" stop-color="#fff" stop-opacity=".05"/><stop offset=".35" stop-color="#fff" stop-opacity=".55"/><stop offset=".48" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".25"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
    <linearGradient id="${p}-sh-velvet" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset=".35" stop-color="#000" stop-opacity=".1"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset=".65" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
    <linearGradient id="${p}-sh-metal" x1="0" x2="1" y1="0" y2=".4"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".2" stop-color="#fff" stop-opacity=".6"/><stop offset=".32" stop-color="#000" stop-opacity=".2"/><stop offset=".52" stop-color="#fff" stop-opacity=".7"/><stop offset=".66" stop-color="#000" stop-opacity=".25"/><stop offset=".85" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
    <linearGradient id="${p}-sh-skin" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    <pattern id="${p}-seq" patternUnits="userSpaceOnUse" width="9" height="9"><circle cx="2.5" cy="2.5" r="2.1" fill="#fff" opacity=".35"/><circle cx="2" cy="2" r=".8" fill="#fff" opacity=".9"/><circle cx="7" cy="7" r="2.1" fill="#000" opacity=".12"/><circle cx="6.6" cy="6.6" r=".7" fill="#fff" opacity=".7"/></pattern>
    <pattern id="${p}-net" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><path d="M0 0H7M0 0V7" stroke="${OUTLINE}" stroke-width=".8" opacity=".55"/></pattern>`;
  }

  /* Egy ruhadarab: körvonal-réteg, kitöltés, árnyék – több darab egyesítve */
  function garment(ds, fillRef, fabric, opts = {}) {
    if (!ds.length) return '';
    const fab = D.fabrics[fabric] || D.fabrics.jersey;
    const p = opts.p;
    const sheen = opts.sheen || fab.sheen;
    const op = opts.opacity != null ? opts.opacity : fab.opacity;
    const outline = ds.map(d => `<path d="${d}" fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="3.2" stroke-linejoin="round"/>`).join('');
    const fills = ds.map(d => `<path d="${d}" fill="${fillRef}"/>`).join('');
    const shades = ds.map(d => `<path d="${d}" fill="url(#${p}-sh-${sheen})"/>`).join('');
    const seq = opts.sequins ? ds.map(d => `<path d="${d}" fill="url(#${p}-seq)"/>`).join('') : '';
    const mesh = fabric === 'halo' ? ds.map(d => `<path d="${d}" fill="url(#${p}-net)"/>`).join('') : '';
    return `<g class="garment" opacity="${op}">${outline}${fills}${shades}${seq}${mesh}${opts.extra || ''}</g>`;
  }

  /* ---------- Testrészek ---------- */
  function armShapes(a) {
    return [capsule(a.s, 11.5, a.e, 8), capsule(a.e, 8, a.w, 5.8), capsule(a.w, 6, a.h, 5)];
  }
  function legShapes(l) {
    return [capsule(l.h, 23, l.k, 13), capsule(l.k, 13, l.a, 7.5), capsule(l.a, 7, l.t, 3.2)];
  }
  function skinGroup(ds, skin, p) {
    return `<g>${ds.map(d => `<path d="${d}" fill="${OUTLINE}" stroke="${OUTLINE}" stroke-width="3"/>`).join('')}${ds.map(d => `<path d="${d}" fill="${skin}"/>`).join('')}${ds.map(d => `<path d="${d}" fill="url(#${p}-sh-skin)"/>`).join('')}</g>`;
  }
  function torsoSkin() {
    const left = TORSO.slice(0, 7);
    const pts = [[189, 114]].concat(left, [[178, 318], [200, 330]], left.slice().reverse().map(q => [400 - q[0], q[1]]), [[211, 114]]);
    return smooth(pts, true);
  }

  /* ---------- Felsőrész ---------- */
  const NECK = {
    kerek: { ly: 128, ry: 128, d: 'L180 118Q200 150 220 118' },
    v: { ly: 128, ry: 128, d: 'L184 115L200 176L216 115' },
    kare: { ly: 128, ry: 128, d: 'L178 119L178 152L222 152L222 119' },
    garbo: { ly: 128, ry: 128, d: 'L186 113L187 93Q200 90 213 93L214 113' },
    halter: { ly: 168, ry: 168, d: 'L187 104L195 104L200 150L205 104L213 104' },
    pantnelkuli: { ly: 166, ry: 166, d: 'Q200 156 234 166' },
    spagetti: { ly: 168, ry: 168, d: 'Q182 148 200 164Q218 148 234 168' },
    egyvallas: { ly: 128, ry: 172, d: 'L186 116L236 172' }
  };

  function sidePoints(y0, y1, right) {
    const pts = [];
    const ys = [y0];
    TORSO.forEach(q => { if (q[1] > y0 + 2 && q[1] < y1 - 2) ys.push(q[1]); });
    ys.push(y1);
    ys.forEach(y => pts.push([right ? xR(y) + 1.5 : xL(y) - 1.5, y]));
    return right ? pts : pts.reverse();
  }

  function topHemY(len) { return { crop: 196, waist: 234, tunic: 302, leotard: 276 }[len] || 234; }

  function bodicePath(top) {
    const nk = NECK[top.neckline] || NECK.kerek;
    const hem = topHemY(top.length);
    const startL = [xL(nk.ly) - 1.5, nk.ly];
    let d = 'M' + pt(startL) + nk.d + 'L' + pt([xR(nk.ry) + 1.5, nk.ry]);
    d += smooth(sidePoints(nk.ry, hem, true), false, true).replace(/^/, '');
    if (top.length === 'leotard') {
      d += 'Q214 300 211 327L189 327Q186 300 ' + f(xL(hem) - 1.5) + ' ' + hem;
    } else {
      d += 'Q200 ' + (hem + 7) + ' ' + f(xL(hem) - 1.5) + ' ' + hem;
    }
    d += smooth(sidePoints(nk.ly, hem, false), false, true) + 'Z';
    return d;
  }

  function sleeveShapes(a, type) {
    const P = (x, y, t) => lerpP(x, y, t);
    switch (type) {
      case 'kis': return [capsule(a.s, 14, P(a.s, a.e, 0.22), 13)];
      case 'rovid': return [capsule(a.s, 14, P(a.s, a.e, 0.55), 11.5)];
      case 'puff': return [capsule(a.s, 18, P(a.s, a.e, 0.42), 16), capsule(P(a.s, a.e, 0.45), 11, P(a.s, a.e, 0.52), 10)];
      case 'haromnegyed': return [capsule(a.s, 14, a.e, 10.5), capsule(a.e, 10.5, P(a.e, a.w, 0.55), 8.5)];
      case 'hosszu': return [capsule(a.s, 14, a.e, 10.5), capsule(a.e, 10.5, a.w, 8)];
      case 'harang': {
        const m = P(a.e, a.w, 0.35);
        const dx = a.h[0] - a.e[0], dy = a.h[1] - a.e[1], L = Math.hypot(dx, dy) || 1;
        const nx = -dy / L, ny = dx / L, ux = dx / L, uy = dy / L;
        const end = [a.w[0] + ux * 14, a.w[1] + uy * 14];
        const bell = 'M' + pt([m[0] + nx * 9, m[1] + ny * 9]) +
          'Q' + pt([end[0] + nx * 16 - ux * 14, end[1] + ny * 16 - uy * 14]) + ' ' + pt([end[0] + nx * 30, end[1] + ny * 30]) +
          'Q' + pt([end[0] + ux * 10, end[1] + uy * 10]) + ' ' + pt([end[0] - nx * 30, end[1] - ny * 30]) +
          'Q' + pt([end[0] - nx * 16 - ux * 14, end[1] - ny * 16 - uy * 14]) + ' ' + pt([m[0] - nx * 9, m[1] - ny * 9]) + 'Z';
        return [capsule(a.s, 14, a.e, 10.5), capsule(a.e, 10.5, m, 9.5), bell];
      }
      default: return [];
    }
  }

  function topDetail(top, p, accentRef, skin, sk, phase) {
    const hem = topHemY(top.length) + 10;
    switch (top.detail) {
      case 'kozepbetet': return `<path d="M188 150L212 150L206 ${hem}L194 ${hem}Z" fill="${accentRef}" stroke="${OUTLINE}" stroke-width="1.2"/>`;
      case 'kivagas': return `<g fill="${skin}" stroke="${OUTLINE}" stroke-width="1.4"><ellipse cx="183" cy="214" rx="7" ry="17" transform="rotate(14 183 214)"/><ellipse cx="217" cy="214" rx="7" ry="17" transform="rotate(-14 217 214)"/></g>`;
      case 'fuzes': {
        let z = ''; const y1 = Math.min(hem - 12, 290);
        for (let y = 170; y < y1; y += 14) z += `M194 ${y}L206 ${y + 14}M206 ${y}L194 ${y + 14}`;
        return `<path d="${z}" stroke="${accentRef}" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M193 166V${y1}M207 166V${y1}" stroke="${OUTLINE}" stroke-width="1" stroke-dasharray="2 4"/>`;
      }
      case 'atlos': return `<path d="M140 150L176 112L280 280L246 316Z" fill="${accentRef}" stroke="${OUTLINE}" stroke-width="1.2"/>`;
      case 'colorblock': return `<path d="M200 80L300 80L300 340L200 340Z" fill="${accentRef}" stroke="${OUTLINE}" stroke-width="1.2"/>`;
      case 'halo': return `<path d="M120 80H280V170Q200 182 120 170Z" fill="${skin}"/><path d="M120 80H280V170Q200 182 120 170Z" fill="url(#${p}-net)"/><path d="M150 170Q200 182 250 170" stroke="${OUTLINE}" stroke-width="1.3" fill="none"/>`;
      default: return '';
    }
  }

  /* ---------- Alsórész ---------- */
  function waistY(b, top) {
    const w = { magas: 212, derek: 232, csipo: 264 }[b.waist] || 232;
    return w;
  }

  function pelvis(wy) {
    const pts = sidePoints(wy, 292, false).reverse(); // bal oldal felülről lefelé
    const ptsR = sidePoints(wy, 292, true);
    return 'M' + pt(pts[0]) + smooth(pts, false, true) + 'Q168 316 200 332Q232 316 ' + pt(ptsR[ptsR.length - 1]) +
      smooth(ptsR.slice().reverse(), false, true) + 'Z';
  }

  function pantLeg(l, type, sway) {
    const P = (a, b, t) => lerpP(a, b, t);
    const dx = l.a[0] - l.k[0], dy = l.a[1] - l.k[1], L = Math.hypot(dx, dy) || 1;
    const u = [dx / L, dy / L];
    const ext = (t) => [l.a[0] + u[0] * t, l.a[1] + u[1] * t];
    // a szár teteje kicsit a csípőízület fölött és beljebb indul, hogy ne lógjon ki a medencerészből
    l = Object.assign({}, l, { h: [l.h[0] + (l.h[0] < 200 ? 3 : -3), l.h[1] - 10] });
    switch (type) {
      case 'leggings': return ribbon([l.h, P(l.h, l.k, 0.5), l.k, P(l.k, l.a, 0.5), l.a], [22, 19, 14.5, 12, 9]);
      case 'short': return ribbon([l.h, P(l.h, l.k, 0.36)], [22.5, 21.5]);
      case 'palazzo': {
        const hw = 37 + sway * 4;
        return ribbon([l.h, P(l.h, l.k, 0.5), l.k, P(l.k, l.a, 0.5), ext(12)], [22.5, 26, 28, 32, hw]);
      }
      case 'trapez': return ribbon([l.h, P(l.h, l.k, 0.5), l.k, P(l.k, l.a, 0.45), ext(10)], [22, 19.5, 15, 17, 29 + sway * 2]);
      case 'buggyos': return ribbon([l.h, P(l.h, l.k, 0.5), l.k, P(l.k, l.a, 0.55), P(l.k, l.a, 0.85), l.a], [23, 29, 31, 28 + sway * 2, 17, 10]);
      default: return '';
    }
  }

  /* Szoknya – visszaadja a darabokat és a szegély pontjait */
  function skirt(b, wy, sway, spin, phase) {
    const out = { ds: [], hem: [], folds: [] };
    const w0 = (xR(wy) - xL(wy)) / 2 + 2;
    const flare = b.flare != null ? b.flare : 0.5;
    const lens = { mini: 350, midi: 470, maxi: 618, asym: [372, 590], zsebkendo: 470, retegelt: 480, sliccelt: 618, tutu: 0 };
    const N = 28;
    const lift = 1 - spin * 0.22 * (0.6 + sway * 0.4);

    if (b.type === 'tutu') {
      const ty = Math.max(wy, 258) + 6;
      const layers = [[150, 32, 0.9], [138, 24, 1], [124, 16, 1]];
      layers.forEach(([W, th, o], li) => {
        const Wd = W + spin * 10;
        let top = [[200 - w0 + 2, ty - 6]];
        top.push([200 - Wd * 0.75, ty + 2 - spin * 6], [200 - Wd, ty + th * 0.6 - spin * 10]);
        const bottom = [];
        const n = 22;
        for (let i = 0; i <= n; i++) {
          const x = 200 - Wd + (2 * Wd) * i / n;
          const edge = Math.abs(x - 200) / Wd;
          const yy = ty + th + (1 - edge * edge) * 10 + (i % 2 ? -5 : 4) - spin * 10 * edge;
          bottom.push([x, yy]);
        }
        const d = 'M' + pt(top[0]) + 'Q' + pt(top[1]) + ' ' + pt(top[2]) +
          bottom.map(q => 'L' + pt(q)).join('') +
          'Q' + pt([400 - top[1][0], top[1][1]]) + ' ' + pt([200 + w0 - 2, ty - 6]) + 'Z';
        out.ds.push(d);
        if (li === 0) out.hem = bottom;
      });
      out.separate = true;
      return out;
    }

    const tiers = b.type === 'retegelt' ? [1, 0.74, 0.48] : [1];
    out.separate = tiers.length > 1;
    tiers.forEach((tf, ti) => {
      let hemL, hemR;
      if (Array.isArray(lens[b.type])) { [hemL, hemR] = lens[b.type]; }
      else hemL = hemR = lens[b.type] || 470;
      hemL = wy + (hemL - wy) * tf * lift; hemR = wy + (hemR - wy) * tf * lift;
      const avg = (hemL + hemR) / 2 - wy;
      const W = w0 + avg * (0.12 + flare * 0.5 + spin * 0.45 * (0.5 + sway));
      const folds = 4 + Math.round(flare * 5);
      const amp = (2.5 + flare * 7 + spin * 8) * (0.6 + sway * 0.6);
      const hem = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N, x = 200 - W + 2 * W * u;
        let y = lerp(hemL, hemR, u) + (1 - Math.pow(2 * u - 1, 2)) * W * 0.1;
        y += Math.sin(u * folds * Math.PI * 2 + phase * (1 + sway)) * amp;
        if (b.type === 'zsebkendo') {
          const k = (u * 6) % 1; y += (k < 0.5 ? k : 1 - k) * -90 + 30;
        }
        hem.push([x + Math.cos(u * folds * Math.PI * 2 + phase) * amp * 0.4, y]);
      }
      const sideL = [200 - w0, wy], midL = [200 - w0 - (W - w0) * 0.42, wy + ((hemL - wy)) * 0.5];
      const sideR = [200 + w0, wy], midR = [200 + w0 + (W - w0) * 0.42, wy + ((hemR - wy)) * 0.5];
      let d = 'M' + pt(sideR) + smooth([sideR, midR, hem[N]], false, true);
      if (b.type === 'zsebkendo') d += hem.slice().reverse().map(q => 'L' + pt(q)).join('');
      else d += 'L' + pt(hem[N]) + smooth(hem.slice().reverse(), false, true);
      d += smooth([hem[0], midL, sideL], false, true) + 'Q200 ' + f(wy + 4) + ' ' + pt(sideR) + 'Z';
      out.ds.push(d);
      if (ti === 0) out.hem = hem;
      // redők
      if (ti === tiers.length - 1 || b.type !== 'retegelt') {
        const fl = [];
        for (let i = 1; i < folds * 2; i += 2) {
          const u = (i / (folds * 2));
          const h = hem[Math.round(u * N)];
          fl.push(`M${f(200 - w0 + 2 * w0 * u)} ${f(wy + 8)}Q${f(lerp(200 - w0 + 2 * w0 * u, h[0], 0.45))} ${f(lerp(wy, h[1], 0.55))} ${pt(h)}`);
        }
        out.folds.push(fl.join(''));
      }
    });
    return out;
  }

  /* ---------- Haj, fej ---------- */
  function hairBack(type, color, phase, spin) {
    switch (type) {
      case 'hosszu': return `<path d="M172 60Q164 120 160 200Q178 214 200 206Q222 214 240 200Q236 120 228 60Z" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>`;
      case 'copf': {
        const sw = Math.sin(phase * 1.3) * (10 + spin * 25);
        return `<path d="M222 46Q${f(250 + sw)} 60 ${f(244 + sw * 1.4)} 110Q${f(236 + sw * 1.8)} 150 ${f(246 + sw * 2)} 170Q${f(222 + sw)} 140 ${f(228 + sw * 0.6)} 100Q232 70 214 54Z" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>`;
      }
      default: return '';
    }
  }
  function hairFront(type, color) {
    const cap = `<path d="M174 64Q170 30 200 30Q230 30 226 64Q222 44 200 42Q178 44 174 64Z" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>`;
    switch (type) {
      case 'konty': return cap + `<circle cx="200" cy="25" r="13" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/><path d="M190 22q10 6 20 0" stroke="#000" stroke-opacity=".25" fill="none"/>`;
      case 'rovid': return `<path d="M172 70Q166 26 200 28Q236 28 229 70Q226 46 214 44Q200 54 182 46Q174 52 172 70Z" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>`;
      case 'hosszu': case 'copf': return cap;
      default: return '';
    }
  }

  /* ---------- Háttér ---------- */
  function background(p, bg, W, H) {
    if (bg === 'szinpad') {
      return `<defs><radialGradient id="${p}-spot" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#3a3350"/><stop offset=".6" stop-color="#16121f"/><stop offset="1" stop-color="#07060b"/></radialGradient>
        <radialGradient id="${p}-pool" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <linearGradient id="${p}-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".02"/></linearGradient></defs>
        <rect width="${W}" height="${H}" fill="url(#${p}-spot)"/>
        <path d="M0 ${FLOOR - 40}H${W}V${H}H0Z" fill="#0d0b12" opacity=".6"/>
        <path d="M${W / 2 - 30} 0L${W / 2 + 30} 0L${W / 2 + 160} ${FLOOR + 20}L${W / 2 - 160} ${FLOOR + 20}Z" fill="url(#${p}-cone)"/>
        <ellipse cx="${W / 2}" cy="${FLOOR + 6}" rx="170" ry="30" fill="url(#${p}-pool)"/>`;
    }
    if (bg === 'papir') {
      let grid = '';
      for (let x = 0; x <= W; x += 20) grid += `M${x} 0V${H}`;
      for (let y = 0; y <= H; y += 20) grid += `M0 ${y}H${W}`;
      return `<rect width="${W}" height="${H}" fill="#fbf7ee"/><path d="${grid}" stroke="#d9cdb4" stroke-width=".5"/>
        <path d="M200 20V${H - 20}" stroke="#c9a98a" stroke-dasharray="4 6" stroke-width=".8"/>
        ${[33, 104, 192, 232, 300, 455, 605].map(y => `<path d="M14 ${y}H40" stroke="#b08e70" stroke-width=".8"/>`).join('')}`;
    }
    return `<defs><radialGradient id="${p}-studio" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ece6f1"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${p}-studio)"/>`;
  }

  function lightOverlay(p, light, W, H) {
    const L = D.lights[light];
    if (!L || !L.color || L.color === 'uv') return '';
    return `<rect width="${W}" height="${H}" fill="${L.color}" style="mix-blend-mode:multiply" opacity=".75"/>
      <rect width="${W}" height="${H}" fill="${L.color}" style="mix-blend-mode:screen" opacity=".08"/>`;
  }

  function styleFilter(p, style) {
    return `<filter id="${p}-uv" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="gamma" exponent="3.2" amplitude="1.25"/><feFuncG type="gamma" exponent="3.2" amplitude="1.1"/><feFuncB type="gamma" exponent="2.2" amplitude="1.35"/></feComponentTransfer>
        <feColorMatrix type="matrix" values="1.05 0 .15 0 .03  0 .95 .1 0 0  .2 0 1.2 0 .06  0 0 0 1 0" result="c"/><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="c"/></feMerge></filter>
      <filter id="${p}-sketch" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="3.5"/></filter>
      <filter id="${p}-aq" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" result="d"/><feGaussianBlur in="d" stdDeviation=".9" result="bl"/>
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="2" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -.9 .95" result="gr"/><feComposite in="bl" in2="gr" operator="arithmetic" k1="0" k2="1" k3="-.12" k4="0"/></filter>`;
  }

  /* ---------- Teljes alak ---------- */
  function figure(design, sk, p, motion, opts = {}) {
    const phase = motion.phase || 0, spin = motion.spin || 0;
    const d = design, top = d.top, b = d.bottom, x = d.extras || {};
    const skin = d.figure.skin, hairC = d.figure.hairColor;
    const defs = [];
    const mk = (name, fill) => { const m = TR.patterns.make(p + '-' + name, fill); if (m.def) defs.push(m.def); return m.ref; };
    const topRef = mk('top', top.fill);
    const bottomFill = b.matchTop ? top.fill : b.fill;
    const bottomRef = b.matchTop ? topRef : mk('bot', bottomFill);
    const accRef = mk('acc', d.accent.fill);
    const bottomFabric = b.matchTop ? top.fabric : b.fabric;
    const bInfo = D.bottoms[b.type] || D.bottoms.nincs;
    const sway = (D.fabrics[bottomFabric] || D.fabrics.jersey).sway;
    const wy = waistY(b, top);
    const parts = [];
    const M = TR.motifs;
    defs.push(M.gemDef(p));
    const bottomMotifs = ds => {
      const l = M.layer(d, 'bottom', p);
      if (!l || !ds.length) return '';
      defs.push(`<clipPath id="${p}-botclip">${ds.map(x => `<path d="${x}"/>`).join('')}</clipPath>`);
      return `<g clip-path="url(#${p}-botclip)">${l}</g>`;
    };

    // 1. hátsó réteg: haj, köpeny
    parts.push(hairBack(d.figure.hair, hairC, phase, spin));
    if (x.kopeny) {
      const A = sk.arm.L, B = sk.arm.R;
      const sw = Math.sin(phase) * (8 + spin * 20);
      const hl = [Math.min(A.w[0], 150) * 0.5 + 60 - spin * 30 + sw, 560 - spin * 60 - sk.oy * 0.3];
      const hr = [Math.max(B.w[0], 250) * 0.5 + 140 + spin * 30 + sw, 560 - spin * 60 - sk.oy * 0.3];
      const cape = 'M190 120' + 'L' + pt(A.s) + 'L' + pt(A.e) + 'L' + pt(A.w) +
        'Q' + pt([hl[0] - 10, lerp(A.w[1], hl[1], 0.5)]) + ' ' + pt(hl) +
        'Q' + pt([200 + sw, 640 - spin * 70 - sk.oy * 0.3]) + ' ' + pt(hr) +
        'Q' + pt([hr[0] + 10, lerp(B.w[1], hr[1], 0.5)]) + ' ' + pt(B.w) +
        'L' + pt(B.e) + 'L' + pt(B.s) + 'L210 120Z';
      parts.push(garment([cape], accRef, 'sifon', { p, opacity: 0.85 }));
    }

    // 2. lábak, törzs, nadrág
    parts.push(skinGroup(['L', 'R'].flatMap(s => legShapes(sk.leg[s])), skin, p));
    parts.push(skinGroup([capsule([200, 90], 10.5, [200, 120], 11.5), torsoSkin()], skin, p));
    if (bInfo.kind === 'pants') {
      const ds = [pelvis(wy)];
      ['L', 'R'].forEach(s => ds.push(pantLeg(sk.leg[s], b.type, Math.sin(phase + (s === 'L' ? 0 : 1.5)) * sway * (1 + spin * 2))));
      parts.push(garment(ds, bottomRef, bottomFabric, { p }));
      parts.push(bottomMotifs(ds));
    }

    // 4. szoknya
    let sk2 = null;
    const skirtGroup = () => {
      if (bInfo.kind !== 'skirt') return '';
      sk2 = skirt(b, wy, sway, spin, phase);
      let extra = sk2.folds.map(fl => `<path d="${fl}" fill="none" stroke="${OUTLINE}" stroke-opacity=".28" stroke-width="1.2"/>`).join('');
      let maskAttr = '';
      if (b.type === 'sliccelt') {
        defs.push(`<mask id="${p}-slit" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="760"><rect width="400" height="760" fill="#fff"/><path d="M226 ${f(wy + 150 - spin * 40)}L${f(206 - spin * 10)} 700L${f(262 + spin * 30)} 700Z" fill="#000"/></mask>`);
        maskAttr = ` mask="url(#${p}-slit)"`;
      }
      let ruffle = '';
      if (x.fodor && sk2.hem.length) ruffle = ruffleShape(sk2.hem, accRef);
      const body = sk2.separate
        ? sk2.ds.map((dd, i) => garment([dd], bottomRef, bottomFabric, { p, extra: i === sk2.ds.length - 1 ? extra : '' })).join('')
        : garment(sk2.ds, bottomRef, bottomFabric, { p, extra });
      return `<g${maskAttr}>${body}${bottomMotifs(sk2.ds)}</g>${ruffle}`;
    };
    if (top.length !== 'tunic') parts.push(skirtGroup());

    // 5. felsőrész (ujjak nélkül)
    const bodice = bodicePath(top);
    defs.push(`<clipPath id="${p}-topclip"><path d="${bodice}"/></clipPath>`);
    const det = topDetail(top, p, accRef, skin, sk, phase);
    parts.push(garment([bodice], topRef, top.fabric, { p, sequins: x.flitter, extra: det ? `<g clip-path="url(#${p}-topclip)">${det}</g>` : '' }));
    const topM = M.layer(d, 'top', p);
    if (topM) parts.push(`<g clip-path="url(#${p}-topclip)">${topM}</g>`);
    if (top.neckline === 'spagetti') parts.push(`<path d="M176 158L178 128M224 158L222 128" stroke="${OUTLINE}" stroke-width="4.5" stroke-linecap="round"/><path d="M176 158L178 128M224 158L222 128" stroke="${topRef}" stroke-width="2.6" stroke-linecap="round"/>`);
    if (top.length === 'tunic') parts.push(skirtGroup());

    // rojtok a felső szegélyén
    if (x.rojt) {
      const hy = topHemY(top.length) + (top.length === 'leotard' ? 4 : 2);
      let fr = '';
      for (let xx = xL(Math.min(hy, 300)) + 2; xx <= xR(Math.min(hy, 300)) - 2; xx += 4) {
        const dd = Math.abs(xx - 200);
        const y0 = top.length === 'leotard'
          ? (dd <= 11 ? 326 : 276 + Math.max(0, Math.min(1, (36 - dd) / 25)) * 48)
          : hy + 6 * (1 - Math.pow(dd / 40, 2));
        const len = 46 + Math.sin(xx * 0.7) * 4;
        const ang = Math.sin(phase * 1.5 + xx * 0.05) * (0.15 + spin * 0.6) * (xx < 200 ? -1 : 1) + (xx - 200) / 200 * spin * 1.2;
        fr += `M${f(xx)} ${f(y0)}l${f(Math.sin(ang) * len)} ${f(Math.cos(ang) * len)}`;
      }
      parts.push(`<path d="${fr}" stroke="${OUTLINE}" stroke-width="2.6" stroke-linecap="round" opacity=".6"/><path d="${fr}" stroke="${accRef}" stroke-width="1.6" stroke-linecap="round"/>`);
    }

    // öv
    if (x.ov) {
      const by = bInfo.kind !== 'none' ? wy : 232;
      const belt = `M${f(xL(by - 7) - 2)} ${by - 7}L${f(xR(by - 7) + 2)} ${by - 7}L${f(xR(by + 7) + 2)} ${by + 7}Q200 ${by + 10} ${f(xL(by + 7) - 2)} ${by + 7}Z`;
      parts.push(garment([belt], accRef, 'szatén', { p, extra: `<rect x="193" y="${by - 8}" width="14" height="16" rx="3" fill="none" stroke="${OUTLINE}" stroke-width="2"/>` }));
    }

    // lobogó szalag
    if (x.szalag) {
      const by = bInfo.kind !== 'none' ? wy : 232;
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        pts.push([xR(by) + 4 + i * (5 + spin * 9) + Math.sin(phase * 1.4 + i * 0.75) * (6 + i * 1.6) * (0.4 + spin),
          by + 4 + i * (34 - spin * 18)]);
      }
      parts.push(garment([ribbon(pts, pts.map((_, i) => 7 - i * 0.35))], accRef, 'szatén', { p }));
      parts.push(`<path d="M${f(xR(by) - 8)} ${by - 6}l12 6l-12 6z" fill="${accRef}" stroke="${OUTLINE}" stroke-width="1.5"/>`);
    }


    // 7. karok, ujjak, kesztyű
    ['L', 'R'].forEach(s => {
      const a = sk.arm[s];
      parts.push(skinGroup(armShapes(a), skin, p));
      const sl = ['halter', 'pantnelkuli', 'spagetti'].includes(top.neckline) || (top.neckline === 'egyvallas' && s === 'R') ? 'nincs' : top.sleeve;
      const ss = sleeveShapes(a, sl);
      if (ss.length) parts.push(garment(ss, topRef, top.fabric === 'halo' ? 'halo' : top.fabric, { p, sequins: x.flitter }));
      if (x.kesztyu) parts.push(garment([capsule(lerpP(a.s, a.e, 0.72), 9.4, a.e, 9), capsule(a.e, 9, a.w, 7.2), capsule(a.w, 7.2, a.h, 6.2)], accRef, 'szatén', { p }));
    });

    // 8. fej
    parts.push(skinGroup([`M175 64A25 31 0 1 0 225 64A25 31 0 1 0 175 64Z`], skin, p));
    parts.push(hairFront(d.figure.hair, hairC));
    if (x.fejdisz) {
      parts.push(`<path d="M176 50Q200 26 224 50" fill="none" stroke="${OUTLINE}" stroke-width="7" stroke-linecap="round"/><path d="M176 50Q200 26 224 50" fill="none" stroke="${accRef}" stroke-width="4.5" stroke-linecap="round"/>` +
        [[184, 40], [200, 36], [216, 40]].map(q => `<circle cx="${q[0]}" cy="${q[1] - 3}" r="${q[0] === 200 ? 6 : 4}" fill="${accRef}" stroke="${OUTLINE}" stroke-width="1.5"/>`).join(''));
    }
    if (x.nyakpant) parts.push(`<rect x="189" y="101" width="22" height="7" rx="3" fill="${accRef}" stroke="${OUTLINE}" stroke-width="1.6"/>`);

    parts.push(M.layer(d, 'szabad', p));
    if (opts.editMotifs) parts.push(M.editLayer(d, opts.selectedMotif));
    return { defs: defs.join(''), body: parts.join('') };
  }

  function ruffleShape(hem, ref) {
    let d = '';
    const n = hem.length;
    for (let i = 0; i < n - 1; i++) {
      const a = hem[i], b = hem[i + 1];
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 9];
      d += (i ? '' : 'M' + pt(a)) + 'Q' + pt(m) + ' ' + pt(b);
    }
    const up = hem.slice().reverse().map(q => 'L' + pt([q[0], q[1] - 8])).join('');
    return `<path d="${d}${up}Z" fill="${ref}" stroke="${OUTLINE}" stroke-width="1.6" stroke-linejoin="round"/>`;
  }

  /* ---------- Fő belépési pont ----------
     design: terv, view: {pose, bg, light, style}, opts: {idp, motion:{phase,spin}, poseData, nested:{x,y,w,h}, noBg} */
  function svg(design, view, opts = {}) {
    const p = opts.idp || 'f';
    const W = 400, H = 760;
    const pose = opts.poseData || poseByName(view.pose);
    const sk = skeleton(pose);
    const motion = opts.motion || { phase: 0, spin: 0 };
    const fig = figure(design, sk, p, motion, opts);
    const style = view.style || 'tiszta';
    const light = view.bg === 'szinpad' ? (view.light || 'feher') : 'feher';
    let figFilter = '';
    if (style === 'vazlat') figFilter = `url(#${p}-sketch)`;
    if (style === 'akvarell') figFilter = `url(#${p}-aq)`;
    const uv = light === 'uv';

    const inner = `<defs>${shadeDefs(p)}${styleFilter(p, style)}${fig.defs}</defs>
      ${opts.noBg ? '' : background(p, view.bg, W, H)}
      <ellipse cx="200" cy="${FLOOR + 4}" rx="${pose.air ? 45 : 70}" ry="9" fill="#000" opacity="${view.bg === 'szinpad' ? 0.45 : 0.14}"/>
      <g ${uv ? `filter="url(#${p}-uv)"` : ''}>
        ${uv ? `<rect width="${W}" height="${H}" fill="#12002b" opacity="${opts.noBg ? 0 : 0.85}"/>` : ''}
        <g transform="translate(200 ${FLOOR}) scale(${SCALE}) translate(-200 ${f(sk.oy - FLOOR)})" ${figFilter ? `filter="${figFilter}"` : ''} stroke-linejoin="round">${fig.body}</g>
      </g>
      ${opts.noBg ? '' : lightOverlay(p, light, W, H)}`;
    if (opts.nested) {
      const n = opts.nested;
      return `<svg x="${f(n.x)}" y="${f(n.y)}" width="${f(n.w)}" height="${f(n.h)}" viewBox="0 0 ${W} ${H}" overflow="visible">${inner}</svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${opts.width || W}" height="${opts.height || H}" class="figure-svg">${inner}</svg>`;
  }

  /* Képernyő (SVG viewBox) pont → az alak saját koordinátái */
  function toFigure(pt, pose) {
    const sk = skeleton(pose);
    return [(pt[0] - 200) / SCALE + 200, (pt[1] - FLOOR) / SCALE + FLOOR - sk.oy];
  }

  return { svg, toFigure, skeleton, lerpPose, poseByName, background, lightOverlay, FLOOR };
})();
