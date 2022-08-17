import { html, css, PlElement } from "polylib";
import "ace-builds/ace.js";
ace.config.set('basePath', '/ace-builds/');
import { debounce } from "@plcmp/utils";

class PlCodeEditor extends PlElement {
    static properties = {
        value: { type: String, value: '', observer: 'valueChange' },
        mode: { type: String, observer: 'modeChange' }
    }

    static css = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }
        #editor{
            width: 100%;
            height: 100%;
            overflow: auto;
        }
    `;

    static template = html`
        <div id="editor"></div>
    `;

    fromEditor = false;
    connectedCallback() {
        super.connectedCallback();
        this.editor = ace.edit(this.$.editor);
        this.editor.renderer.attachToShadowRoot();
        this.editor.on('change', e => {
            let debouncer = debounce(() => {
                this.fromEditor = true;
                this.value = this.editor.session.getValue();
                this.fromEditor = false;
            }, 100)
            debouncer();
        });
    }
    valueChange(value) {
        if (this.fromEditor) return;
        this.editor.session.setValue(value || '');
        this.fromEditor = false;
    }
    modeChange(mode) {
        this.editor.session.setMode(mode);
    }
}

customElements.define('pl-codeeditor', PlCodeEditor);