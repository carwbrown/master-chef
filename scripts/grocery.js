/**
 * Shared logic for the two grocery pages. Each page renders a single list
 * ("staples" | "adhoc") from the `grocery_items` collection and wires
 * add / toggle / delete. Page-specific controls (select-all, clear purchased,
 * counts) stay on the page and drive the returned handle.
 */
import { pb } from './auth.js';
import { escapeHTML } from './utils.js';

export function itemHTML(it) {
  const qty = it.qty ? `<span class="gqty">${escapeHTML(it.qty)}</span>` : '';
  return `<li class="gitem ${it.checked ? 'on' : ''}">
      <input type="checkbox" data-id="${it.id}" ${it.checked ? 'checked' : ''}>
      <span class="gname">${escapeHTML(it.name)}${qty}</span>
      <button class="gdel" data-id="${it.id}" title="Remove" aria-label="Remove">✕</button>
    </li>`;
}

/**
 * Wire a single grocery list.
 *   list        - "staples" | "adhoc"
 *   listEl      - <ul> to render into
 *   formEl      - <form> holding .gadd-name / .gadd-qty inputs
 *   emptyText   - shown when the list is empty
 *   sinkChecked - true => checked items sort to the bottom (trip list)
 *   onRender    - callback(items) after each render, for counts / buttons
 * Returns { items, refresh, render, setAll, removeChecked }.
 */
export function initGroceryList({ list, listEl, formEl, emptyText, sinkChecked = false, onRender }) {
  let items = [];

  async function load() {
    try {
      items = await pb.collection('grocery_items').getFullList({
        sort: 'sort',
        filter: pb.filter('list = {:list}', { list }),
      });
    } catch { items = []; }
  }

  // Stable order: keep saved order, but sink checked items to the bottom.
  function ordered() {
    if (!sinkChecked) return items;
    return items
      .map((it, i) => [it, i])
      .sort((a, b) => (Number(a[0].checked) - Number(b[0].checked)) || (a[1] - b[1]))
      .map(([it]) => it);
  }

  function render() {
    listEl.innerHTML = items.length
      ? ordered().map(itemHTML).join('')
      : `<li class="gempty">${emptyText}</li>`;
    onRender?.(items);
  }

  async function refresh() { await load(); render(); }

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameEl = formEl.querySelector('.gadd-name');
    const qtyEl = formEl.querySelector('.gadd-qty');
    const name = nameEl.value.trim();
    if (!name) return;
    const btn = formEl.querySelector('button');
    btn.disabled = true;
    try {
      const rec = await pb.collection('grocery_items').create({
        list, name, qty: qtyEl.value.trim(), checked: false, sort: Date.now() % 100000000,
      });
      items.push(rec);
      render();
      nameEl.value = ''; qtyEl.value = ''; nameEl.focus();
    } catch (err) { alert('Could not add: ' + (err?.message || err)); }
    finally { btn.disabled = false; }
  });

  // Delegated on the <ul> so it survives re-renders.
  listEl.addEventListener('change', async (e) => {
    const cb = e.target.closest('input[type="checkbox"][data-id]');
    if (!cb) return;
    const it = items.find(i => i.id === cb.dataset.id);
    if (!it) return;
    it.checked = cb.checked;
    render(); // re-render so sinkChecked re-orders and counts update
    try { await pb.collection('grocery_items').update(it.id, { checked: cb.checked }); }
    catch (err) { alert('Could not update: ' + (err?.message || err)); refresh(); }
  });

  listEl.addEventListener('click', async (e) => {
    const del = e.target.closest('.gdel');
    if (!del) return;
    try {
      await pb.collection('grocery_items').delete(del.dataset.id);
      items = items.filter(i => i.id !== del.dataset.id);
      render();
    } catch (err) { alert('Could not remove: ' + (err?.message || err)); }
  });

  return {
    items: () => items,
    refresh,
    render,
    async setAll(checked) {
      const changed = items.filter(i => i.checked !== checked);
      if (!changed.length) return;
      for (const it of changed) it.checked = checked;
      render();
      try { await Promise.all(changed.map(it => pb.collection('grocery_items').update(it.id, { checked }))); }
      catch (err) { alert('Could not update: ' + (err?.message || err)); refresh(); }
    },
    async removeChecked() {
      const done = items.filter(i => i.checked);
      if (!done.length) return;
      if (!confirm(`Clear ${done.length} purchased item${done.length > 1 ? 's' : ''}?`)) return;
      try {
        await Promise.all(done.map(it => pb.collection('grocery_items').delete(it.id)));
        items = items.filter(i => !i.checked);
        render();
      } catch (err) { alert('Could not clear: ' + (err?.message || err)); refresh(); }
    },
  };
}
