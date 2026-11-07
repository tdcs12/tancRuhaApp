/* Szabásminta-generátor: a terv és a méretek alapján közelítő szabásmintát rajzol (cm-ben) */
window.TR = window.TR || {};

TR.sewing = (() => {
  const D = TR.data;
  const f = n => (Math.round(n * 10) / 10).toString();

  const SIZES = {
    gy140: { name: 'Gyerek 140', magassag: 140, mell: 70, derek: 60, csipo: 74, hathossz: 32, vall: 31, karhossz: 47, felkar: 21, csuklo: 13.5, comb: 42, belsoLab: 62 },
    gy152: { name: 'Gyerek 152', magassag: 152, mell: 76, derek: 62, csipo: 80, hathossz: 35, vall: 34, karhossz: 52, felkar: 23, csuklo: 14, comb: 46, belsoLab: 68 },
    xs: { name: 'Női XS', magassag: 160, mell: 80, derek: 63, csipo: 87, hathossz: 38, vall: 36, karhossz: 57, felkar: 25, csuklo: 14.5, comb: 50, belsoLab: 73 },
    s: { name: 'Női S', magassag: 164, mell: 84, derek: 66, csipo: 90, hathossz: 39, vall: 37, karhossz: 58, felkar: 26, csuklo: 15, comb: 52, belsoLab: 74 },
    m: { name: 'Női M', magassag: 168, mell: 90, derek: 72, csipo: 96, hathossz: 40, vall: 38.5, karhossz: 59, felkar: 28, csuklo: 15.5, comb: 55, belsoLab: 76 },
    l: { name: 'Női L', magassag: 172, mell: 96, derek: 78, csipo: 102, hathossz: 41, vall: 40, karhossz: 60, felkar: 30, csuklo: 16, comb: 58, belsoLab: 77 },
    ferfi: { name: 'Férfi M', magassag: 180, mell: 98, derek: 84, csipo: 98, hathossz: 45, vall: 45, karhossz: 63, felkar: 31, csuklo: 17, comb: 56, belsoLab: 82 }
  };
  const FIELDS = [
    ['magassag', 'Testmagasság'], ['mell', 'Mellbőség'], ['derek', 'Derékbőség'], ['csipo', 'Csípőbőség'],
    ['hathossz', 'Háthossz (nyakcsigolya–derék)'], ['vall', 'Vállszélesség'], ['karhossz', 'Karhossz'],
    ['felkar', 'Felkarbőség'], ['csuklo', 'Csuklóbőség'], ['comb', 'Combbőség'], ['belsoLab', 'Belső lábhossz']
  ];
  const STRETCH = { lycra: 0.9, halo: 0.92, lame: 0.95, jersey: 0.96 };

  const defaults = () => Object.assign({ size: 's' }, SIZES.s);

  /* --- útvonal-építő: pontlista szakaszokkal, tükrözhető / megfordítható --- */
  function half(start) { return [{ p: start }]; }
  const L = (seg, x, y) => { seg.push({ p: [x, y] }); return seg; };
  const Q = (seg, cx, cy, x, y) => { seg.push({ c: [cx, cy], p: [x, y] }); return seg; };
  const mirror = seg => seg.map(s => ({ p: [-s.p[0], s.p[1]], c: s.c ? [-s.c[0], s.c[1]] : undefined }));
  function reverse(seg) {
    const out = [{ p: seg[seg.length - 1].p }];
    for (let i = seg.length - 1; i > 0; i--) out.push({ p: seg[i - 1].p, c: seg[i].c });
    return out;
  }
  function toD(seg, cont) {
    return seg.map((s, i) => {
      if (i === 0) return cont ? '' : 'M' + f(s.p[0]) + ' ' + f(s.p[1]);
      return s.c ? 'Q' + f(s.c[0]) + ' ' + f(s.c[1]) + ' ' + f(s.p[0]) + ' ' + f(s.p[1]) : 'L' + f(s.p[0]) + ' ' + f(s.p[1]);
    }).join('');
  }
  const pts = seg => seg.flatMap(s => s.c ? [s.p, s.c] : [s.p]);
  function bbox(points) {
    const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }

  /* --- felsőrész fele (középvonaltól a szélig, felülről lefelé) --- */
  function bodiceHalf(m, top, neck, back, k) {
    const sv = top.length === 'leotard' && k < 1 ? 0.95 : 1; // függőleges nyúlás
    const B = m.mell * k + (k < 1 ? 0 : 6), W = m.derek * k + (k < 1 ? 0 : 3), H = m.csipo * k + (k < 1 ? 0 : 5);
    const bq = B / 4 + (back ? -0.5 : 0.5), wq = W / 4 + (back ? -0.5 : 0.5), hq = H / 4;
    const ad = m.mell / 8 + (k < 1 ? 5.5 : 7);
    const bl = m.hathossz * sv + (back ? 0 : 1);
    const nw = m.mell / 12, sw = m.vall / 2;
    let s;
    const shoulder = sg => { L(sg, sw, 4.5); return Q(sg, sw - 0.5, ad - 4, bq, ad); };
    switch (neck) {
      case 'v': s = back ? Q(half([0, 2]), nw * 0.9, 2, nw, 0) : L(half([0, 18]), nw, 0); shoulder(s); break;
      case 'kare': s = back ? Q(half([0, 2]), nw * 0.9, 2, nw, 0) : L(L(half([0, 12]), nw - 1, 12), nw, 0); shoulder(s); break;
      case 'halter':
        s = back ? Q(half([0, ad + 3]), bq * 0.5, ad + 2, bq, ad) : Q(L(half([0, 14]), nw - 2, 0), nw + 1, ad - 4, bq, ad);
        break;
      case 'pantnelkuli': s = Q(half([0, back ? ad + 2 : ad - 4]), bq * 0.5, back ? ad + 1 : ad - 5, bq, back ? ad : ad - 2); break;
      case 'spagetti':
        s = back ? Q(half([0, ad + 2]), bq * 0.5, ad + 1, bq, ad)
          : Q(Q(half([0, ad - 3]), bq * 0.25, ad - 10, bq * 0.55, ad - 8), bq * 0.9, ad - 5, bq, ad - 1);
        break;
      case 'diag': s = Q(half([0, back ? 2 : 8]), bq * 0.5, ad * 0.5 + 2, bq, ad); break; // egyvállas szabad oldala
      default: s = Q(half([0, back ? 2 : (neck === 'garbo' ? 7 : 8)]), nw * 0.9, back ? 2 : 8, nw, 0); shoulder(s);
    }
    // oldalvarrás és alj
    const xAt = (y) => y <= bl ? bq + (wq - bq) * (y - ad) / (bl - ad) : wq + (hq - wq) * Math.min(1, (y - bl) / 20);
    switch (top.length) {
      case 'crop': { const y = ad + 9; L(s, xAt(y), y); L(s, 0, y + 1); break; }
      case 'tunic': L(s, wq, bl); Q(s, hq, bl + 8, hq, bl + 20); L(s, hq, bl + 22); L(s, 0, bl + 23); break;
      case 'leotard': {
        const cd = (m.csipo / 10 + 17) * sv;
        L(s, wq, bl); Q(s, hq + 0.5, bl + 7, hq, bl + 11);
        if (back) Q(s, hq * 0.85, bl + cd - 2, 4, bl + cd + 1); else Q(s, hq * 0.5, bl + 14, 3.5, bl + cd - 1);
        L(s, 0, bl + (back ? cd + 1 : cd - 1));
        break;
      }
      default: L(s, wq, bl); L(s, 0, bl + 1);
    }
    return s;
  }

  function bodicePiece(m, top, back, k) {
    const neck = top.neckline;
    if (neck === 'egyvallas') {
      const left = bodiceHalf(m, top, 'kerek', back, k), right = bodiceHalf(m, top, 'diag', back, k);
      // bal fél tükrözve (megfordítva) + jobb fél
      const lm = reverse(mirror(left));
      const d = toD(lm) + toD(right, true) + 'Z';
      return { d, points: pts(lm).concat(pts(right)), fold: false, cut: '1× (aszimmetrikus, nem hajtásra)' };
    }
    const h = bodiceHalf(m, top, neck, back, k);
    return { d: toD(h) + 'Z', points: pts(h), fold: true, cut: '1× hajtásra' };
  }

  function sleevePiece(m, type, k) {
    const st = k < 1;
    const ch = m.mell / 8 * 0.75 + (st ? 1.5 : 3.5) + (type === 'puff' ? 4 : 0);
    let bh = (m.felkar * k + (st ? 0 : 4)) / 2 + (type === 'puff' ? 6 : 0);
    const wristH = (m.csuklo * k) / 2 + (st ? 0.5 : 2);
    let len, hh;
    switch (type) {
      case 'kis': len = 7; hh = bh; break;
      case 'rovid': len = 20; hh = bh - 1; break;
      case 'puff': len = 22; hh = (m.felkar * k) / 2 + 1; break;
      case 'haromnegyed': len = m.karhossz * 0.72; hh = bh + (wristH - bh) * 0.6; break;
      case 'harang': len = m.karhossz; hh = bh + 14; break;
      default: len = m.karhossz; hh = wristH;
    }
    const d = `M${f(-bh)} ${f(ch)}C${f(-bh * 0.6)} ${f(ch * 0.85)} ${f(-bh * 0.45)} 0 0 0C${f(bh * 0.45)} 0 ${f(bh * 0.6)} ${f(ch * 0.85)} ${f(bh)} ${f(ch)}` +
      (type === 'harang' ? `L${f(bh - 1)} ${f(len * 0.45)}Q${f(hh - 6)} ${f(len * 0.8)} ${f(hh)} ${f(len)}Q0 ${f(len + 3)} ${f(-hh)} ${f(len)}Q${f(-hh + 6)} ${f(len * 0.8)} ${f(-bh + 1)} ${f(len * 0.45)}Z`
        : `L${f(hh)} ${f(len)}L${f(-hh)} ${f(len)}Z`);
    return { d, points: [[-Math.max(bh, hh), 0], [Math.max(bh, hh), len + 3]], cut: '2× (tükrözve)', fold: false };
  }

  /* --- szoknya --- */
  function skirtPieces(m, b, k, waistC) {
    const out = [];
    const flare = b.flare != null ? b.flare : 0.5;
    const h = m.magassag;
    const maxiL = h * 0.6 - 3;
    const lens = { mini: h * 0.17, midi: h * 0.37, maxi: maxiL, sliccelt: maxiL, asym: [h * 0.21, maxiL * 0.95], zsebkendo: h * 0.33, retegelt: h * 0.37, tutu: h * 0.11 };
    const t = b.type;
    if (t === 'retegelt') {
      const L = lens.retegelt / 3;
      [1.5, 2, 2.6].forEach((mult, i) => {
        const w = waistC * mult / 2;
        out.push({ name: `Szoknya – ${i + 1}. fodorsor`, d: `M0 0H${f(w)}V${f(L + 3)}H0Z`, points: [[0, 0], [w, L + 3]], fold: true, cut: '2× hajtásra (eleje + háta)', note: `Ráncold ${f(w * 2 / mult)} cm-re (az előző sor aljához).` });
      });
      return out;
    }
    if (t === 'tutu') {
      const w = 150;
      out.push({ name: 'Tütü – tüllréteg', d: `M0 0H${f(w)}V${f(lens.tutu + 6)}H0Z`, points: [[0, 0], [w, lens.tutu + 6]], fold: true, cut: '6–8 réteg, rétegenként 2× hajtásra', note: 'Az alsó rétegek a legrövidebbek, a felső a leghosszabb; a derékon (csípőn) sűrűn ráncolva.' });
      return out;
    }
    if (t === 'zsebkendo') {
      const r = waistC / (2 * Math.PI), side = 2 * (r + lens.zsebkendo * 0.75), c = side / 2;
      out.push({
        name: 'Zsebkendő-szoknya', d: `M0 0H${f(side)}V${f(side)}H0ZM${f(c - r)} ${f(c)}A${f(r)} ${f(r)} 0 1 0 ${f(c + r)} ${f(c)}A${f(r)} ${f(r)} 0 1 0 ${f(c - r)} ${f(c)}Z`,
        points: [[0, 0], [side, side]], fold: false, cut: '1× (négyzet, középen derékkivágás)', note: `Derékkivágás sugara ${f(r)} cm. Ha nincs ilyen széles anyag, vágd 4 negyedből.`
      });
      return out;
    }
    // körszoknya-cikkek
    const frac = 0.25 + Math.max(0, Math.min(1, flare)) * 0.75;
    const r = waistC / (2 * Math.PI * frac);
    const n = frac <= 0.5 ? 2 : 4;
    const span = 2 * Math.PI * frac / n;
    const a0 = Math.PI / 2 - span / 2, a1 = Math.PI / 2 + span / 2;
    const Ls = Array.isArray(lens[t]) ? lens[t] : [lens[t] || lens.midi, lens[t] || lens.midi];
    const N = 24, outer = [], inner = [];
    for (let i = 0; i <= N; i++) {
      const a = a0 + (a1 - a0) * i / N;
      inner.push([r * Math.cos(a), r * Math.sin(a)]);
      // aszimmetrikus: a hossz a cikkek mentén végig változik (a két szélső cikk között)
      const L = Ls[0] + (Ls[1] - Ls[0]) * (i / N);
      outer.push([(r + L) * Math.cos(a), (r + L) * Math.sin(a)]);
    }
    const d = 'M' + inner.map(p => f(p[0]) + ' ' + f(p[1])).join('L') + 'L' + outer.slice().reverse().map(p => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z';
    const kind = frac >= 0.95 ? 'teljes körszoknya' : frac >= 0.6 ? '¾ körszoknya' : frac >= 0.45 ? 'félkörszoknya' : 'enyhén harangos (A-vonal)';
    let note = `${kind}: derékív sugara ${f(r)} cm, hossz ${f(Ls[0])}${Ls[1] !== Ls[0] ? '–' + f(Ls[1]) : ''} cm. ${n} egyforma cikkből varrd össze.`;
    if (t === 'asym') note += ' Az egyik cikket tükrözve vágd, hogy a szegély egyenletesen emelkedjen.';
    if (t === 'sliccelt') note += ` Az egyik varrásnál hagyj kb. ${f(h * 0.4)} cm hosszú sliccet.`;
    out.push({ name: 'Szoknya – cikk', d, points: inner.concat(outer), fold: false, cut: `${n}×`, note, hem: (r + (Ls[0] + Ls[1]) / 2) * 2 * Math.PI * frac });
    return out;
  }

  /* --- nadrág --- */
  function pantsPieces(m, b, k) {
    const st = k < 1;
    const H = m.csipo * k + (st ? 0 : 5), W = m.derek * k + (st ? 0 : 3);
    const hq = H / 4, wq = W / 4;
    const cd = m.csipo / 10 + 16;
    const ins = m.belsoLab;
    const kneeC = m.comb * 0.72 * k, ankleC = 22 * k;
    let ky = cd + ins * 0.48, hy = cd + ins, kw, hw;
    switch (b.type) {
      case 'short': hy = cd + 6; ky = hy; kw = hw = (m.comb * k) / 4 + 1; break;
      case 'palazzo': kw = hq * 0.95; hw = hq * 1.15; break;
      case 'trapez': kw = kneeC / 4 + 1; hw = kneeC / 4 + 8; break;
      case 'buggyos': kw = hq; hw = ankleC / 4 + 1.5; break;
      default: kw = kneeC / 4; hw = ankleC / 4 + (st ? 0 : 1);
    }
    const make = (back) => {
      const ext = back ? H * 0.1 : H * 0.05, top = back ? -3 : 0;
      const xc = (hq - ext) / 2;
      const s = [[0, top], [wq, 0]];
      let d = `M0 ${top}L${f(wq + (back ? 1 : 0))} 0Q${f(hq)} 6 ${f(hq)} 18L${f(hq)} ${f(cd)}`;
      if (b.type === 'short') d += `L${f(xc + hw)} ${f(hy)}L${f(-ext)} ${f(hy)}`;
      else d += `L${f(xc + kw)} ${f(ky)}L${f(xc + hw)} ${f(hy)}L${f(xc - hw)} ${f(hy)}L${f(xc - kw)} ${f(ky)}`;
      d += `L${f(-ext)} ${f(cd)}Q${f(-0.5)} ${f(cd - 0.5)} 0 ${f(cd - 7)}Z`;
      return {
        name: back ? 'Nadrág – hátsó szár' : 'Nadrág – első szár', d,
        points: s.concat([[hq, cd], [-ext, hy], [xc + Math.max(kw, hw), hy]]), fold: false, cut: '2× (tükrözve)',
        note: back ? `Ülésmagasság ${f(cd)} cm, belső szárhossz ${f(ins)} cm.` : (b.type === 'buggyos' ? 'A szár alját gumizd vagy ráncold mandzsettába.' : '')
      };
    };
    return [make(false), make(true)];
  }

  /* --- teljes darabjegyzék --- */
  function draft(design, measures) {
    const m = Object.assign(defaults(), measures || {});
    const t = design.top, b = design.bottom, x = design.extras || {};
    const kTop = STRETCH[t.fabric] || 1;
    const bFab = b.matchTop ? t.fabric : b.fabric;
    const kBot = STRETCH[bFab] || 1;
    const pieces = [];
    const add = (p, fabric, zone) => pieces.push(Object.assign({ fabric, zone }, p));

    const front = bodicePiece(m, t, false, kTop), back = bodicePiece(m, t, true, kTop);
    const tl = D.topLength[t.length];
    add(Object.assign({ name: `${t.length === 'leotard' ? 'Body' : 'Felső'} – eleje`, note: `${tl}; nyak: ${D.necklines[t.neckline].toLowerCase()}.` }, front), t.fabric, 'top');
    add(Object.assign({ name: `${t.length === 'leotard' ? 'Body' : 'Felső'} – háta`, note: t.length === 'leotard' ? 'Az elejét és a hátát a lépésvarrásnál varrd össze; a lábkivágást gumizd.' : '' }, back), t.fabric, 'top');
    const noSleeve = ['halter', 'pantnelkuli', 'spagetti'].includes(t.neckline);
    if (!noSleeve && t.sleeve !== 'nincs') {
      const sp = sleevePiece(m, t.sleeve, kTop);
      if (t.neckline === 'egyvallas') sp.cut = '1×';
      add(Object.assign({ name: 'Ujj – ' + D.sleeves[t.sleeve].toLowerCase(), note: t.sleeve === 'puff' ? 'A kugli tetejét ráncold be a karöltőhöz.' : '' }, sp), t.fabric, 'top');
    }
    if (t.neckline === 'garbo') { const w = m.mell * 0.42; add({ name: 'Garbónyak', d: `M0 0H${f(w)}V16H0Z`, points: [[0, 0], [w, 16]], cut: '1× (hosszában félbehajtva)', note: '' }, t.fabric, 'top'); }
    if (t.neckline === 'spagetti') add({ name: 'Spagettipánt', d: 'M0 0H2.5V36H0Z', points: [[0, 0], [2.5, 36]], cut: '2× (hosszában félbehajtva)', note: 'Hosszát próbán igazítsd.' }, t.fabric, 'top');
    if (t.neckline === 'halter') add({ name: 'Nyakpánt / kötő', d: 'M0 0H5V48H0Z', points: [[0, 0], [5, 48]], cut: '2×', note: 'Patenttal vagy kapoccsal rögzítsd.' }, t.fabric, 'top');

    const kind = (D.bottoms[b.type] || {}).kind;
    const waistMap = { magas: m.derek - 2, derek: m.derek, csipo: m.derek + (m.csipo - m.derek) * 0.6 };
    const waistC = (waistMap[b.waist] || m.derek) + (kBot < 1 ? 0 : 2);
    if (kind === 'skirt') skirtPieces(m, b, kBot, waistC).forEach(p => add(p, bFab, 'bottom'));
    if (kind === 'pants') pantsPieces(m, b, kBot).forEach(p => add(p, bFab, 'bottom'));
    if (kind !== 'none' && t.length !== 'leotard') {
      const w = waistC * (kBot < 1 ? 0.9 : 1) + 3;
      add({ name: 'Derékpánt', d: `M0 0H${f(w)}V8H0Z`, points: [[0, 0], [w, 8]], cut: '1× (félbehajtva, gumival)', note: '' }, bFab, 'bottom');
    }

    const accent = 'szatén';
    if (x.kopeny) {
      const R = m.karhossz + 25;
      add({ name: 'Szárnyköpeny', d: `M${f(-R)} 0A${f(R)} ${f(R)} 0 0 0 ${f(R)} 0L8 0A8 8 0 0 1 -8 0Z`, points: [[-R, 0], [R, R]], cut: '1× (sifon)', note: 'A felső élet a vállvarráshoz, a sarkokat csuklópánthoz varrd.' }, 'sifon', 'accent');
    }
    if (x.ov) { const w = m.derek + 6; add({ name: 'Öv', d: `M0 0H${f(w)}V6H0Z`, points: [[0, 0], [w, 6]], cut: '1×', note: '' }, accent, 'accent'); }
    if (x.szalag) add({ name: 'Szalag', d: 'M0 0H5V70H0Z', points: [[0, 0], [5, 70]], cut: '1×', note: 'Max. combközépig érjen.' }, accent, 'accent');
    if (x.kesztyu) { const w = m.felkar * 0.9 / 2 + 1; add({ name: 'Kesztyű / karvédő', d: `M${f(-w)} 0H${f(w)}L${f(m.csuklo / 2 + 0.5)} ${f(m.karhossz * 0.75)}H${f(-m.csuklo / 2 - 0.5)}Z`, points: [[-w, 0], [w, m.karhossz * 0.75]], cut: '2× (lycra / háló)', note: 'Ujjatlan karvédőként a legegyszerűbb.' }, 'lycra', 'accent'); }

    // jegyzetek a nem kiszabott elemekhez
    const extraNotes = [];
    const skirtPiece = pieces.find(p => p.hem);
    if (x.rojt) extraNotes.push(`Rojt: kb. ${f(m.mell * 0.9)} cm hosszú rojtszalag a felső aljára (15–25 cm-es rojt).`);
    if (x.fodor) extraNotes.push(`Fodor: kb. ${f((skirtPiece ? skirtPiece.hem : m.csipo * 2) * 1.5 / 100)} m hosszú, 6–8 cm széles ferdecsík, 1,5× ráncolva.`);
    if (x.flitter) extraNotes.push('Flitter: felvarrható flitter vagy flitteres anyag – a fogási pontokat (derék, hát) hagyd ki.');
    if (x.fejdisz) extraNotes.push('Fejdísz: drótkeretre varrt díszítés, hajtűvel rögzítve.');
    if (x.nyakpant) extraNotes.push(`Nyakpánt: ${f(m.mell * 0.4)} cm hosszú, 2 cm széles pánt patenttal.`);
    const motifs = design.motifs || [];
    const strass = motifs.filter(mm => mm.type === 'strassz').reduce((s, mm) => s + (mm.repeat === 'egy' ? 1 : mm.count) * (mm.mirror ? 2 : 1), 0);
    if (strass) extraNotes.push(`Strasszkövek: a terven kb. ${strass} db látszik elölről – valós méretben ennek 5–10-szerese kell (SS16–SS30 méret).`);
    const others = motifs.filter(mm => mm.type !== 'strassz').length;
    if (others) extraNotes.push(`${others} rátétmotívum: vágd ki a díszítő anyagból (vagy flitterből), és varrd/ragaszd fel a terv szerint.`);

    // anyagszükséglet (140 cm-es anyagszélességgel számolva)
    const needs = {};
    pieces.forEach(p => {
      const pairs = /[AHV]/.test(p.d) ? [] : (p.d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number).reduce((a, v, i, arr) => (i % 2 ? a : a.concat([[v, arr[i + 1]]])), []);
      p.box = bbox(p.points.concat(pairs));
      const mult = parseInt(p.cut, 10) || 1;
      const w = p.box.w * (p.fold ? 2 : 1) + 3, h = p.box.h + 3;
      needs[p.fabric] = (needs[p.fabric] || 0) + (w * h * mult) / 140;
    });
    const fabricNeed = Object.keys(needs).map(k => ({ fabric: (D.fabrics[k] || { name: k }).name, meters: Math.max(0.3, Math.ceil(needs[k] * 1.15 / 10) / 10) }));
    return { m, pieces, extraNotes, fabricNeed, stretch: kTop < 1 || kBot < 1 };
  }

  /* --- elrendezés és SVG kirajzolás (1 egység = 1 cm) --- */
  function sheet(design, measures, opts = {}) {
    const res = draft(design, measures);
    const gap = 7, maxW = Math.max(130, ...res.pieces.map(p => p.box.w + 6));
    let x = gap, y = gap + 8, rowH = 0;
    const placed = res.pieces.slice().sort((a, b) => b.box.h - a.box.h).map(p => {
      const w = p.box.w + 4, h = p.box.h + 10;
      if (x + w > maxW + gap) { x = gap; y += rowH + gap; rowH = 0; }
      const pos = { p, x: x + 2 - p.box.x, y: y + 2 - p.box.y };
      x += w + gap; rowH = Math.max(rowH, h);
      return pos;
    });
    const W = maxW + gap * 2, H = y + rowH + gap;
    const tint = z => {
      const fill = z === 'top' ? design.top.fill : z === 'bottom' ? (design.bottom.matchTop ? design.top.fill : design.bottom.fill) : design.accent.fill;
      return fill.colors[0];
    };
    let grid = '';
    for (let gx = 0; gx <= W; gx += 1) grid += `<path d="M${gx} 0V${f(H)}" stroke="${gx % 10 ? '#eee6d6' : '#d8c8a8'}" stroke-width="${gx % 10 ? 0.04 : 0.09}"/>`;
    for (let gy = 0; gy <= H; gy += 1) grid += `<path d="M0 ${gy}H${f(W)}" stroke="${gy % 10 ? '#eee6d6' : '#d8c8a8'}" stroke-width="${gy % 10 ? 0.04 : 0.09}"/>`;
    const body = placed.map(({ p, x: px, y: py }) => {
      const b = p.box, cx = b.x + b.w / 2;
      const fold = p.fold ? `<path d="M0 ${f(b.y)}V${f(b.y + b.h)}" stroke="#b5179e" stroke-width=".3" stroke-dasharray="1.2 .8"/>
        <text x="-1.2" y="${f(b.y + b.h / 2)}" transform="rotate(-90 -1.2 ${f(b.y + b.h / 2)})" text-anchor="middle" font-size="1.5" fill="#b5179e" font-weight="700">HAJTÁS</text>` : '';
      const gxp = p.fold ? b.x + b.w * 0.45 : cx;
      const g1 = b.y + b.h * 0.12, g2 = b.y + b.h * 0.42;
      const grain = b.h < 16 ? '' : `<path d="M${f(gxp)} ${f(g1)}V${f(g2)}M${f(gxp - 0.8)} ${f(g1 + 1.4)}L${f(gxp)} ${f(g1)}L${f(gxp + 0.8)} ${f(g1 + 1.4)}M${f(gxp - 0.8)} ${f(g2 - 1.4)}L${f(gxp)} ${f(g2)}L${f(gxp + 0.8)} ${f(g2 - 1.4)}" stroke="#2b2233" stroke-width=".18" fill="none"/>`;
      const fs = Math.max(0.9, Math.min(2.4, b.w / 13));
      const ty = b.y + b.h * 0.5;
      const tx = gxp;
      return `<g transform="translate(${f(px)} ${f(py)})">
        <path d="${p.d}" fill="none" stroke="#efe2c9" stroke-width="2" stroke-linejoin="round" fill-rule="evenodd"/>
        <path d="${p.d}" fill="${tint(p.zone)}" fill-opacity=".14" stroke="#2b2233" stroke-width=".22" stroke-linejoin="round" fill-rule="evenodd"/>
        ${fold}${grain}
        <text text-anchor="middle" x="${f(tx)}" y="${f(ty)}" font-size="${f(fs)}" font-weight="700" fill="#2b2233">${esc(p.name)}</text>
        <text text-anchor="middle" x="${f(tx)}" y="${f(ty + fs * 1.25)}" font-size="${f(fs * 0.75)}" fill="#5b4f63">Szabás: ${esc(p.cut)}</text>
        <text text-anchor="middle" x="${f(tx)}" y="${f(ty + fs * 2.3)}" font-size="${f(fs * 0.75)}" fill="#5b4f63">${f(b.w)} × ${f(b.h)} cm</text>
      </g>`;
    }).join('');
    const scaleBox = `<g transform="translate(${f(W - 16)} 3)"><rect width="10" height="10" fill="none" stroke="#2b2233" stroke-width=".2"/><text x="5" y="5.8" font-size="1.6" text-anchor="middle" fill="#2b2233">10×10 cm</text></g>`;
    const title = `<text x="${gap}" y="7" font-size="3" font-weight="700" fill="#2b2233">${esc(design.name || 'Szabásminta')}</text>
      <text x="${gap}" y="10.5" font-size="1.6" fill="#5b4f63">Varrásráhagyás nélkül – a halvány sáv a +1 cm-es ráhagyást mutatja. Méret: ${esc((SIZES[res.m.size] || {}).name || 'egyedi')}</text>`;
    const unit = opts.realSize ? `width="${f(W)}cm" height="${f(H)}cm"` : `width="100%"`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(H)}" ${unit} font-family="system-ui, sans-serif"><rect width="${f(W)}" height="${f(H)}" fill="#fffdf6"/>${grid}${title}${scaleBox}${body}</svg>`;
    return Object.assign(res, { svg, width: W, height: H });
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  return { SIZES, FIELDS, defaults, draft, sheet };
})();
