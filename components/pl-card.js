import { PlElement, html, css } from "polylib";

class PlCard extends PlElement {
    static get properties() {
        return {
            header: { type: String },
            fit: {
                type: Boolean,
                reflectToAttribute: true
            },
            hidden: { type: Boolean, reflectToAttribute: true }
        }
    }

    static get css() {
        return css`
            :host{
                display: flex;
                flex-direction: column;
                width: fit-content;
                height: fit-content;
                box-sizing: border-box;
                gap: 8px;
            }

            :host([hidden]) {
                display: none;
            }

            :host([fit]) {
                height: 100% !important;
                width: 100% !important;
            }

            .header {
                display: flex;
                flex-direction: row;
                align-items: center;
                box-sizing: border-box;
                justify-content: space-between;
                min-height: 32px;
            }

            .header-text-container {
                display: flex;
                flex-direction: row;
                align-items: center;
                box-sizing: border-box;
                justify-content: space-between;
                gap: 8px;
                overflow:hidden;
            }
            
            .header-text {
                font: var(--font-lg);
                color: var(--black-base);
                text-align: start;
                flex: 1 1 0%;
                font-weight: 500;
            }

            .content {
                height: 100%;
                width: 100%;
            }
        `
    }

    static get template() {
        return html`
            <div class="header">
                <div class="header-text-container">
                    <slot name="header-prefix"></slot>
                    <span class="header-text">[[header]]</span>
                    <slot name="header-suffix"></slot>
                </div>
                <slot name="tools"></slot>
            </div>
            <div class="content">
                <slot></slot>
            </div>
            <div class="footer">
                <slot name="footer"></slot>
            </div>
		`;
    }
}

customElements.define('pl-card', PlCard);
