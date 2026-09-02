/**
 * Login Form Web Component — email + password only (no public signup).
 */
import { login } from '../scripts/auth.js';

class LoginForm extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this.render(); this.attach(); }

  attach() {
    this.shadowRoot.querySelector('form')
      ?.addEventListener('submit', (e) => this.handleSubmit(e));
    const pw = this.shadowRoot.querySelector('#password');
    const tog = this.shadowRoot.querySelector('.pw-toggle');
    tog?.addEventListener('click', () => {
      const showing = pw.type === 'password';
      pw.type = showing ? 'text' : 'password';
      tog.textContent = showing ? 'Hide' : 'Show';
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const err = this.shadowRoot.querySelector('.error');
    btn.disabled = true; btn.textContent = 'Signing in…'; err.textContent = '';

    const result = await login(form.identity.value, form.password.value);
    if (result.success) {
      window.location.href = '/hub.html';
    } else {
      err.textContent = result.error || 'Sign in failed';
      btn.disabled = false; btn.textContent = 'Sign In';
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; max-width: 380px; margin: 0 auto; }
        .card {
          background: var(--surface, #fff); padding: 2.25rem;
          border-radius: var(--radius, 14px); box-shadow: var(--shadow-lg, 0 10px 30px rgba(30,60,50,.14));
          border: 1px solid var(--border, #d6e3dd);
        }
        h2 { font-family: var(--font-heading, sans-serif); color: var(--text, #22332c);
             margin: 0 0 1.5rem; text-align: center; }
        .group { margin-bottom: 1.1rem; }
        label { display: block; color: var(--text-muted, #5f7169); margin-bottom: .4rem;
                font-size: .85rem; font-weight: 600; }
        input { width: 100%; padding: .7rem .9rem; border: 1px solid var(--border, #d6e3dd);
                border-radius: var(--radius-sm, 8px); font: inherit; box-sizing: border-box; }
        input:focus { outline: none; border-color: var(--blue, #4a90b8);
                      box-shadow: 0 0 0 3px var(--blue-soft, #dbeaf2); }
        .pw-wrap { position: relative; }
        .pw-wrap input { padding-right: 3.6rem; }
        .pw-toggle { position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
                     border: none; background: none; cursor: pointer; font: inherit; font-size: .8rem;
                     font-weight: 600; color: var(--blue-dark, #37718f); padding: 4px; }
        button { width: 100%; padding: .85rem; margin-top: .4rem; border: none; cursor: pointer;
                 border-radius: var(--radius, 14px); font: inherit; font-weight: 700; color: #fff;
                 background: var(--green, #4f9d69); transition: background .15s ease; }
        button:hover:not(:disabled) { background: var(--green-dark, #3d7a52); }
        button:disabled { opacity: .6; cursor: not-allowed; }
        .error { color: var(--danger, #c0563f); font-size: .85rem; margin-top: 1rem;
                 text-align: center; min-height: 1.25rem; }
      </style>
      <div class="card">
        <h2>Welcome home</h2>
        <form>
          <div class="group">
            <label for="identity">Email</label>
            <input type="email" id="identity" name="identity" required autocomplete="username">
          </div>
          <div class="group">
            <label for="password">Password</label>
            <div class="pw-wrap">
              <input type="password" id="password" name="password" required autocomplete="current-password">
              <button type="button" class="pw-toggle" aria-label="Show password">Show</button>
            </div>
          </div>
          <button type="submit">Sign In</button>
        </form>
        <div class="error"></div>
      </div>
    `;
  }
}

customElements.define('login-form', LoginForm);
export { LoginForm };
