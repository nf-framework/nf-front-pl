import { PlElement, html, css } from "polylib";
import { addOverlay, removeOverlay } from "@plcmp/utils";

class PlAppMenu extends PlElement {
    static properties = {
        header: { type: String },
        content: { type: String },
        buttons: { type: Array, value: () => ([]) }
    }

    static css = css`
        :host {
            background: rgba(0, 0, 0, 0.8);
            height: 100%;
            position: absolute;
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
            padding: var(--space-lg);
            position: fixed;
            width: 360px;
            top: 50%;  
            left: 50%;
            transform: translate(-50%, -50%);                
            background: var(--surface-color);
            box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);
            border-radius: var(--border-radius);
            gap: var(--space-md);
        }

        .header {
            width: 100%;
            display: flex;
        }

        .header-text {
            width: 100%;
            font: var(--font-h3);
            color: var(--header-color);
        }

        .content {
            font: var(--text-font);
            color: var(--text-color);
        }

        .button {
            display: flex;
            gap: var(--space-sm);
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
                <pl-repeat items="[[buttons]]">
                    <template>
                        <pl-button negative="[[item.negative]]" variant="[[item.variant]]" label="[[item.label]]" action="[[item.action]]" on-click="[[close]]"></pl-button>
                    </template>
                </pl-repeat>
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
