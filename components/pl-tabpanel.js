import { PlElement, html, css } from "polylib";

import '@plcmp/pl-repeat';
import './pl-tab.js';

class PlTabPanel extends PlElement {
    static get properties() {
        return {
            _tabs: { type: Array, value: () => [] },
            active: { type: Number }
        }
    }
    static get css() {
        return css`
			:host {
				display: flex;
				flex-direction: column;
				width: 100%;
				height: 100%;
				box-sizing: border-box;
			}

            .tab-header {
                width: 100%;
                height: 48px;
                position: relative;
                display: flex;
                flex-direction: row;
                gap: 16px;
                box-sizing: border-box;
                overflow: hidden;
                flex-shrink:0;
                background: var(--grey-lightest);
                border: 1px solid var(--grey-light);
            }

            .tab {
                display: flex;
                height: 100%;
                align-items: center;
                color: var(--black-lightest);
                cursor: pointer;
                font: var(--font-md);
                font-weight: 500;
                position: relative;
                flex-shrink:0;
                padding:  0 8px;
                gap: 8px;
                position: relative;
            }

            .suffix:empty, .prefix:empty {
                display: none;
            }

            .tab[active], .tab:hover {
                color: var(--black-dark);
            }

            .tab::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 50%;
                height: 2px;
                width: 0%;
                background: var(--primary-base);
                transition: all 0.5s ease;
            }

            .tab[active]::after {
                width: 100%;
                content:'';
                left: 0;
            }

            .content {
                display: flex;
                height: 100%;
                width: 100%;
                box-sizing: border-box;
                overflow: auto;
            }

            .content ::slotted(*) {
                width: 100%;
                height: 100%;
            }

            .content ::slotted(:not([active])) {
                display: none;
            }
      `;
    }

    static get template() {
        return html`
            <div id="header" class="tab-header">
                <pl-repeat items="[[_tabs]]" id="tab-repiter">
                    <template>
                        <div class="tab" active$="[[item.active]]" on-click="[[onTabClick]]">
                            <span>[[item.header]]</span>
                        </div>
                    </template>
                </pl-repeat>
            </div>
            <div class="content">
                <slot></slot>
            </div>
		`;
    }

	connectedCallback() {
		super.connectedCallback();
        requestAnimationFrame(() => {
            const tabs = Array.prototype.slice.call(this.root.querySelector('.content slot').assignedElements());
            tabs.forEach((tab, idx) => {
                tab.active = idx == 0;
                this.push('_tabs', { 
                    header: tab.header, 
                    active: tab.active,
                    node: tab
                });
            });
        })
        
	}

    onTabClick(event){
        this._tabs.forEach((el, idx) => {
            el.node.active = el == event.model.item;
            this.set(`_tabs.${idx}.active`, el == event.model.item);
        });
    }
}

customElements.define('pl-tabpanel', PlTabPanel);
