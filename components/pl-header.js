import { PlElement, html, css } from "polylib";

class PlHeader extends PlElement {
    static get properties(){
        return {
            currentForm: { type: Object }
        }
    }
    static get css() {
        return css`
            :host{
                margin: 8px 16px;
                display: flex;
                height: 48px;
                box-sizing: border-box;
                gap: 8px;
                align-items: center;
                flex-shrink: 0;
            }

            .back {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid var(--grey-light);
                border-radius: 4px;
                cursor: pointer;
                --pl-icon-fill-color: none;
                --pl-icon-stroke-color: var(--black-light);
            }

            .back:hover {
                --pl-icon-stroke-color: var(--black-dark);
                border: 1px solid var(--grey-base);
            }
            
            .content-header {
                display: flex;
                flex-direction: column;
                user-select: none;
            }
            .form-breadcrumbs {
                font: var(--font-sm);
                color: var(--grey-darkest);
            }

            #form-label {
                font: var(--font-xl);
                font-weight: 500;
                color: var(--black-base);
            }
        `;
    }

    static get template() {
        return html`
            <slot></slot>
            <div class="back" on-click="[[close]]">
                <pl-icon iconset="pl-default" size="16" icon="chevron-left"></pl-icon>
            </div>
            <div class="content-header">
                <div class="form-breadcrumbs">Главная</div>
                <div id="form-label">[[currentForm.formTitle]]</div>
                <slot name="suffix"></slot>
            </div>
        `;
    }

    close(){
        this.currentForm?.close();
    }
}

customElements.define('pl-header', PlHeader);
