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
│       ├── green-valley-alliance.svg
│       ├── readers-united.svg
│       ├── neighbors-first.svg
│       └── wellness-together.svg
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

**`<title>` vem de variável EJS.** O header usa `<%= title %>`, e as cinco rotas
(incluindo o 404) passam `title` no `res.render`. É requisito da rubrica que o
título de cada página seja variável.

**Imagens em SVG.** Os quatro cards de `/organizations` usam SVG em
`public/images/`. São nítidos em qualquer densidade de tela, pesam ~1 KB cada e
não dependem de CDN. Cada `<img>` tem `alt` descritivo e `width`/`height` para
reservar o espaço antes de carregar (evita layout shift).

**Um `<h1>` por página.** O título da página é `<h1>`; os títulos dos cards são
`<h2>`. Leitor de tela e validador de acessibilidade esperam essa ordem — sem o
`<h1>` a página não tem título programático.

## Deploy no Render

- Build command: `npm install`
- Start command: `npm start`
- Root directory: `W01` (o repositório guarda uma pasta por semana)

## Checklist da rubrica

- [x] ESM (`import`) e `"type": "module"`
- [x] Arrow functions em todos os handlers
- [x] `const` em vez de `var`/`let`
- [x] `<%= title %>` no header, `<%- include() %>` nos partials
- [x] `express.static` servindo `public/`
- [x] Link Categories na navegação
- [x] `.env` no `.gitignore`
- [x] Imagens em `public/images/` renderizadas em `/organizations`
- [x] Um `<h1>` por página
- [x] CSS responsivo, contraste AA, foco visível
- [ ] Testar o link do Render antes de submeter no Canvas
