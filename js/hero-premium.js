/* hero-premium.js */

const initScrambleText = () => {
  const h1 = document.querySelector('#hero h1');
  if (!h1) return;
  const chars = '#@$%&?!*~';
  const nodes = [];
  h1.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) nodes.push({ node, original: node.textContent, isSpan: false });
    else if (node.nodeType === Node.ELEMENT_NODE) nodes.push({ node, original: node.textContent, isSpan: true });
  });
  const scrambleText = (text, progress) => text.split('').map((char, i) => {
    if (char === ' ' || char === '\n') return char;
    if (progress > i / text.length) return char;
    return chars[Math.floor(Math.random() * chars.length)];
  }).join('');
  let frame = 0;
  const totalFrames = 40;
  const scramble = () => {
    const progress = frame / totalFrames;
    nodes.forEach(({ node, original }) => { node.textContent = scrambleText(original, progress); });
    frame++;
    if (frame <= totalFrames) requestAnimationFrame(scramble);
    else nodes.forEach(({ node, original }) => { node.textContent = original; });
  };
  setTimeout(scramble, 400);
};

const initHeroTerminal = () => {
  const titleWrap = document.querySelector('.section-hero__title-wrap');
  if (!titleWrap) return;

  const terminal = document.createElement('div');
  terminal.className = 'hero-terminal-box';
  terminal.innerHTML = `
    <div class="htb-bar">
      <span class="htb-dot htb-dot--r"></span>
      <span class="htb-dot htb-dot--y"></span>
      <span class="htb-dot htb-dot--g"></span>
      <span class="htb-path">~/trafiqo/index.js</span>
    </div>
    <div class="htb-body" id="htbBody"></div>
  `;
  titleWrap.parentNode.insertBefore(terminal, titleWrap);
  titleWrap.style.display = 'none';

  const body = document.getElementById('htbBody');

  const addLine = (text, cls) => {
    const line = document.createElement('div');
    line.className = 'htb-line ' + cls;
    body.appendChild(line);
    return line;
  };

  const typeInto = (el, text, speed, cb) => {
    let i = 0;
    const t = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) { clearInterval(t); if (cb) setTimeout(cb, 150); }
    }, speed);
  };

  const steps = [
    { cmd: '$ create --type website', out: '  ✓ Сайт который приносит клиентов.' },
    { cmd: '$ build --platform mobile', out: '  ✓ Приложение которым пользуются.' },
    { cmd: '$ deploy --service automation', out: '  ✓ Автоматизация которая работает.' },
  ];

  let si = 0;
  const runStep = () => {
    if (si >= steps.length) {
      setTimeout(() => { body.innerHTML = ''; si = 0; runStep(); }, 2000);
      return;
    }
    const s = steps[si];
    const cmdLine = addLine('', 'htb-line--cmd');
    typeInto(cmdLine, s.cmd, 45, () => {
      const outLine = addLine('', 'htb-line--out');
      typeInto(outLine, s.out, 25, () => { si++; setTimeout(runStep, 300); });
    });
  };

  setTimeout(runStep, 500);
};

document.addEventListener('DOMContentLoaded', () => {
  initScrambleText();
  initHeroTerminal();
});
