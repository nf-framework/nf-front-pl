import { html, css, PlElement } from "polylib";
import "ace-builds/ace.js";
ace.config.set('basePath', '/ace-builds/');
import { debounce } from "@plcmp/utils";

class PlCodeEditor extends PlElement {
    static get properties() {
        return {
            value: { type: String, value: '', observer: 'valueChange' }
        }
    }
    static get template() {
        return html`
           <div id="editor"></div>
		`;
    }

    static get css() {
        return css`
            :host {
                dispaly: block;
                width: 100%;
                height: 100%;
            }
            #editor{
                width: 100%;
                height: 100%;
                overflow: auto;
            }
        `;
    }
    fromEditor = false;
    connectedCallback() {
        super.connectedCallback();
        this.editor = ace.edit(this.$.editor, {
            mode: "ace/mode/typescript"
        });
        this.editor.renderer.attachToShadowRoot();
        this.editor.on('change', e => {
            let debouncer = debounce(() => {
                this.fromEditor = true;
                this.value = this.editor.session.getValue();
            }, 100)
            debouncer();
        });
    }
    valueChange(value) {
        console.log('observer')
        if (this.fromEditor) return;
        this.editor.session.setValue(value || '');
        this.fromEditor = false;
    }
}

customElements.define('pl-codeeditor', PlCodeEditor);