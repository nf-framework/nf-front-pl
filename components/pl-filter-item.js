import { PlElement, html, css } from "polylib";

class PlFilterItem extends PlElement {
    static properties = {
        field: { type: String },
        fieldtype: { type: String },
        value: { type: Object, observer: 'observeValueChanged' },
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
            element.addEventListener('value-changed', ({ detail: { value } }) => {
                this.value = value === undefined || value === '' ? null : value;
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

            this.value = element.value === undefined || element.value === '' ? null : element.value;
            this.notifyChanged();
        }

        this._initiated = true;
    }
    
    disconnectedCallback(){
        super.disconnectedCallback();
        
        this.dispatchEvent(new CustomEvent('filter-removed', { composed: true, bubbles: true }));
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

    observeValueChanged(newVal) {
        const element = this.root.querySelector('slot').assignedElements()[0];
        if (element && element.value !== newVal) {
            element.value = newVal;
        }
    }

    clear() {
        const element = this.root.querySelector('slot').assignedElements()[0];
        if (Object.hasOwn(element, "valueList")) element.valueList = [];
        element.value = null;
    }
}

customElements.define('pl-filter-item', PlFilterItem);