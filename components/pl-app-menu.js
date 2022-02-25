import {PlElement, html, css} from "polylib";
import { addOverlay, removeOverlay } from "@plcmp/utils";

class PlAppMenu extends PlElement {
    static get properties() {
        return {
            opened: { type: Boolean, reflectToAttribute: true, observer: 'openedObserver', value: false }
        }
    }

    static get css() {
        return css`
            :host {
                position: absolute;
                overflow: hidden;
                width: 300px;
                height: 100%;
                top: 0;
                right: 0;
                bottom: 0;
                left:0;
                will-change: contents;
                transform: translate3d(-130%, 0px, 0px);
                border-left: 1px solid rgb(66, 67, 106);
                visibility: hidden;
                flex-direction: column;
                z-index: 5;
                transition: all 0.2s ease-in 0s;
            }

            :host([opened]) {
                display: flex;
                visibility: visible;
                left:64px;
                transform: translate3d(0, 0, 0);
                background: rgb(28, 39, 61);
            }

            @media (min-width: 320px) and (max-width: 768px) {
                :host {
                    top: 48px;
                    height: calc(100% - 48px);
                }

                :host([opened]) {
                    left:0;
                }
            }
        `
    }

    static get template() {
        return html`
            <slot></slot>
		`;
    }

    openedObserver(val) {
        if(val) {
            addOverlay(this);
        } else {
            removeOverlay(this);
        }
    }
}

customElements.define('pl-app-menu', PlAppMenu);
