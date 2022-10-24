import { PlElement, css } from "polylib";
import {loadTemplateComponents} from "../lib/FormUtils.js";

export class PlForm extends PlElement {
    static properties = {
        formTitle: { type: String },
        formSubtitle: { type: String },
        hidden: { type: Boolean, reflectToAttribute: true },
        urlParams: { type: Array, value: [] }
    }

    constructor() {
        super();
        this.ready = loadTemplateComponents(this.constructor.template);
    }
    connectedCallback() {
        super.connectedCallback();
        // lookup for formManager if it's not assigned, usually for sub forms
        // search the closest element with _formManager
        if (!this._formManager) {
            let node = this;
            while (node) {
                if (node._formManager) {
                    this._formManager = node._formManager;
                    break;
                } else
                    node = node.parentNode ?? node.host;
            }
        }
        this.onConnect?.();
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

    open(name, params, opts) {
        return this._formManager?.open(name, { ...opts, params });
    }

    openModal(name, params, options) {
        return this.open(name, params, { ...options, modal: true });
    }

    async close(result) {
        if (result instanceof Event) {
            result = undefined;
        }
        if (this.onClose instanceof Function) {
            if (await this.onClose(result) === false) return false;
        }
        this._closeCallback?.(result);
        this.dispatchEvent(new CustomEvent('close-form', { bubbles: true, composed: true }));
        this.parentNode.removeChild(this);

        return true;
    }

    async showDialog(header, content, buttons = []) {
        const dialog = document.createElement('pl-dialog');
        customLoader('pl-dialog');
        dialog.header = header;
        dialog.content = content;
        dialog.buttons = buttons;
        if(this._formManager) {
            this._formManager.root.appendChild(dialog);
        } else {
            document.body.appendChild(dialog);
        }
        return new Promise((resolve) => {
            dialog.addEventListener('pl-dialog-closed', (event) => {
                resolve(event.detail.action);
            });
        });
    }

    async showAlert(content, options) {
        options = Object.assign({
            header: 'Внимание',
            buttons: [{
                label: 'Ок',
                variant: 'primary',
                action: true
            }]
        }, options);

        return this.showDialog(options.header, content, options.buttons)
    }

    async showConfirm(content, options) {
        options = Object.assign({
            header: 'Подтвердите действие',
            buttons: [{
                label: 'Да',
                variant: 'primary',
                action: true,
            },
            {
                label: 'Отмена',
                variant: 'secondary',
                action: false
            }]
        }, options);

        return this.showDialog(options.header, content, options.buttons)
    }

    notify(message,  options) {
        options = Object.assign({
            type: 'success',
            header: 'Успех',
            icon: '',
            buttons: []
        }, options);

        document.dispatchEvent(new CustomEvent('toast', {
            bubbles: true,
            composed: true,
            detail: {
                message: message,
                options: options
            }
        }));
    }
}