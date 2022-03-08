import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class MainView extends PlForm {
    static get properties() {
        return {
            userProfile: { type: Object, value: () => ({}) },
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

            .username {
                font-weight: bold;
                text-transform: uppercase;
                white-space: nowrap;
            }
            
            .content {
                background: white;
                margin-left: 64px;
                display: flex;
                flex-direction: column;
                flex: 1;
                overflow-x: auto;
                overflow-y: auto;
            }

            #ddProfile {
                width: auto;
                background: #FFFFFF;
                color: #3F3F3F;
                padding: 16px 8px;
                border-radius: 4px;
            }

            pl-icon-button[variant="link"] {
                color: white;
            }
        `;
    }

    static get template() {
        return html`
            <pl-dataset id="dsMenu" data="{{menuItems}}" endpoint="/front/action/getMenu"></pl-dataset>
            <pl-app-side id="menu" opened={{menuOpened}} items="[[menuItems]]" on-menu-item-selected="[[onMenuItemSelected]]">
                <pl-icon-button slot="logo" iconset="pl-default" icon="menu" variant="link"  on-click="[[onMenuButtonClick]]"></pl-icon-button>
                <pl-flex-layout vertical slot="bottom">
                    <pl-icon-button variant="link" size="24" id="btnProfile" iconset="pl-default" icon="profile" on-click="[[onProfileClick]]"></pl-icon-button>
                </pl-flex-layout>
            </pl-app-side>
            <div class="content">
                <pl-header hidden$="[[!currentForm]]" current-form="[[currentForm]]">
                    [[currentForm.headerTemplate]]
                </pl-header>
                <pl-router id="router" current-form="{{currentForm}}"></pl-router>
            </div>
            <pl-dropdown id="ddProfile">
                <pl-flex-layout vertical fit>
                    <div class="username">[[userProfile.username]]</div>
                    <pl-flex-layout stretch justify="flex-end">
                        <pl-button label="Выйти" on-click="[[onLogoutClick]]">
                            <pl-icon iconset="pl-default" icon="logout-filled" slot="suffix">
                        </pl-button>
                    </pl-flex-layout>
                </pl-flex-layout>
            </pl-dropdown>
            <pl-action id="aLogout" endpoint="/front/action/logout"></pl-action>
            <pl-action id="aGetUserProfile" data="{{userProfile}}" endpoint="/front/action/getUserProfile"></pl-action>
            <pl-toast id="toast"></pl-toast>
        `;
    }

    onConnect() {
        document.addEventListener('error', this.showError.bind(this));
        document.addEventListener('success', this.showSuccess.bind(this));

        this.$.dsMenu.execute();
        this.$.aGetUserProfile.execute();
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

    onProfileClick() {
        this.$.ddProfile.open(this.$.btnProfile)
    }

    onLogoutClick() {
        this.$.aLogout.execute();
        document.location.reload();
    }
}