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

function salvar() {
  localStorage.setItem('canalizacoes', JSON.stringify(canalizacoes));
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

    star.addEventListener('click', () => {
      const idx = Number(star.dataset.index);
      const cdata = canalizacoes[idx];
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

// anima loop para flutuação e conexões
function loop() {
  const ctxId = 'ceu-canvas';
  let canvas = document.getElementById(ctxId);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = ctxId;
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.width = ceu.clientWidth;
    canvas.height = ceu.clientHeight;
    ceu.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  canvas.width = ceu.clientWidth;
  canvas.height = ceu.clientHeight;

  // clear
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

  // update stars
  estrelas.forEach(s => {
    s.ang += s.speed;
    const ny = s.y + Math.sin(s.ang)*s.amp;
    s.el.style.transform = `translateY(${Math.sin(s.ang)*s.amp}px)`;
  });

  requestAnimationFrame(loop);
}

// inicialização
criarEstrelas();
loop();

// garantir resize
window.addEventListener('resize', () => {
  criarEstrelas();
});
