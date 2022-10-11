import { PlElement, html, css } from "polylib";

class PlCard extends PlElement {
    static properties = {
        header: { type: String },
        fit: { type: Boolean, reflectToAttribute: true },
        stretch: { type: Boolean, reflectToAttribute: true },
        hidden: { type: Boolean, reflectToAttribute: true },
        border: { type: Boolean, reflectToAttribute: true }
    }

    static css = css`
        :host{
            display: flex;
            flex-direction: column;
            width: fit-content;
            height: fit-content;
            box-sizing: border-box;
            flex-shrink: 0;
            overflow: hidden;
            gap: 8px;
            max-width: 100%;
        }

        :host([border]) {
            border: 1px solid var(--grey-base);
            border-radius: var(--border-radius);
            padding: 8px 8px 8px 8px;
        }

        :host([hidden]) {
            display: none;
        }

        :host([stretch]) {
            width: 100%;
            flex-shrink: 1;
            overflow: visible;
        }

        :host([fit]) {
            height: 100%;
            width: 100%;
            flex: 1;
        }

        .header[hidden] {
            display: none;
        }

        .header {
            display: flex;
            flex-direction: row;
            align-items: center;
            box-sizing: border-box;
            justify-content: space-between;
        }

        .header-text-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            box-sizing: border-box;
            justify-content: space-between;
            gap: 8px;
            overflow:hidden;
            min-height: 32px;
        }

        .header-text {
            font: var(--font-h1);
            color: var(--black-base);
            text-align: start;
            flex: 1 1 0%;
        }

        .content {
            height: 100%;
            width: 100%;
        }

        .tools ::slotted(*) {
            margin-left: 8px;
        }
    `;

    static template = html`
        <div class="header" hidden$=[[!header]]>
            <div class="header-text-container">
                <slot name="header-prefix"></slot>
                <span class="header-text">[[header]]</span>
                <slot name="header-suffix"></slot>
            </div>
            <span class="tools">
                <slot name="tools"></slot>
            </span>
        </div>
        <div class="content">
            <slot></slot>
        </div>
        <slot name="footer"></slot>
    `;
}

customElements.define('pl-card', PlCard);
