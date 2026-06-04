import { html, css, PlElement } from "polylib";
import "ace-builds/ace.js";
import "/ace-builds/ext-language_tools.js";
import "/ace-builds/ext-searchbox.js";
import "/ace-builds/mode-javascript.js";
import "/ace-builds/mode-css.js";
import "/ace-builds/theme-textmate.js";
import "/ace-builds/theme-github.js";
import "/ace-builds/theme-tomorrow.js";
ace.config.set('basePath', '/ace-builds/');
import { debounce } from "@plcmp/utils";

class PlCodeEditor extends PlElement {
    static properties = {
        value: { type: String, value: '', observer: 'valueChange' },
        mode: { type: String, observer: 'modeChange' },
        theme: { type: String, value: 'ace/theme/textmate', observer: 'themeChange' },
        readOnly: { type: Boolean, value: false, observer: 'editorOptionsChange' },
        wrap: { type: Boolean, value: false, observer: 'editorOptionsChange' },
        tabSize: { type: Number, value: 2, observer: 'editorOptionsChange' },
        useSoftTabs: { type: Boolean, value: true, observer: 'editorOptionsChange' },
        showPrintMargin: { type: Boolean, value: false, observer: 'editorOptionsChange' },
        printMarginColumn: { type: Number, value: 100, observer: 'editorOptionsChange' },
        showGutter: { type: Boolean, value: true, observer: 'editorOptionsChange' },
        fontSize: { type: Number, value: 14, observer: 'editorOptionsChange' },
        highlightActiveLine: { type: Boolean, value: true, observer: 'editorOptionsChange' },
        highlightSelectedWord: { type: Boolean, value: true, observer: 'editorOptionsChange' },
        useWorker: { type: Boolean, value: true, observer: 'editorOptionsChange' },
        enableBasicAutocompletion: { type: Boolean, value: true, observer: 'editorOptionsChange' },
        enableLiveAutocompletion: { type: Boolean, value: true, observer: 'editorOptionsChange' },
        enableSnippets: { type: Boolean, value: true, observer: 'editorOptionsChange' }
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
        this.editor.setShowPrintMargin(this.showPrintMargin);
        this.editor.setHighlightActiveLine(this.highlightActiveLine);
        this.editor.setHighlightSelectedWord(this.highlightSelectedWord);
        this.editor.session.setUseSoftTabs(this.useSoftTabs);
        this.editor.session.setTabSize(this.tabSize);
        this.editor.session.setUseWrapMode(this.wrap);
        this.editor.setReadOnly(this.readOnly);
        this.editor.renderer.setShowGutter(this.showGutter);
        this.editor.setTheme(this.theme);
        this.editor.session.setMode(this.mode || "ace/mode/javascript");
        this.editor.session.setUseWorker(this.useWorker);
        this.editor.setOptions({
            fontSize: `${this.fontSize}px`,
            enableBasicAutocompletion: this.enableBasicAutocompletion,
            enableLiveAutocompletion: this.enableLiveAutocompletion,
            enableSnippets: this.enableSnippets,
            showLineNumbers: true,
            displayIndentGuides: true,
            animatedScroll: true,
            behavioursEnabled: true,
            showFoldWidgets: true
        });
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
        if (!this.editor) return;
        if (this.fromEditor) return;
        this.editor.session.setValue(value || '');
        this.fromEditor = false;
    }
    modeChange(mode) {
        if (!this.editor) return;
        this.editor.session.setMode(mode);
    }
    themeChange(theme) {
        if (!this.editor || !theme) return;
        this.editor.setTheme(theme);
    }
    editorOptionsChange() {
        if (!this.editor) return;
        this.editor.setReadOnly(this.readOnly);
        this.editor.setShowPrintMargin(this.showPrintMargin);
        this.editor.setPrintMarginColumn(this.printMarginColumn);
        this.editor.setHighlightActiveLine(this.highlightActiveLine);
        this.editor.setHighlightSelectedWord(this.highlightSelectedWord);
        this.editor.renderer.setShowGutter(this.showGutter);
        this.editor.session.setUseSoftTabs(this.useSoftTabs);
        this.editor.session.setTabSize(this.tabSize);
        this.editor.session.setUseWrapMode(this.wrap);
        this.editor.session.setUseWorker(this.useWorker);
        this.editor.setOptions({
            fontSize: `${this.fontSize}px`,
            enableBasicAutocompletion: this.enableBasicAutocompletion,
            enableLiveAutocompletion: this.enableLiveAutocompletion,
            enableSnippets: this.enableSnippets
        });
    }
    focus() {
        this.editor?.focus();
    }
    find() {
        this.editor?.execCommand('find');
    }
    replace() {
        this.editor?.execCommand('replace');
    }
    gotoLineDialog() {
        this.editor?.execCommand('gotoline');
    }
}

customElements.define('pl-codeeditor', PlCodeEditor);
