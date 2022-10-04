import { PlElement } from "polylib";

class PlRouter extends PlElement {
    static properties = {
        currentForm: { type: Object, observer: 'threadChange' },
        currentThread: { type: Object, observer: 'threadChange' },
        formManager: { type: Object },
        //TODO: make history
        disableHistory: { type: Boolean, value: true }
    }

    connectedCallback() {
        super.connectedCallback();
        this.history = (this.disableHistory ? history.replaceState : history.pushState).bind(history);
        let hash = document.location.hash;
        if (hash) {
            this.processUrl(hash);
        } else {
            history.replaceState(null, null, location.pathname + location.search);
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
            this.currentForm?.urlParams.forEach(el => {
                this.currentForm.addEventListener(`${el}-changed`, () => {
                    this.setUrlParams(thread);
                })
            });

            this.setUrlParams(thread);
        } else {
            history.replaceState(null, null, location.pathname + location.search);
        }
    }

    setUrlParams(thread) {
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
    }
}

customElements.define('pl-router', PlRouter);
