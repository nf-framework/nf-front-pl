import { PlElement, html, css } from "polylib";


import '@plcmp/pl-icon';
import '@plcmp/pl-iconset-default';
import '@plcmp/pl-input';

class PlComboinput extends PlElement {
    static properties = {
        value: { type: String, value: null, observer: '_valueObserver' },
        text: { type: String },
        selected: { type: Object, value: null, observer: '_selectedObserver' },
        contentWidth: { type: Number },
        labelWidth: { type: Number },
        label: { type: String },
        required: { type: Boolean },
        readonly: { type: Boolean },
        invalid: { type: Boolean },
        variant: { type: String, value: 'text', observer: '_variantObserver' },
        orientation: { type: String },
        stretch: { type: Boolean, reflectToAttribute: true },
        placeholder: { type: String },
        textProperty: { type: String, value: 'text' },
        valueProperty: { type: String, value: 'value' },
        titleProperty: { type: String, value: undefined },

        disabled: { type: Boolean, reflectToAttribute: true },
        hidden: { type: Boolean, reflectToAttribute: true },

        multiSelect: { type: Boolean, value: false, observer: '_multiSelectObserver' },
        valueList: { type: Array, value: () => [], observer: '_valueListObserver' },
        selectedList: { type: Array, value: () => [], observer: '_selectedListObserver' },
        _multiTemplate: { type: Object }
    };

    static css = css`
        :host {
            min-width: 0;
            flex-shrink: 0;
        }s

        :host([hidden]) {
            display: none;
        }

        :host([stretch]) {
            width: 100%;
            flex-shrink: 1;
        }

        :host([disabled]) pl-icon-button {
            pointer-events: none;
        }

        :host([disabled]) pl-icon {
            pointer-events: none;
        }

        .tag {
            display: flex;
            background: var(--primary-lightest);
            box-sizing: border-box;
            border: 1px solid var(--primary-light);
            border-radius: 4px;
            width: auto;
            height: 20px;
            max-width: 140px;
            padding: 0 4px;
            align-items: center;
        }

        .tag pl-icon {
            cursor: pointer;
        }

        .tag:last-child {
            margin-right: 2px;
        }

        .tag-text {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .tag-cont {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }

        .text-cont {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    `;
    static tagsTemplate = html`
        <div slot="input" class="tag-cont">
            <div class="tag" d:repeat="[[selectedList]]">
                <span class="tag-text" title$=[[_getTagTitle(item)]]>[[_getTagText(item)]]</span>
                <pl-icon hidden="[[readonly]]" iconset="pl-default" size="16" icon="close-s" on-click="[[_onRemoveTagClick]]"></pl-icon>
            </div>
        </div>
    `;

    static textTemplate = html`
        <div slot="input" class="text-cont" title$=[[_getTitleForMulti(selectedList)]]>
            [[_getTextForMulti(selectedList)]]
        </div>
    `;
    static template = html`
        <pl-input content-width="[[contentWidth]]" label-width="[[labelWidth]]" stretch="[[stretch]]" readonly
            disabled="{{disabled}}" id="input" placeholder="[[_getPlaceholder(placeholder, selectedList)]]" value="{{text}}" required="[[required]]"
            invalid="{{invalid}}" label="[[label]]" orientation="[[orientation]]" on-dblclick="[[_onMenuClick]]">
            <slot name="prefix" slot="prefix"></slot>
            [[_multiTemplate]]
            <slot name="suffix" slot="suffix"></slot>
            <slot name="label-prefix" slot="label-prefix"></slot>
            <slot name="label-suffix" slot="label-suffix"></slot>
            <pl-icon-button variant="link" hidden="[[_isClearHidden(value, selectedList, readonly)]]" slot="suffix"
                iconset="pl-default" size="12" icon="close" on-click="[[_onClearClick]]"></pl-icon-button>
            <pl-icon-button variant="link" hidden="[[readonly]]" iconset="pl-default" slot="suffix" size="16"
                icon="more-horizontal" on-click="[[_onMenuClick]]"></pl-icon-button>
        </pl-input>
    `;

    connectedCallback() {
        super.connectedCallback();
        this.$.input.validators = [this.validator.bind(this)];
    }

    _getPlaceholder(placeholder, selectedList){
        if(this.multiSelect && selectedList.length > 0) {
            return '';
        } else{
            return placeholder || '';
        }
    }

    _variantObserver() {
        this._multiSelectObserver();
    }

    _selectedObserver(val) {
        if(val) {
            this.set('value', this.selected[this.valueProperty]);
            this.set('text', this.selected[this.textProperty]);
        } else {
            this.set('value', null);
            this.set('text', null);
        }
    }

    _valueObserver(val) {
        this.$.input.validate();
    }

    _valueListObserver() {
        this.$.input.validate();
    }

    _multiSelectObserver() {
        if(this.multiSelect) {
            if(this._multiTemplate != PlComboinput.tagsTemplate && this.variant == 'tags') {
                this._multiTemplate = PlComboinput.tagsTemplate;
            } 

            if(this._multiTemplate != PlComboinput.textTemplate && this.variant == 'text') {
                this._multiTemplate = PlComboinput.textTemplate;
            }
        }
    }

    validator() {
        let messages = [];
        if (this.multiSelect) {
            if (this.valueList.length === 0 && this.required) {
                messages.push('Значение не может быть пустым');
            }
        } else if ((this.value === null || this.value === undefined) && this.required) {
            messages.push('Значение не может быть пустым');
        }

        return messages.length > 0 ? messages.join(';') : undefined;
    }

    _isClearHidden() {
        return this.readonly || !this.value && this.selectedList.length === 0;
    }

    _onMenuClick(e) {
        if (!this.readonly && !this.disabled) 
            this.dispatchEvent(new CustomEvent('menuClick', { detail: e.detail }));
    }

    _onRemoveTagClick(event) {
        event.stopPropagation();
        this.splice('selectedList', this.selectedList.findIndex(x => x[this.valueProperty] == event.model.item[this.valueProperty]), 1);
    }

    _getTagText(item) {
        return item[this.textProperty];
    }

    _getTagTitle(item) {
        return this.titleProperty ? item[this.titleProperty] : item[this.textProperty];
    }

    _onClearClick(event) {
        this.text = null;

        if (this.multiSelect) {
            this.splice('selectedList', 0, this.selectedList.length);
        } else {
            this.value = null;
        }

        event.stopImmediatePropagation();
    }

    _selectedListObserver(newValues, old, mut) {
        if (this.inStack) { return; }
        this.inStack = true;

        this.valueList = this.selectedList.map(x => x[this.valueProperty]);
        this.inStack = false;
    }

    _getTextForMulti(selectedList) {
        return selectedList.length === 0 ? '' : (this._getTagText(selectedList[0]) + (selectedList.length > 1 ? ` (+${this.selectedList.length - 1})` : ''));
    }

    _getTitleForMulti(selectedList) {
        if(selectedList.length == 0) {
            return '';
        } 
        
        return selectedList.map(x => this._getTagText(x)).join('\n');
    }
}

customElements.define('pl-comboinput', PlComboinput);