
import { PlElement, html, css } from "polylib";
import './pl-toast.js';

class PlToastManager extends PlElement {
	static properties = {
		toasts: { type: Array, value: () => []},
		position: { type: String, value: 'top-right' },
		toastToKill: { type: Array, value: () => [] },
	};

	killTimeout = null;

	pushToast(text, options) {
		const toast = document.createElement(`pl-toast`);
		toast.type = options.type;
		toast.buttons = options.buttons;
		toast.header = options.header;

		toast.text = text;

		switch (this.position) {
			case 'top-right': {
				toast.style.setProperty('--toast-position-right', '1.5em');
				toast.style.setProperty('--toast-position-top', '1.5em');
				toast.style.setProperty('--toast-fly-in', 'translateX(calc(100% + 1.5em))');
				toast.style.setProperty('--toast-translate', `translateY(${100 * this.toasts.length}%)`);

				break;
			}
			case 'top-left': {
				toast.style.setProperty('--toast-position-left', '1.5em');
				toast.style.setProperty('--toast-position-top', '1.5em');
				toast.style.setProperty('--toast-fly-in', 'translateX(calc(-100% + 1.5em))');
				toast.style.setProperty('--toast-translate', `translateY(${100 * this.toasts.length}%)`);

				break;

			}
			case 'bottom-right': {
				toast.style.setProperty('--toast-position-right', '1.5em');
				toast.style.setProperty('--toast-position-bottom', '1.5em');
				toast.style.setProperty('--toast-fly-in', 'translateX(calc(100% + 1.5em))');
				toast.style.setProperty('--toast-translate', `translateY(${-100 * this.toasts.length}%)`);

				break;

			}
			case 'bottom-left': {
				toast.style.setProperty('--toast-position-left', '1.5em');
				toast.style.setProperty('--toast-position-bottom', '1.5em');
				toast.style.setProperty('--toast-fly-in', 'translateX(calc(-100% + 1.5em))');
				toast.style.setProperty('--toast-translate', `translateY(${-100 * this.toasts.length}%)`);

				break;
			}
		}

		document.body.append(toast);
		toast.addEventListener("close", this.killNote.bind(this, toast));


		this.toasts.push(toast);
	}

	shiftNotes() {
		this.toasts.forEach((item, i) => {
			let transY = 0;
			switch (this.position) {
				case 'top-left':
				case 'top-right': {
					transY = 100 * i;
					break;
				}
				case 'bottom-right':
				case 'bottom-left': {
					transY = -100 * i;
					break;
				}
			}
			item.style.transform = `translateY(${transY}%)`;
		});
	}

	killNote(toast, e) {
		toast.classList.add('out');
		this.toastToKill.push(toast);

		clearTimeout(this.killTimeout);

		this.killTimeout = setTimeout(() => {
			this.toastToKill.forEach(itemToKill => {
				document.body.removeChild(itemToKill);

				const left = this.toasts.filter(item => item !== itemToKill);
				this.toasts = [...left];
			});

			this.toastToKill = [];

			this.shiftNotes();
		}, 200);
	}
}

customElements.define('pl-toast-manager', PlToastManager);