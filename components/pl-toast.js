
import { PlElement, html, css } from "polylib";
import '@plcmp/pl-button';
import '@plcmp/pl-icon-button';

class PlToast extends PlElement {
	static properties = {
		header: { type: String },
		icon: { type: String },
		text: { type: String },
		type: { type: String, reflectToAttribute: true, value: 'success' },
		buttons: { type: Array, value: [] }
	};

	static css = css`
		:host([type=success]) {
			--pl-toast-background: var(--primary-lightest);
			--pl-toast-icon-color: var(--primary-base);
		}
		:host([type=error]) {
			--pl-toast-background: var(--negative-lightest);
			--pl-toast-icon-color: var(--negative-base);
		}

        :host {
			position: fixed;
			top: var(--toast-position-top);
			right: var(--toast-position-right);
			bottom: var(--toast-position-bottom);
			left: var(--toast-position-left);
			transition: transform 0.15s ease-out;
			transform: var(--toast-translate);
			padding-bottom: 8px;
		}

		.toast-content {
			padding: 8px;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			animation: flyIn 0.3s ease-out;
			border-radius: 0.75em;
			background: var(--pl-toast-background);
			box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.16);
			width: 320px;
			box-sizing: border-box;
		}

		:host(.out) > .toast-content{
			animation: flyOut 0.3s ease-out;
		}

		.header {
			display: flex;
			align-items: center;
			width: 100%;
			font: var(--header-font);
			color: var(--header-color);
			font-weight: 700;
			font-size: 14px;
			line-height: 16px;
			justify-content: space-between;
		}

		.content {
			padding: 0 0 8px 24px;
			overflow: hidden;
			display: -webkit-box;
			-webkit-line-clamp: 3;
			-webkit-box-orient: vertical;
			font: var(--text-font);
			color: var(--text-color);
			max-height: 42px;
		}

		:host([type=success]) .full{
			color: var(--primary-dark);
		}
		:host([type=error]) .full{
			color: var(--negative-dark);
		}

		
		.full {
			padding: 0 0 8px 24px;
			font: var(--header-font);
			cursor: pointer;
		}

		.full[hidden] {
			display: none;
		}

		.header-block {
			display: flex;
			gap: 8px;
			--pl-icon-fill-color: var(--pl-toast-icon-color);
		}

		.button {
            display: flex;
            gap: var(--space-sm);
            width: 100%;
            justify-content: flex-end;
        }

		@keyframes flyIn {
			from {
				transform: var(--toast-fly-in)
			}
			to {
				transform: translateX(0);
			}
		}

		@keyframes flyOut {
			from {
				transform: translateX(0);
			}
			to {
				transform: var(--toast-fly-in)
			}
		}
		
		
	`;

	static template = html`
		<div class="toast-content">
			<div class="header">
				<div class="header-block">
					<pl-icon iconset="pl-default" size="16" icon="[[icon]]"></pl-icon>
					[[header]]
				</div>
				<pl-icon-button variant="link" iconset="pl-default" size="16" icon="close" on-click="[[onClose]]"></pl-icon-button>
			</div>
			<div class="content">
				[[text]]
			</div>
			<div class="full" hidden$="[[isShowFullHidden(text)]]" on-click="[[onFullClick]]">Показать полностью...</div>
			<div class="button">
				<pl-button d:repeat="[[buttons]]" negative="[[item.negative]]" variant="[[item.variant]]" label="[[item.label]]"
					on-click="[[onClick]]"></pl-button>
			</div>
		</div>
	`;

	onClose() {
		this.dispatchEvent(new CustomEvent('close', { composed: true }));
	}

	onClick(e) {
		this.onClose();
		e.model.item.onClick();
	}

	isShowFullHidden(text){
		return text.length < 130;
	}

	onFullClick() {
		const dialog = document.createElement('pl-dialog');
		customLoader('pl-dialog');
		dialog.header = 'Внимание';
		dialog.content = this.text;
		dialog.buttons =  [{
			label: 'Ок',
			variant: 'primary',
			action: true
		}];
		document.body.appendChild(dialog);
		return new Promise((resolve) => {
			dialog.addEventListener('pl-dialog-closed', (event) => {
				resolve(event.detail.action);
			});
		});
	}

}

customElements.define('pl-toast', PlToast);