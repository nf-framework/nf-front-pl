
import { PlElement, html, css } from "polylib";
import { addOverlay, removeOverlay } from "@plcmp/utils";

class PlToast extends PlElement {
    static get css() {
        return css`
            :host {
                display: flex;
                position: absolute;
                left: 10%;
                transform: translateX(-50%) translateY(110%);
                bottom: 0;
                background-color: #292929;
                color: white;
                border-radius: 4px;
                padding: 16px;
                font: var(--font-sm);
            }
            :host(.show) {
                bottom: 40px;
                transform: translateX(-50%);
                -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
                animation: fadein 0.5s, fadeout 0.5s 2.5s;
            }
            @-webkit-keyframes fadein {
                from {
                    bottom: 0;
                    transform: translateX(-50%) translateY(110%);
                }
                to {
                    bottom: var(--lt-bottom, 40px);
                    transform: translateX(-50%) translateY(0);
                }
            }
            @keyframes fadein {
                from {
                    bottom: 0;
                    transform: translateX(-50%) translateY(110%);
                }
                to {
                    bottom: var(--lt-bottom, 40px);
                    transform: translateX(-50%) translateY(0);
                }
            }
            @-webkit-keyframes fadeout {
                from {
                    bottom: var(--lt-bottom, 40px);
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    bottom: 0;
                    transform: translateX(-50%) translateY(110%);
                }
            }
            @keyframes fadeout {
                from {
                    bottom: var(--lt-bottom, 40px);
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    bottom: 0;
                    transform: translateX(-50%) translateY(110%);
                }
            }
        `;
    }

    static get properties() {
        return {
            text: { type: String }
        };
    }


    static get template() {
        return html`
            [[text]]
		`;
    }
    show(text = '', duration = 3000) {
        return new Promise((resolve, reject) => {
            if (this.className === 'show') {
                // Do nothing, prevent spamming
            } else {
                // 1000ms to not overlap fadein and fadeout animations
                if (duration >= 1000) {
                    this.style.animation = `fadein 0.5s, fadeout 0.5s ${duration -
                        500}ms`;
                }
                this.text = text;
                addOverlay(this);
                this.className = 'show';
                setTimeout(
                    () => {
                        this.text = '';
                        this.style.animation = '';
                        this.className = this.className.replace('show', '');
                        removeOverlay(this);
                        resolve();
                    },
                    duration >= 1000 ? duration : 3000
                );
            }
        });
    }
}

customElements.define('pl-toast', PlToast);