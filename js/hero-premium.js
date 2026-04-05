/* hero-premium.js */

const initScrambleText = () => {
  const h1 = document.querySelector('#hero h1');
  if (!h1) return;
  if (window.innerWidth <= 768) return;
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
  let scramblesDone = false;

  const scramble = () => {
    if (scramblesDone) return;
    const progress = frame / totalFrames;
    nodes.forEach(({ node, original, isSpan }) => {
      const scrambled = scrambleText(original, progress);
      if (isSpan) node.textContent = scrambled;
      else node.textContent = scrambled;
    });
    frame++;
    if (frame <= totalFrames) requestAnimationFrame(scramble);
    else { nodes.forEach(({ node, original }) => { node.textContent = original; }); scramblesDone = true; }
  };

  setTimeout(scramble, 400);
};

const initCodeEditor = () => {
  const visuals = document.querySelector('.section-hero__visuals');
  if (!visuals) return;
  visuals.querySelectorAll('.ui-browser,.ui-phone,.ui-chat').forEach(el => el.style.display = 'none');
  const editor = document.createElement('div');
  editor.className = 'he-wrap';
  editor.innerHTML = `<div class="he-bar"><div class="he-dots"><span class="he-dot r"></span><span class="he-dot y"></span><span class="he-dot g"></span></div><div class="he-tabs"><span class="he-tab active" data-file="html">index.html</span><span class="he-tab" data-file="bot">bot.js</span><span class="he-tab" data-file="py">app.py</span></div><span class="he-status" id="heStatus">compiling...</span></div><div class="he-body"><div class="he-nums" id="heNums"></div><div class="he-code" id="heCode"></div></div>`;
  visuals.appendChild(editor);
  const F = {
    html:[['comment','<!-- TRAFIQO — Landing Page -->'],['tag','<section class="hero">'],['str','  <h1>Сайт который продаёт</h1>'],['fn','  <p class="subtitle">'],['str','    Берём задачи любой сложности'],['fn','  </p>'],['tag','  <div class="cta-group">'],['fn','    <button class="btn--primary">'],['str','      Обсудить проект'],['fn','    </button>'],['tag','  </div>'],['tag','</section>'],['comment','<!-- ✓ deployed to trafiqo.store -->']],
    bot: [['comment','// Telegram Bot — TRAFIQO'],['kw','const bot = new TelegramBot(TOKEN)'],['tag',''],['fn','bot.onText(/start/, async (msg) => {'],['str','  const lead = await getLead(msg)'],['fn','  await notify({'],['str',"    text: 'Новая заявка!',"],['str','    data: lead'],['fn','  })'],['kw','  return sendMenu(msg.chat.id)'],['tag','})'],['comment','// ✓ 300+ лидов обработано']],
    py:  [['comment','# CRM автоматизация — TRAFIQO'],['kw','import trafiqo_sdk as sdk'],['tag',''],['fn','def process_lead(data: dict):'],['str','    lead = sdk.create_lead(data)'],['fn','    sdk.notify_team(lead.id)'],['fn','    sdk.push_to_crm(lead)'],['kw','    return {"status": "ok",'],['str','            "lead_id": lead.id}'],['tag',''],['comment','# ✓ конверсия +340%']],
  };
  const C = {comment:'rgba(240,236,255,0.28)',tag:'rgba(240,236,255,0.5)',str:'#C9A84C',kw:'#FF7B7B',fn:'#9B7FE8'};
  let tmr = null, cur = 'html';
  const render = f => {
    const ce = document.getElementById('heCode'), ne = document.getElementById('heNums'), st = document.getElementById('heStatus');
    if (!ce || !ne) return;
    ce.innerHTML = ''; ne.innerHTML = '';
    if (tmr) clearInterval(tmr);
    if (st) { st.textContent = 'compiling...'; st.style.color = '#C9A84C'; }
    let i = 0;
    tmr = setInterval(() => {
      if (i >= F[f].length) { clearInterval(tmr); if (st) { st.textContent = '✓ compiled'; st.style.color = '#28C840'; } return; }
      const [t, v] = F[f][i];
      const l = document.createElement('div'); l.className = 'he-line'; l.style.color = C[t]; l.textContent = v || '\u00A0'; ce.appendChild(l);
      const n = document.createElement('div'); n.className = 'he-num'; n.textContent = i + 1; ne.appendChild(n);
      i++;
    }, 110);
  };
  editor.querySelectorAll('.he-tab').forEach(tab => tab.addEventListener('click', () => { editor.querySelectorAll('.he-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); cur = tab.dataset.file; render(cur); }));
  let ai = 0; const files = ['html', 'bot', 'py'];
  setInterval(() => { ai = (ai + 1) % files.length; const tab = editor.querySelector(`[data-file="${files[ai]}"]`); if (tab) tab.click(); }, 5000);
  render(cur);
};

document.addEventListener('DOMContentLoaded', () => { initScrambleText(); initCodeEditor(); });
