/* Képből minta: betöltés, kicsinyítés, színpaletta kinyerése */
window.TR = window.TR || {};

TR.imagetools = (() => {
  function loadFile(file, maxSize = 320) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) { reject(new Error('Nem képfájl')); return; }
      const rd = new FileReader();
      rd.onerror = () => reject(new Error('Nem sikerült beolvasni'));
      rd.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('A kép nem nyitható meg'));
        img.onload = () => {
          const k = Math.min(1, maxSize / Math.max(img.width, img.height));
          const cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(img.width * k)); cv.height = Math.max(1, Math.round(img.height * k));
          const ctx = cv.getContext('2d');
          ctx.drawImage(img, 0, 0, cv.width, cv.height);
          const palette = extractPalette(ctx.getImageData(0, 0, cv.width, cv.height).data, 6);
          resolve({ dataUrl: cv.toDataURL('image/jpeg', 0.86), palette, width: cv.width, height: cv.height });
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }

  /* k-közép csoportosítás a pixelek egy mintáján; gyakoriság szerint rendezett színek */
  function extractPalette(data, k = 6) {
    const px = [];
    const step = Math.max(1, Math.floor(data.length / 4 / 4000));
    for (let i = 0; i < data.length; i += 4 * step) if (data[i + 3] > 128) px.push([data[i], data[i + 1], data[i + 2]]);
    if (!px.length) return ['#888888'];
    let cent = [];
    for (let i = 0; i < k; i++) cent.push(px[Math.floor((i + 0.5) / k * px.length)].slice());
    let counts = new Array(k).fill(0);
    for (let it = 0; it < 10; it++) {
      const sums = cent.map(() => [0, 0, 0]); counts = new Array(k).fill(0);
      px.forEach(p => {
        let best = 0, bd = Infinity;
        cent.forEach((c, j) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; best = j; } });
        sums[best][0] += p[0]; sums[best][1] += p[1]; sums[best][2] += p[2]; counts[best]++;
      });
      cent = cent.map((c, j) => counts[j] ? sums[j].map(v => v / counts[j]) : c);
    }
    const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    const out = cent.map((c, j) => ({ c: hex(c), n: counts[j] })).sort((a, b) => b.n - a.n);
    // a nagyon hasonló színek összevonása
    const uniq = [];
    out.forEach(o => {
      const rgb = TR.color.hexToRgb(o.c);
      if (!uniq.some(u => { const r = TR.color.hexToRgb(u); return Math.abs(r[0] - rgb[0]) + Math.abs(r[1] - rgb[1]) + Math.abs(r[2] - rgb[2]) < 40; })) uniq.push(o.c);
    });
    return uniq;
  }

  return { loadFile, extractPalette };
})();
