import { PlElement, css } from "polylib";
import { ControlledArray, PlaceHolder } from "@plcmp/utils";
import { requestData } from "../lib/RequestServer.js";

class PlDataset extends PlElement {
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
                observer: '_dataObserver'
            },
            unauthorized: {
                type: Boolean,
                value: false
            },
            type: {
                type: String // [simple??] | sql-endpoint
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

    connectedCallback() {
        super.connectedCallback();
        if (!(this.data instanceof ControlledArray)) {
            this.data = ControlledArray.from([])
        }
        if (this.data instanceof ControlledArray) {
            this.data.load = (x) =>
                this.loadByPlaceHolder(x);

        }
    }
    loadByPlaceHolder(ph) {
        this.data.control.range.chunk_start = ph.rn;
        this.data.control.range.chunk_end = ph.rn + 99;
        this.execute(undefined, true);
    }
    _argsChanged(val) {
        if (this.executeOnArgsChange) {
            this.execute(this.args);
        }
    }
    _dataObserver(val, oldVal, mut) {
        if (mut.path === 'data.sorts') {
            this.execute(this.args);
        }
    }
    prepareSQLEndpointParams(args, control) {
        return Object.assign({
            args: args || this.args || {},
            sqlPath: this.innerText,
            control: {
                partialData: this.data?.control?.partialData,
                sorts: this.data?.sorts,
                filters: this.data?.filters
            }
        }, { control })
    }
    prepareSimpleEndpointParams(args) {
        return { args: args || this.args, control: {
            sorts: this.data?.sorts,
            filters: this.data?.filters
        }}
    }
    async execute(args, merge) {
        try {
            let chunk_start, chunk_end;
            if (this.data?.control?.partialData) {
                if (!merge) {
                    this.data.control.range.chunk_start = 0;
                    this.data.control.range.chunk_end = 99;
                }
                chunk_start = this.data?.control?.range?.chunk_start ?? 0;
                chunk_end = this.data?.control?.range?.chunk_end ?? 99;
            }
            const req = await requestData(this.endpoint, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(this.type === 'sql-endpoint' ? this.prepareSQLEndpointParams(args, { range: { chunk_start, chunk_end } }) : this.prepareSimpleEndpointParams(args)),
                unauthorized: this.unauthorized
            });
            const json = await req.json();
            const { data, error, stack } = json;
            if (data.length && this.data.control?.partialData) {
                if (data[0].r_n_ < chunk_start) {
                    if (this.data[data[0].r_n_]) {
                        data.shift();
                    } else {
                        data[0] = new PlaceHolder(data[0].r_n_ ?? chunk_start);
                    }
                }
                if (data[data.length - 1].r_n_ > chunk_end) {
                    data[data.length - 1] = new PlaceHolder(data[data.length - 1].r_n_ ?? chunk_end);
                }
            }
            if (error) throw error;

            if (this.data instanceof ControlledArray) {
                let start = data[0]?.r_n_ ?? 0, del = merge ? 0 : this.data.length;
                if (merge && this.data[start] instanceof PlaceHolder) del = 1;
                this.splice('data', start, del, ...data);
            } else {
                this.data = ControlledArray.from(data);
            }

            return this.data;

        }
        catch (err) {
            console.log(err);
            alert(err);
        }
    }
}

customElements.define('pl-dataset', PlDataset);
