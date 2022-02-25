import { PlElement, html, css } from "polylib";
import '@plcmp/pl-repeat';
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
                --menu-color: var(--menu-background-color);
                --menu-background: var(--white);
            }

            :host([variant=main]) {
                --menu-color: var(--white);
                --menu-background: var(--menu-background-color);
            }

            .items-flex {
                display: flex;
                align-items: center;
                height: 40px;
                position: relative;
                cursor: pointer;
                color: var(--menu-color);
                --pl-icon-fill-color: var(--menu-color);
            }

            .items-flex pl-icon {
                padding: 0 24px;
            }

            .items-flex:hover{
                background-color: var(--menu-color);
                color: var(--menu-background);
                --pl-icon-fill-color: var(--menu-background);
            }

            .submenu-title {
                font-size: 21px;
                margin: 8px 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid #c3c3c3;
                color: rgb(72, 83, 99);
            }

            .submenu-title pl-icon-button {
                color: rgb(72, 83, 99);
            }

            .submenu-title:empty {
                display: none;
            }

            .submenu-caption {
                user-select: none;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow-x: hidden;
                flex-grow: 1;
            }

            :host([opened]) .submenu-caption {
                display: inline-flex;
			}

            :host([opened]) .chevron {
                display: inline-flex;
			}

            :host([variant="main"]) .submenu-title {
                display: none;
            }
        `;
    }

    static get template() {
        return html`
            <div class="submenu-title">
                [[parent.caption]]
            </div>
            <pl-repeat items="[[items]]">
                <template>
                    <div class="items-flex" on-click="[[onMenuClick]]">
                        <pl-icon iconset="pl-default" icon="[[item.icon]]"></pl-icon>
                        <span class="submenu-caption">[[item.caption]]</span>
                    </div> 
                </template>
            </pl-repeat>
        `;
    }

    onMenuClick(event) {
        this.dispatchEvent(new CustomEvent('menuClick', { detail: event.model.item, bubbles: true, composed: true }));
    }
}

customElements.define("pl-app-side-list", PlAppSideList);