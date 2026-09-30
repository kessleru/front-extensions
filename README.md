<div align="center">

<img src=".github/readme/banner.svg" alt="Extensions — gerenciador de extensões do navegador" width="100%">

**Interface de gerenciamento de extensões do navegador: ative e desative, filtre, remova e troque entre tema claro e escuro.**

[![Demo](https://img.shields.io/badge/demo-ao%20vivo-e53935?style=for-the-badge&logo=githubpages&logoColor=white)](https://kessleru.github.io/front-extensions/)
[![Super-Linter](https://img.shields.io/github/actions/workflow/status/kessleru/front-extensions/super-linter.yml?branch=main&style=for-the-badge&label=lint)](https://github.com/kessleru/front-extensions/actions/workflows/super-linter.yml)
[![Último commit](https://img.shields.io/github/last-commit/kessleru/front-extensions?style=for-the-badge&color=1e2a5a)](https://github.com/kessleru/front-extensions/commits/main)

<img src=".github/readme/desktop.png" alt="Lista de extensões em três colunas, cada card com ícone, nome, descrição, botão Remove e chave de ativação" width="100%">

</div>

## Sobre

Solução para a **Lista 05**, que pede para reproduzir a
[interface de gerenciamento de extensões](https://github.com/andreluizfrancabatista/browser-extensions-manager-ui)
do [Frontend Mentor](https://www.frontendmentor.io) a partir do design e de um `data.json`.

As 12 extensões vêm do `data.json` via `fetch` e viram cards montados por JavaScript. O estado de
cada uma (ativa ou não) vive num array em memória que os filtros consultam, e o tema escolhido fica
salvo no `localStorage`.

## Telas

### Tema escuro

O botão no canto do cabeçalho alterna o atributo `data-theme` no `<html>`; as cores vêm de custom
properties redefinidas em `[data-theme='dark']`.

<img src=".github/readme/desktop-escuro.png" alt="A mesma lista no tema escuro, com fundo azul-marinho" width="100%">

### Filtro "Active"

Mostra só as extensões ligadas — 8 das 12 no estado inicial.

<img src=".github/readme/filtro-ativas.png" alt="Filtro Active selecionado, com apenas as extensões ativas" width="100%">

### Celular

<table>
<tr>
<td width="50%"><img src=".github/readme/mobile.png" alt="Lista no celular, tema claro" width="100%"></td>
<td width="50%"><img src=".github/readme/mobile-escuro.png" alt="Lista no celular, tema escuro" width="100%"></td>
</tr>
<tr>
<td align="center"><sub><b>Tema claro</b></sub></td>
<td align="center"><sub><b>Tema escuro</b></sub></td>
</tr>
</table>

## Funcionalidades

| | |
|---|---|
| 🔌 **Ativar / desativar** | A chave de cada card atualiza o `isActive` no array e esmaece o card inativo |
| 🔎 **Filtros** | **All**, **Active** e **Inactive** re-renderizam a grade a partir do estado atual |
| 🗑️ **Remover** | Tira a extensão do array e o card do DOM |
| 🌗 **Tema claro/escuro** | Alternado por botão e lembrado no `localStorage` |
| 📱 **Responsivo** | Três colunas no desktop, duas abaixo de 992px e uma abaixo de 610px |
| ✅ **Lint no CI** | [Super-Linter](https://github.com/super-linter/super-linter) roda a cada push na `main` |

## Stack

| Camada | Ferramenta |
|---|---|
| Marcação | HTML5 |
| Estilo | CSS3 — custom properties, Grid, CSS organizado em `base/`, `components/` e `layout/` |
| Lógica | JavaScript em ES Modules, `fetch` e `localStorage` |
| CI | GitHub Actions + Super-Linter |
| Deploy | [GitHub Pages](https://pages.github.com) |

## Rodando localmente

```bash
git clone https://github.com/kessleru/front-extensions.git
cd front-extensions
python -m http.server 8000
```

Abra `http://localhost:8000`.

> **Atenção:** abrir o `index.html` direto no navegador (`file://`) não funciona: o navegador
> bloqueia o `fetch` do `data.json` e os ES Modules fora de um servidor HTTP.

## Estrutura

```
├── index.html
├── data.json                 # as 12 extensões: logo, nome, descrição e isActive
├── css/
│   ├── styles.css            # importa os arquivos abaixo
│   ├── base/                 # reset, variáveis de cor (claro e escuro) e global
│   ├── components/           # card, header e nav (filtros)
│   └── layout/responsivo.css # breakpoints de 992px e 610px
├── js/
│   ├── script.js             # init: carrega os dados e liga os módulos
│   └── modules/
│       ├── fetchData.js      # loadData / getExtensionsData
│       ├── displayCards.js   # monta os cards
│       ├── cardFunctions.js  # chave de ativação e botão Remove
│       ├── filter.js         # All / Active / Inactive
│       └── toggleTheme.js    # tema + localStorage
└── assets/images/            # logos das extensões e ícones de tema
```

<details>
<summary><b>Regerando as imagens deste README</b></summary>

```bash
node .github/readme/gerar.mjs                 # banner.svg

python -m http.server 8000                    # em outro terminal
npm i --no-save puppeteer-core sharp
node .github/readme/capturar.mjs              # telas em 2x, nos dois temas
```

</details>

---

<div align="center">
<sub>Feito por <a href="https://github.com/kessleru">Otávio Kessler Ustra</a> · desafio do <a href="https://www.frontendmentor.io">Frontend Mentor</a></sub>
</div>
