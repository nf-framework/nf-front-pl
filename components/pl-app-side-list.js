import { PlElement, html, css } from "polylib";
import '@plcmp/pl-icon';

class PlAppSideList extends PlElement {
    static get properties() {
        return {
            items: { type: Array },
            parent: { type: Object }
        };
    }

    static get css() {
        return css`
            :host {
                height: 100%;
                transition: 0.3s;
                box-sizing: border-box;
            }

            :host([variant=main]) {
                color: var(--menu-text-color);
            }

            :host([variant="main"]) .items-flex:hover {
                --menu-background-color: var(--primary-base);
                color: var(--primary-lightest);
                transition: 0.3s;
            }

            .items-flex {
                --menu-text-color: #464B52;
                display: flex;
                align-items: center;
                height: 48px;
                cursor: pointer;
                transition: 0.3s;
            }

            .items-flex:hover {
                --menu-background-color: #F5F6F7;
                background-color: var(--menu-background-color);
            }

            .items-flex pl-icon {
                --menu-text-color: #464B52;
                padding: 0 12px;
            }

            :host([variant="main"]) pl-icon {
                padding: 0 24px;
            }

            .submenu-title {
                --menu-text-color: #1C273D;
                font-size: 16px;
                font-weight: 700;
                margin: 12px;
            }

            .submenu-title pl-icon-button {
                --menu-text-color: #1C273D;
            }

            .submenu-title:empty {
                display: none;
            }

            .submenu-caption {
                user-select: none;
                flex-grow: 1;
                
            } 

            :host([opened]) .chevron {
                display: inline-flex;
			}

            :host([variant="main"]) .submenu-title {
                display: none;
            }
          .icon {
            width: 16px;
          }
        `;
    }

    static get template() {
        return html`
            <div class="submenu-title">
                [[parent.caption]]
            </div>
            <template d:repeat="{{items}}">
                <div class="items-flex" on-click="[[onMenuClick]]">
                    <pl-icon class="icon" iconset="pl-default" icon="[[item.icon]]"></pl-icon>
                    <span class="submenu-caption">[[item.caption]]</span>
                    <pl-icon iconset="pl-default" hidden="[[!item.hasChildren]]" icon="chevron-right"></pl-icon>   
                </div> 
            </template>
        `;
    }

    onMenuClick(event) {
        this.dispatchEvent(new CustomEvent('menuClick', { detail: {...event.model.item, newThread: event.shiftKey }, bubbles: true, composed: true }));
    }
}

customElements.define("pl-app-side-list", PlAppSideList);