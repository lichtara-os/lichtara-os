console.log('Portal Lichtara iniciado. Abra o canal da canalização!');

async function fetchList() {
	const res = await fetch('/api/canalizacoes');
	const items = await res.json();
	const container = document.getElementById('lista');
	container.innerHTML = '';
	if (!items.length) {
		container.innerHTML = '<p>Nenhuma canalização ainda.</p>';
		return;
	}
	items.forEach(it => {
		const div = document.createElement('div');
		div.className = 'item';
		div.innerHTML = `<h3>${escapeHtml(it.title)}</h3><div class="meta">${it.author} • ${new Date(it.created_at).toLocaleString()}</div><p>${escapeHtml(it.content)}</p>`;
		container.appendChild(div);
	});
}

function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;') }

document.getElementById('form-canalizacao').addEventListener('submit', async (e) => {
	e.preventDefault();
	const title = document.getElementById('title').value.trim();
	const author = document.getElementById('author').value.trim();
	const content = document.getElementById('content').value.trim();
	if (!title || !content) return alert('Título e conteúdo são obrigatórios');
	const res = await fetch('/api/canalizacoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, author, content }) });
	if (res.ok) {
		document.getElementById('form-canalizacao').reset();
		await fetchList();
	} else {
		const err = await res.json();
		alert('Erro: ' + (err.error || 'desconhecido'));
	}
});

// Portal Cósmico Interativo - Script Adicional
// Integrated visual system attached to #ceubasico

// util
function random(min, max) { return Math.random() * (max - min) + min; }

const MAX_PARTICLES = 200;

const ceu = document.getElementById('ceubasico');
if (ceu) {
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
  }
  resizeCanvas();
  window.addEventListener('resize', () => { DPR = window.devicePixelRatio || 1; resizeCanvas(); });

  // particles, stars, comet
  const stars = [];
  const particles = [];
  const connections = [];
  let comet = { x: canvas.width/2, y: canvas.height/2, trail: [] };

  // initial stars
  const STAR_COUNT = 90;
  for (let i=0;i<STAR_COUNT;i++) stars.push({ x: random(0, canvas.width), y: random(0, canvas.height), r: random(0.4,1.4), alpha: random(0.2,1), delta: random()*0.02 });

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
  const ro = new ResizeObserver(() => { resizeCanvas(); updateConnections(); });
  ro.observe(ceu);

  // toggle effects
  const toggle = document.getElementById('toggle-effects');
  const effectsKey = 'lichtara.effects.enabled';
  let effectsEnabled = localStorage.getItem(effectsKey);
  effectsEnabled = effectsEnabled === null ? true : effectsEnabled === 'true';
  if (toggle) { toggle.setAttribute('aria-pressed', effectsEnabled ? 'true' : 'false'); toggle.addEventListener('click', () => { effectsEnabled = !effectsEnabled; localStorage.setItem(effectsKey, effectsEnabled); toggle.setAttribute('aria-pressed', effectsEnabled ? 'true' : 'false'); }); }

  // comet follows cursor within ceu
  ceu.addEventListener('mousemove', e => {
    const r = ceu.getBoundingClientRect();
    comet.x = (e.clientX - r.left) * DPR; comet.y = (e.clientY - r.top) * DPR;
    comet.trail.push({ x: comet.x, y: comet.y, t: Date.now() });
    if (comet.trail.length > 30) comet.trail.shift();
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

  // resume audio on first user gesture if enabled
  function resumeIfNeeded() {
    if (!soundEnabled) return;
    if (!audioCtx) { initAudio().then(()=>playAudio()).catch(()=>{}); return; }
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
    if (musicSource && musicSource.type === 'element') musicSource.el.play().catch(()=>{});
  }
  ['pointerdown','keydown','click','touchstart'].forEach(ev => window.addEventListener(ev, resumeIfNeeded, { once: true }));

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

  // main render loop
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (!effectsEnabled) { requestAnimationFrame(draw); return; }

    // stars
    for (let s of stars) {
      s.alpha += s.delta;
      if (s.alpha <= 0.1 || s.alpha >= 1) s.delta *= -1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * DPR, 0, Math.PI*2); ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
    }

    // connections
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

  draw();

  // small periodic refresh of star positions to remain within new size
  setInterval(() => { for (let s of stars) { s.x = Math.min(canvas.width-2, Math.max(2, s.x + random(-8,8))); s.y = Math.min(canvas.height-2, Math.max(2, s.y + random(-8,8))); } }, 2000);

} // end if ceu
