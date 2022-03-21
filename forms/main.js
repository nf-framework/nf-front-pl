import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class MainView extends PlForm {
    static get properties() {
        return {
            userProfile: { type: Object, value: () => ({}) },
            menuItems: { type: Array, value: () => ([]) },
            menuOpened: { type: Boolean, value: false },
            currentForm: {
                type: Object, 
                value: () => ({
                    hideHeader: true
                })
            }
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
                background: var(--background-color);
                margin-left: 64px;
                display: flex;
                flex-direction: column;
                flex: 1;
                overflow-x: auto;
                overflow-y: auto;
            }

            #btnProfile {
                margin-bottom: 16px;
            }

            #ddProfile {
                width: auto;
                background: var(--background-color);
                color: #3F3F3F;
                padding: 16px 8px;
                border-radius: var(--border-radius);
                box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12);
            }

            pl-icon-button[variant="link"] {
               --primary-base: var(--grey-light);
               --primary-dark: var(--grey-lightest);
               --primary-darkest:#fff;
            }

            .logo {
                transform: scale(1);
                transition: .3s;
                flex-shrink: 0;
            }

            pl-app-side[opened] .logo {
                transform: scale(1.1);
                transition: .3s;
                margin-left: 16px;
            }

            pl-app-side[opened] .icon-open {
                transition: all 0.3s ease-in-out 0s;
                transform: translateX(-41px);
            }
            
            .logo-wrapper {
                min-height: 40px;
                margin: 16px 0;
                verflow: hidden;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                overflow: hidden;
            }

            .close-icon {
                display: none;
            }

            pl-app-side[opened] .close-icon {
                display: inline-flex;
            }

            @keyframes show{
                0%{
                    opacity:0;
                }
                100% {
                    opacity:1;
                }
            }

            .logo{
                height: 32px;
                width: 200px;
                background: url(/front-pl/menu-logo.svg);
                background-repeat: no-repeat;
                background-size: contain;
            }
        `;
    }

    static get template() {
        return html`
            <pl-dataset id="dsMenu" data="{{menuItems}}" endpoint="/front/action/getMenu"></pl-dataset>
            <pl-app-side id="menu" opened={{menuOpened}} items="[[menuItems]]" on-menu-item-selected="[[onMenuItemSelected]]">
            <div slot="logo" class="logo-wrapper">
                    <div class="logo" slot="logo"></div>
                    <pl-icon-button variant="primary" class="close-icon" slot="logo" iconset="pl-default" icon="chevron-left" on-click="[[onMenuButtonClick]]"></pl-icon-button>
                </div>
                <pl-icon-button variant="link"  class="icon-open" slot="logo" iconset="pl-default" icon="menu" on-click="[[onMenuButtonClick]]"></pl-icon-button>
                <pl-flex-layout vertical slot="bottom">
                    <pl-icon-button variant="link" size="24" id="btnProfile" iconset="pl-default" icon="profile"
                        on-click="[[onProfileClick]]"></pl-icon-button>
                </pl-flex-layout>
            </pl-app-side>
            <div class="content">
                <pl-header hidden$="[[currentForm.hideHeader]]" current-form="[[currentForm]]">
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
        `;
    }

    onConnect() {
        this.$.dsMenu.execute();
        this.$.aGetUserProfile.execute();
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