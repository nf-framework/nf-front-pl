import { html, css } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class Login extends PlForm {
    static get properties() {
        return {
            login: { type: String },
            password: { type: String },
            auth: { type: Boolean, value: false }
        };
    }

    static get css() {
        return css`{
            :host([hidden]) {
                display: none;
            }
        }`
    }
    static get template() {
        return html`
            <pl-action data="{{auth}}" endpoint="/front/action/login" unauthorized></pl-action>
		    <pl-flex-layout vertical fit stretch align="center" justify="center" slot="top-toolbar">
                <pl-input label="Логин" value="{{login}}"></pl-input>
                <pl-input label="Пароль" value="{{password}}" type="password"></pl-input>
                <pl-button variant="primary" label="Войти" on-click="[[onLoginClick]]"></pl-button>
            </pl-flex-layout>
		`;
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                this.onLoginClick();
            }
        });
    }

    onLoginClick() {
        this.root.querySelector('pl-action').execute({ login: this.login, password: this.password });
    }
}