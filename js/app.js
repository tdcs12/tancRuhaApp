/* TáncRuha Stúdió – alkalmazáslogika */
(() => {
  const D = TR.data, U = TR.util, C = TR.color, R = TR.render, A = TR.advisor;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- Tárolás (biztonságosan) ---------- */
  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };

  /* ---------- Állapot ---------- */
  function normalize(d) {
    const base = D.defaultDesign();
    const out = Object.assign(base, d || {});
    ['figure', 'top', 'bottom', 'accent', 'extras'].forEach(k => { out[k] = Object.assign(D.defaultDesign()[k], (d || {})[k] || {}); });
    ['top', 'bottom', 'accent'].forEach(k => { out[k].fill = Object.assign(D.defaultDesign()[k].fill, ((d || {})[k] || {}).fill || {}); });
    return out;
  }
  const state = {
    design: normalize(store.get('tancruha.current', null)),
    view: Object.assign({ pose: 'alap', motion: 'none', bg: 'studio', light: 'feher', style: 'tiszta' }, store.get('tancruha.view', {})),
    zone: 'top',
    activeView: 'designer',
    history: [], future: [],
    gallery: store.get('tancruha.gallery', []),
    sketchMode: false, eraser: false
  };
  state.history.push(JSON.stringify(state.design));

  /* ---------- Segédek ---------- */
  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const setPath = (obj, path, val) => { const ks = path.split('.'); const last = ks.pop(); ks.reduce((o, k) => o[k], obj)[last] = val; };
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }
  let commitTimer = null;
  function commit(immediate) {
    clearTimeout(commitTimer);
    const run = () => {
      const s = JSON.stringify(state.design);
      if (state.history[state.history.length - 1] !== s) {
        state.history.push(s); if (state.history.length > 80) state.history.shift();
        state.future = [];
      }
      store.set('tancruha.current', state.design);
      updateUndo();
    };
    if (immediate) run(); else commitTimer = setTimeout(run, 350);
  }
  function changed(opts = {}) {
    renderFigure();
    refreshControls(opts);
    updateAnalysis();
    commit(opts.immediate !== false);
  }
  function updateUndo() {
    $('#undoBtn').disabled = state.history.length < 2;
    $('#redoBtn').disabled = !state.future.length;
  }
  function undo() {
    if (state.history.length < 2) return;
    state.future.push(state.history.pop());
    state.design = normalize(JSON.parse(state.history[state.history.length - 1]));
    afterLoad(false);
  }
  function redo() {
    if (!state.future.length) return;
    const s = state.future.pop(); state.history.push(s);
    state.design = normalize(JSON.parse(s));
    afterLoad(false);
  }
  function afterLoad(pushHistory = true) {
    loadSketch();
    renderFigure(); refreshControls({ all: true }); updateAnalysis();
    if (pushHistory) commit(true); else { store.set('tancruha.current', state.design); updateUndo(); }
    if (state.activeView === 'sheet') buildSheet();
  }

  /* ---------- Vezérlők felépítése ---------- */
  function optionsFor(key) {
    const src = D[key];
    return Object.keys(src).map(k => [k, typeof src[k] === 'string' ? src[k] : src[k].name]);
  }
  function buildControls() {
    $$('select[data-opts]').forEach(sel => {
      sel.innerHTML = optionsFor(sel.dataset.opts).map(([k, n]) => `<option value="${k}">${U.esc(n)}</option>`).join('');
    });
    $$('[data-chips]').forEach(box => {
      box.innerHTML = optionsFor(box.dataset.opts).map(([k, n]) => `<button type="button" data-val="${k}">${U.esc(n)}</button>`).join('');
      box.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        setPath(state.design, box.dataset.chips, b.dataset.val); changed();
      });
    });
    $$('[data-bind]').forEach(el => {
      const ev = el.type === 'range' || el.type === 'color' ? 'input' : 'change';
      el.addEventListener(ev, () => {
        let v = el.type === 'checkbox' ? el.checked : el.type === 'range' ? parseFloat(el.value) : el.value;
        setPath(state.design, el.dataset.bind, v);
        changed({ immediate: ev === 'change', skipThumbs: el.type === 'range' });
      });
      if (ev === 'input') el.addEventListener('change', () => commit(true));
    });

    // alsórész rács
    $('#bottomGrid').innerHTML = Object.keys(D.bottoms).map(k =>
      `<button type="button" data-val="${k}" title="${U.esc(D.bottoms[k].name)}"><span class="thumb"></span><span class="lbl">${U.esc(D.bottoms[k].name)}</span></button>`).join('');
    $('#bottomGrid').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      state.design.bottom.type = b.dataset.val;
      if (b.dataset.val === 'tutu') state.design.bottom.fabric = 'tull';
      changed();
    });

    // minták
    $('#patternGrid').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      zoneFill().pattern = b.dataset.val; changed();
    });
    $$('#colorRow input[type=color]').forEach(inp => {
      inp.addEventListener('input', () => { zoneFill().colors[+inp.dataset.c] = inp.value; changed({ immediate: false, skipThumbs: true }); });
      inp.addEventListener('change', () => { refreshControls({}); commit(true); });
    });
    $('#patScale').addEventListener('input', e => { zoneFill().scale = parseFloat(e.target.value); changed({ immediate: false, skipThumbs: true }); });
    $('#patRot').addEventListener('input', e => { zoneFill().rotation = parseFloat(e.target.value); changed({ immediate: false, skipThumbs: true }); });
    $('#swapColors').addEventListener('click', () => { const c = zoneFill().colors; c.push(c.shift()); changed(); });
    $('#randomZone').addEventListener('click', () => {
      const f = zoneFill(); const keys = Object.keys(D.patterns);
      f.pattern = U.pick(keys);
      const base = C.random();
      const h = C.harmony(base, U.pick(['komplementer', 'analog', 'triad', 'split']));
      f.colors = [h[0], h[2], h[4]]; f.scale = Math.round((0.6 + Math.random() * 1.2) * 20) / 20;
      changed();
    });
    $('#zoneTabs').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      state.zone = b.dataset.zone; refreshControls({ all: true });
    });

    // harmónia
    const harm = () => {
      const cols = C.harmony($('#harmonyBase').value, $('#harmonyMode').value);
      $('#harmonySwatches').innerHTML = cols.map(c => `<button type="button" style="background:${c}" title="${c} – kattintásra a kiválasztott zóna alapszíne lesz" data-c="${c}"></button>`).join('');
      return cols;
    };
    $('#harmonyBase').addEventListener('input', harm);
    $('#harmonyMode').addEventListener('change', harm);
    $('#harmonySwatches').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      zoneFill().colors[0] = b.dataset.c; changed();
    });
    $$('[data-harm]').forEach(btn => btn.addEventListener('click', () => {
      const h = harm(), t = btn.dataset.harm, d = state.design;
      if (t === 'top' || t === 'all') d.top.fill.colors = [h[0], h[1], h[2]];
      if (t === 'bottom' || t === 'all') d.bottom.fill.colors = t === 'all' ? [h[2], h[3], h[0]] : [h[0], h[1], h[2]];
      if (t === 'all') d.accent.fill.colors = [h[4], h[1], h[3]];
      changed(); toast('Színharmónia alkalmazva');
    }));
    harm();

    // kiegészítők
    $('#extrasGrid').innerHTML = Object.keys(D.extras).map(k => `<button type="button" data-val="${k}">${U.esc(D.extras[k])}</button>`).join('');
    $('#extrasGrid').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      state.design.extras[b.dataset.val] = !state.design.extras[b.dataset.val]; changed();
    });

    // bőr
    $('#skinRow').innerHTML = D.skins.map(c => `<button type="button" data-val="${c}" style="background:${c}" aria-label="Bőrtónus ${c}"></button>`).join('');
    $('#skinRow').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      state.design.figure.skin = b.dataset.val; changed();
    });

    // szekció fülek
    $('#sectionTabs').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('#sectionTabs button').forEach(x => x.classList.toggle('active', x === b));
      $$('.panel.left .sec').forEach(s => s.classList.toggle('active', s.dataset.sec === b.dataset.sec));
      if (b.dataset.sec === 'forma') refreshBottomThumbs();
    });

    // eszköztár
    $('#poseSelect').innerHTML = Object.keys(D.poses).map(k => `<option value="${k}">${U.esc(D.poses[k].name)}</option>`).join('');
    $('#bgSelect').innerHTML = optionsFor('backgrounds').map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
    $('#lightSelect').innerHTML = optionsFor('lights').map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
    $('#styleSelect').innerHTML = optionsFor('drawStyles').map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
    const viewSel = (id, key) => $(id).addEventListener('change', e => {
      state.view[key] = e.target.value;
      if (key === 'light' && e.target.value !== 'feher' && state.view.bg !== 'szinpad') state.view.bg = 'szinpad';
      viewChanged();
    });
    viewSel('#poseSelect', 'pose'); viewSel('#bgSelect', 'bg'); viewSel('#lightSelect', 'light'); viewSel('#styleSelect', 'style');
    $('#motionSeg').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      state.view.motion = b.dataset.motion; viewChanged();
    });

    // inspiráció
    $('#insStyle').innerHTML = Object.keys(D.danceStyles).map(k => `<option value="${k}">${D.danceStyles[k].name}</option>`).join('');
    $('#insMood').innerHTML = Object.keys(D.moods).map(k => `<option value="${k}">${D.moods[k].name}</option>`).join('');
    $('#inspireBtn').addEventListener('click', doInspire);

    // név
    $('#designName').addEventListener('input', e => { state.design.name = e.target.value; commit(); });

    // gombok
    $('#undoBtn').addEventListener('click', undo);
    $('#redoBtn').addEventListener('click', redo);
    $('#saveBtn').addEventListener('click', saveToGallery);
    $('#pngBtn').addEventListener('click', exportPNG);
    $('#svgBtn').addEventListener('click', exportSVG);
    $('#sketchBtn').addEventListener('click', () => {
      state.sketchMode = !state.sketchMode;
      $('#sketchBtn').classList.toggle('active', state.sketchMode);
      $('#sketchTools').hidden = !state.sketchMode;
      $('#sketchCanvas').classList.toggle('drawing', state.sketchMode);
    });
    $('#penMode').addEventListener('click', () => {
      state.eraser = !state.eraser; $('#penMode').textContent = state.eraser ? 'Radír' : 'Toll';
    });
    $('#sketchClear').addEventListener('click', () => {
      const cv = $('#sketchCanvas'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
      state.design.sketch = null; commit(true); toast('Rajz törölve');
    });

    document.addEventListener('keydown', e => {
      if (e.target.matches('input[type=text], textarea')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    });

    // nézetek
    $$('.tabs .tab').forEach(t => t.addEventListener('click', () => showView(t.dataset.view)));

    // csoport
    ['#grpCount', '#grpForm', '#grpVariant', '#grpPose', '#grpAnim'].forEach(id => $(id).addEventListener('input', () => {
      $('#grpCountOut').textContent = $('#grpCount').value; renderGroup(lastT);
    }));

    // galéria
    $('#exportAll').addEventListener('click', () => {
      download('tancruha-tervek.json', new Blob([JSON.stringify({ app: 'TáncRuha Stúdió', version: 1, designs: state.gallery }, null, 1)], { type: 'application/json' }));
    });
    $('#importFile').addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const data = JSON.parse(rd.result);
          const list = Array.isArray(data) ? data : data.designs || (data.design ? [data] : []);
          let n = 0;
          list.forEach(it => { if (it && it.design) { state.gallery.unshift({ id: U.uid(), name: it.name || it.design.name, date: it.date || Date.now(), design: normalize(it.design), view: it.view || {} }); n++; } });
          persistGallery(); renderGallery(); toast(`${n} terv importálva`);
        } catch (err) { toast('Hibás fájl – nem sikerült importálni'); }
      };
      rd.readAsText(file); e.target.value = '';
    });
    $('#newDesign').addEventListener('click', () => {
      state.design = D.defaultDesign(); state.design.name = 'Új tervem';
      afterLoad(); showView('designer'); toast('Új terv indult');
    });
    $('#galleryGrid').addEventListener('click', e => {
      const b = e.target.closest('button[data-act]'); if (!b) return;
      const id = b.closest('[data-id]').dataset.id;
      const item = state.gallery.find(g => g.id === id); if (!item) return;
      if (b.dataset.act === 'load') {
        state.design = normalize(U.clone(item.design));
        Object.assign(state.view, item.view || {});
        afterLoad(); syncViewControls(); showView('designer'); toast(`„${item.name}” betöltve`);
      } else if (b.dataset.act === 'dup') {
        const c = U.clone(item); c.id = U.uid(); c.name = item.name + ' (másolat)'; c.design.name = c.name; c.date = Date.now();
        state.gallery.unshift(c); persistGallery(); renderGallery();
      } else if (b.dataset.act === 'del') {
        if (!confirm(`Biztosan törlöd: „${item.name}”?`)) return;
        state.gallery = state.gallery.filter(g => g.id !== id); persistGallery(); renderGallery();
      }
    });

    $('#printBtn').addEventListener('click', () => window.print());
  }

  function zoneFill() {
    const d = state.design;
    if (state.zone === 'bottom') {
      if (d.bottom.matchTop) return d.top.fill;
      return d.bottom.fill;
    }
    return d[state.zone].fill;
  }

  /* ---------- Vezérlők frissítése az állapotból ---------- */
  function refreshControls(opts = {}) {
    const d = state.design;
    $$('select[data-bind], input[data-bind]').forEach(el => {
      const v = getPath(d, el.dataset.bind);
      if (el.type === 'checkbox') el.checked = !!v;
      else if (document.activeElement !== el || opts.all) el.value = v;
    });
    $$('[data-chips]').forEach(box => {
      const v = getPath(d, box.dataset.chips);
      $$('button', box).forEach(b => b.classList.toggle('active', b.dataset.val === v));
    });
    // nyakkivágás → ujj kompatibilitás jelzése
    const noSleeve = ['halter', 'pantnelkuli', 'spagetti'].includes(d.top.neckline);
    $$('[data-chips="top.sleeve"] button').forEach(b => b.classList.toggle('disabled', noSleeve && b.dataset.val !== 'nincs'));
    $$('#bottomGrid button').forEach(b => b.classList.toggle('active', b.dataset.val === d.bottom.type));
    $$('#extrasGrid button').forEach(b => b.classList.toggle('active', !!d.extras[b.dataset.val]));
    $$('#skinRow button').forEach(b => b.classList.toggle('active', b.dataset.val === d.figure.skin));
    $$('#zoneTabs button').forEach(b => b.classList.toggle('active', b.dataset.zone === state.zone));
    const zf = zoneFill();
    $$('#colorRow input[type=color]').forEach(inp => { if (document.activeElement !== inp || opts.all) inp.value = zf.colors[+inp.dataset.c]; });
    $('#patScale').value = zf.scale; $('#patRot').value = zf.rotation;
    if (!opts.skipThumbs || opts.all) {
      $('#patternGrid').innerHTML = Object.keys(D.patterns).map(k =>
        `<button type="button" data-val="${k}" class="${zf.pattern === k ? 'active' : ''}" title="${D.patterns[k]}">${TR.patterns.swatch(k, zf.colors)}<span>${D.patterns[k]}</span></button>`).join('');
    }
    if (document.activeElement !== $('#designName')) $('#designName').value = d.name || '';
    if (!opts.skipThumbs && $('.sec[data-sec=forma]').classList.contains('active')) refreshBottomThumbs();
    $('#zoneTabs [data-zone=bottom]').textContent = d.bottom.matchTop ? 'Alsó (= felső)' : 'Alsó';
  }

  let thumbTimer = null;
  function refreshBottomThumbs() {
    clearTimeout(thumbTimer);
    thumbTimer = setTimeout(() => {
      const base = U.clone(state.design);
      base.extras = {}; base.top.detail = 'nincs';
      $$('#bottomGrid button').forEach(b => {
        const d = U.clone(base); d.bottom.type = b.dataset.val;
        if (d.bottom.type === 'nincs') d.top.length = 'leotard';
        let s = R.svg(d, { pose: 'alap', bg: 'studio' }, { idp: 'bt' + b.dataset.val, noBg: true, width: 64, height: 80 });
        s = s.replace('viewBox="0 0 400 760"', 'viewBox="70 200 260 440"');
        $('.thumb', b).innerHTML = s;
      });
    }, 120);
  }

  function syncViewControls() {
    const v = state.view;
    $('#poseSelect').value = v.pose; $('#bgSelect').value = v.bg; $('#lightSelect').value = v.light; $('#styleSelect').value = v.style;
    $$('#motionSeg button').forEach(b => b.classList.toggle('active', b.dataset.motion === v.motion));
    $('#lightGroup').classList.toggle('dim', v.bg !== 'szinpad');
    $('#stage').dataset.bg = v.bg;
    $('#poseSelect').disabled = v.motion === 'choreo';
  }
  function viewChanged() {
    store.set('tancruha.view', state.view);
    syncViewControls(); renderFigure(); updateAnalysis();
    if (state.activeView === 'group') renderGroup(lastT);
  }

  /* ---------- Rajzolás / animáció ---------- */
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function motionAt(t, mode, offset = 0) {
    const tt = t + offset;
    if (mode === 'spin') {
      return { pose: R.poseByName(state.view.pose), motion: { phase: tt * 4.2, spin: 0.55 + 0.45 * Math.sin(tt * 1.6) } };
    }
    if (mode === 'choreo') {
      const seq = D.choreo, dur = 1.5, n = seq.length;
      const pos = (tt / dur) % n, i = Math.floor(pos), fr = pos - i;
      const a = D.poses[seq[i]], b = D.poses[seq[(i + 1) % n]];
      const k = ease(Math.min(1, fr / 0.7));
      const pose = R.lerpPose(a, b, k);
      if (fr < 0.7) pose.air = (a.air || 0) * (1 - k) + (b.air || 0) * k;
      return { pose, motion: { phase: tt * 3.2, spin: 0.25 + 0.25 * Math.sin(tt * 2.4) + (fr < 0.7 ? Math.sin(fr / 0.7 * Math.PI) * 0.3 : 0) } };
    }
    return { pose: R.poseByName(state.view.pose), motion: { phase: 0.9, spin: 0 } };
  }

  let lastT = 0;
  function renderFigure(t = lastT) {
    const m = motionAt(t, state.view.motion);
    $('#figureHost').innerHTML = R.svg(state.design, state.view, { idp: 'main', poseData: m.pose, motion: m.motion });
  }

  let rafId = null, lastFrame = 0;
  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (ts - lastFrame < 33) return;
    lastFrame = ts;
    lastT = ts / 1000;
    if (state.activeView === 'designer' && state.view.motion !== 'none') renderFigure(lastT);
    if (state.activeView === 'group' && $('#grpAnim').checked) renderGroup(lastT);
  }

  /* ---------- Vázlatrajz ---------- */
  function setupSketch() {
    const cv = $('#sketchCanvas'), ctx = cv.getContext('2d');
    let drawing = false, last = null;
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * cv.width, (e.clientY - r.top) / r.height * cv.height]; };
    cv.addEventListener('pointerdown', e => {
      if (!state.sketchMode) return;
      drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId);
      stroke(last, [last[0] + 0.1, last[1] + 0.1]);
    });
    cv.addEventListener('pointermove', e => {
      if (!drawing) return; const p = pos(e); stroke(last, p); last = p;
    });
    const end = () => {
      if (!drawing) return; drawing = false;
      try { state.design.sketch = cv.toDataURL('image/png'); } catch (err) { /* ignore */ }
      commit(true);
    };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    function stroke(a, b) {
      ctx.globalCompositeOperation = state.eraser ? 'destination-out' : 'source-over';
      ctx.strokeStyle = $('#penColor').value; ctx.lineWidth = +$('#penSize').value * 2 * (state.eraser ? 3 : 1);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
  }
  function loadSketch() {
    const cv = $('#sketchCanvas'), ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (state.design.sketch) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, cv.width, cv.height);
      img.src = state.design.sketch;
    }
  }

  /* ---------- Elemzés ---------- */
  function updateAnalysis() {
    const r = A.analyze(state.design, state.view);
    const meter = (label, v, cls) => `<div class="meter"><span>${label}</span><div class="bar"><i class="${cls}" style="width:${v}%"></i></div><b>${v}</b></div>`;
    $('#meters').innerHTML = meter('Mozgásszabadság', r.move, 'm1') + meter('Színpadi hatás', r.stage, 'm2') + meter('Praktikum', r.practical, 'm3');
    const icon = { good: '✓', warn: '!', info: 'i' };
    $('#tips').innerHTML = r.tips.length ? r.tips.slice(0, 7).map(t => `<li class="${t.kind}"><span>${icon[t.kind]}</span>${U.esc(t.text)}</li>`).join('') : '<li class="info"><span>i</span>Alapos, kiegyensúlyozott terv – nincs különösebb figyelmeztetés.</li>';
  }

  /* ---------- Inspiráció ---------- */
  function doInspire() {
    const locks = { form: $('#lockForm').checked, color: $('#lockColor').checked, pattern: $('#lockPattern').checked };
    const res = A.inspire(state.design, $('#insStyle').value, $('#insMood').value, locks);
    state.design = normalize(res.design);
    if (!locks.color) { state.view.light = res.concept.light; }
    afterLoad();
    syncViewControls();
    const c = res.concept;
    $('#concept').hidden = false;
    $('#concept').innerHTML = `<h4>${U.esc(c.name)}</h4><p>${U.esc(c.text)}</p>
      <div class="pal">${c.palette.map(x => `<i style="background:${x}" title="${x}"></i>`).join('')}</div>
      <p class="small">Javasolt fény: <b>${D.lights[c.light].name}</b>${state.view.bg !== 'szinpad' ? ' – kapcsold a hátteret <a href="#" id="toStage">színpadra</a>' : ''}.</p>`;
    const ts = $('#toStage');
    if (ts) ts.addEventListener('click', e => { e.preventDefault(); state.view.bg = 'szinpad'; viewChanged(); ts.parentElement.textContent = `Javasolt fény: ${D.lights[c.light].name}.`; });
  }

  /* ---------- Galéria ---------- */
  function persistGallery() {
    if (!store.set('tancruha.gallery', state.gallery)) toast('A böngésző tárhelye megtelt – exportáld a terveket JSON-ba.');
    $('#galleryCount').textContent = state.gallery.length;
  }
  function saveToGallery() {
    const d = U.clone(state.design);
    const existing = state.gallery.find(g => g.name === d.name);
    if (existing) {
      existing.design = d; existing.view = U.clone(state.view); existing.date = Date.now();
      toast(`„${d.name}” frissítve a galériában`);
    } else {
      state.gallery.unshift({ id: U.uid(), name: d.name || 'Névtelen terv', date: Date.now(), design: d, view: U.clone(state.view) });
      toast(`„${d.name}” elmentve a galériába`);
    }
    persistGallery();
    if (state.activeView === 'gallery') renderGallery();
  }
  function renderGallery() {
    $('#galleryCount').textContent = state.gallery.length;
    $('#galleryEmpty').hidden = state.gallery.length > 0;
    $('#galleryGrid').innerHTML = state.gallery.map((g, i) => {
      const v = Object.assign({ pose: 'alap', bg: 'studio', light: 'feher', style: 'tiszta' }, g.view || {});
      const svg = R.svg(normalize(g.design), v, { idp: 'gal' + i, width: 180, height: 342 });
      const dt = new Date(g.date).toLocaleDateString('hu-HU');
      return `<div class="g-card" data-id="${g.id}"><div class="g-thumb">${svg}${g.design.sketch ? `<img src="${g.design.sketch}" alt="">` : ''}</div>
        <div class="g-info"><b>${U.esc(g.name)}</b><small>${dt} · ${U.esc(D.bottoms[g.design.bottom.type] ? D.bottoms[g.design.bottom.type].name : '')}</small></div>
        <div class="g-actions"><button class="btn small primary" data-act="load">Megnyitás</button><button class="btn small" data-act="dup">Másolat</button><button class="btn small ghost" data-act="del" title="Törlés">✕</button></div></div>`;
    }).join('');
  }

  /* ---------- Csoportkép ---------- */
  function formation(kind, n) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1), mid = (n - 1) / 2;
      switch (kind) {
        case 'sor': pts.push([0.1 + u * 0.8, 0.6]); break;
        case 'ket': pts.push([0.12 + u * 0.76, i % 2 ? 0.25 : 0.8]); break;
        case 'iv': pts.push([0.1 + u * 0.8, 0.85 - Math.sin(u * Math.PI) * 0.65]); break;
        case 'ek': pts.push([0.5 + (i - mid) / Math.max(1, n) * 0.85, 0.95 - Math.abs(i - mid) / Math.max(1, mid) * 0.8]); break;
        case 'szort': { const r = U.seeded(i * 97 + 13); pts.push([0.1 + u * 0.8 + (r() - 0.5) * 0.06, 0.15 + r() * 0.8]); break; }
        default: pts.push([0.1 + u * 0.8, 0.15 + Math.abs(i - mid) / Math.max(1, mid) * 0.75]); // V: közép elöl
      }
    }
    if (kind === 'v') pts.forEach(p => { p[1] = 1 - p[1] + 0.1; });
    return pts;
  }
  function hueShift(fill, deg) {
    const f = U.clone(fill);
    f.colors = f.colors.map(c => { const [h, s, l] = C.hexToHsl(c); return C.hslToHex(h + deg, s, l); });
    return f;
  }
  function renderGroup(t = 0) {
    const host = $('#groupStage');
    const W = 1200, H = 640;
    const n = +$('#grpCount').value, kind = $('#grpForm').value, variant = $('#grpVariant').value, poseMode = $('#grpPose').value;
    const anim = $('#grpAnim').checked;
    const pts = formation(kind, n);
    const order = pts.map((p, i) => i).sort((a, b) => pts[a][1] - pts[b][1]);
    const p = 'grp';
    let body = '';
    const centerIdx = order[order.length - 1];
    order.forEach(i => {
      const [x, depth] = pts[i];
      const h = 300 + depth * 230, w = h * 400 / 760;
      const cx = 80 + x * (W - 160), baseY = 300 + depth * 300;
      let d = state.design;
      if (variant === 'colors') {
        d = U.clone(d); const sh = (i - (n - 1) / 2) * 28;
        d.top.fill = hueShift(d.top.fill, sh); d.bottom.fill = hueShift(d.bottom.fill, sh); d.accent.fill = hueShift(d.accent.fill, -sh);
      } else if (variant === 'solo' && i !== centerIdx) {
        d = U.clone(d);
        ['top', 'bottom'].forEach(z => { d[z].fill = U.clone(d[z].fill); d[z].fill.colors = d[z].fill.colors.map(c => C.mix(c, '#5a5560', 0.55)); });
        d.extras = Object.assign({}, d.extras, { kopeny: false, flitter: false, fejdisz: false });
      } else if (variant === 'gallery' && state.gallery.length) {
        d = normalize(state.gallery[i % state.gallery.length].design);
      }
      let m;
      const mode = anim ? (state.view.motion === 'none' ? 'choreo' : state.view.motion) : 'none';
      if (poseMode === 'canon') m = motionAt(t, mode, -i * 0.45);
      else if (poseMode === 'mixed') m = { pose: D.poses[D.choreo[i % D.choreo.length]], motion: { phase: t * 3 + i, spin: anim ? 0.3 + 0.3 * Math.sin(t * 2 + i) : 0 } };
      else m = motionAt(t, mode);
      // a FLOOR (636/760) pont kerüljön az alap vonalra
      const y = baseY - h * (R.FLOOR / 760);
      body += R.svg(d, state.view, { idp: p + i, nested: { x: cx - w / 2, y, w, h }, noBg: true, poseData: m.pose, motion: m.motion });
    });
    const light = state.view.bg === 'szinpad' ? state.view.light : 'feher';
    const bgSvg = R.background(p + 'bg', state.view.bg, W, H);
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${bgSvg}
      ${state.view.bg === 'szinpad' ? `<path d="M0 ${H * 0.42}H${W}V${H}H0Z" fill="#000" opacity=".25"/>` : ''}
      ${light === 'uv' ? `<rect width="${W}" height="${H}" fill="#12002b" opacity=".85"/>` : ''}
      ${body}${R.lightOverlay(p, light, W, H)}</svg>`;
  }

  /* ---------- Tervlap ---------- */
  function buildSheet() {
    const d = state.design, v = state.view;
    const sheetView = { pose: v.pose, bg: 'papir', light: 'feher', style: v.style };
    const main = R.svg(d, sheetView, { idp: 'sh1', width: 300, height: 570 });
    const s2 = R.svg(d, { pose: 'vkar', bg: 'studio', style: v.style }, { idp: 'sh2', width: 150, height: 285, motion: { phase: 2.2, spin: 0.9 } });
    const s3 = R.svg(d, { pose: 'kitaras', bg: 'szinpad', light: v.light === 'feher' ? 'meleg' : v.light, style: v.style }, { idp: 'sh3', width: 150, height: 285, motion: { phase: 4, spin: 0.4 } });
    const r = A.analyze(d, v);
    const fills = [['Felsőrész', d.top.fill], ['Alsórész', d.bottom.matchTop ? d.top.fill : d.bottom.fill], ['Díszítés', d.accent.fill]];
    const sw = fills.map(([n, f]) => `<div class="sw-line"><span class="sw-name">${n}</span><span class="sw-pat">${D.patterns[f.pattern] || ''}</span>${f.colors.map(c => `<span class="sw"><i style="background:${c}"></i>${c.toUpperCase()}</span>`).join('')}</div>`).join('');
    const fab = A.fabricAdvice(d).map(x => `<tr><td>${U.esc(x.part)}</td><td>${U.esc(x.fabric)}</td><td>${U.esc(x.note)}</td></tr>`).join('');
    const tips = r.tips.map(t => `<li class="${t.kind}">${U.esc(t.text)}</li>`).join('');
    $('#sheet').innerHTML = `
      <header class="sheet-head"><div><small>JELMEZTERV · TáncRuha Stúdió</small><h1>${U.esc(d.name || 'Névtelen terv')}</h1></div>
        <div class="sheet-date">${new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}</div></header>
      <div class="sheet-body">
        <div class="sheet-fig"><div class="sheet-main">${main}${d.sketch ? `<img src="${d.sketch}" alt="">` : ''}</div>
          <div class="sheet-small"><figure>${s2}<figcaption>Mozgásban</figcaption></figure><figure>${s3}<figcaption>Színpadi fényben</figcaption></figure></div></div>
        <div class="sheet-info">
          <h2>Színek és minták</h2>${sw}
          <h2>Anyagok és szabás</h2><table class="fab"><thead><tr><th>Darab</th><th>Anyag</th><th>Megjegyzés</th></tr></thead><tbody>${fab}</tbody></table>
          <h2>Táncolhatóság</h2>
          <div class="sheet-scores"><span>Mozgásszabadság <b>${r.move}</b></span><span>Színpadi hatás <b>${r.stage}</b></span><span>Praktikum <b>${r.practical}</b></span></div>
          <ul class="sheet-tips">${tips}</ul>
          <h2>Jegyzetek</h2>
          <textarea id="notes" placeholder="Méretek, koreográfiai igények, gyors öltözés, költségkeret…">${U.esc(d.notes || '')}</textarea>
          <div class="print-notes">${U.esc(d.notes || '')}</div>
        </div>
      </div>`;
    $('#notes').addEventListener('input', e => { state.design.notes = e.target.value; $('.print-notes').textContent = e.target.value; commit(); });
  }

  /* ---------- Export ---------- */
  function download(name, blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const fileBase = () => (state.design.name || 'tancruha').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tancruha';
  function currentSVG() {
    const m = motionAt(lastT, state.view.motion);
    return R.svg(state.design, state.view, { idp: 'exp', poseData: m.pose, motion: m.motion });
  }
  function exportSVG() {
    let s = currentSVG();
    if (state.design.sketch) s = s.replace('</svg>', `<image href="${state.design.sketch}" x="0" y="0" width="400" height="760"/></svg>`);
    download(fileBase() + '.svg', new Blob([s], { type: 'image/svg+xml' }));
  }
  function exportPNG() {
    const s = currentSVG();
    const img = new Image();
    const url = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' }));
    img.onload = () => {
      const cv = document.createElement('canvas'); cv.width = 800; cv.height = 1520;
      const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0, 800, 1520);
      ctx.drawImage($('#sketchCanvas'), 0, 0, 800, 1520);
      URL.revokeObjectURL(url);
      cv.toBlob(b => { if (b) download(fileBase() + '.png', b); else toast('A PNG mentése nem sikerült'); }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('A PNG mentése nem sikerült'); };
    img.src = url;
  }

  /* ---------- Nézetváltás ---------- */
  function showView(name) {
    state.activeView = name;
    $$('.tabs .tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
    if (name === 'gallery') renderGallery();
    if (name === 'group') renderGroup(lastT);
    if (name === 'sheet') buildSheet();
    if (name === 'designer') renderFigure();
  }

  /* ---------- Indítás ---------- */
  buildControls();
  setupSketch();
  loadSketch();
  syncViewControls();
  refreshControls({ all: true });
  renderFigure();
  updateAnalysis();
  updateUndo();
  $('#galleryCount').textContent = state.gallery.length;
  $('#insStyle').value = 'kortars'; $('#insMood').value = 'misztikus';
  rafId = requestAnimationFrame(loop);
  window.TRApp = { state, renderFigure, showView };
})();
