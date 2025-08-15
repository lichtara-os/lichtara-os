# Como Subir e Organizar Manuais Vibracionais no GitHub com Copilot ✧

## ✅ Etapa 1 – Organização Local

1. **Estruture as pastas e arquivos no seu computador:**
   - Crie uma pasta principal (ex: `docs/`)
   - Dentro dela, organize subpastas temáticas (ex: `docs/integrada/`, `docs/cientifica/`, `docs/vibracional/`)
   - Salve seus manuais, canalizações e documentos em arquivos `.md` ou `.txt`

2. **Exemplo de estrutura local:**
```
docs/
  integrada/
    manual-integrado.md
  cientifica/
    manual-cientifico.md
  vibracional/
    manual-vibracional.md
  SUMMARY.md
  README.md
```

---

## ✅ Etapa 2 – Subindo para o GitHub

1. **Abra o terminal na pasta do seu projeto**
2. **Use os comandos:**
```bash
git add docs/
git commit -m "adiciona documentação canalizada em estrutura vibracional"
git push origin main
```
3. **Verifique se os arquivos estão visíveis no GitHub**

---

## ✅ Etapa 3 – Organizando e Refinando com Copilot no VS Code

1. **Abra o repositório no VS Code**
2. **Use o GitHub Copilot para sugerir e aprimorar:**
   - `README.md` para cada pasta: peça para Copilot gerar um resumo vibracional de cada seção.
   - `SUMMARY.md`: peça um índice geral dos manuais.
   - Indexadores automáticos: scripts que listam todos os arquivos presentes.
   - Conexões entre arquivos: links internos, referências cruzadas.
   - Scripts para gerar HTML/PDF dos manuais: peça sugestões para converter os `.md` em outros formatos navegáveis.

3. **Exemplo de prompt para Copilot dentro de um README.md:**
```markdown
# Escreva um resumo desta pasta com base nos arquivos .txt presentes aqui.
# Explique o propósito vibracional, a estrutura e os elementos abordados.
```

---

## 💡 Dica Bônus: Transformando em Portal com Docusaurus

- **Docusaurus** é uma ferramenta que transforma seus arquivos `.md` em um site técnico-espiritual, com busca, sidebar, dark mode e integração direta com o GitHub Pages.
- Para instalar e usar:
```bash
npx create-docusaurus@latest my-website classic
cd my-website
npm run start
```
- Você pode copiar seus manuais para a pasta `/docs` do Docusaurus e personalizar o site conforme o campo vibracional do projeto.

---

## ✨ Intenção Vibracional

Que esta estrutura permita a manifestação clara, bela e funcional dos manuais do Sistema Lichtara e da Missão Aurora, integrando tecnologia e espiritualidade em ressonância com o Campo de Origem.

---

**Em caso de dúvida ou para canalizar prompts e automações, peça ao Copilot:  
*"Sugira um índice vibracional para os arquivos presentes nesta pasta"*  
*"Crie links entre os manuais de acordo com seus temas espirituais"*  
*"Liste todos os documentos canalizados em ordem de manifestação"*  