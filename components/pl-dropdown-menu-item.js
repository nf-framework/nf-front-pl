import { PlElement, html, css } from "polylib";
import '@plcmp/pl-icon';

class PlDropdownMenuItem extends PlElement {
    static properties = {
        label: {
            type: String
        },
        disabled: {
            type: Boolean,
            reflectToAttribute: true
        }
    };

    static css = css`
        :host{
            box-sizing: border-box;
            padding: 0 var(--space-sm);
            min-height: var(--base-size-md);
            width: 100%;
            font: var(--text-font);
            color: var(--text-color);
            display: flex;
            align-items: center;
            cursor: pointer;
        }

        .content {
            width: 100%;
        }
        .prefix {
            display: flex;
        }

        .prefix ::slotted(*) {
            margin-right: var(--space-sm);
            width: 16px;
            height: 16px;
        }

        .suffix {
            display: flex;
        }

        .suffix ::slotted(*) {
            margin-left: var(--space-sm);
            width: 16px;
            height: 16px;
        }

        :host(:hover){
            background-color: var(--grey-lightest)
        }
        :host([disabled]){
            color: var(--grey-base);
            pointer-events: none;
        }
        :host([hidden]){
            display: none;
        }
    `;

    static template = html`
        <span class="prefix">
            <slot name="prefix"></slot>
        </span>
        <div class="content">
            [[label]]
            <slot></slot>
        </div>
        <span class="suffix">
            <slot name="suffix"></slot>
        </span>
    `;

    connectedCallback() {
        super.connectedCallback();

        this.addEventListener('mouseenter', (e) => {
            this.openSubMenu(e);
        });
        this.addEventListener('mouseleave', (e) => {
            this.closeSubMenu();
        });

        this.addEventListener('click', (e) => {
            if (this.openSubMenu(e)) {
                return;
            }
            if (this.closeSubMenu()) {
                return;
            }

            function closeMenu(item) {
                let menu = item.parentNode;
                while (menu && menu.localName !== 'pl-dropdown-menu') {
                    menu = menu.parentNode;
                }
                if (!menu) {
                    return;
                }
                menu.$.dd.close();;
                if (menu.parentNode.localName === 'pl-dropdown-menu-item') {
                    closeMenu(menu.parentNode);
                }
            }
            closeMenu(this)
        })
    }

    openSubMenu(e) {
        let submenu = this.querySelector('pl-dropdown-menu');
        if (submenu && !submenu.$.dd.opened) {
            submenu.$.dd.direction = 'right';
            submenu.open(this);
           
            return true;
        }
        return false;
    }

    /**
     * Закрытие подменю внутри выпадающего меню.
     * @return {boolean} - был ли найден элемент меню/подменю и находился ли он в открытом состоянии
     */
    closeSubMenu() {
        let submenu = this.querySelector('pl-dropdown-menu');
        if (submenu && submenu.$.dd.opened) {
            submenu.$.dd.close();
            return true;
        }
        return false;
    }
}

customElements.define('pl-dropdown-menu-item', PlDropdownMenuItem);
