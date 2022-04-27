import { PlElement, html, css } from "polylib";

class PlRouter extends PlElement {
    static get properties() {
        return {
            currentForm: { type: Object, observer: 'threadChange' },
            currentThread: { type: Object, observer: 'threadChange' },
            formManager: { type: Object },
            //TODO: make history
            disableHistory: { type: Boolean, value: true }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.history = (this.disableHistory ? history.replaceState : history.pushState).bind(history);
        let hash = document.location.hash;
        if (hash) {
            this.processUrl(hash);
        } else {
            history.replaceState({}, null, '#');
        }

        onhashchange = (e) => {
            let hash = document.location.hash;
            this.processUrl(hash);
        }
    }

    processUrl(hash) {
        const path = hash.replace('#', '');
        if (path) {
            let { name, threadId, args } = path.match(/^(?<name>[\w\d\._\-]+)(:(?<threadId>\w+))?\??(?<args>.*)?$/).groups ?? {};
            const params = args ? Object.fromEntries(new URLSearchParams(args)) : undefined;
            this.formManager?.open(name, { params });
        }
    }

    threadChange() {
        let thread = this.currentThread;
        if (thread && this.currentForm) {
            const params = {};
            this.currentForm?.urlParams.forEach(el => {
                if (this.currentForm[el]) {
                    params[el] = this.currentForm[el];
                }
            });

            if (Object.keys(params).length === 0) {
                this.history({ threadId: thread.threadId, formName: this.currentForm?._formName }, null, `#${this.currentForm?._formName}`);
            } else {
                this.history({ threadId: thread.threadId, formName: this.currentForm?._formName }, null, `#${this.currentForm?._formName}?${new URLSearchParams(params).toString()}`);
            }
        } else
            this.history({}, null, '#');

    }
}

customElements.define('pl-router', PlRouter);
