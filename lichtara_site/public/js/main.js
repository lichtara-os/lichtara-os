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

fetchList();
