// Netlify Function: /api/canalizacoes
// Storage strategy: GitHub Issues (label: canalizacao)
// Env required: GH_REPO_OWNER, GH_REPO_NAME, GH_TOKEN (with repo:issues scope)

const API = 'https://api.github.com';

function cors(headers = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }

  const owner = process.env.GH_REPO_OWNER;
  const repo = process.env.GH_REPO_NAME;
  const token = process.env.GH_TOKEN;
  if (!owner || !repo || !token) {
    return {
      statusCode: 500,
      headers: cors(),
      body: JSON.stringify({ error: 'Server not configured. Missing GH_REPO_OWNER, GH_REPO_NAME or GH_TOKEN.' })
    };
  }

  const auth = { Authorization: `Bearer ${token}`, 'User-Agent': 'lichtara-site-netlify-fn' };

  try {
    if (event.httpMethod === 'GET') {
      const url = `${API}/repos/${owner}/${repo}/issues?state=open&labels=${encodeURIComponent('canalizacao')}&per_page=100`;
      const res = await fetch(url, { headers: auth });
      if (!res.ok) throw new Error('GitHub GET failed ' + res.status);
      const issues = await res.json();
      const list = issues.map((i) => ({
        id: i.id,
        title: i.title,
        author: (i.user && i.user.login) || 'Anônimo',
        content: i.body || '',
        created_at: i.created_at,
        url: i.html_url,
      }));
      return { statusCode: 200, headers: cors(), body: JSON.stringify(list) };
    }

    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '{}');
      const title = (payload.title || '').trim();
      const author = (payload.author || 'Anônimo').trim();
      const content = (payload.content || '').trim();
      if (!title || !content) {
        return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'Título e conteúdo são obrigatórios' }) };
      }

      const body = `${content}\n\n—\nAutor: ${author}\nOrigem: lichtara_site`;
      const createRes = await fetch(`${API}/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, labels: ['canalizacao'] })
      });
      if (!createRes.ok) throw new Error('GitHub POST failed ' + createRes.status);
      const issue = await createRes.json();
      const item = {
        id: issue.id,
        title: issue.title,
        author: (issue.user && issue.user.login) || author,
        content,
        created_at: issue.created_at,
        url: issue.html_url,
      };
      return { statusCode: 201, headers: cors(), body: JSON.stringify(item) };
    }

    return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: err.message }) };
  }
};
