import { PlElement, html, css } from "polylib";
import '@plcmp/pl-iconset-default';
import { requestData, openForm } from "@nfjs/front-pl";
import './pl-action.js';
import './pl-toast-manager.js';


class App extends PlElement {
	static properties = {
		auth: { type: Boolean, value: undefined, observer: '_authObserver' }
	};

	static css = css`
		:host{
			display: block;
			width: 100%;
			height: 100%;
		}

		#root {
			display: block;
			width: 100%;
			height: 100%;
		}

		#root > *:not(:last-child){
			display: none;
		}
	`;

	static template = html`
		<div id="root"></div>
		<pl-action id="aSessionCheck" data="{{auth}}" endpoint="/front/action/checkSession"></pl-action>
		<pl-toast-manager id="toastManager"></pl-toast-manager>
	`;

	async connectedCallback() {
		super.connectedCallback();
		window.NF = {};

		addEventListener('authorized', () => { this.auth = true; });
		addEventListener('unauthorized', () => { this.auth = false; });
		document.addEventListener('toast', this.showToast.bind(this));

		const cfgResp = await requestData('/pl-get-config', {
			unauthorized: true
		});

		const config = await cfgResp.json();
		NF.config = config;

		let { includeTimeZone } = config || {};
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

		this.$.toastManager.position = NF?.config?.front?.toastPosition || 'top-right';
		document.querySelector('#preloader').style.display = "none";
		this.$.aSessionCheck.execute();
	}

	showToast(e) {
		this.$.toastManager.pushToast(e.detail.message, e.detail.options)
	}

	async _authObserver(auth) {
		if (auth) {
			await openForm('main', this.$.root);
			if (this.loginForm) {
				await this.loginForm.close();
				this.loginForm = null;
			}
		} else {
			this.loginForm = await openForm('login', this.$.root);
		}
	}

	_isAuth(auth) {
		return !auth;
	}
}

customElements.define('pl-app', App);