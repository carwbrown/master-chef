/**
 * Recipe Card Web Component
 * Displays a recipe preview card
 */

class RecipeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._recipe = null;
  }

  set recipe(data) {
    this._recipe = data;
    this.render();
  }

  connectedCallback() {
    if (this._recipe) this.render();
  }

  render() {
    const r = this._recipe || {};

    const ingredientCount = Array.isArray(r.ingredients) ? r.ingredients.length : 0;
    const tags = r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .card {
          background: #faf8f5;
          border: 1px solid #e8e4df;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .content {
          padding: 1.5rem;
        }

        .title {
          font-family: 'Crimson Text', Georgia, serif;
          color: #2c1810;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          line-height: 1.3;
        }

        .meta {
          color: #5c4a3d;
          font-size: 0.875rem;
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: rgba(139, 115, 85, 0.1);
          color: #8b7355;
          padding: 0.25rem 0.75rem;
          border-radius: 100px;
          font-size: 0.75rem;
        }

        .source {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e8e4df;
          font-size: 0.75rem;
          color: #8b7355;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>

      <div class="card" onclick="window.location.href='/recipe-view.html?id=${r.id}'">
        <div class="content">
          <h3 class="title">${r.title || 'Untitled Recipe'}</h3>
          <div class="meta">
            ${r.prep_time ? `<span class="meta-item">⏱️ Prep: ${r.prep_time}</span>` : ''}
            ${r.cook_time ? `<span class="meta-item">🍳 Cook: ${r.cook_time}</span>` : ''}
            ${ingredientCount ? `<span class="meta-item">📝 ${ingredientCount} ingredients</span>` : ''}
          </div>
          ${tags.length ? `
            <div class="tags">
              ${tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
          ${r.source_url ? `<div class="source">From: ${new URL(r.source_url).hostname}</div>` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('recipe-card', RecipeCard);

export { RecipeCard };
