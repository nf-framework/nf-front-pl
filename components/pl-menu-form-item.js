import { PlElement, html, css } from "polylib";

class PlMenuFormItem extends PlElement {
    static properties = {
        label: {
            type: String
        },
        name: {
            type: String,
            reflectToAttribute: true
        },
        hidden: {
            type: Boolean,
            reflectToAttribute: true,
            value: false
        },
        menuHidden: {
            type: Boolean,
            observer: 'propertyChanged'
        },
        selected: {
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
        }
    };

    static css = css`
        :host{
            width: 100%;
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

    static template = html`
        <slot></slot>
    `;

    propertyChanged() {
        this.dispatchEvent(new CustomEvent('pl-menu-form-item-change', {
            bubbles: true
        }));
    }
}

customElements.define('pl-menu-form-item', PlMenuFormItem);