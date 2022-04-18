import { PlElement, html, css } from "polylib";
import '@plcmp/pl-iconset-default';
import { customLoader } from "../lib/CustomElementsLoader.js";
import { openForm } from "../lib/FormUtils.js";
window.customLoader = customLoader;

class App extends PlElement {
	static get properties() {
		return {
			auth: { type: Boolean, value: undefined, observer: '_authObserver' }
		};
	}

	static get css() {
		return css`
			:host{
				display: block;
				width: 100%;
				height: 100%;
			}`
	}

	connectedCallback() {
		super.connectedCallback();
		customLoader('pl-action').then(() => {
			this.aSessionCheck = this.$.aSessionCheck;
			this.aSessionCheck.execute()
		})

		customLoader('pl-toast');

		this.resizers = [];

		window.addEventListener('authorized', () => {
			this.auth = true;
		});

		window.addEventListener('unauthorized', () => {
			this.auth = false;
		});

		this.addEventListener('resize-notify-required', (ev) => {
			ev.stopPropagation();
			this.resizers.push(ev.detail)
		});

		const resizeObserver = new ResizeObserver(() => {
			window.requestAnimationFrame(() => {
				this.resizers.forEach(el => el.cb());
			});
		});

		resizeObserver.observe(document.body);
		document.querySelector('#preloader').style.display = "none";
		document.addEventListener('error', this.showError.bind(this));
        document.addEventListener('success', this.showSuccess.bind(this));

	}

	static get template() {
		return html`
			<pl-action id="aSessionCheck" data="{{auth}}"  endpoint="/front/action/checkSession"></pl-action>
			<pl-toast id="toast"></pl-toast>
		`;
	}

	showError(e) {
        this.$.toast.show(e.detail.message)
    }

    showSuccess(e) {
        this.$.toast.show(e.detail.message)
    }

	async _authObserver(auth) {
		if (auth) {
			await openForm('main', this.root);
			if(this.loginForm) {
				await this.loginForm.close();
				this.loginForm = null;
			}
		} else {
			this.loginForm = await openForm('login', this.root);
		}
	}

	_isAuth(auth) {
		return !auth;
	}
}

customElements.define('pl-app', App);