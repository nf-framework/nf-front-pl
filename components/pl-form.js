import { PlElement } from "polylib";

export class PlForm extends PlElement {
    __awaits = [];
    static get properties() {
        return {
            formTitle: { type: String },
            formSubtitle: { type: String }
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
        this.ready = Promise.all(this.__awaits).then(() => true)
    }
    connectedCallback() {
        super.connectedCallback()
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

    open(name, params) {
        return new Promise((resolve, reject) => {
            this.dispatchEvent(new CustomEvent('open-form', {
                detail: {
                    formName: name,
                    params: params,
                    options: {
                        _formPromise: resolve
                    }
                },
                bubbles: true,
                composed: true
            }));
        });
    }

    openModal(name, params, options) {
        return new Promise((resolve, reject) => {
            this.dispatchEvent(new CustomEvent('open-modal-form', {
                detail: {
                    formName: name,
                    params: params,
                    options: {
                        _formPromise: resolve,
                        size: options?.size ?? 'large'
                    }
                },
                bubbles: true,
                composed: true
            }));
        });
    }

    async close(result) {
        if(result instanceof Event){
            result = undefined;
        }
        let canClose = true;
        if (this.onClose instanceof Function) {
            canClose = this.onClose(result);

            if (canClose instanceof Promise) {
                canClose = await canClose;
            }
        }

        if (canClose) {
            this._formPromise && this._formPromise(result);
            this.dispatchEvent(new CustomEvent('close-form', { bubbles: true, composed: true }));
            this.parentElement.removeChild(this);
        }

        return canClose;
    }
}