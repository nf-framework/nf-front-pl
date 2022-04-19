import { PlElement } from "polylib";

export class PlForm extends PlElement {
    __awaits = [];
    static get properties() {
        return {
            formTitle: { type: String },
            formSubtitle: { type: String },
            hidden: { type: Boolean, reflectToAttribute: true }
        }
    }
    constructor() {
        super();
        this.constructor.template.usedCE.forEach(c => {
            let t = customLoader?.(c);
            this.__awaits.push(t);
        });
        this.constructor.template.usedCEL.forEach(c => {
            let t = customLoader?.(c);
        });
        let watchDog = setTimeout(() => {
            console.log(this.constructor.template.usedCE,this.__awaits )
            throw 'Timeout loading components'
        },10000 )
        this.ready = Promise.all(this.__awaits).then(() => { clearTimeout(watchDog); return true; });

    }
    connectedCallback() {
        super.connectedCallback()
        this.onConnect?.();

        // Повышаем z-index всех родительских элементов до формы при показе дропдауна,
        // необходимо для правильного отображения комбобоксов в строках гридов и подобных элементах
        this.addEventListener('pl-dropdown-show', (e) => {
            const path = e.composedPath();
            const currentZIndex = path[0].style.zIndex;
            path.find((p) => {
                if (p instanceof HTMLElement) {
                    p._oldZIndex = p.style.zIndex;
                    p.style.zIndex = currentZIndex;
                }
                return p === this;
            });
            e.stopImmediatePropagation();
        });

        // Откатываем z-index всех родительских элементов до формы при скрытии дропдауна
        this.addEventListener('pl-dropdown-hide', (e) => {
            const path = e.composedPath();
            path.find((p) => {
                if (p instanceof HTMLElement) {
                    p.style.zIndex = p._oldZIndex;
                    p._oldZIndex = undefined;
                    delete p._oldZIndex;
                }
                return p === this;
            });
            e.stopImmediatePropagation();
        });
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
        options = Object.assign({
            modal: true
        }, options);
        
        return this.open(name, params, options);
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
        this.root.appendChild(dialog);

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

    notify(message, options) {
        options = Object.assign({
            type: 'success',
        }, options);

        document.dispatchEvent(new CustomEvent(options.type, {
            bubbles: true,
            composed: true,
            detail: {
                message: message
            }
        }));
    } 
}