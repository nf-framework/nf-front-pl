import { PlElement, html, css } from "polylib";
import { addOverlay, removeOverlay } from "@plcmp/utils";
import '@plcmp/pl-icon-button';

class PlModalForm extends PlElement {
    static get properties() {
        return {
            opened: { type: Boolean, reflectToAttribute: true },
            position: { type: String, value: 'right', reflectToAttribute: true },
            size: { type: String, value: 'large', reflectToAttribute: true },
            formTitle: { type: String, value: '' }
        }
    }

    static get css() {
        return css`
            :host {
                background: rgba(0, 0, 0, 0.8);
                height: 100%;
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                width: 100%;
            }
            :host .modal{
                height: 100%;
                position: fixed;
                background: var(--background-color);
                will-change: contents;
                opacity: 0;
                transform: translateX(30%);
                box-sizing: border-box;
                visibility: hidden;
                display: flex;
                inset-block-start: 0px;
                inset-inline-end: 0;
                flex-direction: column;
                will-change: transform, opacity;
                transition: all ease 200ms;
                box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            }

            .content-header {
                padding: 16px;
                display: flex;
                height: 48px;
                box-sizing: border-box;
                gap: 8px;
                align-items: center;
                flex-shrink: 0;
                justify-content: space-between;
            }

            #form-label {
                font: var(--font-h2);
                color: var(--text-color);
            }

            :host([size=small]) .modal{
                width: 320px;
            }

            :host([size=medium]) .modal{
                width: 560px;
            }

            :host([size=large]) .modal{
                width: 920px;
            }

            :host([opened]) .modal{
                opacity: 1;
                transform: translateX(0);
                visibility: visible;
            }

            :host ::slotted(*) {
                padding: 0 16px 16px 16px;
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: auto;
            }
        `
    }

    static get template() {
        return html`
            <div class="modal">
                <div class="content-header">
                    <span id="form-label">[[formTitle]]</span>
                    <pl-icon-button on-click="[[close]]" variant="link" iconset="pl-default" size="16" icon="close"></pl-icon-button>
                </div>
                <slot></slot>
            </div>
		`;
    }

    constructor() {
        super();
        this._close = e => {
            let path = e.composedPath();
            if (path.includes(this) && !path.includes(this.firstChild)) {
                e.preventDefault();
                this.close();
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('close-form', (event) => {
            event.stopPropagation();
            this.opened = false;
            setTimeout(() => {
                removeEventListener('click', this._close, { capture: true });
                removeOverlay(this);
                this.parentNode.removeChild(this);
            }, 200);
        });

        addEventListener('click', this._close, { capture: true })
    }

    open() {
        this.opened = true;
        addOverlay(this);
        this.formTitle = this.firstChild.formTitle;
    }

    async close(result) {
        await this.firstChild?.close(result);
    }

    /**
     * Функция **_compose**
     *
     * Используется для подстановки значений указанным аргументам.
     * @example ```js args: _compose('ready;privs;paz;...',initReady,privs,flt.paz,@client)```
     * @param {string} str - список аргументов (перечисляются через `;`)
     * @param {Array} args - список значений для аргументов (перечисляются через `,`)
     * @return {Object} - сформированный объект со значениями для соответствующих свойств
     * @private
     */
    _compose(str, ...args) {
        let result = {};
        let desc = str.split(';');
        desc.forEach((name, index) => {
            if (name === '...') {
                Object.assign(result, args[index]);
                return;
            }
            let path = name.split('.');
            let i;
            let obj = result;
            for (i = 0; i < path.length - 1; i++) {
                if (!obj[path[i]]) obj[path[i]] = {};
                obj = obj[path[i]];
            }
            obj[path[i]] = args[index];
        });
        return result;
    }
}

customElements.define('pl-modal-form', PlModalForm);
