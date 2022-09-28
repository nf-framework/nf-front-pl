import { PlElement, html, css } from "polylib";
import '@plcmp/pl-iconset-default';
import { customLoader } from "../lib/CustomElementsLoader.js";
import { requestData } from "../lib/RequestServer.js";
import { openForm } from "../lib/FormUtils.js";
window.customLoader = customLoader;

class App extends PlElement {
	static properties = {
		auth: { type: Boolean, value: undefined, observer: '_authObserver' }
	};

	static css = css`
		:host{
			display: block;
			width: 100%;
			height: 100%;
		}`;

	static template = html`
		<pl-action id="aSessionCheck" data="{{auth}}" endpoint="/front/action/checkSession"></pl-action>
		<pl-toast-manager id="toastManager"></pl-toast-manager>
	`;

	async connectedCallback() {
		super.connectedCallback();
		customLoader('pl-action').then(() => {
			this.aSessionCheck = this.$.aSessionCheck;
			this.aSessionCheck.execute()
		})

		window.NF = {};

		this.config = await requestData('/pl-get-config', { unauthorized: true }).then(r => r.json()).catch(() => { });
		NF.config = this.config;

		let { includeTimeZone } = this.config || {};
		Date.prototype.toJSON = function () {
			var tzo = -this.getTimezoneOffset(),
				dif = tzo >= 0 ? '+' : '-',
				pad = function (num) {
					var norm = Math.floor(Math.abs(num));
					return (norm < 10 ? '0' : '') + norm;
				},
				pad3 = function (num) {
					var norm = Math.floor(Math.abs(num));
					return (norm < 10 ? '00' : (norm < 100 ? '0' : '')) + norm;
				};
			return this.getFullYear() +
				'-' + pad(this.getMonth() + 1) +
				'-' + pad(this.getDate()) +
				'T' + pad(this.getHours()) +
				':' + pad(this.getMinutes()) +
				':' + pad(this.getSeconds()) +
				'.' + pad3(this.getMilliseconds()) +
				(includeTimeZone ? (dif + pad(tzo / 60) + ':' + pad(tzo % 60)) : '');
		}


		customLoader('pl-toast-manager').then((res) => {
			if(NF?.config?.front?.toastPosition)  {
				this.$.toastManager.position = NF?.config?.front?.toastPosition;
			}
		});

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

		document.querySelector('#preloader').style.display = "none";
		document.addEventListener('toast', this.showToast.bind(this));
	}

	showToast(e) {
		this.$.toastManager.pushToast(e.detail.message, e.detail.options)
	}

	async _authObserver(auth) {
		if (auth) {
			await openForm('main', this.root);
			if (this.loginForm) {
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