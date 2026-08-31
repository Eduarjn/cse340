# W01 Assignment — Initial Site Creation

Site institucional **ServiceConnect**, em Express + EJS.

## Rodar localmente

```bash
npm install
npm start
```

http://localhost:3000

## Rotas

| Rota | View | Título |
|---|---|---|
| `/` | `index.ejs` | ServiceConnect \| Home |
| `/organizations` | `organizations.ejs` | Partner Organizations |
| `/projects` | `projects.ejs` | Service Projects |
| `/categories` | `categories.ejs` | Service Project Categories |
| qualquer outra | `404.ejs` | Page Not Found |

## Estrutura

```
W01/
├── server.js
├── package.json
├── .gitignore
├── public/
│   ├── css/style.css
│   └── images/
└── views/
    ├── index.ejs
    ├── organizations.ejs
    ├── projects.ejs
    ├── categories.ejs
    ├── 404.ejs
    └── partials/
        ├── header.ejs
        └── footer.ejs
```

## Decisões técnicas

**Caminhos absolutos com `fileURLToPath`.** Em ESM não existe `__dirname`.
`express.static('public')` resolveria a partir do diretório de onde o processo
foi iniciado, não do arquivo — funciona local e quebra no Render quando o start
dir difere. Por isso `views` e `public` são montados com `path.join(__dirname, ...)`.

**`process.env.PORT`.** O Render injeta a porta; porta fixa não sobe.

**Fallback no `<title>`.** O header usa
`<%= typeof title !== 'undefined' ? title : 'ServiceConnect' %>`.
Sem isso, qualquer rota que esqueça de passar `title` derruba a página com
`ReferenceError`. Continua sendo `<%= %>`, como a rubrica pede.

## Deploy no Render

- Build command: `npm install`
- Start command: `npm start`
- Root directory: `UNIVERSIDADE/BYU/CSE340/W01` (se o repo tiver várias semanas)

## Checklist da rubrica

- [x] ESM (`import`) e `"type": "module"`
- [x] Arrow functions em todos os handlers
- [x] `const` em vez de `var`/`let`
- [x] `<%= title %>` no header, `<%- include() %>` nos partials
- [x] `express.static` servindo `public/`
- [x] Link Categories na navegação
- [x] `.env` no `.gitignore`
- [x] CSS responsivo, contraste AA, foco visível
- [ ] Testar o link do Render antes de submeter no Canvas
