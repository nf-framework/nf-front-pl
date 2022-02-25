import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class MainView extends PlForm {
    static get properties() {
        return {
            menuItems: { type: Array, value: () => ([]) },
            menuOpened: { type: Boolean, value: false },
            currentForm: { type: Object }
        };
    }

    static get css() {
        return css`
            :host {
                display: flex;
                flex-direction: row;
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
            }

            pl-header[hidden] {
                display: none;
            }
            
            .content {
                background: white;
                margin-left: 64px;
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }

            @media (min-width: 320px) and (max-width: 768px) {
                :host {
                    flex-direction: column;
                }

                .app-bar {
                    width: 100%;
                    height: 64px;
                    justify-content: flex-start;
                    align-items: center;
                }
            }
        `;
    }

    static get template() {
        return html`
            <pl-dataset id="dsMenu" data="{{menuItems}}" endpoint="/front/action/getMenu"></pl-dataset>
            <pl-app-side id="menu" opened={{menuOpened}} items="[[menuItems]]" on-menu-item-selected="[[onMenuItemSelected]]">
                <pl-icon-button slot="logo" iconset="pl-default" icon="menu" on-click="[[onMenuButtonClick]]"></pl-icon-button>
                <pl-icon-button slot="bottom" iconset="pl-default" icon="logout" on-click="[[onLogout]]"></pl-icon-button>
            </pl-app-side>
            <div class="content">
                <pl-header hidden$="[[!currentForm]]" current-form="[[currentForm]]">
                    [[currentForm.headerTemplate]]
                </pl-header>
                <pl-router id="router" current-form="{{currentForm}}"></pl-router>
            </div>
            <pl-action id="aLogout" endpoint="/front/action/logout"></pl-action>
            <pl-toast id="toast"></pl-toast>
        `;
    }

    onConnect() {
        document.addEventListener('error', this.showError.bind(this));
        document.addEventListener('success', this.showSuccess.bind(this));

        this.$.dsMenu.execute();
    }

    showError(e) {
        this.$.toast.show(e.detail)
    }

    showSuccess(e) {
        this.$.toast.show(e.detail.message)
    }

    onMenuButtonClick() {
        this.menuOpened = !this.menuOpened;
    }

    onMenuItemSelected(event) {
        if (event.detail.form) {
            this.$.router.openForm(event.detail.form);
            this.$.menu.close();
        }
    }

    onLogout() {
        this.$.aLogout.execute();
        document.location.reload();
    }
}