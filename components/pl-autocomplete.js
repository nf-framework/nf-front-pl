import { PlElement, html, css } from "polylib";

class PlAutocomplete extends PlElement {
    static properties = {
        search: { type: String, observer: 'searchObserver' },
        textProperty: { type: String },
        valueProperty: { type: String },
        data: { type: Array },
        value: { type: String },
        vdata: { type: Array },
        selected: { type: Object },
        _openedForDomIf: { type: Boolean },
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
                <div inner-h-t-m-l="[[_itemText(item, textProperty, search)]]"></div>
            </div>
        </pl-dropdown>
    `;

    searchObserver(val) {
        if (this._flag || !val) { this.$.dd.close(); return }
        this.vdata = this.data.filter(x => x[this.textProperty].toLowerCase().includes(val.toLowerCase()));
        this.$.dd.open(this.target);
    }

    _itemText(item, textProperty, search) {
        if (search) {
            const txtPart = item[this.textProperty].match(new RegExp(search, 'i'));
            return item[this.textProperty].replace(new RegExp(search, 'i'), `<b>${txtPart?.[0]}</b>`);
        }

        return item[textProperty];
    }

    _onSelect(event) {
        this.selected = event.model.item;
        this._flag = true;
        this.search = this.selected[this.textProperty];
        this._flag = false;
        this.$.dd.close();
    }
}

customElements.define('pl-autocomplete', PlAutocomplete);