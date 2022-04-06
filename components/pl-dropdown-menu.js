import { PlElement, html, css } from "polylib";
import '@plcmp/pl-dropdown';

class PlDropdownMenu extends PlElement {
    static get properties() {
        return {
            /**
             * Является ли этот компонент элементом подменю.
             * @memberOf NfDropdownMenu
             * @private
             */
            _isSubMenu: {
                type: Boolean
            }
        };
    }

    static get css() {
        return css`
            pl-dropdown[opened] {
                display: flex;
                flex-direction: column;
                background: var(--surface-color);
                border-radius: var(--border-radius);
                box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);
                min-width: var(--content-width);
                box-sizing: border-box;
                overflow: auto;
                padding: var(--space-md) 0;
            }`
    }

    static get template() {
        return html`
            <pl-dropdown id="dd">
                <slot></slot>
            </pl-dropdown>
        `;
    }

    open(target, fitInto, opts) {
        this.$.dd.open(target, fitInto, opts);
    }

    close(){
        this.$.dd.close();
    }
}
customElements.define('pl-dropdown-menu', PlDropdownMenu);
