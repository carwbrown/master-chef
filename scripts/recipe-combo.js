/**
 * Searchable recipe picker. Enhances a container that holds:
 *   <div class="combo"><input class="combo-input"><input type="hidden" name="recipe"><div class="combo-list"></div></div>
 * Multi-word "fuzzy" match across title, author, website, and tags.
 */
import { escapeHTML } from './utils.js';

const domain = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const label = (r) => r.author || domain(r.source_url);

export function initRecipeCombo(root, recipes) {
  const input = root.querySelector('.combo-input');
  const hidden = root.querySelector('input[type="hidden"]');
  const list = root.querySelector('.combo-list');
  const byId = Object.fromEntries(recipes.map(r => [r.id, r]));

  function render(q) {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = recipes.filter(r => {
      if (!words.length) return true;
      const hay = `${r.title} ${r.author || ''} ${domain(r.source_url)} ${(Array.isArray(r.tags) ? r.tags : []).join(' ')}`.toLowerCase();
      return words.every(w => hay.includes(w));
    }).slice(0, 40);
    const rows = matches.map(r => {
      const src = label(r);
      const srcSpan = src ? `<span class="combo-src">${escapeHTML(src)}</span>` : '';
      return `<div class="combo-opt" data-id="${r.id}">${escapeHTML(r.title)}${srcSpan}</div>`;
    }).join('');
    list.innerHTML = `<div class="combo-opt" data-id="">— none —</div>` + rows;
  }

  const open = () => { render(input.value); list.hidden = false; };
  const close = () => { list.hidden = true; };

  input.addEventListener('focus', open);
  input.addEventListener('input', () => { hidden.value = ''; open(); });
  list.addEventListener('mousedown', (e) => {          // mousedown fires before input blur
    const opt = e.target.closest('.combo-opt');
    if (!opt) return;
    e.preventDefault();
    hidden.value = opt.dataset.id;
    input.value = opt.dataset.id ? (byId[opt.dataset.id]?.title || '') : '';
    close();
  });
  input.addEventListener('blur', () => setTimeout(close, 150));

  return {
    set(id) { hidden.value = id || ''; input.value = (id && byId[id]) ? byId[id].title : ''; },
  };
}
