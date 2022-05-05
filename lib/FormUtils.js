import { customLoader } from './CustomElementsLoader.js';

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
      dom._formManager = options?.formManager
      if (options?.params && options.params instanceof Object) {
            Object.assign(dom, options.params);
      }

      target.append(dom);
      return /**@type PlForm*/ dom;
}

