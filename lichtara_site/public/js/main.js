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

// Configurações
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.style.position = 'fixed';
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '0';
canvas.style.pointerEvents = 'none';
const ctx = canvas.getContext('2d');

let stars = [];
let planets = [];
let connections = [];
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Função utilitária
function random(min, max) { return Math.random() * (max - min) + min; }

// Criar estrelas de fundo
for (let i = 0; i < 150; i++) {
  stars.push({ x: random(0, width), y: random(0, height), r: random(0.5, 1.5), alpha: random(0.1, 1), delta: Math.random()*0.02 });
}

// Criar planetas orbitando (cada pasta)
document.querySelectorAll('.folder').forEach((folder, i) => {
  planets.push({
    folder,
    angle: random(0, 2*Math.PI),
    radius: random(20, 50),
    speed: random(0.01, 0.03),
    size: random(6, 12),
    color: `hsl(${i*40 % 360}, 70%, 60%)`
  });
});

// Conectar arquivos dentro de pastas
document.querySelectorAll('.file').forEach(file => {
  const rect = file.getBoundingClientRect();
  connections.push({x: rect.left + rect.width/2, y: rect.top + rect.height/2});
});

// Atualizar canvas ao redimensionar
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Desenhar loop
function animate() {
  ctx.clearRect(0, 0, width, height);

  // Estrelas
  stars.forEach(s => {
    s.alpha += s.delta;
    if (s.alpha <= 0.1 || s.alpha >= 1) s.delta *= -1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.fill();
  });

  // Planetas orbitando pastas
  planets.forEach(p => {
    const rect = p.folder.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    p.angle += p.speed;
    const px = cx + Math.cos(p.angle)*p.radius;
    const py = cy + Math.sin(p.angle)*p.radius;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI*2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Conexões (constelações)
  for (let i=0; i<connections.length; i++) {
    for (let j=i+1; j<connections.length; j++) {
      const dx = connections[i].x - connections[j].x;
      const dy = connections[i].y - connections[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 150) {
        ctx.beginPath();
        ctx.moveTo(connections[i].x, connections[i].y);
        ctx.lineTo(connections[j].x, connections[j].y);
        ctx.strokeStyle = `rgba(173,216,230,${1-dist/150})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

// Cometa seguindo cursor
let comet = { x: width/2, y: height/2 };
window.addEventListener('mousemove', e => { comet.x = e.clientX; comet.y = e.clientY; });

function drawComet() {
  ctx.beginPath();
  ctx.arc(comet.x, comet.y, 5, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
  ctx.shadowBlur = 15;
  ctx.shadowColor = 'rgba(255, 255, 200, 0.9)';
  ctx.fill();
  ctx.shadowBlur = 0;
  requestAnimationFrame(drawComet);
}

// Inicializar
animate();
drawComet();
