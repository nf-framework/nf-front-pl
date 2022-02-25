import path from 'path';
import mime from 'mime';
import { web } from '@nfjs/back';
import fs from "fs";
import { auth } from "@nfjs/auth";

import { registerLibDir, prepareResponse, getCacheKey } from "@nfjs/front-server";
import { api, extension } from "@nfjs/core";
import { ComponentCache, endpointData, endpointPlAction } from "@nfjs/back";

const __dirname = path.join(path.dirname(decodeURI(new URL(import.meta.url).pathname))).replace(/^\\([A-Z]:\\)/, "$1");
const menu = await api.loadJSON(`${__dirname}/menu.json`);
const customElementsJson = await api.loadJSON(`${__dirname}/customElements.json`);

async function formsHandler(context) {
    try {

        const frmpath = context.params.form.replace(/\./g, '/');
        const formsDir = 'forms/';

        let file = await extension.getFiles(formsDir + frmpath + '.js');
        const customOptions = context.customOptions;
        const cacheKey = getCacheKey(context.url, customOptions);
        const mimeType = mime.getType(file);
        const contentType = mimeType?.split('/')[1] || 'javascript';

        const response = await prepareResponse(cacheKey,
            { customOptions, contentType, mimeType, minify: false },
            () => {
                const stream = fs.createReadStream(file);
                stream.on('error', (e) => {
                    context.code(404);
                    context.end(`${e}`);
                })
                return stream;
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


async function init() {
    registerLibDir('front-pl', __dirname + '/static');
    registerLibDir('polylib');
    registerLibDir('imask');
    registerLibDir('dayjs');
    registerLibDir('ace-builds', 'node_modules/ace-builds/src-noconflict');

    registerLibDir('@nfjs/front-pl');
    registerLibDir('@plcmp');

    web.on('GET', '/forms/:form', formsHandler);
    web.on('GET', '/load-custom-element/:component', customElementsHandler);

    web.on('POST', '/checkSession', { middleware: ['session', 'auth'] }, checkSession);

    web.on('POST', '/front/action/login', { middleware: ['json', 'session'] }, login);
    web.on('POST', '/front/action/logout', { middleware: ['session', 'json'] }, logout);
    web.on('POST', '/front/action/getMenu', {}, (context) => context.send({ data: extension.menuInfo }));

    web.on(
        'POST',
        '/@nfjs/front-pl/pl-action/:form/:id',
        { middleware: ['session', context => ComponentCache.load(context, 'pl-form', context?.params?.form), 'auth', 'json'] },
        async (context) => { await endpointData(context, endpointPlAction);}
    );


}

export {
    init,
    menu
};
