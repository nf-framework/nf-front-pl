import { PlElement, html, css } from "polylib";
import "@plcmp/pl-dropdown";

class PlAutocomplete extends PlElement {
    static properties = {
        text: { type: String, observer: 'textObserver' },
        textProperty: { type: String },
        value: { type: String },
        valueProperty: { type: String },
        searchProperty: { type: String },
        data: { type: Array, observer: 'textObserver' },
        vdata: { type: Array },
        selected: { type: Object },
        target: { type: Object }
    }

    static css = css`
        pl-dropdown {
            background: var(--surface-color);
            border-radius: var(--border-radius);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            border: 1px solid var(--grey-lightest);
            max-height: var(--dropdown-max-height, 254px);
            min-width: var(--content-width);
            box-sizing: border-box;
            overflow: auto;
            padding: 0;
            overscroll-behavior: contain;
        }

        .comboitem {
            box-sizing: border-box;
            padding: 2px var(--space-sm);
            min-height: var(--base-size-md);
            width: 100%;
            font: var(--text-font);
            color: var(--text-color);
            display: flex;
            align-items: center;
            cursor: pointer;
        }

        .comboitem:hover {
            background-color: var(--grey-lightest)
        }
    `

    static template = html`
        <pl-dropdown id="dd">
            <div class="comboitem" on-click="[[_onSelect]]" d:repeat="{{vdata}}">
                <div inner-h-t-m-l="[[_itemText(item, searchProperty, text)]]"></div>
            </div>
        </pl-dropdown>
    `;

    textObserver() {
        if (this._flag || !this.text || this.data.length == 0) { if (this.$.dd) { this.$.dd.close(); } return }
        this.vdata = this.data.filter(x => x[this.searchProperty].toLowerCase().includes(this.text.toLowerCase()));
        this.$.dd.open(this.target);
        this.$.dd.style.minWidth = this.target.offsetWidth + 'px';
    }

    _itemText(item, textProperty, text) {
        if (text) {
            const txtPart = item[textProperty].match(new RegExp(text, 'i'));
            return item[textProperty].replace(new RegExp(text, 'i'), `<b>${txtPart?.[0]}</b>`);
        }

        return item[textProperty];
    }

    _onSelect(event) {
        this.selected = event.model.item;
        this._flag = true;
        this.text = this.selected[this.textProperty];
        this.value = this.selected[this.valueProperty];
        this._flag = false;
        this.$.dd.close();
    }
}

customElements.define('pl-autocomplete', PlAutocomplete);