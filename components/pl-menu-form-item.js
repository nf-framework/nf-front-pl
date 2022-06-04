import { PlElement, html, css } from "polylib";

class PlMenuFormItem extends PlElement {
    static get properties() {
        return {
            label: {
                type: String
            },
            name: {
                type: String,
                reflectToAttribute: true
            },
            hidden: {
                type: Boolean,
                reflectToAttribute: true
            },
            active: {
                type: Boolean,
                reflectToAttribute: true
            },
            invalid: {
                type: Boolean,
                observer: 'propertyChanged'
            },
            fit: {
                type: Boolean,
                reflectToAttribute: true,
                observer: 'propertyChanged'
            }
        };
    }

    static get template() {
        return html`
            <slot></slot>
      	`;
    }

    static get css() {
        return css`
            :host{
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                flex-shrink: 0;
            }
            :host([hidden]){
                display: none;
            }
            :host([fit]) {
                height: 100%;
            }
        `;
    }

    propertyChanged() {
        this.dispatchEvent(new CustomEvent('pl-menu-form-item-change', {
            bubbles: true
        }));
    }
}

customElements.define('pl-menu-form-item', PlMenuFormItem);