/* Táncolhatósági elemzés, inspiráció-generátor, anyagjavaslatok */
window.TR = window.TR || {};

TR.advisor = (() => {
  const D = TR.data, C = TR.color, U = TR.util;

  /* ---- Táncolhatóság ---- */
  function analyze(design, view) {
    const t = design.top, b = design.bottom, x = design.extras || {};
    const bf = D.fabrics[b.matchTop ? t.fabric : b.fabric] || D.fabrics.jersey;
    const tf = D.fabrics[t.fabric] || D.fabrics.jersey;
    let move = 85, stage = 55, practical = 85;
    const tips = [];
    const add = (kind, text) => tips.push({ kind, text });

    // mozgásszabadság
    if (['lycra', 'jersey'].includes(t.fabric)) { move += 8; add('good', 'A felső anyaga rugalmas – nagy kar- és törzsmozdulatokhoz ideális.'); }
    if (t.fabric === 'barsony' || t.fabric === 'lame') { move -= 8; add('warn', `A ${tf.name.toLowerCase()} kevésbé nyúlik – a hónaljnál és a vállnál hagyj elég bőséget, vagy tegyél rugalmas betétet.`); }
    if (t.neckline === 'pantnelkuli') { practical -= 15; add('warn', 'Pánt nélküli felső nagy karmozdulatoknál és emeléseknél lecsúszhat – szilikoncsík, fűzőváz vagy átlátszó pánt ajánlott.'); }
    if (t.neckline === 'halter') add('info', 'Nyakba kötős felsőnél rögzítsd a kötést patenttal, hogy forgásnál se oldódjon ki.');
    const noSleeve = ['halter', 'pantnelkuli', 'spagetti'].includes(t.neckline);
    if (t.sleeve === 'harang' && !noSleeve) { stage += 8; add('good', 'A harangujj kiemeli a port de bras-t és a kézmozdulatokat.'); }
    if (t.sleeve === 'puff' && !noSleeve) add('info', 'A puffos ujj a vállvonalat szélesíti – csoportban erős, egységes sziluettet ad.');
    if (t.detail === 'kivagas' && t.length !== 'crop') { stage += 4; add('info', 'Az oldalsó kivágás karcsúsít, de partnermunkánál a fogás helye legyen anyaggal fedett.'); }
    if (t.length === 'leotard') { move += 4; add('good', 'A body nem csúszik fel – emelésnél, padlómunkánál, fordított helyzetben is biztos.'); }
    if (t.length === 'crop' && b.type !== 'nincs') add('info', 'Crop felsőnél ellenőrizd, hogy hajlításkor mennyi bőr látszik – szükség esetén testszínű háló alá.');

    switch (b.type) {
      case 'maxi': case 'sliccelt':
        move -= 12; practical -= 12; stage += 12;
        add('warn', 'Földig érő szoknyánál padlómunka és ugrás közben rá lehet lépni – a hossz legyen 2–3 cm-rel a talaj felett' + (b.type === 'sliccelt' ? ', a slicc pedig segíti a lábmunkát.' : ', vagy használj sliccet.'));
        break;
      case 'tutu': move -= 6; practical -= 15; stage += 10; add('warn', 'Tütüvel a partnermunka és a padlón végzett elemek nehezebbek – a koreográfiával egyeztesd.'); break;
      case 'palazzo': stage += 8; if (bf.weight >= 3) { move -= 10; add('warn', 'Nehéz anyagú bő nadrág ugrásoknál lehúz – válassz könnyebb anyagot.'); } else add('good', 'A bő szárú nadrág minden lépést felnagyít, mégis szabadon mozoghatsz.'); break;
      case 'buggyos': move += 4; add('good', 'A buggyos nadrág kényelmes földközeli, guggolós mozdulatokhoz.'); break;
      case 'leggings': case 'short': move += 6; practical += 5; break;
      case 'mini': case 'midi': case 'asym': case 'zsebkendo': case 'retegelt':
        stage += 8;
        if (bf.sway > 0.7) add('good', `A ${bf.name.toLowerCase()} szoknya forgásoknál látványosan kinyílik.`);
        if (b.type !== 'mini') add('info', 'Szoknyához testszínű vagy azonos színű alsónadrág/rövidnadrág javasolt.');
        break;
      default: break;
    }
    if (b.flare > 0.75 && ['mini', 'midi', 'maxi', 'asym'].includes(b.type)) { stage += 6; add('info', 'Nagyon bő szoknya: körszoknya-szabás (2×2 negyedkör) adja a legszebb forgást.'); }

    // kiegészítők
    if (x.kesztyu) { practical -= 8; add('warn', 'A kesztyű csökkenti a tapadást – partneremelésnél csúszhat.'); }
    if (x.kopeny) { stage += 10; practical -= 8; add('info', 'A szárnyköpeny forgásnál és karemelésnél lenyűgöző, de rögzítsd csuklópánttal, és ügyelj a hosszra.'); }
    if (x.rojt) { stage += 8; add('good', 'A rojtok minden csípő- és törzsmozdulatot megsokszoroznak.'); }
    if (x.flitter) { stage += 8; practical -= 4; add('info', 'A flitter fényben ragyog, de nehezebb, és partnermunkánál karcolhat – a fogási pontokon hagyd ki.'); }
    if (x.fejdisz) { practical -= 4; add('info', 'A fejdíszt hajtűvel és hajhálóval rögzítsd, gyors fordulatoknál leeshet.'); }
    if (x.szalag) { stage += 5; add('info', 'A lobogó szalag hossza ne érje el a térdet, különben belegabalyodhat a lábakba.'); }
    if (x.fodor) stage += 4;

    // anyag és fény
    if (tf.sheen === 'gloss' || tf.sheen === 'metal' || bf.sheen === 'gloss' || bf.sheen === 'metal') stage += 6;
    if (tf.opacity < 0.9 || bf.opacity < 0.9) add('info', 'Áttetsző anyag: színpadi ellenfényben átlátszik – szükség esetén bélelt rész vagy body alá.');

    // kontraszt a háttérrel
    const cols = [t.fill.colors[0], (b.matchTop ? t.fill : b.fill).colors[0]];
    const lum = cols.reduce((s, c) => s + C.luminance(c), 0) / cols.length;
    if (view.bg === 'szinpad' && lum < 0.05 && view.light !== 'uv') { stage -= 12; add('warn', 'Sötét színpadon a nagyon sötét jelmez beleolvadhat a háttérbe – adj hozzá világos vagy fényes elemet.'); }
    if (view.light === 'uv') {
      const neon = [...t.fill.colors, ...(b.fill.colors || [])].some(c => { const [h, s, l] = C.hexToHsl(c); return s > 0.7 && l > 0.45; });
      if (neon) { stage += 10; add('good', 'UV fényben a neon árnyalatok világítani fognak – nagyon erős hatás.'); }
      else add('warn', 'UV fényhez válassz neon/fluoreszkáló anyagot, különben a jelmez sötét marad.');
    }
    const satAll = [...t.fill.colors].map(c => C.hexToHsl(c)[1]);
    if (Math.max(...satAll) > 0.8) stage += 4;

    const clamp = v => Math.max(5, Math.min(100, Math.round(v)));
    return { move: clamp(move), stage: clamp(stage), practical: clamp(practical), tips };
  }

  /* ---- Inspiráció ---- */
  function inspire(design, styleKey, moodKey, locks) {
    const r = Math.random;
    const st = D.danceStyles[styleKey] || D.danceStyles.kortars;
    const md = D.moods[moodKey] || D.moods.energikus;
    const d = U.clone(design);
    const pick = arr => U.pick(arr, r);

    if (!locks.form) {
      d.top.length = pick(st.lengths);
      d.top.neckline = pick(st.necklines);
      d.top.sleeve = pick(st.sleeves);
      d.top.detail = pick(st.details);
      d.top.fabric = pick(st.fabrics);
      d.bottom.type = pick(st.bottoms);
      if (d.top.length !== 'leotard' && d.bottom.type === 'nincs') d.bottom.type = 'leggings';
      d.bottom.waist = pick(['magas', 'derek', 'derek', 'csipo']);
      d.bottom.flare = Math.round((0.3 + r() * 0.6) * 20) / 20;
      const kind = D.bottoms[d.bottom.type].kind;
      d.bottom.fabric = kind === 'skirt' ? pick(d.bottom.type === 'tutu' ? ['tull'] : ['sifon', 'szatén', 'jersey', ...st.fabrics])
        : pick(['jersey', 'lycra', ...st.fabrics]);
      if (d.bottom.type === 'leggings') d.bottom.fabric = 'lycra';
      d.bottom.matchTop = r() < 0.18 && kind === 'skirt';
      Object.keys(d.extras).forEach(k => { d.extras[k] = false; });
      const nEx = Math.floor(r() * 3);
      for (let i = 0; i < nEx; i++) d.extras[pick(st.extras)] = true;
    }
    if (!locks.color) {
      const pal = pick(md.palettes);
      const sh = U.clone(pal).sort(() => r() - 0.5);
      d.top.fill.colors = [pal[0], pal[1], pal[2]];
      d.bottom.fill.colors = r() < 0.5 ? [pal[0], pal[1], pal[2]] : [sh[0], sh[1], sh[2]];
      d.accent.fill.colors = [pal[2], pal[1], pal[0]];
    }
    if (!locks.pattern) {
      const p1 = pick(st.patterns);
      d.top.fill.pattern = p1;
      d.bottom.fill.pattern = r() < 0.45 ? p1 : pick(st.patterns);
      d.top.fill.scale = d.bottom.fill.scale = Math.round((0.7 + r() * 0.9) * 20) / 20;
      d.top.fill.rotation = d.bottom.fill.rotation = pick([0, 0, 0, 45, 90, 30]);
      d.accent.fill.pattern = pick(['egyszinu', 'egyszinu', 'ombre', p1]);
    }
    if (!locks.form) {
      const keepCustom = (d.motifs || []).filter(m => m.type.startsWith('custom:'));
      d.motifs = keepCustom;
      if (st.motifs || r() < 0.3) {
        const kinds = st.motifs ? ['nyak', 'koszoru', 'szort', 'ivek'].filter(() => r() < 0.6) : [pick(['nyak', 'ivek', 'szort'])];
        if (st.motifs && !kinds.length) kinds.push('nyak');
        kinds.forEach(k => motifPreset(k, d).forEach(m => d.motifs.push(m)));
      }
    }
    const name = pick(md.adj) + ' ' + pick(D.nouns);
    d.name = name;
    const bottomPhrase = D.phrases.bottom[d.bottom.type] || '';
    const patPhrase = D.phrases.pattern[d.top.fill.pattern] || '';
    const concept = {
      name,
      text: `${st.name} koreográfiához, amely ${md.desc} köré épül. ${st.desc} A felsőrész ${patPhrase} dolgozik, ${bottomPhrase}.`,
      light: md.light,
      palette: d.top.fill.colors
    };
    return { design: d, concept };
  }

  /* ---- Gyors motívum-díszítések ---- */
  function motifPreset(kind, design) {
    const M = TR.motifs, acc = design.accent.fill.colors;
    const mk = (type, props) => Object.assign(M.newMotif(type, 200, 150), props);
    const hasBottom = D.bottoms[design.bottom.type].kind !== 'none';
    switch (kind) {
      case 'nyak': return [mk('strassz', { y: 124, repeat: 'iv', count: 15, gap: 1.35, size: 7, color: '#eaf4ff' })];
      case 'koszoru': return [mk('kristaly', { y: 205, repeat: 'kor', count: 10, gap: 1.1, size: 14, color: acc[0], color2: '#ffffff' })];
      case 'szort': return [mk('szikra', { y: hasBottom ? 400 : 220, target: hasBottom ? 'bottom' : 'top', repeat: 'szort', count: 22, gap: 2.4, size: 10, color: '#ffffff', outline: false, opacity: 0.9 })];
      case 'ivek': return [mk('iv', { x: 172, y: 210, rot: -25, size: 70, color: acc[0], color2: acc[1], mirror: true })];
      default: return [];
    }
  }

  /* ---- Anyagjavaslat a tervlaphoz ---- */
  function fabricAdvice(design) {
    const t = design.top, b = design.bottom;
    const list = [];
    const tf = D.fabrics[t.fabric];
    const sleeve = ['halter', 'pantnelkuli', 'spagetti'].includes(t.neckline) ? 'nincs' : t.sleeve;
    list.push({ part: `Felsőrész – ${D.topLength[t.length]}, ${D.necklines[t.neckline].toLowerCase()} nyakkivágás, ${D.sleeves[sleeve].toLowerCase()}`, fabric: tf.name, note: tf.desc });
    const binfo = D.bottoms[b.type];
    if (binfo.kind !== 'none') {
      const bf = D.fabrics[b.matchTop ? t.fabric : b.fabric];
      const cut = {
        mini: 'Körszoknya-szabás, a bőség miatt 1 teljes kör.', midi: 'A-vonal, oldalt rejtett cipzár vagy gumis derék.',
        maxi: 'Fél vagy teljes kör, a szegély 2–3 cm-rel a talaj felett.', asym: 'Átlós szegély: a rövidebb oldal térd felett.',
        zsebkendo: 'Négyzetes anyagdarab középen kivágott derékkal – a csúcsok lógnak.', retegelt: '3 sáv, mindegyik 1,5× bőséggel ráncolva.',
        sliccelt: 'Combközépig érő slicc, a szélein eldolgozva.', tutu: 'Több réteg merevített tüll + alsó body, karikás vagy lapos tütü.',
        palazzo: 'Nagyon bő szár, magasított derék, gumis vagy patentos derékpánt.', trapez: 'Térdtől bővülő szár, a sarok fölött ér véget.',
        buggyos: 'Bő szár, a bokánál gumizott mandzsetta.', leggings: 'Négyirányban nyúló anyag, lapos varrás.', short: 'Rugalmas, combtőnél gumis szegély.'
      }[b.type] || '';
      list.push({ part: `Alsórész – ${binfo.name}${b.matchTop ? ' (egybeszabva)' : ''}`, fabric: bf.name, note: cut + ' ' + bf.desc });
    }
    const ex = Object.keys(design.extras).filter(k => design.extras[k]);
    if (ex.length) {
      const exNotes = {
        ov: 'Szatén vagy rugalmas pánt, patenttal.', rojt: 'Viszkóz vagy fémszálas rojt, 15–25 cm.', fodor: 'Ferdén szabott csík, 1,5× ráncolva.',
        kopeny: 'Sifon félkör, csuklópánttal rögzítve.', szalag: 'Szatén szalag, max. combközépig.', kesztyu: 'Lycra vagy háló, a fogásnál csúszásgátló.',
        fejdisz: 'Könnyű drótkeret, hajtűvel rögzítve.', nyakpant: 'Bársony vagy rugalmas pánt, patenttal.', flitter: 'Varrt flitter vagy flitteres anyag – a fogási pontokon hagyd ki.'
      };
      ex.forEach(k => list.push({ part: 'Kiegészítő – ' + D.extras[k], fabric: '', note: exNotes[k] || '' }));
    }
    return list;
  }

  return { analyze, inspire, fabricAdvice, motifPreset };
})();
