Portal Cósmico Interativo — versão client-only

Como usar:

1. Abra `lichtara_portal/index.html` no navegador (arraste para o navegador ou use um servidor estático).
2. Preencha o formulário e envie — as canalizações são salvas em localStorage e aparecem como estrelas.
3. Clique nas estrelas para ver o modal com conteúdo.

Para rodar via servidor simples (opcional):

- Python (rápido):

  python3 -m http.server 8000

  e abra http://localhost:8000/lichtara_portal/

Notas:
- Esta versão é cliente-only e salva dados no localStorage do navegador. Para persistência no servidor, substitua a lógica de salvar pelo endpoint POST/GET em `server.js`.
