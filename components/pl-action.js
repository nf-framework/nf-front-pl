import { PlElement, css } from "polylib";
import { requestData } from "../lib/RequestServer.js";
import { setPath, getPath, cloneDeep, clearObj } from "@nfjs/core/api/common";

class PlAction extends PlElement {
    static get properties() {
        return {
            endpoint: {
                type: String
            },
            method: {
                type: String
            },
            args: {
                type: Object,
                observer: '_argsChanged'
            },
            executeOnArgsChange: {
                type: Boolean
            },
            executing: {
                type: Boolean,
                value: false
            },
            requiredArgs: {
                type: String
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
            },
            paths: {
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
            this.execute(this.args, { executedOnArgsChange: true });
        }
    }

    static _processMutations(args, paths, sendMutationObject = false) {
        const pathsArray = paths.split(',');
        // подразумевается что корень всегда обьект.
        const pathTree = {};
        pathsArray.sort().forEach((e) => {
            if (e === '') return;
            setPath(pathTree, `root.${e}`, {});
        });
        const hash = new WeakMap();
        function clonePaths(obj, path = '') {
            if (Object(obj) !== obj) return obj; // primitives
            if (getPath(pathTree, path) === undefined) return obj;
            if (hash.has(obj)) return hash.get(obj); // cyclic reference
            const result = obj instanceof Date ? new Date(obj)
                : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
                    : obj.constructor ? new obj.constructor()
                        : Object.create(null);
            hash.set(obj, result);
            if (obj instanceof Map) {
                Array.from(obj, ([key, val]) => result.set(key, clonePaths(val, path)));
            }
            if (Array.isArray(obj) && getPath(pathTree, path)) {
                // требуется передача изменений массива
                // если указана отправка мутаций отдельными массивами то отправляем объект с 3 массивами
                if (sendMutationObject) {
                    if (obj._mutations) {
                        return Object.assign({}, ...Object.keys(obj._mutations).map(
                            key => ({ [key]: clonePaths(obj._mutations[key], path) })
                        ));
                    }
                    return { add: [], upd: [], del: [] };
                }
                // либо отправляем массив с указанием $action в элементах
                if (obj._mutations) {
                    Object.keys(obj._mutations).forEach((key) => {
                        result.push(...obj._mutations[key].map(el => clonePaths(Object.assign({}, el, { $action: key }), path)));
                    });
                    return result;
                }
                return [];
            }
            if (getPath(pathTree, path) !== undefined) {
                if (obj.__changed) result.$action = 'upd';
            }
            return Object.assign(result, ...Object.keys(obj).map(key => ({ [key]: clonePaths(obj[key], `${path}.${key}`) })));
        }
        return clonePaths(args, 'root');
    }

    async execute(args, opts) {
        this.executing = true;
        try {
            let _args = args || this.args;
            // Проверяем необходимость отправки мутаций вложенных массивов
            if (this.paths) _args = PlAction._processMutations(_args, this.paths);
            // Чтобы при последующей очистке не повлиять на данные на форме
            _args = cloneDeep(_args);
            // Очистка от служебных свойств (начинаются с __)
            clearObj(_args);

            const { executedOnArgsChange = false } = opts ?? {};
            const reqArgs = this.requiredArgs ? this.requiredArgs.split(';') : [];
            if (reqArgs.length > 0 && (!_args || reqArgs.find(r => _args[r] === undefined || _args[r] === null))) {
                if (executedOnArgsChange) {
                    this.executing = false;
                    return;
                }
                const needArgs = reqArgs.filter(r => !_args || _args[r] === undefined || _args[r] === null).join();
                throw new Error(`Не переданы обязательные параметры [${needArgs}]`);
            }

            let url = this.endpoint;
            const params = {
                headers: { 'Content-Type': 'application/json' },
                method: this.method || 'POST',
                unauthorized: this.unauthorized
            };
            if (params.method === 'GET') {
                const queryParams = new URLSearchParams(args);
                url = `${url}?${queryParams.toString()}`;
            } else {
                params.body = JSON.stringify({ args: _args });
            }
            const req = await requestData(url, params);
            const json = await req.json();
            const { data, error } = json;
            if (error) {
                throw new Error(error);
            }
            this.data = data;
            this.executing = false;
            return this.data;
        }
        catch (e) {
            this.executing = false;
            let errorMessage = '';
            if (e instanceof Response) {
                errorMessage = e.statusText;
            }
            if(e instanceof Error) {
                errorMessage = e.message;
            }

            document.dispatchEvent(new CustomEvent('error', { detail: { message: errorMessage } }));
            throw e;
        }
    }
}

customElements.define('pl-action', PlAction);
