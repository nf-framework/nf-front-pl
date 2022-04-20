import {html, css, PlElement} from "polylib";
import {normalizePath} from "polylib/common.js";
import './pl-forms-thread.js';

class FormManager extends PlElement {
    static properties = {
        currentForm: { type: Object, observer: 'currentFormChange' },
        currentThread: { type: Object },
        container: { type: Object },
        threads: { type: Array, value: ()=>[], observer: 'threadFormChange' }
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
        <pl-repeat items="{{threads}}">
            <template>
                <pl-forms-thread id="[[item.id]]" current-form="{{item.currentForm}}"></pl-forms-thread>
            </template>
        </pl-repeat>`;

    connectedCallback() {
        super.connectedCallback();
        this.container = this.container ?? this.root;
        this.container.addEventListener('pl-form-thread-empty', (e)=>this.onThreadEmpty(e))
    }

    open(name, options = {} ) {
        let {threadId, newThread, extKey} = options;
        let thread, showOnly = false;
        if (threadId) {
            thread = this.threads.find( i => i.id === threadId );
        }
        if (!newThread) {
            // search and show existing thread, new window will not open
            thread = this.threads.find( i => i.name === name);
            if (thread) showOnly = true;
        }
        if (!thread || newThread) {
            //Create new thread
            let id = threadId ?? 'trd'+(Math.random() + 1).toString(36).substring(2);
            thread = { id, name, node: null };
            let ind = this.push('threads', thread);
            this.set(['threads',ind-1,'node'], this.$[id]);
        }
        let result = showOnly || thread.node.open(name, options);
        //Make thread visible, and hide others
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
        dispatchEvent( new CustomEvent('form-change', { detail: { form } }));
    }
}

customElements.define('pl-forms-manager', FormManager);