import { PlElement, html, css } from "polylib";
import "@plcmp/pl-icon";
import "./pl-file-preview.js";

class PlFileUpload extends PlElement {
    static get properties() {
        return {
            dragActive: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            multiple: {
                type: Boolean,
                value: false
            },
            files: {
                type: Array,
                value: []
            },
            required: {
                type: Boolean,
                reflectToAttribute: true,
                value: false
            },
            accept: {
                type: String
            },
            endpoint: {
                type: String,
                value: 'upload'
            },
            downloadEndpoint: {
                type: String,
                value: 'download'
            },
            hint: {
                type: String,
                value: 'Перетащите файлы или нажмите здесь, чтобы загрузить'
            }
        }
    }

    static get css() {
        return css`
            :host {
                display:flex;
                flex-direction: column;
                gap: var(--space-sm);
            }

            .uploader-container{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: var(--space-lg);
                font: var(--subtext-font);
                width: 300px;
                height: 92px;
                border: 1px dashed var(--grey-dark);
                box-sizing: border-box;
                border-radius: var(--border-radius);
                color: var(--grey-dark);
                position: relative;
                cursor: pointer;
            }

            :host([hidden]) .uploader-container{
                display: none !important;
            }

            .uploader-container:hover, :host([drag-active]) .uploader-container{
                background: var(--primary-lightest);
                border: 1px dashed  var(--primary-base);
                color: var(--primary-base);
            }

            .uploader-container::before {
                content: '';
                display: block;
                position: absolute;
                box-sizing: border-box;
                top: 0;
                left: 0;
            }

            :host([required]) .uploader-container::before {
				border-top: calc(var(--space-md) / 2) solid var(--attention);
				border-left: calc(var(--space-md) / 2)  solid var(--attention);
				border-bottom: calc(var(--space-md) / 2) solid transparent;
				border-right: calc(var(--space-md) / 2) solid transparent;
            }
        `;
    }

    static get template() {
        return html`
            <div id="uploader" class="uploader-container">
                <input id="fileInput" accept$="[[accept]]" type="file" multiple$="[[multiple]]" on-change="[[onFileInputChange]]" hidden/>
                <pl-icon iconset="pl-default" size="32" icon="upload"></pl-icon>
            
                <span class="hint">[[hint]]</span>
            </div>
            <pl-file-preview endpoint="[[downloadEndpoint]]" can-delete="true" files="{{files}}"></pl-file-preview>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.$.uploader.addEventListener('click', this.onFileClick.bind(this), false);
        this.$.uploader.addEventListener("dragenter", this.dragenter.bind(this), false);
        this.$.uploader.addEventListener("dragover", this.dragover.bind(this), false);
        this.$.uploader.addEventListener("dragleave", this.dragleave.bind(this), false);
        this.$.uploader.addEventListener("drop", this.drop.bind(this), false);
    }

    onFileClick(event) {
        this.$.fileInput.click()
    }

    dragenter(e) {
        e.dataTransfer.dropEffect = 'copy';

        e.stopPropagation();
        e.preventDefault();
    }

    dragleave(e) {
        this.dragActive = false;
        e.stopPropagation();
        e.preventDefault();
    }

    dragover(e) {
        this.dragActive = true;
        e.stopPropagation();
        e.preventDefault();
    }

    drop(e) {
        this.dragActive = false;
        e.stopPropagation();
        e.preventDefault();
        var dt = e.dataTransfer;
        var files = dt.files;

        for (var i = 0; i < dt.files.length; i++) {
            const file = dt.files[i];
            if (!this.acceptFile(file, this.accept)) {
                return false;
            }
        };

        this.handleFiles(files);
    }

    onFileInputChange(e) {
        var files = e.target.files;
        this.handleFiles(files);
    }

    acceptFile(file, acceptedFiles) {
        if (file && acceptedFiles) {
            var acceptedFilesArray = Array.isArray(acceptedFiles) ? acceptedFiles : acceptedFiles.split(',');
            var fileName = file.name || '';
            var mimeType = (file.type || '').toLowerCase();
            var baseMimeType = mimeType.replace(/\/.*$/, '');
            return acceptedFilesArray.some(function (type) {
                var validType = type.trim().toLowerCase();

                if (validType.charAt(0) === '.') {
                    return fileName.toLowerCase().endsWith(validType);
                } else if (validType.endsWith('/*')) {
                    return baseMimeType === validType.replace(/\/.*$/, '');
                }

                return mimeType === validType;
            });
        }

        return true;
    }

    handleFiles(uploadedFiles) {
        if (this.multiple) {
            for (var i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                file.loaded = 0;
                file.progress = 0;
                file.value = '';
                this.push('files', file);
                this.uploadFile(file, i);
            };
        }
        else {
            this.set('files', []);
            const file = uploadedFiles[0];
            file.loaded = 0;
            file.progress = 0;
            file.value = '';
            this.push('files', file);
            this.uploadFile(file, i);
        }
    }

    uploadFile(file) {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        const url = this.endpoint;
        file._xhr = xhr;
        const idx = this.files.indexOf(file);
        formData.append('file', file, file.name);
        xhr.upload.onprogress = (event) => {
            const done = event.loaded;
            const total = event.total;
            const progress = Math.floor((done / total) * 1000) / 10;
            this.set(`files.${idx}.loaded`, done);
            this.set(`files.${idx}.progress`, progress);
        };

        xhr.open('POST', url, true);
        xhr.onload = (event) => {
            if (event.target.status == 200) {
                const resp = JSON.parse(event.target.response);
                if (resp.id) {
                    this.set(`files.${idx}.value`, resp.id);
                } else {
                    if(resp.error) {
                        this.splice('files', idx, 1);
                        document.dispatchEvent(new CustomEvent('error', { detail: resp.error }));
                    }
                }
            }
        };
        xhr.send(formData);
    }
}

customElements.define('pl-file-upload', PlFileUpload);
