import { PlElement, html, css } from "polylib";

class PlAppMenu extends PlElement {
    static get properties() {
        return {
            header: { type: String },
            content: { type: String },
            buttons: { type: Array, value: () => ([]) }
        }
    }

    static get css() {
        return css`
            :host {
                background: rgba(0, 0, 0, 0.8);
                height: 100%;
                position: fixed;
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
                padding: 16px;
                position: absolute;
                width: 360px;
                top: 50%;  
                left: 50%;
                transform: translate(-50%, -50%);                
                background: #FFFFFF;
                box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);
                border-radius: 4px;
                gap: 8px;
            }

            .header {
                width: 100%;
                display: flex;
            }

            .header-text {
                width: 100%;
                font-weight: bold;
                font-size: 14px;
                line-height: 16px;
                color: #2B2F33;
            }

            .content {
                font-style: normal;
                font-weight: normal;
                font-size: 13px;
                line-height: 18px;
                color: #464B52;
            }

            .button {
                display: flex;
                gap: 8px;
                width: 100%;
                justify-content: flex-end;
            }
        `
    }

    static get template() {
        return html`
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
                            <pl-button variant="[[item.variant]]" label="[[item.label]]" action="[[item.action]]" on-click="[[close]]"></pl-button>
                        </template>
                    </pl-repeat>
                </div>
            </div>
		`;
    }

    close(event) {
        this.remove();
        this.dispatchEvent(new CustomEvent('pl-dialog-closed', { bubbles: true, detail: { action: event.target.action } }));
    }
}

customElements.define('pl-dialog', PlAppMenu);
