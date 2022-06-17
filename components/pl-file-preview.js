import { PlElement, html, css } from "polylib";
import "@plcmp/pl-repeat";
import "@plcmp/pl-icon";

class PlFilePreview extends PlElement {
    static get properties() {
        return {
            files: {
                type: Array,
                value: []
            },
            canDelete: {
                type: Boolean,
                value: false
            },
            endpoint: {
                type: String
            }
        }
    }

    static get css() {
        return css`
            :host{
                max-height: 100%;
                gap: 8px;
              display: block;
            }

            .cont {
                max-width: 300px;
                height: 64px;
                display:flex;
                flex-direction:column;
                box-sizing: border-box;
                border: 1px solid var(--grey-base);
                border-radius: var(--border-radius);
                position: relative;
                overflow: hidden;
            }

            .file-info-container {
                display:flex;
                flex-direction:row;
                justify-content:space-between;
                width: 100%;
                height: 100%;
            }

            .img {
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 8px;
                width: 48px;
                background: var(--grey-lightest);
                height: 48px;
            }

            .progress {
                position: absolute;
                bottom: 0;
            }

            progress {
                width: 100%;
                height: 4px;
                background: var(--primary-base);
            }

            progress::-webkit-progress-value { background: var(--primary-base); }
            progress::-moz-progress-bar { background: var(--primary-base); }
            progress[value]::-webkit-progress-bar {
                background-color: var(--grey-light);
                border-radius: var(--border-radius);
              }
              

            .data-container {
                display: flex;
                flex-direction: column;
                flex: 1 1 0;
                margin-right: 16px;
                justify-content: center;
                gap: 4px;
                overflow: hidden;
                white-space: nowrap;
            }

            .name {
                font: var(--text-font);
                color: var(--text-color);
                text-overflow: ellipsis;
                overflow: hidden;
            }

            .size {
                color: var(--grey-dark);
                font: var(--subtext-font);
            }

            .tools {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 16px;
            }
        `;
    }

    static get template() {
        return html`
        <pl-repeat items="[[files]]">
            <template>
                <div class="cont">
                    <div class="file-info-container" title="[[item.name]]">
                        <div class="img">
                            <pl-icon iconset="pl-default" size="16" icon="file"></pl-icon>
                        </div>
                        <div class="data-container">
                            <div class="name">
                                [[item.name]]
                            </div>
                            <div class="size">[[getFileSize(item.value, item.loaded, item.size)]]</div>
                        </div>
                        <div class="tools">
                            <pl-icon-button hidden="[[!canDelete]]" variant="link" iconset="pl-default" size="16" icon="close"
                                on-click="[[onCloseClick]]"></pl-icon-button>
                            <pl-icon-button hidden="[[!item.value]]" variant="link" iconset="pl-default" size="16"
                                icon="download" on-click="[[onDownloadClick]]"></pl-icon-button>
                        </div>
                    </div>
                    <progress hidden="[[item.value]]" class="progress" max="100" value="[[item.progress]]"></progress>
                </div>
            </template>
        </pl-repeat>
        `;
    }

    _getDownloadUrl(endpoint, url) {
        return `${endpoint}/${url}`;
    }

    onDownloadClick(event) {
        const link = document.createElement("a");
        link.target = "_blank";

        // Construct the URI
        link.href = `${this.endpoint}/${event.model.item.value}`;
        document.body.appendChild(link);
        link.click();

        // Cleanup the DOM
        document.body.removeChild(link);
    }

    getFileSize(value, loaded, size) {
        if (value) {
            return `${(loaded / 1024).toFixed(2)} KB`;
        }
        return loaded && size ? `${(loaded / 1024).toFixed(2)} KB / ${(size / 1024).toFixed(2)} KB` : '';
    }

    onCloseClick(event) {
        if(event.model.item._xhr) {
            event.model.item._xhr.abort();
        }
        //TODO: remove already uploaded files from server
        this.splice('files', this.files.findIndex( x => x === event.model.item), 1);
    }
}

customElements.define('pl-file-preview', PlFilePreview);
