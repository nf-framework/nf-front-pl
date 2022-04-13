import { PlElement, html, css } from "polylib";

class PlTab extends PlElement {
	static get properties() {
		return {
			header: { type: String },
			active: { type: Boolean, reflectToAttribute: true },
			hidden: { type: Boolean, reflectToAttribute: true }
		}
	}

	static get template() {
		return html`
	      <slot></slot>
      	`;
	}

	static get css() {
		return css`
            :host([hidden]) {
                display: none;
            }
        `;
	}
}

customElements.define('pl-tab', PlTab);