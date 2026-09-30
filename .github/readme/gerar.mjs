/**
 * Gera as imagens vetoriais do README: o banner e os cartões de terminal.
 *
 * Rodar:  node .github/readme/gerar.mjs
 *
 * Sem dependências. Todo texto de terminal nas cenas lá embaixo é cópia de uma
 * execução real — se a saída mudar, cole a nova e rode de novo.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SAIDA = import.meta.dirname;

const FONTE_UI = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
const FONTE_MONO =
  "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace,'Noto Color Emoji','Apple Color Emoji','Segoe UI Emoji'";

const escapar = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------------------------------------------------------------------
// Terminal: saída real com códigos ANSI → SVG
// ---------------------------------------------------------------------

const CORES_ANSI = {
  31: '#ff7b72', // vermelho
  32: '#7ee787', // verde
  33: '#f2cc60', // amarelo
  34: '#79c0ff', // azul
  35: '#d2a8ff', // magenta
  36: '#a5d6ff', // ciano
  37: '#c9d1d9',
  90: '#7d8590', // cinza
  97: '#f0f6fc',
};

/** Quebra uma linha com códigos ANSI em trechos `{ texto, cor, negrito }`. */
function lerAnsi(linha) {
  const trechos = [];
  let cor = null;
  let negrito = false;
  let resto = linha;
  const RE = /\x1b\[([0-9;]*)m/;
  let m;
  while ((m = RE.exec(resto)) !== null) {
    if (m.index > 0) trechos.push({ texto: resto.slice(0, m.index), cor, negrito });
    for (const codigo of m[1].split(';').map(Number)) {
      if (codigo === 0) ((cor = null), (negrito = false));
      else if (codigo === 1) negrito = true;
      else if (codigo === 22) negrito = false;
      else if (codigo === 39) cor = null;
      else if (CORES_ANSI[codigo]) cor = CORES_ANSI[codigo];
    }
    resto = resto.slice(m.index + m[0].length);
  }
  if (resto) trechos.push({ texto: resto, cor, negrito });
  return trechos.length ? trechos : [{ texto: '', cor: null, negrito: false }];
}

const comprimento = (linha) => lerAnsi(linha).reduce((n, t) => n + t.texto.length, 0);

function linhasSvg(linhas, { x, y0, alturaLinha }) {
  return linhas
    .map((linha, i) => {
      const spans = lerAnsi(linha)
        .map(
          (t) =>
            `<tspan${t.cor ? ` fill="${t.cor}"` : ''}${t.negrito ? ' font-weight="600"' : ''}>${escapar(t.texto)}</tspan>`,
        )
        .join('');
      return `    <text x="${x}" y="${y0 + i * alturaLinha}" xml:space="preserve">${spans}</text>`;
    })
    .join('\n');
}

/** Cartão de terminal com fundo escuro fixo: funciona nos dois temas do GitHub. */
function terminal({ titulo, linhas, arquivo, colunas }) {
  const FONTE = 13;
  const LARGURA_CHAR = FONTE * 0.6; // métrica de fonte monoespaçada
  const ALTURA_LINHA = 20;
  const PADDING = 18;
  const BARRA = 34;
  const ZONA_BOTOES = 82; // o título não pode passar por cima das bolinhas
  const MARGEM_CANTO = 24;

  const cols = colunas ?? Math.max(...linhas.map(comprimento));
  const larguraMinima = ZONA_BOTOES + titulo.length * 12 * 0.6 + MARGEM_CANTO;
  const largura = Math.ceil(Math.max(cols * LARGURA_CHAR + PADDING * 2, larguraMinima));
  const altura = BARRA + PADDING + linhas.length * ALTURA_LINHA + PADDING;
  const xTitulo = ZONA_BOTOES + (largura - ZONA_BOTOES - MARGEM_CANTO) / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" role="img" aria-label="${escapar(titulo)}">
  <rect width="${largura}" height="${altura}" rx="10" fill="#0d1117" stroke="#30363d"/>
  <path d="M0 10a10 10 0 0 1 10-10h${largura - 20}a10 10 0 0 1 10 10v${BARRA - 10}H0z" fill="#161b22"/>
  <line x1="0" y1="${BARRA}" x2="${largura}" y2="${BARRA}" stroke="#30363d"/>
  <circle cx="18" cy="17" r="5" fill="#ff5f57"/>
  <circle cx="36" cy="17" r="5" fill="#febc2e"/>
  <circle cx="54" cy="17" r="5" fill="#28c840"/>
  <text x="${xTitulo}" y="22" text-anchor="middle" font-family="${FONTE_MONO}" font-size="12" fill="#7d8590">${escapar(titulo)}</text>
  <g font-family="${FONTE_MONO}" font-size="${FONTE}" fill="#c9d1d9">
${linhasSvg(linhas, { x: PADDING, y0: BARRA + PADDING + ALTURA_LINHA - 6, alturaLinha: ALTURA_LINHA })}
  </g>
</svg>
`;
  writeFileSync(join(SAIDA, arquivo), svg);
  console.log(`✓ ${arquivo}  (${largura}×${altura})`);
}

// ---------------------------------------------------------------------
// Banner 1200×380: identidade à esquerda, "o que o projeto faz" à direita
// ---------------------------------------------------------------------

/**
 * Conteúdo pronto para o card do banner: um terminal em miniatura.
 * Coordenadas relativas ao card (428×252).
 */
function cardTerminal({ titulo, linhas, fonte: fonteMax = 13 }) {
  // Cabe no card: a fonte encolhe para a linha mais longa e a altura da linha
  // para o número de linhas, em vez de o texto vazar pela borda.
  const maisLonga = Math.max(...linhas.map(comprimento));
  const fonte = Math.min(fonteMax, 388 / (maisLonga * 0.6));
  const alturaLinha = Math.min(fonte * 1.55, 196 / linhas.length);
  if (fonte < 10.5 || alturaLinha < fonte * 1.2) console.warn(`! card "${titulo}" apertado: fonte ${fonte.toFixed(1)}`);
  return `
    <rect width="428" height="252" rx="18" fill="#0d1117"/>
    <path d="M0 18a18 18 0 0 1 18-18h392a18 18 0 0 1 18 18v12H0z" fill="#161b22"/>
    <circle cx="22" cy="16" r="4.5" fill="#ff5f57"/><circle cx="38" cy="16" r="4.5" fill="#febc2e"/><circle cx="54" cy="16" r="4.5" fill="#28c840"/>
    <text x="241" y="20" text-anchor="middle" font-family="${FONTE_MONO}" font-size="11" fill="#7d8590">${escapar(titulo)}</text>
    <g font-family="${FONTE_MONO}" font-size="${+fonte.toFixed(2)}" fill="#c9d1d9">
${linhasSvg(linhas, { x: 20, y0: +(44 + alturaLinha * 0.75).toFixed(1), alturaLinha: +alturaLinha.toFixed(2) })}
    </g>`;
}

function banner({ arquivo, titulo, tagline, stack, pills = [], cores, card, arte = '', defs = '', circulos = true, rotulo }) {
  const { de, ate, texto = '#ffffff', suave = 'rgba(255,255,255,.78)', circulo = '#ffffff', circuloOpacidade = 0.08 } = cores;
  const tamanhoTitulo = titulo.length > 16 ? 44 : 52;

  // A coluna da esquerda tem ~600px úteis; avisa antes de o texto invadir o card.
  const largo = [
    [titulo, tamanhoTitulo * 0.58],
    [tagline, 24 * 0.52],
    [stack, 17 * 0.5],
  ].find(([t, k]) => t.length * k > 600);
  if (largo) console.warn(`! texto largo demais para o banner: "${largo[0]}"`);

  let x = 74;
  const pillsSvg = pills
    .map((p) => {
      const largura = Math.round(p.texto.length * 14 * 0.58 + 46);
      const s = `<rect x="${x}" y="262" width="${largura}" height="32" rx="16" fill="${p.fundo}"/>
    <circle cx="${x + 20}" cy="278" r="4" fill="${p.cor}"/><text x="${x + 32}" y="283" fill="${p.cor}">${escapar(p.texto)}</text>`;
      x += largura + 10;
      return s;
    })
    .join('\n    ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="380" viewBox="0 0 1200 380" role="img" aria-label="${escapar(rotulo ?? `${titulo} — ${tagline}`)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${de}"/>
      <stop offset="100%" stop-color="${ate}"/>
    </linearGradient>
    <filter id="sombra" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000000" flood-opacity=".28"/>
    </filter>
    <clipPath id="recorte"><rect width="428" height="252" rx="18"/></clipPath>
    <clipPath id="moldura"><rect width="1200" height="380" rx="24"/></clipPath>${defs}
  </defs>

  <rect width="1200" height="380" rx="24" fill="url(#bg)"/>
${circulos ? `  <circle cx="1105" cy="60" r="190" fill="${circulo}" opacity="${circuloOpacidade}"/>
  <circle cx="110" cy="360" r="150" fill="${circulo}" opacity="${circuloOpacidade * 0.8}"/>` : ''}
  <g clip-path="url(#moldura)">${arte}
  </g>

  <text x="72" y="148" font-family="${FONTE_UI}" font-size="${tamanhoTitulo}" font-weight="800" letter-spacing="-1" fill="${texto}">${escapar(titulo)}</text>
  <text x="74" y="196" font-family="${FONTE_UI}" font-size="24" font-weight="600" fill="${texto}">${escapar(tagline)}</text>
  <text x="74" y="232" font-family="${FONTE_UI}" font-size="17" fill="${suave}">${escapar(stack)}</text>

  <g font-family="${FONTE_UI}" font-size="14" font-weight="600">
    ${pillsSvg}
  </g>

${card ? `  <g transform="translate(700,64)">
    <rect width="428" height="252" rx="18" fill="${card.fundo ?? '#ffffff'}" filter="url(#sombra)"/>
    <g clip-path="url(#recorte)">${card.conteudo}
    </g>
  </g>` : ''}
</svg>
`;
  writeFileSync(join(SAIDA, arquivo), svg);
  console.log(`✓ ${arquivo}  (1200×380)`);
}

/**
 * Embute um SVG do próprio repositório (logo, ícone) dentro do banner, na
 * caixa x/y/largura/altura. Ids ganham prefixo para não colidirem entre si.
 * `trocar` substitui cores literais (ex.: { white: '#1a1a1a' }).
 */
function svgArquivo(caminho, { x, y, largura, altura, trocar = {}, extra = '' }) {
  let bruto = readFileSync(join(SAIDA, '..', '..', caminho), 'utf8')
    .replace(/<\?xml[^>]*>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const raiz = bruto.match(/<svg[ >][^>]*>/)[0];
  const viewBox =
    (raiz.match(/viewBox="([^"]+)"/) ?? [])[1] ??
    `0 0 ${parseFloat(raiz.match(/width="([^"]+)"/)[1])} ${parseFloat(raiz.match(/height="([^"]+)"/)[1])}`;
  const prefixo = caminho.replace(/[^a-z0-9]/gi, '');
  let miolo = bruto.slice(bruto.indexOf(raiz) + raiz.length, bruto.lastIndexOf('</svg>'));
  miolo = miolo
    .replace(/id="([^"]+)"/g, `id="${prefixo}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefixo}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${prefixo}-$1"`);
  for (const [de, para] of Object.entries(trocar)) miolo = miolo.split(`"${de}"`).join(`"${para}"`);
  return `<svg x="${x}" y="${y}" width="${largura}" height="${altura}" viewBox="${viewBox}" ${extra}>${miolo.trim()}</svg>`;
}

