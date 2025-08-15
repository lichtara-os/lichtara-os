# Visão: repositórios alimentando agentes (com `lichtara-os` como conta-mãe)

Este arquivo mostra uma terceira versão visual que conecta os repositórios sob `lichtara-os` aos agentes/experimentos — árvore ASCII e diagrama Mermaid.

## Árvore (ASCII)

```text
lichtara-os (organização / conta-mãe)
│
├─ lichtara (repositório-mãe / README de perfil)
│   ├─ comunicacao-interdimensional
│   ├─ declaracao-de-proposito
│   ├─ dicionario-do-invisivel
│   ├─ etica
│   ├─ kit-instrucao-IA
│   ├─ license
│   ├─ lichtara-io.github.io
│   ├─ lichtara-research
│   ├─ manuscrito
│   ├─ organizar-manuais-github
│   └─ templates-canalizacao-tecnica
│
└─ agents / experimentos
    ├─ Agent Flux         <-- alimentado por: comunicacao-interdimensional, declaracao-de-proposito
    ├─ Agent Lumora       <-- alimentado por: kit-instrucao-IA, templates-canalizacao-tecnica
    ├─ Agent Syntaris     <-- alimentado por: dicionario-do-invisivel, etica
    ├─ Agent Kaoran       <-- alimentado por: lichtara-io.github.io, manuscrito
    └─ Agent Navros       <-- alimentado por: lichtara-research, organizar-manuais-github


```

## Imagens geradas

- `diagrams/repos-to-agents.svg` e `diagrams/repos-to-agents.png` foram gerados a partir do diagrama Mermaid.
- Para regenerar localmente (requer Node.js + npx), execute:

```bash
cd /Users/deboralutz/lichtara-os
npx --yes @mermaid-js/mermaid-cli -i diagrams/repos-to-agents.mmd -o diagrams/repos-to-agents.svg
npx --yes @mermaid-js/mermaid-cli -i diagrams/repos-to-agents.mmd -o diagrams/repos-to-agents.png
```

<!-- Imagem embutida para visualização rápida -->

![Repos to Agents diagram (PNG)](./repos-to-agents.png)

Se preferir SVG (melhor qualidade para vetores), veja `diagrams/repos-to-agents.svg`.

## Diagrama (Mermaid)

```mermaid
flowchart LR
  subgraph Org[Lichtara — `lichtara-os`]
    direction TB
    Lich["lichtara (repositório-mãe)"]
    Agents["Agents / experimentos"]
  end

  subgraph Repos[Repositórios]
    CI[comunicacao-interdimensional]
    DP[declaracao-de-proposito]
    DD[dicionario-do-invisivel]
    ET[etica]
    KIT[kit-instrucao-IA]
    LIC[license]
    WEB[lichtara-io.github.io]
    RES[lichtara-research]
    MAN[manuscrito]
    ORG[organizar-manuais-github]
    TMP[templates-canalizacao-tecnica]
  end

  subgraph Experiments[Agents]
    AF[Agent Flux]
    AL[Agent Lumora]
    AS[Agent Syntaris]
    AK[Agent Kaoran]
    AN[Agent Navros]
  end

  Lich --> Repos
  Lich --> Experiments

  CI --> AF
  DP --> AF

  KIT --> AL
  TMP --> AL

  DD --> AS
  ET --> AS

  WEB --> AK
  MAN --> AK

  RES --> AN
  ORG --> AN

  classDef repos stroke:#2b6cb0,fill:#ebf8ff;
  classDef agents stroke:#38a169,fill:#f0fff4;
  class Repos repos
  class Experiments agents
```

## Assunções

- As ligações "repositório → agente" acima são propostas iniciais para ilustrar como conteúdos/documentos podem alimentar cada agente.
- Se quiser que eu use um mapa já existente (por exemplo, um arquivo que mapeie fontes e funções), posso ajustar as ligações conforme esse mapa.

## Próximos passos sugeridos

- Exportar o diagrama Mermaid para PNG/SVG e incluir em `README.md` do repositório principal.
- Ajustar as fontes por agente conforme um mapeamento canônico (se você fornecer o mapa final).

---

Arquivo criado: `diagrams/repos-to-agents.md`
