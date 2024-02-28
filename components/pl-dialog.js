import { PlElement, html, css } from "polylib";
import { addOverlay, removeOverlay } from "@plcmp/utils";
import '@plcmp/pl-button';

class PlAppMenu extends PlElement {
    static properties = {
        header: { type: String },
        content: { type: String },
        buttons: { type: Array, value: () => ([]) }
    }

    static css = css`
        :host {
            background: rgba(36, 51, 49, 0.4);
            height: 100%;
            position: var(--pl-modal-position, fixed);
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 100%;
        }
        :host .modal{
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: var(--pl-space-lg);
            position: fixed;
            width: 360px;
            top: 50%;  
            left: 50%;
            transform: translate(-50%, -50%);                
            background: var(--pl-surface-color);
            border-radius: var(--pl-border-radius);
            gap: var(--pl-space-md);
        }

        .header {
            width: 100%;
            display: flex;
        }

        .header-text {
            width: 100%;
            font: var(--pl-text-font);
            color: var(--pl-header-color);
            font-size: 16px;
        }

        .content {
            font: var(--pl-text-font);
            color: var(--pl-text-color);
        }

        .button {
            display: flex;
            gap: var(--pl-space-sm);
            width: 100%;
            justify-content: flex-end;
        }
    `;

    static template = html`
        <div class="modal">
            <div class="header">
                <span class="header-text">
                    [[header]]
                </span>
            </div>
            <div class="content">
                [[content]]
            </div>
            <div class="button">
                <pl-button d:repeat="[[buttons]]" negative="[[item.negative]]" variant="[[item.variant]]" label="[[item.label]]" action="[[item.action]]" on-click="[[close]]"></pl-button>
            </div>
        </div>
    `;

    connectedCallback(){
        super.connectedCallback();
        addOverlay(this);
    }

    close(event) {
        removeOverlay(this);
        this.remove();
        this.dispatchEvent(new CustomEvent('pl-dialog-closed', { bubbles: true, detail: { action: event.target.action } }));
    }
}

customElements.define('pl-dialog', PlAppMenu);
