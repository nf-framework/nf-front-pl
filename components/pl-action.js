import { PlElement, css } from "polylib";
import { requestData } from "../lib/RequestServer.js";

class PlAction extends PlElement {
    static get properties() {
        return {
            endpoint: {
                type: String
            },
            args: {
                type: Object,
                observer: '_argsChanged'
            },
            executeOnArgsChange: {
                type: Boolean
            },
            data: {
                type: Object
            },
            unauthorized: {
                type: Boolean,
                value: false
            },
            success: {
                type: String
            }
        }
    }

    static get css() {
        return css`
            :host {
                display: none;
            }
		`;
    }

    _argsChanged(val) {
        if (this.executeOnArgsChange) {
            this.execute(this.args);
        }
    }

    async execute(args) {
        try {
            let _args = args || this.args;
            const req = await requestData(this.endpoint, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({ args: _args }),
                unauthorized: this.unauthorized
            });
            const json = await req.json();
            const { data, error } = json;
            if (error) {
                throw new Error(error);
            }
            this.data = data;
            return this.data;
        }
        catch (err) {
            console.log(err);
            document.dispatchEvent(new CustomEvent('error', { detail: err }));
        }
    }
}

customElements.define('pl-action', PlAction);
