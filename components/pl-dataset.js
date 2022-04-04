import { PlElement, css } from "polylib";
import { ControlledArray, PlaceHolder } from "@plcmp/utils";
import { requestData } from "../lib/RequestServer.js";
import assignDeep from "deep-object-assign-with-reduce";

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
        let data = this.data;
        if (!(data instanceof ControlledArray)) {
            data = ControlledArray.from([])
        }
        if (data instanceof ControlledArray) {
            data.load = (x) => this.loadByPlaceHolder(x);
        }
        this.data = data;
    }
    loadByPlaceHolder(placeHolder) {
        this.data.control.range.chunk_start = placeHolder.rn ?? 0;
        this.data.control.range.chunk_end = (placeHolder.rn ?? 0) + 99;
        if (this.data.control.treeMode) {
            this.data.control.treeMode.hidValue = placeHolder.hid;
        }
        return this.execute(undefined, { merge: true, placeHolder });
    }
    _argsChanged() {
        if (this.executeOnArgsChange) {
            this.execute(this.args);
        }
    }
    _dataObserver(val, oldVal, mut) {
        if (mut.path === 'data.sorts') {
            this.execute(this.args);
        }
    }
    prepareEndpointParams(args, control) {
        return assignDeep({
            args: args || this.args || {},
            sqlPath: this.innerText,
            control: {
                partialData: this.data?.control?.partialData,
                sorts: this.data?.sorts,
                filters: this.data?.filters
            }
        }, { control: this.data.control }, { control })
    }

    async execute(args, opts) {
        let _args = args || this.args;

        try {
            let {merge, placeHolder} = opts ?? {};
            let chunk_start, chunk_end;
            if (this.data?.control?.partialData) {
                if (!merge) {
                    this.data.control.range.chunk_start = 0;
                    this.data.control.range.chunk_end = 99;
                }
                chunk_start = this.data?.control?.range?.chunk_start ?? 0;
                chunk_end = this.data?.control?.range?.chunk_end ?? 99;
                if (this.data?.control?.treeMode && !merge) {
                    this.data.control.treeMode.hidValue = null;
                }
            }
            const req = await requestData(this.endpoint, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify( this.prepareEndpointParams(_args, { range: { chunk_start, chunk_end } }) ),
                unauthorized: this.unauthorized
            });
            const json = await req.json();
            const { data, error, stack } = json;
            if (error) throw error;

            if (data.length && this.data.control?.partialData) {
                if (data[0]._rn < chunk_start) {
                    if (this.data[data[0]._rn]) {
                        data.shift();
                    } else {
                        data[0] = new PlaceHolder({ rn: data[0]._rn ?? chunk_start });
                    }
                }
                if (data[data.length - 1]._rn > chunk_end) {
                    data[data.length - 1] = new PlaceHolder({ rn: data[data.length - 1]._rn ?? chunk_end });
                }
            }

            if (this.data instanceof ControlledArray) {
                let phIndex = this.data.indexOf(placeHolder);
                if (phIndex >= 0) {
                    this.splice('data', phIndex, 1, ...data);
                } else {
                    if (merge) {
                        this.splice('data', this.data.length, 0, ...data);
                    } else {
                        this.splice('data', 0, this.data.length, ...data);
                    }
                }
            } else {
                this.data = ControlledArray.from(data);
            }

            return this.data;

        }
        catch (err) {
            console.log(err);
            document.dispatchEvent(new CustomEvent('error', {detail: err}));
        }
    }
}

customElements.define('pl-dataset', PlDataset);
