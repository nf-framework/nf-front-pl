import { customLoader } from './CustomElementsLoader.js';
import { getNextWM } from "polylib/engine/v1/ctx.js";

/**
 * Open form into `target` element
 * @param {String} name
 * @param {Element} target - DOM Element to insert form into
 * @param {Object} [options] - Options for open form
 * @param {Object} [options.params] - arguments for new form, will assign to form element
 * @param {Function} [options._closeCallback] - callback function after close form
 * @param {Object} [options.formManager] - form manager instance
 * @return {Promise<PlForm>} - DOM element of created form
 */
export async function openForm(name, target, options) {
      await customLoader(`pl-form-${name}`);
      const dom = document.createElement(`pl-form-${name}`);
      await dom.ready;
      dom._formName = name;
      dom._closeCallback = options?._closeCallback;
      dom._formsThread = options?.formsThread
      if (options?.params && options.params instanceof Object) {
            Object.entries(options.params).forEach( ([k,v]) => {
                  if (dom._dp[k]) {
                        dom._props[k] = v;
                  } else {
                        console.log(`deprecated use form argument for undeclared property (opened form: ${name}, property: ${k})`);
                        dom[k] = v;
                  }
            });
      }
      target.append(dom);
      setTimeout(() => {
            if (options?.params && options.params instanceof Object) {
                  Object.keys(options?.params).forEach(p => {
                        if (dom._props[p] !== dom._dp[p]?.value) dom.notifyChange({ action: 'upd', path: p, value: dom._props[p], init: true, wmh: getNextWM() })
                  })
            }
      })
      return /**@type PlForm*/ dom;
}


export async function loadTemplateComponents(template) {
      let __awaits = [];
      let usedCEL = new Set(), usedCE = new Set(), forms = new Set();
      let tw = document.createTreeWalker(template.tpl.content, NodeFilter.SHOW_ELEMENT ,
          { acceptNode: n => n.localName?.match(/\w+-/) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP } );
      while( tw.nextNode() ) {
            let node = tw.currentNode;
            if (node.getAttribute('loading') === 'lazy')
                  usedCEL.add(node.localName);
            else {
                  if (node.localName.startsWith('pl-form-'))
                        forms.add(node.localName);
                  else
                        usedCE.add(node.localName);
            }
      }
      return Promise.all( [...forms].map(c => customLoader?.(c))).then( () => {
            __awaits.push(...([...forms].map(x => loadTemplateComponents(customElements.get(x).template))));
            __awaits.push(...([...template.nestedTemplates].map(t => loadTemplateComponents(t[1]))));
            usedCE.forEach(c => { __awaits.push(customLoader?.(c)) });
            usedCEL.forEach(c => { customLoader?.(c) });
            let watchDog = setTimeout(() => {
                  console.log(usedCE, __awaits)
                  throw 'Timeout loading components'
            }, 10000)
            return Promise.all(__awaits).then(() => { clearTimeout(watchDog); return true; });
      });
}
