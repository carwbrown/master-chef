/**
 * Login Form Web Component for Master Chef
 * Handles both login and registration with username support
 */

import { login, register } from '../scripts/auth.js';

class LoginForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._mode = 'login';
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  toggleMode() {
    this._mode = this._mode === 'login' ? 'register' : 'login';
    this.render();
    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = this.shadowRoot.querySelector('form');
    const toggle = this.shadowRoot.querySelector('.toggle-link');

    form?.addEventListener('submit', (e) => this.handleSubmit(e));
    toggle?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMode();
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorDiv = this.shadowRoot.querySelector('.error');

    submitBtn.disabled = true;
    submitBtn.textContent = this._mode === 'login' ? 'Signing in...' : 'Creating account...';
    errorDiv.textContent = '';

    let result;
    if (this._mode === 'login') {
      const identity = form.identity.value;
      const password = form.password.value;
      result = await login(identity, password);
    } else {
      const email = form.email.value;
      const username = form.username.value;
      const password = form.password.value;
      const passwordConfirm = form.passwordConfirm.value;

      if (password !== passwordConfirm) {
        errorDiv.textContent = 'Passwords do not match';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        return;
      }
      result = await register(email, username, password, passwordConfirm);
    }

    if (result.success) {
      window.location.href = '/recipes.html';
    } else {
      errorDiv.textContent = result.error;
      submitBtn.disabled = false;
      submitBtn.textContent = this._mode === 'login' ? 'Sign In' : 'Create Account';
    }
  }

  render() {
    const isLogin = this._mode === 'login';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 400px;
          margin: 0 auto;
        }

        .form-container {
          background: #faf8f5;
          padding: 2.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border: 1px solid #e8e4df;
        }

        h2 {
          color: #2c1810;
          margin: 0 0 1.5rem 0;
          text-align: center;
          font-family: 'Crimson Text', Georgia, serif;
          font-size: 1.75rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        label {
          display: block;
          color: #5c4a3d;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d4cfc8;
          border-radius: 4px;
          background: #fff;
          color: #2c1810;
          font-size: 1rem;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: #8b7355;
        }

        button[type="submit"] {
          width: 100%;
          padding: 0.875rem;
          background: #2c1810;
          border: none;
          color: #faf8f5;
          font-size: 1rem;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s ease;
          margin-top: 0.5rem;
        }

        button[type="submit"]:hover:not(:disabled) {
          background: #3d2518;
        }

        button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          color: #c0392b;
          font-size: 0.875rem;
          margin-top: 1rem;
          text-align: center;
          min-height: 1.25rem;
        }

        .toggle-mode {
          text-align: center;
          margin-top: 1.5rem;
          color: #5c4a3d;
          font-size: 0.875rem;
        }

        .toggle-link {
          color: #8b7355;
          cursor: pointer;
          text-decoration: underline;
        }

        .toggle-link:hover {
          color: #2c1810;
        }
      </style>

      <div class="form-container">
        <h2>${isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <form>
          ${isLogin ? `
          <div class="form-group">
            <label for="identity">Email or Username</label>
            <input type="text" id="identity" name="identity" required>
          </div>
          ` : `
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required minlength="3">
          </div>
          `}
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required minlength="8">
          </div>
          ${!isLogin ? `
          <div class="form-group">
            <label for="passwordConfirm">Confirm Password</label>
            <input type="password" id="passwordConfirm" name="passwordConfirm" required minlength="8">
          </div>
          ` : ''}
          <button type="submit">${isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>
        <div class="error"></div>
        <div class="toggle-mode">
          ${isLogin
            ? "Don't have an account? <a class=\"toggle-link\">Sign up</a>"
            : 'Already have an account? <a class="toggle-link">Sign in</a>'}
        </div>
      </div>
    `;
  }
}

customElements.define('login-form', LoginForm);

export { LoginForm };
