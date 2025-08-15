# Lichtara Site — Mini portal de canalizações

Pequeno site para registrar e exibir canalizações localmente.

Como executar (macOS / zsh)

1. Instalar dependências (se ainda não):

```bash
cd /Users/deboralutz/lichtara-os/lichtara_site
npm install
```

2. Iniciar o servidor:

```bash
npm start
# ou
node server.js
```

3. Abrir no navegador: http://localhost:3000

Onde os dados são salvos
- `lichtara_site/data/canalizacoes.json` — arquivo JSON simples com as entradas.

Workflow sugerido para versionamento

```bash
cd /Users/deboralutz/lichtara-os
git add lichtara_site
git commit -m "feat: add lichtara_site mini portal de canalizacoes"
# depois faça push (ver notas sobre autenticação abaixo)
```

Notas sobre autenticação Git (macOS)

- Se o Git pedir senha repetidamente via `git-credential-osxkeychain`, o problema geralmente é uma credencial antiga armazenada no Keychain ou a necessidade de usar um Personal Access Token (PAT) para HTTPS.
- Recomendamos configurar SSH para evitar prompts constantes (gera chave e adicione em GitHub > Settings > SSH and GPG keys).

Se quiser, eu faço o commit local por você (não precisa de credenciais) e gero um zip/patch com as mudanças para subir onde preferir.
