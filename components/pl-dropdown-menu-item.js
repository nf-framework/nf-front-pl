import { PlElement, html, css } from "polylib";
import '@plcmp/pl-icon';

class PlDropdownMenuItem extends PlElement {
    static properties = {
        label: {
            type: String
        },
        disabled: {
            type: Boolean,
            reflectToAttribute: true
        }
    };

    static css = css`
        :host{
            box-sizing: border-box;
            padding: 0 var(--space-sm);
            min-height: var(--base-size-md);
            width: 100%;
            font: var(--text-font);
            color: var(--text-color);
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        :host(:hover){
            background-color: var(--grey-lightest)
        }
        :host([disabled]){
            color: var(--grey-base);
            pointer-events: none;
        }
        :host([hidden]){
            display: none;
        }
    `;

    static template = html`
        [[label]]
        <slot></slot>
    `;

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', (e) => {
            this.parentElement.close();
        })
    }
}

customElements.define('pl-dropdown-menu-item', PlDropdownMenuItem);
