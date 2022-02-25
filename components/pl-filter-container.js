import { PlElement, html, css } from "polylib";

class PlFilterContainer extends PlElement {
    static get properties() {
        return {
            data: { type: Array },
            _filters: {
                type: Array,
                value: () => ([])
            }
        }
    }

    static get template() {
        return html`
            <slot></slot>
        `;
    }

    static get css() {
        return css`
            :host {
                all: inherit;
            }
        `
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('filter-changed', this.onFilterChanged.bind(this));
    }


    onFilterChanged(event) {
        const filter = this._filters.find(x => x.field == event.detail.field);
        if (filter) {
            filter.value = event.detail.value;
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
        const items = this.getFilterItems();
        items.forEach((item) => {
            item.clear();
        });
    }
}

customElements.define('pl-filter-container', PlFilterContainer);