console.log('Portal Lichtara iniciado. Abra o canal da canalização!');

const LS_KEY = 'lichtara.canalizacoes';

const API_BASE = (function(){
  try { return localStorage.getItem('lichtara.api.base') || ''; } catch { return ''; }
})();

async function apiFetch(url, options) {
  try {
    const abs = (API_BASE && url.startsWith('/')) ? (API_BASE.replace(/\/$/, '') + url) : url;
    const res = await fetch(abs, options);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res;
  } catch (e) {
    return null; // offline/no API
  }
}

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveLocal(items) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
}

async function fetchList() {
  let items = [];
  const res = await apiFetch('/api/canalizacoes');
  if (res) {
    items = await res.json();
    document.getElementById('offline-banner').style.display = 'none';
  } else {
    items = loadLocal();
    document.getElementById('offline-banner').style.display = 'block';
  }
  const container = document.getElementById('lista');
  container.innerHTML = '';
  if (!items.length) {
    container.innerHTML = '<p>Nenhuma canalização ainda.</p>';
    // still update stars map to empty
    window.__canalizacoes = [];
  // notify starfield listeners
  try { window.dispatchEvent(new CustomEvent('lichtara:list-updated')); } catch {}
    return;
  }
  window.__canalizacoes = items.slice();
  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<h3>${escapeHtml(it.title)}</h3><div class="meta">${escapeHtml(it.author||'Anônimo')} • ${new Date(it.created_at).toLocaleString()}</div><p>${escapeHtml(it.content)}</p>`;
    container.appendChild(div);
  });
  // notify starfield listeners
  try { window.dispatchEvent(new CustomEvent('lichtara:list-updated')); } catch {}
}

function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;') }

document.getElementById('form-canalizacao').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const content = document.getElementById('content').value.trim();
  if (!title || !content) return alert('Título e conteúdo são obrigatórios');

  // try API first
  const payload = { title, author, content };
  const res = await apiFetch('/api/canalizacoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (res) {
    document.getElementById('form-canalizacao').reset();
    await fetchList();
    return;
  }

  // offline fallback: save to localStorage
  const items = loadLocal();
  const now = new Date().toISOString();
  items.unshift({ id: Date.now(), title, author: author || 'Anônimo', content, created_at: now });
  saveLocal(items);
  document.getElementById('form-canalizacao').reset();
  await fetchList();
});

// initial load
fetchList();

// Portal Cósmico Interativo - Script Adicional
// Integrated visual system attached to #ceubasico

// util
function random(min, max) { return Math.random() * (max - min) + min; }

const MAX_PARTICLES = 240;

const ceu = document.getElementById('ceubasico');
if (ceu) {
  // optional background video activation
  (async () => {
    try {
      const v = document.getElementById('auroraVideo');
      if (!v) return;
      // test sources quickly; if MP4 available, show when can play
      const probe = await fetch('media/aurora.mp4', { method: 'HEAD' });
      if (probe.ok) {
        v.addEventListener('canplaythrough', () => v.classList.add('loaded'), { once: true });
        // try play (some browsers require gesture; we keep muted+autoplay)
        v.play().catch(()=>{});
      }
    } catch {}
  })();
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  ceu.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let DPR = window.devicePixelRatio || 1;
  function resizeCanvas() {
    const rect = ceu.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * DPR));
    canvas.height = Math.max(1, Math.floor(rect.height * DPR));
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    // recalc star density based on area (cap ranges)
    const areaK = (canvas.width * canvas.height) / (1200*800);
    const desired = Math.max(60, Math.min(220, Math.floor(110 * areaK)));
    if (stars.length < desired) {
      for (let i=stars.length; i<desired; i++) stars.push({ x: random(0, canvas.width), y: random(0, canvas.height), r: random(0.4,1.6), alpha: random(0.2,1), delta: random()*0.02, vx: random(-0.05,0.05), vy: random(-0.02,0.02) });
    } else if (stars.length > desired) {
      stars.length = desired;
    }
  }
  resizeCanvas();
  window.addEventListener('resize', () => { DPR = window.devicePixelRatio || 1; resizeCanvas(); });

  // particles, stars, comet
  const stars = [];
  const particles = [];
  const connections = [];
  let comet = { x: canvas.width/2, y: canvas.height/2, trail: [] };
  let parallax = { x: 0, y: 0 };
  // clickable channel-stars (computed positions)
  let channelStars = [];

  // initial stars
  const STAR_COUNT = 120;
  for (let i=0;i<STAR_COUNT;i++) stars.push({ x: random(0, canvas.width), y: random(0, canvas.height), r: random(0.4,1.6), alpha: random(0.2,1), delta: random()*0.02, vx: random(-0.05,0.05), vy: random(-0.02,0.02) });

  // map existing .file elements to connection points (in ceu coords)
  function updateConnections() {
    connections.length = 0;
    document.querySelectorAll('.file').forEach(el => {
      const r = el.getBoundingClientRect();
      const parentR = ceu.getBoundingClientRect();
      connections.push({ x: (r.left - parentR.left + r.width/2) * DPR, y: (r.top - parentR.top + r.height/2) * DPR });
    });
  }
  updateConnections();

  // resize-aware update
  const ro = new ResizeObserver(() => { resizeCanvas(); updateConnections(); computeChannelStars(); });
  ro.observe(ceu);

  // toggle effects (low-power mode)
  const toggle = document.getElementById('toggle-effects');
  const effectsKey = 'lichtara.effects.enabled';
  let effectsEnabled = localStorage.getItem(effectsKey);
  effectsEnabled = effectsEnabled === null ? true : effectsEnabled === 'true';
  let animating = false;
  if (toggle) {
    toggle.setAttribute('aria-pressed', effectsEnabled ? 'true' : 'false');
    toggle.textContent = effectsEnabled ? '✨' : '⏸️';
    toggle.addEventListener('click', () => {
      effectsEnabled = !effectsEnabled;
      localStorage.setItem(effectsKey, effectsEnabled);
      toggle.setAttribute('aria-pressed', effectsEnabled ? 'true' : 'false');
      toggle.textContent = effectsEnabled ? '✨' : '⏸️';
      if (!effectsEnabled) { ctx.clearRect(0,0,canvas.width,canvas.height); }
      if (effectsEnabled && !animating) { lastT = performance.now(); requestAnimationFrame(draw); }
    });
  }

  // comet follows cursor within ceu
  ceu.addEventListener('mousemove', e => {
    const r = ceu.getBoundingClientRect();
    const cx = (e.clientX - r.left);
    const cy = (e.clientY - r.top);
    comet.x = cx * DPR; comet.y = cy * DPR;
    comet.trail.push({ x: comet.x, y: comet.y, t: Date.now() });
    if (comet.trail.length > 30) comet.trail.shift();
    // parallax - map [0..w] -> [-1..1]
    parallax.x = (cx / Math.max(1,r.width)) * 2 - 1;
    parallax.y = (cy / Math.max(1,r.height)) * 2 - 1;
  });

  // --- Audio: ambient track or WebAudio fallback ---
  const soundToggle = document.getElementById('toggle-sound');
  const soundKey = 'lichtara.sound.enabled';
  let soundEnabled = localStorage.getItem(soundKey);
  soundEnabled = soundEnabled === null ? false : soundEnabled === 'true';
  if (soundToggle) { soundToggle.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false'); }

  // audio context & nodes
  let audioCtx = null;
  let masterGain = null;
  let musicSource = null; // either <audio> element or webaudio nodes

  // try to load packaged file first
  async function initAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(audioCtx.destination);

      // try to fetch local file
      const audioUrl = '/public/media/ambient.mp3'.replace(/^\/public/, '');
      // prefer <audio> element for simple playback if file exists
      const resp = await fetch(audioUrl, { method: 'HEAD' });
      if (resp.ok) {
        const audio = document.createElement('audio');
        audio.src = audioUrl;
        audio.loop = true;
        const src = audioCtx.createMediaElementSource(audio);
        src.connect(masterGain);
        musicSource = { type: 'element', el: audio };
      } else {
        // fallback: gentle WebAudio ambient (two oscillators + noise)
        const o1 = audioCtx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 220;
        const o2 = audioCtx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 330;
        const o1g = audioCtx.createGain(); o1g.gain.value = 0.02;
        const o2g = audioCtx.createGain(); o2g.gain.value = 0.018;
        o1.connect(o1g); o2.connect(o2g); o1g.connect(masterGain); o2g.connect(masterGain);
        o1.start(); o2.start();
        musicSource = { type: 'webaudio', nodes: [o1,o2,o1g,o2g] };
      }
    } catch (err) {
      console.warn('audio init failed', err);
      audioCtx = null; masterGain = null; musicSource = null;
    }
  }

  function playAudio() {
    if (!audioCtx) return initAudio().then(() => playAudio()).catch(()=>{});
    if (musicSource && musicSource.type === 'element') {
      musicSource.el.play().catch(()=>{});
    }
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  }

  function stopAudio() {
    if (!musicSource) return;
    if (musicSource.type === 'element') {
      musicSource.el.pause();
    } else if (musicSource.type === 'webaudio') {
      // gently fade out
      if (masterGain) {
        const now = audioCtx.currentTime;
        masterGain.gain.cancelScheduledValues(now); masterGain.gain.setValueAtTime(masterGain.gain.value, now); masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
      }
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', async () => {
      soundEnabled = !soundEnabled; localStorage.setItem(soundKey, soundEnabled); soundToggle.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
      if (soundEnabled) { await initAudio(); playAudio(); } else { stopAudio(); }
    });
  }

  // keyboard shortcuts: L toggles low-power, S toggles sound, Esc closes modal
  window.addEventListener('keydown', (ev) => {
    const k = ev.key.toLowerCase();
    if (k === 'escape') { try { closeModal(); } catch {} }
    if (k === 'l' && toggle) { ev.preventDefault(); toggle.click(); }
    if (k === 's' && soundToggle) { ev.preventDefault(); soundToggle.click(); }
  });

  // resume audio on first user gesture if enabled
  function resumeIfNeeded() {
    if (!soundEnabled) return;
    if (!audioCtx) { initAudio().then(()=>playAudio()).catch(()=>{}); return; }
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
    if (musicSource && musicSource.type === 'element') musicSource.el.play().catch(()=>{});
  }
  ['pointerdown','keydown','click','touchstart'].forEach(ev => window.addEventListener(ev, resumeIfNeeded, { once: true }));

  // Audio settings UI wiring
  const settingsBtn = document.getElementById('audio-settings-btn');
  const settingsPanel = document.getElementById('audio-settings');
  const volSlider = document.getElementById('audio-volume');
  const toneSlider = document.getElementById('audio-tone');
  const syncCheckbox = document.getElementById('audio-sync');

  // initial values
  const volKey = 'lichtara.sound.volume';
  const toneKey = 'lichtara.sound.tone';
  const syncKey = 'lichtara.sound.sync';
  const savedVol = localStorage.getItem(volKey); if (savedVol) volSlider.value = savedVol;
  const savedTone = localStorage.getItem(toneKey); if (savedTone) toneSlider.value = savedTone;
  const savedSync = localStorage.getItem(syncKey); if (savedSync) syncCheckbox.checked = savedSync === 'true';

  function toggleSettings() {
    const hide = settingsPanel.getAttribute('aria-hidden') === 'false';
    settingsPanel.setAttribute('aria-hidden', hide ? 'true' : 'false');
  }
  if (settingsBtn) settingsBtn.addEventListener('click', toggleSettings);

  // modify initAudio to respect tone and master volume and to expose oscillators for sync
  let oscA = null, oscB = null, oscAGain = null, oscBGain = null;
  const getVolume = () => parseFloat(volSlider.value || 0.7);
  const getTone = () => parseFloat(toneSlider.value || 220);

  // update master gain on slider change
  volSlider.addEventListener('input', () => {
    localStorage.setItem(volKey, volSlider.value);
    if (masterGain) masterGain.gain.value = getVolume();
  });

  toneSlider.addEventListener('input', () => {
    localStorage.setItem(toneKey, toneSlider.value);
    if (oscA) oscA.frequency.setValueAtTime(getTone(), audioCtx.currentTime);
  });

  syncCheckbox.addEventListener('change', () => { localStorage.setItem(syncKey, syncCheckbox.checked); });

  // extend initAudio to keep references
  const _initAudio = initAudio;
  initAudio = async function() {
    if (audioCtx) return;
    await _initAudio();
    if (!audioCtx) return;
    // ensure master gain matches slider
    if (masterGain) masterGain.gain.value = getVolume();
    // if we are using webaudio fallback, capture nodes
    if (musicSource && musicSource.type === 'webaudio') {
      // nodes: [o1,o2,o1g,o2g]
      const nodes = musicSource.nodes;
      oscA = nodes[0]; oscB = nodes[1]; oscAGain = nodes[2]; oscBGain = nodes[3];
      // set tone
      oscA.frequency.setValueAtTime(getTone(), audioCtx.currentTime);
      oscB.frequency.setValueAtTime(getTone()*1.5, audioCtx.currentTime);
      // ramp gains gently
      if (oscAGain) oscAGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      if (oscBGain) oscBGain.gain.setValueAtTime(0.018, audioCtx.currentTime);
    }
  };

  // sync aurora <-> audio: if checked, tweak oscillator frequencies slowly based on aurora layer phases
  function syncAudioToAurora(time) {
    if (!syncCheckbox || !syncCheckbox.checked) return;
    if (!oscA || !oscB) return;
    // sample aurora layers phases (use time) to modulate
    const t = time * 0.0005;
    const base = getTone();
    const f1 = base + Math.sin(t * 0.9) * 18;
    const f2 = base*1.45 + Math.cos(t * 0.7) * 28;
    oscA.frequency.setValueAtTime(f1, audioCtx.currentTime);
    oscB.frequency.setValueAtTime(f2, audioCtx.currentTime);
  }

  // create explosion at ceu-local coords
  function createExplosion(x, y, color) {
    const count = 18 + Math.floor(random(0,16));
    for (let i=0;i<count;i++) {
      particles.push({ x, y, vx: random(-2,2), vy: random(-2,2), life: 60 + Math.floor(random(0,60)), age:0, r: random(1,3), color });
      if (particles.length > MAX_PARTICLES) particles.shift();
    }
  }

  // bind click on stars (we'll treat .item elements as stars trigger)
  document.getElementById('lista').addEventListener('click', (ev) => {
    if (!effectsEnabled) return;
    const it = ev.target.closest('.item');
    if (!it) return;
    const r = it.getBoundingClientRect();
    const pr = ceu.getBoundingClientRect();
    const x = (r.left - pr.left + r.width/2) * DPR;
    const y = (r.top - pr.top + r.height/2) * DPR;
    createExplosion(x,y,'hsl('+ (Math.floor(random(0,360))) +',70%,70%)');
  });

  // map canalizações into deterministic positions across the canvas
  function hashStr(s){
    let h=0; for (let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0; } return Math.abs(h);
  }
  function computeChannelStars(){
    const list = window.__canalizacoes || [];
    const W = canvas.width, H = canvas.height;
    channelStars = list.map((it, idx) => {
      const h = hashStr((it.title||'') + (it.author||'') + (it.created_at||idx));
      const x = (h % (W-40)) + 20;
      const y = ((Math.floor(h/997)) % (H-40)) + 20;
      const r = 2 + (h % 3);
      return { x, y, r, it };
    });
  maybeShowHint();
  }
  // recompute when list fetched initially and on list updates
  computeChannelStars();
  window.addEventListener('lichtara:list-updated', computeChannelStars);

  // star click detection opens modal
  ceu.addEventListener('click', (ev) => {
    const r = ceu.getBoundingClientRect();
    const x = (ev.clientX - r.left) * DPR;
    const y = (ev.clientY - r.top) * DPR;
    // find nearest channel star within threshold
    let best = null, bestD = 999999;
    for (const cs of channelStars){
      const dx = cs.x - x, dy = cs.y - y; const d = Math.sqrt(dx*dx+dy*dy);
      if (d < 18*DPR && d < bestD){ best = cs; bestD = d; }
    }
    if (best){
      openModal(best.it);
      createExplosion(best.x, best.y, 'hsl('+ (Math.floor(random(0,360))) +',70%,70%)');
    }
  });

  // main render loop
  let lastT = performance.now();
  function draw(now) {
  animating = true;
  const dt = Math.min(40, now - lastT); lastT = now;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // audio sync
  try { if (typeof syncAudioToAurora === 'function') syncAudioToAurora(performance.now()); } catch(e) {}
    if (!effectsEnabled) { animating = false; return; }

    // stars
    for (let s of stars) {
      s.alpha += s.delta;
      if (s.alpha <= 0.1 || s.alpha >= 1) s.delta *= -1;
      // gentle drift
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.x < 0) s.x += canvas.width; if (s.x > canvas.width) s.x -= canvas.width;
      if (s.y < 0) s.y += canvas.height; if (s.y > canvas.height) s.y -= canvas.height;
      // parallax offset
      const px = s.x + parallax.x * (8 + s.r*4);
      const py = s.y + parallax.y * (6 + s.r*3);
      ctx.beginPath(); ctx.arc(px, py, s.r * DPR, 0, Math.PI*2); ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
    }

    // connections (between .file UI anchors, optional)
    ctx.lineWidth = 1 * DPR;
    for (let i=0;i<connections.length;i++) {
      for (let j=i+1;j<connections.length;j++) {
        const a = connections[i], b = connections[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 140 * DPR) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(173,216,230,${1-dist/(140*DPR)})`; ctx.stroke();
        }
      }
    }

    // draw channel stars (on top)
    for (const cs of channelStars){
      ctx.beginPath(); ctx.arc(cs.x, cs.y, Math.max(1.5, cs.r) * DPR, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,210,0.95)'; ctx.shadowBlur = 8 * DPR; ctx.shadowColor = 'rgba(255,240,200,0.8)'; ctx.fill(); ctx.shadowBlur = 0;
    }

    // particles
    for (let i = particles.length-1; i>=0; i--) {
      const p = particles[i];
      p.vy += 0.06; p.x += p.vx * DPR; p.y += p.vy * DPR; p.age++;
      p.r *= 0.997;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.4, p.r) * DPR, 0, Math.PI*2); ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, 1 - p.age/p.life);
      ctx.fill(); ctx.globalAlpha = 1;
      if (p.age > p.life) particles.splice(i,1);
    }

    // comet trail
    if (comet.trail.length) {
      for (let i=0;i<comet.trail.length;i++) {
        const t = comet.trail[i];
        const age = Date.now() - t.t;
        const a = Math.max(0, 1 - age/800);
        ctx.beginPath(); ctx.arc(t.x, t.y, 4 * DPR * (a*0.8+0.2), 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,230,180,${a*0.7})`; ctx.fill();
      }
    }

    // comet head
    ctx.beginPath(); ctx.arc(comet.x, comet.y, 6 * DPR, 0, Math.PI*2); ctx.fillStyle = 'rgba(255,245,210,0.95)'; ctx.shadowBlur = 18 * DPR; ctx.shadowColor = 'rgba(255,230,180,0.8)'; ctx.fill(); ctx.shadowBlur = 0;

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  // small periodic refresh of star positions to remain within new size
  setInterval(() => { for (let s of stars) { s.x = Math.min(canvas.width-2, Math.max(2, s.x + random(-8,8))); s.y = Math.min(canvas.height-2, Math.max(2, s.y + random(-8,8))); } }, 2000);

  // Dismissible hint overlay: encourage clicking stars
  function maybeShowHint(){
    try {
      const dismissed = localStorage.getItem('lichtara.hint.dismissed') === 'true';
      if (dismissed) return;
      if (!channelStars || channelStars.length === 0) return;
      let hint = document.getElementById('hint-stars');
      if (!hint) {
        hint = document.createElement('div');
        hint.id = 'hint-stars';
        hint.style.position = 'absolute';
        hint.style.right = '16px';
        hint.style.bottom = '16px';
        hint.style.maxWidth = '320px';
        hint.style.background = 'rgba(0,0,0,0.55)';
        hint.style.color = '#fff';
        hint.style.backdropFilter = 'blur(4px)';
        hint.style.border = '1px solid rgba(255,255,255,0.16)';
        hint.style.borderRadius = '10px';
        hint.style.padding = '10px 12px';
        hint.style.zIndex = '3';
        hint.style.fontSize = '14px';
        hint.style.lineHeight = '1.3';
        hint.innerHTML = 'Dica: clique nas estrelas para abrir as canalizações. <button id="hint-close" style="margin-left:8px;background:#fff;color:#000;border:none;border-radius:6px;padding:2px 6px;cursor:pointer">Entendi</button>';
        ceu.appendChild(hint);
        const closeBtn = hint.querySelector('#hint-close');
        closeBtn.addEventListener('click', () => { localStorage.setItem('lichtara.hint.dismissed','true'); hint.remove(); });
      }
    } catch {}
  }
  // show once on entry if applicable
  maybeShowHint();

} // end if ceu

// Markdown live preview
const contentEl = document.getElementById('content');
const previewEl = document.getElementById('preview');
if (contentEl && previewEl && window.marked) {
  const render = () => { previewEl.innerHTML = marked.parse(contentEl.value || ''); };
  contentEl.addEventListener('input', render);
  render();
}

// Simple modal for channel star clicks
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalContent = document.getElementById('modal-content');

function openModal(item){
  if (!modal) return;
  modalTitle.textContent = item.title || 'Sem título';
  modalMeta.textContent = `${item.author||'Anônimo'} • ${new Date(item.created_at).toLocaleString()}`;
  modalContent.textContent = item.content || '';
  modal.style.display = 'flex';
}
function closeModal(){ if (modal) modal.style.display = 'none'; }
if (modal){
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}
if (modalClose){ modalClose.addEventListener('click', closeModal); }
