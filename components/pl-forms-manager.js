import {html, css, PlElement} from "polylib";
import {normalizePath} from "polylib/common.js";
import './pl-forms-thread.js';

class FormManager extends PlElement {
    static properties = {
        currentForm: { type: Object, observer: 'currentFormChange' },
        currentThread: { type: Object },
        container: { type: Object },
        threads: { type: Array, value: ()=>[], observer: 'threadFormChange' },
        singleThread: { type: Boolean, value: false },
        dashboard: { type: String, observer: 'dashBoardChange' }
    }
    static css = css`
        :host {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            height: 100%;
            width: 100%;
            box-sizing: border-box;
        }
    `;
    static template = html`
        <slot></slot>
        <template d:repeat="{{threads}}">
            <pl-forms-thread id="[[item.id]]" current-form="{{item.currentForm}}"></pl-forms-thread>
        </template>
    `;

    connectedCallback() {
        super.connectedCallback();
        this.container = this.container ?? this.root;
        this.container.addEventListener('pl-form-thread-empty', (e)=>this.onThreadEmpty(e));
        this.container.addEventListener('pl-open-in-new-thread', (e)=>this.onOpenInNewThread(e));
    }

    async onOpenInNewThread(event) {
        await this.open(event.detail.name, event.detail.options)
    }

    async open(name, options = {} ) {
        let {threadId, newThread, extKey, dashboard} = options;
        if (name === this.dashboard) {
            dashboard = true;
        }
        let thread, showOnly = false;
        if (threadId) {
            thread = this.threads.find( i => i.id === threadId );
        }
        if (!newThread) {
            // search and show existing thread, new window will not open
            thread = this.threads.find( i => i.name === name);
            if (thread) {
                showOnly = true;
                //if form already opened update props
                if (options?.params && options.params instanceof Object)
                    Object.entries(options.params).forEach( ([k,v]) => {
                        thread.currentForm[k] = v;
                    });
            }
        }
        if (this.singleThread && !this.currentThread?.dashboard && this.currentThread !== thread) {
            if (await this.currentThread?.node.closeAll() === false) return;
        }
        if (!thread || newThread) {
            //Create new thread
            let id = threadId ?? 'trd'+(Math.random() + 1).toString(36).substring(2);
            thread = { id, name, node: null, dashboard };
            let ind = this.push('threads', thread);
            this.set(['threads',ind-1,'node'], this.$[id]);
        }
        let result = showOnly || thread.node.open(name, options);
        //Make thread visible, and hide others
        if (options?.dashboard && this.currentThread)
            // When dashboard auto-open on already opened form, hide any thread except current
            this.switchTo(this.currentThread.id);
         else
            this.switchTo(thread.id);

        return result;
    }
    threadFormChange(v,o,m) {
        if (m.action === 'upd') {
            let path = normalizePath(m.path);
            if (path.at(-1) === 'currentForm') {
                let thread = this.get(path.slice(0, -1));
                if (thread.node.hidden === false){
                     this.currentForm = thread.node.currentForm;
                }
            }
        }
    }
    onThreadEmpty(event) {
        let ind = this.threads.findIndex( i=> i.id === event.detail.thread );
        if (ind>=0) {
            this.splice('threads', ind, 1);
            this.currentThread = null;
            this.switchTo(this.findLast());
        }

    }
    switchTo(id) {
        this.threads.forEach( t => {
            if (t.id === id) {
                t.node.hidden = false;
                this.currentThread = t;
                this.currentForm = t.node.currentForm;
            } else {
                t.node.hidden = true;
            }
        } );
    }
    findLast() {
        //TODO: search most recent thread
        return this.threads.at(-1)?.id;
    }
    currentFormChange(form) {
        window.plCurrentForm = {form};
        if (form && form?._formName === this.dashboard) {
            form._dashboard = true;
        }
        dispatchEvent( new CustomEvent('form-change', { detail: { form }, bubbles: true }));
    }
    async dashBoardChange(db) {
        if (this.currentThread?.name == db) {
            this.set('currentThread.dashboard', db);
        }
        if (db) {
            this._dbForm = await this.open(db, { dashboard: true });
        }
    }

    async closeAllThreads() {
        let formThreadsLength = this.threads.length;
        while (formThreadsLength--) {
            await this.threads[formThreadsLength].node.closeAll();
        }
    }}

customElements.define('pl-forms-manager', FormManager);