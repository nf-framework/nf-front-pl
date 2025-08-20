import { PlElement, html, css } from "polylib";

class PlFilterItem extends PlElement {
    #lockObserver = false;
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

        this._elementControl = this.root.querySelector('slot').assignedElements()[0];
        if (this._elementControl) {
            this._elementControl.addEventListener('value-changed', (event) => {
                this.#lockObserver = true;
                this.value = event.detail.value;
                this.#lockObserver = false;
                this.notifyChanged();
            });

            const constructor = customElements.get(this._elementControl.tagName.toLowerCase());
            if (constructor && constructor.properties && 'operator' in constructor.properties) {
                this.operator = this._elementControl.operator || '=';
                this._elementControl.addEventListener('operator-changed', ({ detail }) => {
                    this.operator = detail.value;
                    this.notifyChanged();
                });
            }

            this.#lockObserver = true;
            this.value = this._elementControl.value;
            this.notifyChanged();
            this.#lockObserver = false;
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

    observeValueChanged(newVal) {
        if (this.#lockObserver) return; 

        if (this._elementControl && this._elementControl.value !== newVal) {
            this._elementControl.value = newVal;
        }
    }

     clear() {
        if (this._elementControl) {
            this._elementControl.value = null;
        }
    }
}

customElements.define('pl-filter-item', PlFilterItem);