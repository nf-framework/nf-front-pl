import path from 'path';
import mime from 'mime';
import fs from "fs/promises";
import url from "url";

import { auth } from "@nfjs/auth";
import { web, ComponentCache, endpointData, endpointPlAction, endpointPlDataset } from "@nfjs/back";
import { registerLibDir, prepareResponse, getCacheKey } from "@nfjs/front-server";
import { api, extension } from "@nfjs/core";

const __dirname = path.join(path.dirname(decodeURI(new URL(import.meta.url).pathname))).replace(/^\\([A-Z]:\\)/, "$1");
const menu = await api.loadJSON(`${__dirname}/menu.json`);
const customElementsJson = await api.loadJSON(`${__dirname}/customElements.json`);

async function formsHandler(context) {
    try {
        const formPath = context.params.form.replace(/\./g, '/');
        const formsDir = 'forms/';

        let file = await extension.getFiles(formsDir + formPath + '.js');
        if (!file) {
            context.code(404);
            context.end();
            return;
        }
        const customOptions = context.customOptions;
        const cacheKey = getCacheKey(context.url, customOptions);
        const mimeType = mime.getType(file);
        const contentType = mimeType?.split('/')[1] || 'javascript';

        const response = await prepareResponse(
            cacheKey,
            { customOptions, contentType, mimeType, minify: false },
            async () => {
                let form = await fs.readFile(file, 'utf8');
                const rex = new RegExp('serverEndpoints(.*|\\n|\\r\\n)*\\/\\/serverEndpoints', 'm');
                const serverEndpointText = form.match(rex);
                if (serverEndpointText) {
                    await ComponentCache.save(`/pl-form/${context.params.form}.js`, `export const ${serverEndpointText[0]}`);
                    form = form.replace(rex, '');
                }
                return form;
            }
        );
        if (response.headers) context.headers(response.headers);
        if (response.stream) context.send(response.stream);
    }
    catch (err) {
        context.send(err);
    }
}

async function customElementsHandler(context) {
    try {
        const customElementName = context.params.component;
        const finded = customElementsJson.find(x => x.name == customElementName);
        if(!finded) {
            console.error('Not Found', customElementName);
            throw new Error(`${customElementName} not found`);
        }
        context.send(finded.path);
    }
    catch (err) {
        context.code(404);
        context.send(err);
    }
}

async function checkSession(context) {
    if (context.session.get('context.user')) {
        context.send({ data: true });
    } else {
        context.code(401);
        context.send({ data: false });
    }
}

async function login(context) {
    let { login, password } = context.body.args;
    let data = {};
    let r = await auth.login(login, password, context.session);
    data = r.result;
    context.send({ data });
    context.end();
}

async function logout(context) {
    let data = await auth.logout(context.session);
    if (!data) data = { status: 'success' };
    context.send({ data });
    context.end();
}

async function getUserProfile(context) {
    const data = {
        username: context.session.get('context.user')
    }
     context.send({ data });
     context.end();
}

async function init() {
    registerLibDir('front-pl', __dirname + '/static');
    registerLibDir('polylib');
    registerLibDir('imask');
    registerLibDir('dayjs');
    registerLibDir('ace-builds', 'node_modules/ace-builds/src-noconflict');
    registerLibDir('deep-object-assign-with-reduce');
    registerLibDir('@nfjs/front-pl');
    registerLibDir('@plcmp');
    registerLibDir('@nfjs/core/api/common.js', 'node_modules/@nfjs/core/api/common.js', { singleFile: true });

    web.on('GET', '/forms/:form', formsHandler);
    web.on('GET', '/load-custom-element/:component', customElementsHandler);

    web.on('POST', '/front/action/checkSession', { middleware: ['session', 'auth'] }, checkSession);
    web.on('POST', '/front/action/getUserProfile', { middleware: ['session', 'auth'] }, getUserProfile);

    web.on('POST', '/front/action/login', { middleware: ['json', 'session'] }, login);
    web.on('POST', '/front/action/logout', { middleware: ['session', 'json'] }, logout);
    web.on('POST', '/front/action/getMenu', {}, (context) => context.send({ data: extension.menuInfo }));


    async function loadFormServerEndpoint(context, type) {
        const path = ComponentCache.getPath(context, 'pl-form', `${context?.params?.form}.js`);
        const urlFile = url.pathToFileURL(path).toString();
        const formCache = await import(urlFile);
        context.cachedObj = formCache?.serverEndpoints?.[type]?.[context?.params?.id];
    }
    web.on(
        'POST',
        '/@nfjs/front-pl/fse/:form/:type/:id',
        { middleware: ['session', context => loadFormServerEndpoint(context, context?.params?.type), 'auth', 'json'] },
        context => endpointData(context, (context?.params?.type === 'dataset') ? endpointPlDataset : endpointPlAction)
    );

    web.on('POST', '/front/action/getPackages', async (context) => {
        const root = await api.getRootPackageInfo();
        const exts = extension.getSortedExtensions().map(e => ({ name: e.name, version: e.version }));
        context.send({ data: {
            root: root,
            modules: exts
        } });
        context.end();
    });
}

export {
    init,
    menu
};
