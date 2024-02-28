
import { PlElement, html, css } from "polylib";
import './pl-toast.js';
import { addOverlay, removeOverlay } from "@plcmp/utils";

class PlToastManager extends PlElement {
	static properties = {
		toasts: { type: Array, value: () => [] },
		position: { type: String, value: 'bottom-right' },
		toastToKill: { type: Array, value: () => [] },
	};

	killTimeout = null;

	pushToast(text, options) {
		const toast = document.createElement(`pl-toast`);
		toast.type = options?.type || 'success';
		toast.icon = options?.icon || 'check-circle';
		toast.buttons = options?.buttons;
		toast.header = options?.header;
		toast.timeout = options?.timeout;
		toast.text = text;
		const translateVal = this.toasts.map(x => x.offsetHeight).reduce((last, current) => last + current, 0);
		switch (this.position) {
			case 'top-right': {

				toast.style.setProperty('--pl-toast-position-right', '1.5em');
				toast.style.setProperty('--pl-toast-position-top', '1.5em');
				toast.style.setProperty('--pl-toast-fly-in', 'translateX(calc(100% + 1.5em))');
				toast.style.setProperty('--pl-toast-translate', `translateY(${translateVal}px)`);


				break;
			}
			case 'top-left': {
				toast.style.setProperty('--pl-toast-position-left', '1.5em');
				toast.style.setProperty('--pl-toast-position-top', '1.5em');
				toast.style.setProperty('--pl-toast-fly-in', 'translateX(calc(-100% + 1.5em))');
				toast.style.setProperty('--pl-toast-translate', `translateY(${translateVal}px)`);

				break;

			}
			case 'bottom-right': {
				toast.style.setProperty('--pl-toast-position-right', '1.5em');
				toast.style.setProperty('--pl-toast-position-bottom', '1.5em');
				toast.style.setProperty('--pl-toast-fly-in', 'translateX(calc(100% + 1.5em))');
				toast.style.setProperty('--pl-toast-translate', `translateY(${-translateVal}px)`);

				break;

			}
			case 'bottom-left': {
				toast.style.setProperty('--pl-toast-position-left', '1.5em');
				toast.style.setProperty('--pl-toast-position-bottom', '1.5em');
				toast.style.setProperty('--pl-toast-fly-in', 'translateX(calc(-100% + 1.5em))');
				toast.style.setProperty('--pl-toast-translate', `translateY(${-translateVal}px)`);

				break;
			}
		}
		addOverlay(toast);
		document.body.append(toast);
		toast.addEventListener("close", this.killNote.bind(this, toast));
		this.toasts.push(toast);
		if (toast.timeout != 0) {
			setTimeout(() => {
				this.killNote(toast);
			}, 3000)
		}
	}

	shiftNotes() {
		this.toasts.forEach((item, i) => {
			let transY = 0;
			const translateVal = this.toasts.filter((el, idx) => idx < i).map(x => x.offsetHeight).reduce((last, current) => last + current, 0);
			switch (this.position) {
				case 'top-left':
				case 'top-right': {
					transY = translateVal;
					break;
				}
				case 'bottom-right':
				case 'bottom-left': {
					transY = -translateVal
					break;
				}
			}
			item.style.transform = `translateY(${transY}px)`;
		});
	}

	killNote(toast, e) {
		toast.classList.add('out');
		this.toastToKill.push(toast);

		clearTimeout(this.killTimeout);

		this.killTimeout = setTimeout(() => {
			this.toastToKill.forEach(itemToKill => {
				removeOverlay(itemToKill);
				itemToKill.remove();

				const left = this.toasts.filter(item => item !== itemToKill);
				this.toasts = [...left];
			});

			this.toastToKill = [];

			this.shiftNotes();
		}, 200);
	}
}

customElements.define('pl-toast-manager', PlToastManager);