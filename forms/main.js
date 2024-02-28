import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class MainView extends PlForm {
    static properties = {
        userProfile: { type: Object, value: () => ({}) },
        menuItems: { type: Array, value: () => ([]) },
        menuOpened: { type: Boolean, value: false },
        currentForm: { type: Object },
        currentThread: { type: Object },
        breadcrumbs: { type: Array },
        singleThread: { type: Boolean },
        menuManualHide: { type: Boolean },
        dashboard: { type: String }
    };

    static css = css`
        :host {
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
        }

        .username {
            font-weight: bold;
            text-transform: uppercase;
            white-space: nowrap;
        }
        
        .content {
            background: var(--pl-background-color);
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow-x: auto;
            overflow-y: auto;
        }

        #ddProfile {
            width: auto;
            background: var(--pl-background-color);
            color: #3F3F3F;
            padding: 16px 8px;
            border-radius: var(--pl-border-radius);
            box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12);
        }

        pl-icon-button[variant="link"] {
            --pl-primary-base: var(--pl-grey-light);
            --pl-primary-dark: var(--pl-grey-lightest);
            --pl-primary-darkest:#fff;
        }

        .logo-wrapper {
            height: 40px;
            margin: 16px 8px;
            display: flex;
            align-items: center;
            overflow: hidden;
        }

        .menu {
            display: flex;
            margin: 8px 0;
            align-self: flex-end;
            min-width: 64px;
            justify-content: center;
        }

        .profile {
            width: 64px;
            display: flex;
            justify-content: center;
        }

        #btnProfile {
            margin: 8px 0 16px 0;
            align-self: flex-start;
        }

        #btnMenu {
            margin: 8px 0;
            align-self: flex-end;
        }

        .logo{
            height: 28px;
            width: 200px;
            flex-shrink: 0;
            background: url(/static/menu-logo.svg);
            background-repeat: no-repeat;
            background-size: contain;
        }
        
        #formManager {
            padding: 0 var(--pl-space-lg) var(--pl-space-lg) var(--pl-space-lg);
        }
    `;

    static template = html`
        <pl-dataset id="dsMenu" data="{{menuItems}}" endpoint="/front/action/getMenu"></pl-dataset>
        <pl-app-side id="menu" opened={{menuOpened}} items="[[menuItems]]" on-menu-item-selected="[[onMenuItemSelected]]" manual-hide="[[menuManualHide]]">
            <div slot="top" class="logo-wrapper">
                <div class="logo"></div>
            </div>
            <div class="menu" slot="top">
                <pl-icon-button variant="link" size="24" class="icon-open" slot="top" iconset="pl-default" icon="[[menuIcon(menuOpened)]]"
                    on-click="[[onMenuButtonClick]]" id="btnMenu"></pl-icon-button>
            </div>
            <div class="profile" slot="bottom">
                <pl-icon-button id="btnProfile" variant="link" size="24"  iconset="pl-default" icon="profile"
                on-click="[[onProfileClick]]"></pl-icon-button>
            </div>
        </pl-app-side>
        <div class="content">
            <pl-forms-manager id="formManager" current-form="{{currentForm}}" current-thread="{{currentThread}}" single-thread="[[singleThread]]" dashboard="[[dashboard]]">
                <pl-header hidden="[[isHeaderHidden(currentForm)]]" current-form="[[currentForm]]" breadcrumbs="[[breadcrumbs]]" on-breadcrumb-click="[[onBreadCrumbsClick]]">
                    [[currentForm.headerTemplate]]
                </pl-header>
            </pl-forms-manager>
            <pl-router id="router" disable-history current-form="{{currentForm}}" current-thread="[[currentThread]]"
                form-manager="[[$.formManager]]"></pl-router>
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

    onConnect() {
        this.singleThread = NF?.config?.front?.formManager?.singleThread === true;
        this.dashboard = NF?.config?.front?.formManager?.dashboard;
        this.menuManualHide = NF?.config?.front?.mainMenu?.manualHide === true;
        this.$.dsMenu.execute();
        this.$.aGetUserProfile.execute().then(res => NF.user = {...res});
        addEventListener('form-change', e => this.onFormChange());
        if (this.menuManualHide) {
            //save state to localstorage
            let m = localStorage.getItem('mainMenuOpened');
            if (m)
                this.menuOpened = m === 'true';
            else
                this.menuOpened = NF?.config?.front?.mainMenu?.defaultOpened === true;
        }
    }

    onMenuButtonClick() {
        this.menuOpened = !this.menuOpened;
        if (this.menuManualHide) {
            //save state to localstorage
            localStorage.setItem('mainMenuOpened', this.menuOpened);
        }
    }

    async onMenuItemSelected(event) {
        if (event.detail.form) {
            this.$.menu.close();
            await this.$.formManager.open(event.detail.form, { newThread: event.detail.newThread, extKey: event.detail.form });
        } else if (event.detail.url) {
            if (event.detail.url.startsWith('config://')) {
                const configName = event.detail.url.replace('config://', '');
                const url = NF?.config?.[configName];
                if(!url) {
                    console.log(`Параметр конфигурации ${configName} не объявлен`);
                    return;
                }
                window.open(url, '_blank');
            } else {
                window.open(event.detail.url, '_blank');
            }
        }
    }

    onProfileClick() {
        this.$.ddProfile.open(this.$.btnProfile)
    }

    async onLogoutClick() {
        await this.$.aLogout.execute();
        document.location.reload();
    }
    isHeaderHidden(form) {
        return !form || form.hideHeader;
    }
    onFormChange() {
        this.breadcrumbs = this.currentThread.node.openedForms.filter(x => !x.isModal).map( i => ({ title: i.formTitle, form: i })).slice(0,-1);
    }
    async onBreadCrumbsClick(e) {
        while (this.currentForm != e.detail?.form && !this.currentForm._dashboard) {
            let r = await this.currentForm.close();
            if (r === false) break;
        }
    }
    menuIcon(x) {
        return x ? 'chevron-left' : 'chevron-right';
    }
}