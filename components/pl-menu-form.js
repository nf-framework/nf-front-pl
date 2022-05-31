import { PlElement, html, css } from "polylib";

import '@plcmp/pl-repeat';
import './pl-menu-form-item.js';

class PlMenuForm extends PlElement {
    static get properties() {
        return {
            items: { type: Array, value: () => [] },
            selected: { type: String, value: '', observer: '_selectedChange' },
            scrollable: { type: Boolean }
        }
    }
    static get css() {
        return css`
            :host {
                display: flex;
                height: 100%;
                width: 100%;
                box-sizing: border-box;
            }
            
            .left-nav {
                width: 250px;
                height: 100%;
                box-sizing: border-box;
                background-color: #F2F2F2;
                padding: 16px;
            }
            
           
            #menu {
                display: flex;
                flex-direction: column;
                width: 200px;
                height: 100%;
                border-right: 1px solid var(--grey-light);
                padding-top: 16px;
                box-sizing: border-box;
                gap: 4px;
                position: relative;
                flex-shrink: 0;
            }

            .menu-item {
                height: 28px;
                border-radius: 4px 0 0 4px;
                padding: 6px 12px;
                box-sizing: border-box;
                font-size: 13px;
                line-height: 16px;
                display: flex;
                align-items: center;
                color: #464B52;
                cursor: pointer;
                gap: 8px;
            }

            .menu-item:hover, .menu-item[active] {
                background: var(--primary-base);
                color: var(--primary-lightest);
                font-weight: 500;
            }

            .bottom {
                position: absolute;
                bottom: 0px;
                padding-right: 16px;
                width: 100%;
                display: flex;
                box-sizing: border-box;
            }

            .main-container {
                display: flex;
                flex-direction: row;
                border-top: 1px solid var(--grey-base);
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                gap: 16px;
            }

            .content {
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
                overflow-y: auto;
                box-sizing: border-box;
                padding-right: 16px;
                padding-top: 16px;
                gap: 16px;
            }
            .mark {
                display: flex;
                width: 8px;
                height: 8px;
                background: var(--attention);
                border-radius: 8px;
            }

            .mark[hidden] {
                display: none;
            }
      `;
    }

    static get template() {
        return html`
            <div class="main-container">
                <div id="menu">
                    <pl-repeat items="[[items]]">
                        <template>
                            <div class="menu-item" active$="[[item.active]]" name$="[[item.name]]" on-click="[[onMenuClick]]">
                                [[item.title]]
                                <div class="mark" hidden$="[[!item.invalid]]"></div>
                            </div>
                        </template>
                    </pl-repeat>
                    <div class="bottom">
                        <slot name="buttons"></slot>
                    </div>
                </div>
                <div class="content" on-scroll="[[onScroll]]">
                    <slot></slot>
                </div>
            </div>
		`;
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('pl-menu-form-item-change', this.observationHappended);
        setTimeout(() => {
            this.observationHappended();
        }, 300)
    }

    onMenuClick(event) {
        if(this.scrollable) {
            this.selected = null;
        }
        this.selected = event.model.item.name;
    }

    observationHappended() {
        let prepared_items = []
        let items = Array.prototype.slice.call(this.querySelectorAll('PL-MENU-FORM-ITEM'));
        for (let item of items) {
            let path = 'items';
            let groupName = item.getAttribute('group');
            let item_cont = prepared_items;
            if (groupName) {
                let parentItem = prepared_items.find(x => x.title === groupName && x.name == null);
                if (!parentItem) {
                    parentItem = {
                        items: [],
                        title: groupName,
                        path: `${path}.${item_cont.length}`
                    };

                    prepared_items.push(parentItem)
                }

                item_cont = parentItem.items;
                path = parentItem.path + '.items';
            }

            let descriptor = {
                invalid: item.invalid,
                name: item.getAttribute('name'),
                title: item.label,
                hidden: item.hasAttribute('hidden'),
                dom: item
            }
            let l = item_cont.push(descriptor);
            descriptor.path = `${path}.${l - 1}`;
            item._descriptor = descriptor;
        }
        this.items = prepared_items;
        if (this.selected) {
            if(this.scrollable) {
                let tDom = this.querySelector(`[name=${this.selected}]`);
                this.lastTop = null;
                this.setActiveScroll(tDom);
            } else {
                this._selectedChange(this.selected);
            }
        }
    }

    scrollTo(targetname) {
        if (Array.isArray(this.items) && this.items.length > 0) {
            let firstSectionName = this.items[0].name || this.items[0].items[0].name;
            let tDom = this.querySelector(`[name=${targetname}]`);
            if (targetname && (targetname !== firstSectionName) && tDom) {
                tDom.scrollIntoView({ behavior: 'smooth', block: 'start', });
            }
            else if (targetname === firstSectionName && tDom) {
                tDom.scrollIntoView({ behavior: 'smooth', block: 'end', });
            }
        }
    }

    onScroll(event) {
        if (this.scrollable) {
            const scrolltop = event.target.scrollTop;
            let items = Array.prototype.slice.call(this.querySelectorAll('PL-MENU-FORM-ITEM'));
            items = items.filter(i => !i._descriptor.items)
            let top = items.find(i => i.offsetTop >= scrolltop);
            if (top) {
                this.setActiveScroll(top);
            }
        }
    }

    setActiveScroll(top) {
        if (top && top != this.lastTop) {
            if (this.lastTop) {
                this.set(`${this.lastTop._descriptor.path}.active`, false)
            }
            if (top._descriptor) {
                this.set(`${top._descriptor.path}.active`, true);

                this.lastTop = top;
            }
        }
    }
    _selectedChange(selected) {
        if (this.scrollable) {
            this.scrollTo(selected);
        }
        else {
            this.items.forEach((item) => {
                if (item.name == selected) {
                    this.set(`items.${this.items.findIndex(x => x.name == selected)}.active`, true);
                    item.dom.removeAttribute('hidden');
                } else {
                    this.set(`items.${this.items.indexOf(item)}.active`, false);
                    item.dom.setAttribute('hidden', 'hidden');
                }
            });
        }
    }
}

customElements.define('pl-menu-form', PlMenuForm);
