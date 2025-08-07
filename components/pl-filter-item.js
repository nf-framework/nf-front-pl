import { PlElement, html, css } from "polylib";

class PlFilterItem extends PlElement {
    static properties = {
        field: { type: String },
        fieldtype: { type: String },
        value: { type: Object },
        operator: { type: String },
        cast: { type: String }
    }

    static template = html`
        <slot></slot>
    `;
    
    connectedCallback() {
        super.connectedCallback();
        if (this._initiated) return;

        let element = this.root.querySelector('slot').assignedElements()[0];
        if (element) {
            element.addEventListener('value-changed', (event) => {
                this.value = event.detail.value;
                this.notifyChanged();
            });

            const constructor = customElements.get(element.tagName.toLowerCase());
            if (constructor && constructor.properties && 'operator' in constructor.properties) {
                this.operator = element.operator || '=';
                element.addEventListener('operator-changed', ({ detail }) => {
                    this.operator = detail.value;
                    this.notifyChanged();
                });
            }

            this.value = element.value;
            this.notifyChanged();
        }

        this._initiated = true;
    }

    notifyChanged() {
        this.dispatchEvent(new CustomEvent('filter-changed', {
            detail: {
                field: this.field,
                fieldtype: this.fieldtype,
                value: this.value,
                operator: this.operator,
                cast: this.cast
            },
            composed: true,
            bubbles: true
        }));
    }

    clear() {
        this.root.querySelector('slot').assignedElements()[0].value = null;
    }
}

customElements.define('pl-filter-item', PlFilterItem);