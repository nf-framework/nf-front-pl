import { PlElement, html, css } from "polylib";

class PlHeader extends PlElement {
    static get properties() {
        return {
            currentForm: { type: Object, observer: 'currentFormObserver' },
            formTitle: { type: String },
            breadcrumbs: { type: Array, value: ['Главная'] },
            hidden: { type: Boolean, reflectToAttribute: true }
        }
    }
    static get css() {
        return css`
            :host{
                margin: 8px 0;
                display: flex;
                height: 48px;
                box-sizing: border-box;
                gap: 8px;
                align-items: center;
                flex-shrink: 0;
            }

            :host([hidden]) {
                display: none;
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
            }

            .back:hover {
                border: 1px solid var(--grey-base);
            }
            
            .content-header {
                display: flex;
                flex-direction: column;
                user-select: none;
            }
            .form-breadcrumbs {
              display: flex;
              align-items: center;
            }
            .form-breadcrumbs a {
                font: var(--header-font);
                color: var(--grey-darkest);
                font-weight: 400;
                text-decoration: none;
            }
            .form-breadcrumbs pl-icon {
                color: var(--grey-darkest);
              cursor: pointer;
            }
            .form-breadcrumbs a:hover, .form-breadcrumbs pl-icon:hover {
                color: var(--text-color);
            }
            #form-label {
                font: var(--font-h2);
                color: var(--text-color);
            }
            .form-breadcrumbs .item:not(:first-child)::before {
                content: '>';
                margin: 0 4px;
                color: var(--grey-darkest);
            }
            .homeIcon {
                display: inline-flex;
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
                <div class="form-breadcrumbs">
                    <pl-icon class="homeIcon" iconset="pl-default" icon="home" size="12" on-click="[[onBreadCrumbsClick]]"></pl-icon>
                    <pl-repeat items="[[breadcrumbs]]">
                        <template>
                            <span class="item"><a href="javascript:void(0)" on-click="[[onBreadCrumbsClick]]">[[item.title]]</a></span>    
                        </template>
                    </pl-repeat>
                </div>
                <div id="form-label">[[formTitle]]</div>
                <slot name="suffix"></slot>
            </div>
        `;
    }

    currentFormObserver(form) {
        if (form) {
            this.formTitle = form.formTitle;

            if (!form._titleChangedEventFlag) {
                form.addEventListener('formTitle-changed', () => {
                    this.formTitle = this.currentForm.formTitle;
                });
            }

            form._titleChangedEventFlag = true;
        } else {
            this.formTitle = null;
        }
    }

    close() {
        this.currentForm?.close();
    }
    onBreadCrumbsClick(e) {
        this.dispatchEvent(new CustomEvent('breadcrumbClick', { detail: e.model?.item }))
    }
}

customElements.define('pl-header', PlHeader);
