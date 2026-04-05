/* hero-premium.js */

const initScrambleText = () => {
  const h1 = document.querySelector('#hero h1');
  if (!h1) return;
  const chars = '#@$%&?!*~';

  // Собираем все узлы — текстовые и span
  const nodes = [];
  h1.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      nodes.push({ node, original: node.textContent, isSpan: false });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      nodes.push({ node, original: node.textContent, isSpan: true });
    }
  });

  const scrambleText = (text, progress) => {
    return text.split('').map((char, i) => {
      if (char === ' ' || char === '\n') return char;
      if (progress > i / text.length) return char;
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
  };

  let frame = 0;
  const totalFrames = 40;

  const scramble = () => {
    const progress = frame / totalFrames;
    nodes.forEach(({ node, original, isSpan }) => {
      const scrambled = scrambleText(original, progress);
      if (isSpan) node.textContent = scrambled;
      else node.textContent = scrambled;
    });
    frame++;
    if (frame <= totalFrames) requestAnimationFrame(scramble);
    else nodes.forEach(({ node, original }) => {
      node.textContent = original;
    });
  };

  setTimeout(scramble, 400);
};

document.addEventListener('DOMContentLoaded', initScrambleText);
