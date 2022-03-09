import { PlElement, css } from "polylib";
import { requestData } from "../lib/RequestServer.js";
import { setPath, getPath, cloneDeep } from "@nfjs/core/api/common";

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
            this.execute(this.args);
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
                // либо отправляем массив с указанием _action в элементах
                if (obj._mutations) {
                    Object.keys(obj._mutations).forEach((key) => {
                        result.push(...obj._mutations[key].map(el => clonePaths(Object.assign({}, el, { _action: key }), path)));
                    });
                    return result;
                }
                return [];
            }
            if (getPath(pathTree, path) !== undefined) {
                if(obj.__changed) result._action = 'upd';
            }
            return Object.assign(result, ...Object.keys(obj).map(key => ({ [key]: clonePaths(obj[key], `${path}.${key}`) })));
        }
        return clonePaths(args, 'root');
    }

    static _clear(obj) {
        if (obj instanceof Object) {
            for (const prop in obj) {
                if (prop.startsWith('__')) {
                    delete obj[prop];
                } else {
                    const o = obj[prop];
                    if (o instanceof Object) PlAction._clear(o);
                }
            }
        }
    }

    async execute(args) {
        this.executing = true;
        try {
            let _args = args || this.args;
            // Проверяем необходимость отправки мутаций вложенных массивов
            if (this.paths) _args = PlAction._processMutations(_args, this.paths);
            // Чтобы при последующей очистке не повлиять на данные на форме
            _args = cloneDeep(_args);
            // Очистка от служебных свойств (начинаются с __)
            PlAction._clear(_args);
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
        catch (err) {
            this.executing = false;
            console.log(err);
            document.dispatchEvent(new CustomEvent('error', { detail: err }));
        }
    }
}

customElements.define('pl-action', PlAction);
