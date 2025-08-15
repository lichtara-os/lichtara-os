// Portal Cósmico Interativo - versão client-only (localStorage)

const form = document.getElementById('canalizacaoForm');
const ceu = document.getElementById('ceubasico');
const modal = document.getElementById('modal');
const modalTitulo = document.getElementById('modalTitulo');
const modalAutor = document.getElementById('modalAutor');
const modalConteudo = document.getElementById('modalConteudo');
const closeModal = document.getElementById('closeModal');

let canalizacoes = JSON.parse(localStorage.getItem('canalizacoes') || '[]');
let estrelas = [];

// Partículas e cometa
let particles = [];
let comet = { x: 0, y: 0, visible: false };

function salvar() {
  localStorage.setItem('canalizacoes', JSON.stringify(canalizacoes));
}

function createExplosion(x, y, color) {
  const count = 28 + Math.floor(Math.random()*12);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random()*3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40 + Math.random()*20,
      size: 2 + Math.random()*4,
      color
    });
  }
}

function createCometTrail(x,y) {
  // small trail particle
  particles.push({ x, y, vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6 - 0.6, life: 18, size: 1 + Math.random()*2, color: 'rgba(255,240,180,0.9)' });
}

function criarEstrelas() {
  ceu.innerHTML = '';
  estrelas = [];
  canalizacoes.forEach((c, i) => {
    const star = document.createElement('div');
    star.classList.add('estrela');
    const x = Math.random() * (ceu.clientWidth-30);
    const y = Math.random() * (ceu.clientHeight-30);
    star.style.left = x + 'px';
    star.style.top = y + 'px';
    star.dataset.index = i;

    // animação de flutuação (CSS transform via requestAnimationFrame)
    const ang = Math.random() * Math.PI*2;
    const amp = 4 + Math.random()*6;
    estrelas.push({el: star, x, y, ang, amp, speed: 0.01 + Math.random()*0.02});

    star.addEventListener('click', (ev) => {
      const idx = Number(star.dataset.index);
      const cdata = canalizacoes[idx];

      // explosion at star center
      const rect = star.getBoundingClientRect();
      const parentRect = ceu.getBoundingClientRect();
      const ex = rect.left - parentRect.left + rect.width/2;
      const ey = rect.top - parentRect.top + rect.height/2;
      createExplosion(ex, ey, 'rgba(255,210,80,1)');

      modalTitulo.textContent = cdata.titulo;
      modalAutor.textContent = cdata.autor;
      modalConteudo.textContent = cdata.conteudo;
      modal.classList.remove('hidden');
    });

    ceu.appendChild(star);
  });
}

closeModal.addEventListener('click', () => modal.classList.add('hidden'));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const titulo = document.getElementById('titulo').value.trim();
  const autor = document.getElementById('autor').value.trim();
  const conteudo = document.getElementById('conteudo').value.trim();
  if (!titulo || !conteudo) return alert('Título e conteúdo são obrigatórios');
  canalizacoes.push({titulo, autor, conteudo});
  salvar();
  criarEstrelas();
  form.reset();
});

// anima loop para flutuação, conexões, partículas e cometa
function loop() {
  const ctxId = 'ceu-canvas';
  let canvas = document.getElementById(ctxId);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = ctxId;
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = 30; // on top of stars so particles are visible
    canvas.width = ceu.clientWidth;
    canvas.height = ceu.clientHeight;
    ceu.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  canvas.width = ceu.clientWidth;
  canvas.height = ceu.clientHeight;

  // clear with slight fade for trailing effect
  ctx.clearRect(0,0,canvas.width, canvas.height);

  // draw connections
  for (let i=0;i<estrelas.length;i++){
    for (let j=i+1;j<estrelas.length;j++){
      const a = estrelas[i];
      const b = estrelas[j];
      const dx = (a.x) - (b.x);
      const dy = (a.y) - (b.y);
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < 180) {
        ctx.beginPath();
        ctx.moveTo(a.x+7, a.y+7);
        ctx.lineTo(b.x+7, b.y+7);
        ctx.strokeStyle = `rgba(180,200,255,${1 - dist/200})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // update stars (floating)
  estrelas.forEach(s => {
    s.ang += s.speed;
    const ny = s.y + Math.sin(s.ang)*s.amp;
    s.el.style.transform = `translateY(${Math.sin(s.ang)*s.amp}px)`;
  });

  // update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04; // gravity slight
    p.life -= 1;
    const alpha = Math.max(0, p.life / 60);
    ctx.beginPath();
    ctx.fillStyle = p.color.includes('rgba') ? p.color.replace(/[^,]+\)$/, `${alpha})`) : p.color;
    ctx.globalAlpha = alpha;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (p.life <= 0) particles.splice(i,1);
  }

  // draw comet (glow + small tail)
  if (comet.visible) {
    // soft glow
    const grad = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 28);
    grad.addColorStop(0, 'rgba(255,245,200,0.95)');
    grad.addColorStop(0.4, 'rgba(255,220,120,0.6)');
    grad.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(comet.x, comet.y, 30, 0, Math.PI*2); ctx.fill();

    // bright core
    ctx.beginPath(); ctx.fillStyle = 'rgba(255,255,220,0.95)'; ctx.arc(comet.x, comet.y, 6, 0, Math.PI*2); ctx.fill();
  }

  requestAnimationFrame(loop);
}

// mouse tracking for comet inside ceu
ceu.addEventListener('mouseenter', () => { comet.visible = true; });
ceu.addEventListener('mouseleave', () => { comet.visible = false; });
ceu.addEventListener('mousemove', (e) => {
  const rect = ceu.getBoundingClientRect();
  comet.x = e.clientX - rect.left;
  comet.y = e.clientY - rect.top;
  // add trail
  createCometTrail(comet.x, comet.y);
});

// inicialização
criarEstrelas();
loop();

// garantir resize
window.addEventListener('resize', () => {
  criarEstrelas();
});
