// reader — Distraction-Free Reading Mode
// Part of the Edge Toolkit · github.com/edgeof8

(function () {
  'use strict';

  // 1. Prevent duplicate injections
  if (document.getElementById('edge-reader-overlay')) return;

  // 2. Metadata Extraction Helpers
  const qs = s => document.querySelector(s);
  const mt = n => qs(`meta[name="${n}"], meta[property="${n}"]`)?.content || '';

  const title = mt('og:title') || mt('twitter:title') || document.title;
  let author = mt('author') || mt('article:author') || qs('[rel="author"], .author, .byline')?.textContent || '';
  author = author.replace(/^by\s+/i, '').trim();
  const dateStr = mt('article:published_time') || qs('time[datetime]')?.getAttribute('datetime') || '';
  const date = dateStr ? new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const site = mt('og:site_name') || location.hostname;

  // 3. Content Extraction Heuristic
  function getBody() {
    // Attempt 1: Strict semantic tags
    const candidates = Array.from(document.querySelectorAll('article, main[role="main"], .post-content, .article-content, .entry-content'));
    if (candidates.length > 0) {
      // Pick the largest block by text length
      return candidates.sort((a, b) => b.innerText.length - a.innerText.length)[0].cloneNode(true);
    }

    // Attempt 2: Paragraph scoring fallback
    let best = null, max = 0;
    document.querySelectorAll('div, section').forEach(el => {
      let score = el.getElementsByTagName('p').length;
      if (score > max) { max = score; best = el; }
    });
    return best ? best.cloneNode(true) : document.body.cloneNode(true);
  }

  const contentNode = getBody();

  // 4. Aggressive Junk Removal
  const junk =[
    'script', 'style', 'nav', 'aside', 'footer', 'header', 'form', 'iframe', 
    '.ad', '.adsbygoogle', '.social', '.share', '[role="complementary"]', 
    '[role="navigation"]', '#comments', '.comments'
  ];
  
  junk.forEach(sel => {
    try { contentNode.querySelectorAll(sel).forEach(e => e.remove()); } catch (e) {}
  });

  // 5. CSP-Proof Inline Styling Engine
  // We strip all original classes/styles and apply consistent typography via inline CSS text
  contentNode.querySelectorAll('*').forEach(el => {
    const tag = el.tagName.toLowerCase();
    let css = 'box-sizing:border-box;';
    
    if (tag === 'p') css += 'margin-bottom:1.6em;line-height:1.7;';
    else if (tag === 'img' || tag === 'video' || tag === 'picture') css += 'max-width:100%;height:auto;border-radius:8px;margin:2em auto;display:block;';
    else if (tag === 'a') css += 'color:var(--r-link);text-decoration:none;font-weight:500;';
    else if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') css += 'margin-top:2em;margin-bottom:1em;line-height:1.3;font-weight:700;color:var(--r-fg);';
    else if (tag === 'blockquote') css += 'border-left:4px solid var(--r-border);margin:2em 0;padding-left:1.2em;color:var(--r-meta);font-style:italic;';
    else if (tag === 'pre') css += 'background:var(--r-code-bg);padding:1.2em;border-radius:8px;overflow-x:auto;font-family:ui-monospace,monospace;font-size:0.9em;margin-bottom:1.6em;border:1px solid var(--r-border);';
    else if (tag === 'code') css += 'font-family:ui-monospace,monospace;background:var(--r-code-bg);padding:0.2em 0.4em;border-radius:4px;font-size:0.85em;';
    else if (tag === 'ul' || tag === 'ol') css += 'margin-bottom:1.6em;padding-left:2em;';
    else if (tag === 'li') css += 'margin-bottom:0.6em;line-height:1.7;';
    else if (tag === 'figure') css += 'margin:2em 0;';
    else if (tag === 'figcaption') css += 'font-size:0.85em;color:var(--r-meta);text-align:center;margin-top:0.8em;';
    
    el.removeAttribute('class');
    el.removeAttribute('id');
    el.removeAttribute('style'); 
    el.style.cssText = css;
  });

  // 6. Build the UI
  const overlay = document.createElement('div');
  overlay.id = 'edge-reader-overlay';
  
  // Base CSS Variables (Dark Mode Default)
  function setColors(dark) {
    overlay.style.setProperty('--r-bg', dark ? '#0d1117' : '#fafafa');
    overlay.style.setProperty('--r-fg', dark ? '#c9d1d9' : '#374151');
    overlay.style.setProperty('--r-link', dark ? '#58a6ff' : '#2563eb');
    overlay.style.setProperty('--r-border', dark ? '#30363d' : '#e5e7eb');
    overlay.style.setProperty('--r-meta', dark ? '#8b949e' : '#6b7280');
    overlay.style.setProperty('--r-code-bg', dark ? '#161b22' : '#f3f4f6');
    overlay.style.setProperty('--r-btn-bg', dark ? '#21262d' : '#ffffff');
  }

  overlay.style.cssText = `
    position:fixed;inset:0;z-index:2147483647;
    background:var(--r-bg);color:var(--r-fg);
    overflow-y:auto;font-family:system-ui,-apple-system,sans-serif;
    transition:background 0.2s,color 0.2s;
  `;
  
  let isDark = true;
  let fSize = 19;
  setColors(isDark);

  // Controls UI (Top Right)
  const controls = document.createElement('div');
  controls.style.cssText = 'position:fixed;top:24px;right:24px;display:flex;gap:8px;z-index:10;';

  function createBtn(txt, fn) {
    const b = document.createElement('button');
    b.textContent = txt;
    b.style.cssText = `
      background:var(--r-btn-bg);color:var(--r-fg);border:1px solid var(--r-border);
      border-radius:6px;padding:6px 14px;font-size:15px;font-weight:600;
      cursor:pointer;font-family:system-ui;transition:all 0.1s;
    `;
    b.onclick = fn;
    return b;
  }

  controls.appendChild(createBtn('A-', () => { fSize = Math.max(14, fSize - 2); updateSize(); }));
  controls.appendChild(createBtn('A+', () => { fSize = Math.min(32, fSize + 2); updateSize(); }));
  controls.appendChild(createBtn('🌓', () => { isDark = !isDark; setColors(isDark); }));
  controls.appendChild(createBtn('×', closeReader));

  // Article Container
  const article = document.createElement('div');
  article.style.cssText = 'max-width:720px;margin:0 auto;padding:80px 24px 120px;';

  // Header Info
  const head = document.createElement('div');
  head.style.cssText = 'margin-bottom:48px;border-bottom:1px solid var(--r-border);padding-bottom:32px;';
  head.innerHTML = `
    <h1 style="font-size:2.4em;font-weight:800;line-height:1.2;margin:0 0 20px;color:var(--r-fg);letter-spacing:-0.02em;">${title}</h1>
    <div style="font-size:0.95em;color:var(--r-meta);display:flex;gap:16px;flex-wrap:wrap;font-weight:500;">
      ${author ? `<span><span style="opacity:0.7">By</span> ${author}</span>` : ''}
      ${site ? `<span><span style="opacity:0.7">On</span> ${site}</span>` : ''}
      ${date ? `<span>${date}</span>` : ''}
    </div>
  `;

  // Content Wrapper
  const content = document.createElement('div');
  content.appendChild(contentNode);

  function updateSize() {
    content.style.cssText = `font-size:${fSize}px;color:var(--r-fg);`;
  }
  updateSize();

  article.appendChild(head);
  article.appendChild(content);
  overlay.appendChild(controls);
  overlay.appendChild(article);

  // Lock background scroll and append
  document.body.style.overflow = 'hidden';
  document.body.appendChild(overlay);

  // Handlers
  function closeReader() {
    document.body.style.overflow = '';
    overlay.remove();
    document.removeEventListener('keydown', handleKey);
  }

  function handleKey(e) {
    if (e.key === 'Escape') closeReader();
  }
  document.addEventListener('keydown', handleKey);

})();