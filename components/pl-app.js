import { PlElement, html, css } from "polylib";
import '@plcmp/pl-iconset-default';
import { customLoader } from "../lib/CustomElementsLoader.js";
window.customLoader = customLoader;

customLoader('pl-form-login');

class App extends PlElement {
	static get properties() {
		return {
			auth: { type: Boolean, value: false, observer: '_authObserver' }
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
			this.aSessionCheck.execute();
		})

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
	}

	static get template() {
		return html`
			<pl-action id="aSessionCheck" data="{{auth}}"  endpoint="/checkSession"></pl-action>
			<pl-form-login hidden$=[[auth]] auth="{{auth}}"></pl-form-login>
		`;
	}

	async _authObserver(auth) {
		if (auth) {
			if (!customElements.get('pl-form-main')) {
				await customLoader('pl-form-main');
				let form = document.createElement('pl-form-main');
				await form.ready;
				this.root.appendChild(form);
			}
		}
	}

	_isAuth(auth) {
		return !auth;
	}
}

customElements.define('pl-app', App);