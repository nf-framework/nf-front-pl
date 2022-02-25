import { html, css, PlElement } from "polylib";
import "ace-builds/ace.js";
ace.config.set('basePath', '/ace-builds/');
import { debounce } from "@plcmp/utils";

class PlCodeEditor extends PlElement {
    static get properties() {
        return {
            value: { type: String, value: '' }
        }
    }
    static get template() {
        return html`
           <div id="editor"></div>
		`;
    }

    static get css() {
        return css`
            #editor{
                width: 100%;
                height: 100%;
                overflow: auto;
            }
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.editor = ace.edit(this.$.editor, {
            mode: "ace/mode/typescript"
        });
        this.editor.renderer.attachToShadowRoot();
        this.editor.on('change', e => {
            let debouncer = debounce(() => { 
                this.value = this.editor.session.getValue();
            }, 100)
            debouncer();
        });
    }

    setValue(value){
        this.editor.session.setValue(value || '', 1);
    }
}

customElements.define('pl-codeeditor', PlCodeEditor);