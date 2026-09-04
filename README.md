# CSE 340 — Web Backend Development

Tarefas por semana. Cada pasta `Wxx` é um projeto independente, com o próprio
`package.json` e o próprio `node_modules`.

| Semana | Tarefa | Pasta | Status |
|---|---|---|---|
| W01 | Initial Site Creation | [`W01/`](./W01) | ✅ concluída |
| W02 | Database Retrieval | [`W02/`](./W02) | ✅ concluída |
| W03 | — | — | — |

## Como rodar qualquer semana

```bash
cd W01
npm install
npm start
```

Abre em http://localhost:3000

## Convenções do curso

- **ESM** (`import`/`export`) — exige `"type": "module"` no `package.json`
- **Arrow functions** em todos os handlers: `const nome = () => {}`
- **`const`** por padrão; `let` só quando houver reatribuição real
- EJS: `<%= %>` para dados, `<%- include() %>` para partials
- Arquivos estáticos servidos de `public/`
- `.env` **sempre** no `.gitignore` — item de nota 0 na rubrica
