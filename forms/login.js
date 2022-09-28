import { html } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class Login extends PlForm {
    static properties = {
        login: { type: String },
        password: { type: String },
        auth: { type: Boolean, value: false }
    };

    static template = html`
        <pl-action id="aLogin" data="{{auth}}" endpoint="/front/action/login" unauthorized></pl-action>
        <pl-flex-layout vertical fit align="center" justify="center" slot="top-toolbar">
            <pl-input label="Логин" value="{{login}}"></pl-input>
            <pl-input label="Пароль" value="{{password}}" type="password"></pl-input>
            <pl-button variant="primary" label="Войти" on-click="[[onLoginClick]]"></pl-button>
        </pl-flex-layout>
    `;

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                this.onLoginClick();
            }
        });
    }

    onLoginClick() {
        this.$.aLogin.execute({ login: this.login, password: this.password })
            .then((res) => {
                if(this.auth) {
                    dispatchEvent(new CustomEvent('authorized'));
                }
            });
    }
}