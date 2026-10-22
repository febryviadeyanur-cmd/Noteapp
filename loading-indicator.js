// Pakai counter supaya beberapa request bersamaan tidak saling mematikan spinner
class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this._pending = 0;
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: none;
          place-items: center;
          background: rgba(238, 241, 247, 0.7);
        }
        :host([active]) { display: grid; }
        .spinner {
          width: 52px;
          height: 52px;
          border: 5px solid rgba(28, 37, 65, 0.2);
          border-top-color: var(--ink, #1c2541);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
      <div class="spinner" role="status" aria-label="Memuat"></div>
    `;
  }

  show() {
    this._pending += 1;
    this.setAttribute('active', '');
  }

  hide() {
    this._pending = Math.max(0, this._pending - 1);
    if (this._pending === 0) this.removeAttribute('active');
  }
}

customElements.define('loading-indicator', LoadingIndicator);
