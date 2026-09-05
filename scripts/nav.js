/**
 * Shared hamburger menu for the app header. Call mountMenu(el, current)
 * where `current` is 'hub' | 'recipes' | 'planner' | 'grocery' | 'staples' to mark the active page.
 */
import { logout } from './auth.js';

const HAMBURGER = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>`;

const LINKS = [
  { href: 'hub.html', label: '🏠  Hub', key: 'hub' },
  { href: 'week.html', label: '🗓️  Week', key: 'week' },
  { href: 'recipes.html', label: '📖  Recipes', key: 'recipes' },
  { href: 'planner.html', label: '📅  Meal planner', key: 'planner' },
  { href: 'todo.html', label: '📝  To-do', key: 'todo' },
  { href: 'grocery.html', label: '🛒  Grocery', key: 'grocery' },
  { href: 'staples.html', label: '🧺  Staples', key: 'staples' },
  { href: 'sync.html', label: '🔄  Sync', key: 'sync' },
  { href: 'settings.html', label: '⚙️  Settings', key: 'settings' },
];

export function mountMenu(el, current) {
  el.innerHTML = `
    <details class="navmenu">
      <summary class="navmenu-btn" aria-label="Menu">${HAMBURGER}</summary>
      <ul class="navmenu-list">
        ${LINKS.map(l => `<li><a href="${l.href}"${l.key === current ? ' aria-current="page"' : ''}>${l.label}</a></li>`).join('')}
        <li><button type="button" class="navmenu-logout">🚪  Sign out</button></li>
      </ul>
    </details>`;
  const dd = el.querySelector('.navmenu');
  el.querySelector('.navmenu-logout').addEventListener('click', () => { dd.open = false; logout(); });
  el.querySelectorAll('.navmenu-list a').forEach(a => a.addEventListener('click', () => { dd.open = false; }));
  document.addEventListener('click', (e) => { if (!dd.contains(e.target)) dd.open = false; });
}
