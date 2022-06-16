import { html } from "polylib";
import { PlForm } from "@nfjs/front-pl/components/pl-form.js";

export default class GroupList extends PlForm {
    static get properties() {
        return {
            root: { value: () => ({}) },
            modules: { value: () => ([]) },
            formTitle: {
                type: String,
                value: 'О Системе'
            }
        }
    }

    static get template() {
        return html`
            <pl-flex-layout fit vertical>
                <pl-flex-layout vertical>
                    <span><b>Наименование:</b> [[root.name]]</span>
                    <span><b>Версия</b>: [[root.version]]</span>
                    <span><b>Описание</b>: [[root.description]]</span>
                </pl-flex-layout>
                <pl-flex-layout fit>
                    <pl-grid data="{{modules}}">
                        <pl-grid-column field="name" header="Модуль"></pl-grid-column>
                        <pl-grid-column field="version" header="Версия" width="100"></pl-grid-column>
                    </pl-grid>
                </pl-flex-layout>
            </pl-flex-layout>
            <pl-action id="aData" endpoint="/front/action/getPackages"></pl-action>
		`;
    }
    onConnect() {
        this.$.aData.execute()
            .then((res) => {
                this.modules = res.modules;
                this.root = res.root;
            });

    }
}