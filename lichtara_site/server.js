const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'canalizacoes.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar diretório/arquivo de dados se necessário
async function ensureDataFile() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        try {
            await fs.access(DATA_FILE);
        } catch (err) {
            await fs.writeFile(DATA_FILE, '[]', 'utf8');
        }
    } catch (err) {
        console.error('Erro ao garantir arquivo de dados:', err);
    }
}

// Ler canalizações
async function readCanalizacoes() {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
}

// Gravar canalizações
async function writeCanalizacoes(items) {
    await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
}

app.get('/api/canalizacoes', async (req, res) => {
    try {
        const items = await readCanalizacoes();
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao ler canalizações' });
    }
});

app.post('/api/canalizacoes', async (req, res) => {
    try {
        const { title, author, content } = req.body;
        if (!content || !title) return res.status(400).json({ error: 'title and content required' });
        const items = await readCanalizacoes();
        const now = new Date().toISOString();
        const entry = { id: Date.now(), title, author: author || 'Anônimo', content, created_at: now };
        items.unshift(entry);
        await writeCanalizacoes(items);
        res.status(201).json(entry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar canalização' });
    }
});

// Inicializar e iniciar servidor
ensureDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor Lichtara rodando: http://localhost:${PORT}`);
    });
});
