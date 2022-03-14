import { PlElement, html, css } from "polylib";

class PlRouter extends PlElement {
    static get properties() {
        return {
            current: { type: Object, observer: 'currentObserver' },
            currentForm: { type: Object },
            forms: { type: Array, value: () => [] }
        }
    }

    static get css() {
        return css`
			:host{
                display: block;
                height: 100%;
                width: 100%;
                overflow: hidden;
                position: relative;
            }

            :host > ::slotted(.current){
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
                overflow: hidden;
                background: var(--white);
                padding: 0 16px 16px 16px;
                box-sizing: border-box;
            }

            :host > ::slotted(:not(slot):not(.current)) {
                display: none !important;
            }
        `;
    }

    static get template() {
        return html`
            <slot></slot>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        let hash = document.location.hash;
        if (hash) {
            this.processUrl(hash);
        } else {
            history.replaceState({}, null, '#');
            this.openForm(null);
        }

        onhashchange = (e) => {
            let hash = document.location.hash;
            this.processUrl(hash);
        }

        this.addEventListener('open-form', async (e) => {
            let { formName, params, options } = e.detail;
            this.openForm(formName, params, options)
        });

        customLoader('pl-modal-form');

        this.addEventListener('open-modal-form', async (e) => {
            let { formName, params, options } = e.detail;
            let { size } = options;
            await customLoader(`pl-form-${formName}`);
            const form = document.createElement(`pl-form-${formName}`);
            await form.ready;
            form._formPromise = options?._formPromise;
            params && Object.assign(form, params);

            const drawer = document.createElement('pl-modal-form');
            if (size) {
                drawer.size = size;
            }
            drawer.append(form);
            this.current.form.root.append(drawer);
            setTimeout(() => {
                drawer.open();
            }, 200);
        });

        this.addEventListener('close-form', this.closeForm);
    }

    processUrl(hash) {
        const path = hash.replace('#', '');
        if(path) {
            let [_match, name, args] = path.match(/^([\w\d\._\-]+)\??(.*)$/);
            const params = args ? Object.fromEntries(new URLSearchParams(args)) : undefined;
            this.openForm(name, params);
        } else {
            this.openForm(null);
        }
    }

    async openForm(formName, params, options) {
        let formId = formName ? `#${formName}` : '#';
        formName = formName || 'index';
        if (params) {
            formId = formId + '?' + new URLSearchParams(params).toString();
        }

        const frmIndex = this.forms.findIndex(x => x.formId == formId);
        if (frmIndex == -1) {
            try {
                await customLoader(`pl-form-${formName}`);
                const form = document.createElement(`pl-form-${formName}`);
                await form.ready;
                form._formPromise = options?._formPromise;
                params && Object.assign(form, params);

                this.append(form);

                const formInfo = {
                    formId: formId,
                    form: form
                };

                this.forms.push(formInfo);
                this.current = formInfo;
            }
            catch (err) {
                document.dispatchEvent(new CustomEvent('error', {detail: `Форма ${formName} не найдена`}));
            }
        } else if (this.forms.length > 0) {
            this.current = this.forms[frmIndex];
        }
    }

    currentObserver(formInfo) {
        window.plCurrentForm = formInfo;
        window.dispatchEvent(new CustomEvent('form-change', { detail: { form: this.current?.form } }));
        this.forms.forEach((el) => {
            el.form.classList.remove('current');
        });

        if (formInfo) {
            formInfo.form.classList.add('current');
            this.currentForm = formInfo.form;

            if (history.state?.formId === formInfo.formId) {
                return;
            } else {
                history.pushState({
                    formId: formInfo.formId
                }, null, formInfo.formId);
            }
        } else {
            this.openForm(null);
        }
    }

    closeForm(e) {
        const frmIdx = this.forms.findIndex(x => x.form == e.target);
        this.splice('forms', frmIdx, 1);
        if (this.forms.length > 0) {
            const lastFormInfo = this.forms[this.forms.length - 1];
            this.current = lastFormInfo;
        } else {
            history.pushState({}, null, '#');
            this.openForm(null);
        }
    }
}

customElements.define('pl-router', PlRouter);
