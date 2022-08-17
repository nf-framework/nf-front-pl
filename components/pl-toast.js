
import { PlElement, html, css } from "polylib";
import { addOverlay, removeOverlay } from "@plcmp/utils";

class PlToast extends PlElement {
	static properties = {
		text: { type: String }
	};

	static css = css`
        :host {
			display: flex;
			position: fixed;
			right: 0;
			transform: translateX(-5%) translateY(-100%);
			top: 0;
			background-color: var(--menu-background-color);
			color: white;
			text-align: center;
			border-radius: 4px;
			padding: 16px;
			width: 320px;
		}
		:host(.show) {
			top: 32px;
			transform: translateX(-5%) translateY(0);
			-webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
			animation: fadein 0.5s, fadeout 0.5s 2.5s;
		}
		@-webkit-keyframes fadein {
			from {
				top: 0;
				transform: translateX(-5%) translateY(-100%);
			}
			to {
				top: 32px;
				transform: translateX(-5%) translateY(0);
			}
		}
		@keyframes fadein {
			from {
				top: 0;
				transform: translateX(-5%) translateY(-100%);
			}
			to {
				top: 32px;
				transform: translateX(-5%) translateY(0);
			}
		}
		@-webkit-keyframes fadeout {
			from {
				top: 32px;
				transform: translateX(-5%) translateY(0);
			}
			to {
				top: 0;
				transform: translateX(-5%) translateY(-100%);
			}
		}
		@keyframes fadeout {
			from {
				top: 32px;
				opacity: 1;
				transform: translateX(-5%) translateY(0);
			}
			to {
				top: 0;
				opacity: 0;
				transform: translateX(-5%) translateY(-100%);
			}
		}
	`;

	static template = html`
		[[text]]
	`;
	
	show(text = '', duration = 4000) {
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