// Atalhos ANSI para escrever as cenas
const v = '\x1b[32m';
const am = '\x1b[33m';
const vm = '\x1b[31m';
const az = '\x1b[34m';
const c = '\x1b[36m';
const mg = '\x1b[35m';
const f = '\x1b[90m';
const b = '\x1b[1m';
const _ = '\x1b[0m';

// ---------------------------------------------------------------------
// Cenas
// ---------------------------------------------------------------------
// Arte: três cards da interface, com os logos reais das extensões
// (assets/images/) e a chave ligada/desligada de cada uma.
const card = (x, y, logo, nome, ativa, escuro) => `
  <g transform="translate(${x},${y})" filter="url(#sombra)"${ativa ? '' : ' opacity=".7"'}>
    <rect width="300" height="112" rx="14" fill="${escuro ? '#1e293b' : '#fcfdff'}" stroke="${escuro ? '#334155' : '#e2e8f0'}"/>
    ${svgArquivo(`assets/images/${logo}.svg`, { x: 16, y: 16, largura: 40, altura: 40 })}
    <text x="68" y="34" font-family="system-ui,'Segoe UI',sans-serif" font-size="16" font-weight="700" fill="${escuro ? '#f1f5f9' : '#091540'}">${nome}</text>
    <rect x="68" y="44" width="170" height="6" rx="3" fill="${escuro ? '#475569' : '#cbd5e1'}"/>
    <rect x="68" y="56" width="120" height="6" rx="3" fill="${escuro ? '#475569' : '#cbd5e1'}"/>
    <rect x="16" y="76" width="70" height="24" rx="12" fill="none" stroke="${escuro ? '#475569' : '#cbd5e1'}"/>
    <text x="51" y="92" text-anchor="middle" font-family="system-ui,'Segoe UI',sans-serif" font-size="11" font-weight="600" fill="${escuro ? '#f1f5f9' : '#091540'}">Remove</text>
    <rect x="244" y="80" width="40" height="20" rx="10" fill="${ativa ? '#e53935' : escuro ? '#475569' : '#e2e8f0'}"/>
    <circle cx="${ativa ? 274 : 254}" cy="90" r="7" fill="#ffffff"/>
  </g>`;

banner({
  arquivo: 'banner.svg',
  titulo: 'Extensions',
  tagline: 'Gerenciador de extensões do navegador',
  stack: 'HTML · CSS · JavaScript em ES Modules · fetch',
  cores: { de: '#040918', ate: '#1e2a5a', circulo: '#e53935', circuloOpacidade: 0.1 },
  pills: [
    { texto: 'Ativar/desativar', fundo: 'rgba(229,57,53,.2)', cor: '#ffb4b2' },
    { texto: 'Filtros', fundo: 'rgba(229,57,53,.2)', cor: '#ffb4b2' },
    { texto: 'Tema escuro', fundo: 'rgba(229,57,53,.2)', cor: '#ffb4b2' },
  ],
  arte: `
  ${card(800, 30, 'logo-devlens', 'DevLens', true, false)}
  ${card(760, 134, 'logo-style-spy', 'StyleSpy', true, true)}
  ${card(840, 238, 'logo-speed-boost', 'SpeedBoost', false, true)}`,
});
