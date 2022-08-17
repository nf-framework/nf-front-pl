import { PlElement, html, css } from "polylib";

class PlFilterContainer extends PlElement {
    static properties = {
        data: { type: Array },
        _filters: {
            type: Array,
            value: () => ([])
        }
    }

    static css = css`
        :host {
            display: contents;
        }
    `;

    static template = html`
        <slot></slot>
    `;

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('filter-changed', this.onFilterChanged.bind(this));
    }


    onFilterChanged(event) {
        const filter = this._filters.find(x => x.field == event.detail.field && x.operator == event.detail.operator);
        if (filter) {
            this.set(`_filters.${this._filters.indexOf(filter)}.value`, event.detail.value);
        } else {
            this.push('_filters', {
                field: event.detail.field,
                fieldtype: event.detail.fieldtype,
                value: event.detail.value,
                operator: event.detail.operator,
                cast: event.detail.cast
            });
        }
    }

    getFilterItems() {
        return Array.prototype.slice.call(this.querySelectorAll('pl-filter-item'));
    }

    applyFilters() {
        this.set('data.filters', this._filters.filter(x => x.value != null));
    }

    clearFilters() {
        this.splice('data.filters', 0, this.data.filters.length);
        this.splice('_filters', 0, this._filters.length);

        const items = this.getFilterItems();
        items.forEach((item) => {
            item.clear();
        });
    }
}

customElements.define('pl-filter-container', PlFilterContainer);