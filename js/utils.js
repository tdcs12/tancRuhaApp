/* Segédfüggvények: színek, geometria */
window.TR = window.TR || {};

TR.color = (() => {
  function hexToRgb(hex) {
    let h = String(hex || '#000').replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function hexToHsl(hex) {
    let [r, g, b] = hexToRgb(hex).map(v => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }
  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
    return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
  }
  function luminance(hex) {
    const [r, g, b] = hexToRgb(hex).map(v => {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }
  function shade(hex, amt) { return amt < 0 ? mix(hex, '#000000', -amt) : mix(hex, '#ffffff', amt); }
  function harmony(base, mode) {
    const [h, s, l] = hexToHsl(base);
    const S = Math.max(s, 0.35);
    switch (mode) {
      case 'komplementer': return [base, hslToHex(h, S, Math.min(l + 0.25, 0.9)), hslToHex(h + 180, S, l), hslToHex(h + 180, S, Math.max(l - 0.2, 0.12)), hslToHex(h, S * 0.3, 0.95)];
      case 'analog': return [hslToHex(h - 40, S, l), hslToHex(h - 20, S, l), base, hslToHex(h + 20, S, l), hslToHex(h + 40, S, l)];
      case 'triad': return [base, hslToHex(h + 120, S, l), hslToHex(h + 240, S, l), hslToHex(h, S, Math.max(l - 0.25, 0.1)), hslToHex(h + 120, S * 0.5, 0.92)];
      case 'split': return [base, hslToHex(h + 150, S, l), hslToHex(h + 210, S, l), hslToHex(h, S, Math.min(l + 0.3, 0.92)), hslToHex(h + 180, S * 0.4, 0.15)];
      case 'tetrad': return [base, hslToHex(h + 90, S, l), hslToHex(h + 180, S, l), hslToHex(h + 270, S, l), hslToHex(h, 0.1, 0.12)];
      default: return [hslToHex(h, S, 0.15), hslToHex(h, S, 0.32), base, hslToHex(h, S, 0.7), hslToHex(h, S * 0.6, 0.92)];
    }
  }
  function random(seedRand) {
    const r = seedRand || Math.random;
    return hslToHex(r() * 360, 0.5 + r() * 0.45, 0.35 + r() * 0.35);
  }
  return { hexToRgb, rgbToHex, hexToHsl, hslToHex, luminance, mix, shade, harmony, random };
})();

TR.util = (() => {
  const f = n => (Math.round(n * 10) / 10).toString();
  const pt = p => f(p[0]) + ' ' + f(p[1]);
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpP = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const rad = d => d * Math.PI / 180;

  /* Catmull-Rom görbe → köbös Bézier SVG parancsok (M nélkül, ha cont = true) */
  function smooth(points, closed, cont) {
    const n = points.length;
    if (n < 2) return '';
    let d = cont ? '' : 'M' + pt(points[0]);
    const get = i => closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))];
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += 'C' + pt(c1) + ' ' + pt(c2) + ' ' + pt(p2);
    }
    if (closed) d += 'Z';
    return d;
  }

  /* Két különböző sugarú kör burka – kúpos „kapszula” végtagokhoz */
  function capsule(A, rA, B, rB) {
    const dx = B[0] - A[0], dy = B[1] - A[1];
    let d = Math.hypot(dx, dy);
    if (d < 0.01) d = 0.01;
    const th = Math.atan2(dy, dx);
    let c = (rA - rB) / d; c = Math.max(-0.999, Math.min(0.999, c));
    const al = Math.acos(c);
    const e = (r, a, P) => [P[0] + r * Math.cos(a), P[1] + r * Math.sin(a)];
    const a1 = e(rA, th + al, A), b1 = e(rB, th + al, B), b2 = e(rB, th - al, B), a2 = e(rA, th - al, A);
    const largeB = 2 * al > Math.PI ? 1 : 0, largeA = 2 * Math.PI - 2 * al > Math.PI ? 1 : 0;
    return 'M' + pt(a1) + 'L' + pt(b1) + 'A' + f(rB) + ' ' + f(rB) + ' 0 ' + largeB + ' 0 ' + pt(b2) +
      'L' + pt(a2) + 'A' + f(rA) + ' ' + f(rA) + ' 0 ' + largeA + ' 0 ' + pt(a1) + 'Z';
  }

  /* Szalag egy töröttvonal mentén változó félszélességgel (lapos végek) */
  function ribbon(points, hw) {
    const n = points.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = points[Math.max(0, i - 1)], b = points[Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
      const nx = -ty, ny = tx, w = hw[i];
      L.push([points[i][0] + nx * w, points[i][1] + ny * w]);
      R.push([points[i][0] - nx * w, points[i][1] - ny * w]);
    }
    return smooth(L, false) + 'L' + pt(R[n - 1]) + smooth(R.slice().reverse(), false, true) + 'Z';
  }

  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  return { f, pt, lerp, lerpP, rad, smooth, capsule, ribbon, seeded, pick, esc, clone, uid };
})();
