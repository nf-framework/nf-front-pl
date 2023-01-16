import { PlElement, html, css } from "polylib";
import { addOverlay, removeOverlay } from "@plcmp/utils";
import '@plcmp/pl-icon-button';

export class PlModalForm extends PlElement {
    static properties = {
        position: { type: String, value: 'right', reflectToAttribute: true },
        size: { type: String, value: 'large', reflectToAttribute: true },
        formTitle: { type: String, value: '' },
        ignoreOutsideClick: { type: Boolean, value: false }
    }

    static css = css`
        :host {
            background: rgba(36, 51, 49, 0.4);
            height: 100%;
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            z-index: 10000;
        }

        :host(.out) > .modal {
			animation: flyOut 0.3s ease-out;
		}

        :host .modal{
            display: flex;
            flex-direction: column;
            height: 100%;
            box-sizing: border-box;
            position: absolute;
            inset-block-start: 0;
            inset-inline-end: 0;
            background: var(--background-color);
            will-change: transform, opacity, visibility;
            visibility: hidden;
            opacity: 0;
        }

        :host(.in) > .modal {
            animation: flyIn 0.3s ease-out;
            visibility: visible;
            opacity: 1;
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

        :host ::slotted(*) {
            padding: 0 16px 16px 16px;
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: auto;
            box-sizing: border-box;
            position: relative;
        }

        @keyframes flyIn {
			from {
                transform: translateX(30%);
                opacity: 0;
                visibility: hidden;
            }
			to {
                transform: translateX(0);
                opacity: 1;
                visibility: visible;
			}
		}

		@keyframes flyOut {
			from {
                transform: translateX(0);
                opacity: 1;
                visibility: visible;
			}
			to {
                transform: translateX(30%);
                opacity: 0;
                visibility: hidden;
			}
		}
    `;

    static template = html`
        <div class="modal">
            <div id="header" class="content-header">
                <span id="form-label">[[formTitle]]</span>
                <pl-icon-button on-click="[[close]]" variant="link" iconset="pl-default" size="16" icon="close">
                </pl-icon-button>
            </div>
            <slot></slot>
        </div>
    `;

    constructor() {
        super();
        this._close = e => {
            if (this.ignoreOutsideClick) {
                return;
            }
            let path = e.composedPath();
            if (path.includes(this) && !path.includes(this.firstChild) && !path.includes(this.$.header)) {
                e.preventDefault();
                this.close();
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('close-form', (event) => {
            event.stopPropagation();
            this.classList.remove('in');
            this.classList.add('out');

            setTimeout(() => {
                removeEventListener('click', this._close);
                removeOverlay(this);
                this.parentNode.removeChild(this);
            }, 200);
        });

        // stop all click events to prevent actions under modal window
        this.addEventListener('click', e => {
            this._close(e);
        });
    }

    open() {
        this.formTitle = this.firstChild.formTitle;
        setTimeout(() => {
            addOverlay(this);
            this.classList.add('in');
            this.firstChild.addEventListener('formTitle-changed', () => {
                this.formTitle = this.firstChild.formTitle;
            });
        }, 200)
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
