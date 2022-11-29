const host = import.meta.url.match(/^[a-z]+:\/\/[^\/]+/i)?.[0] ?? '';

const importQueue = [];
export async function customLoader(name) {
	if (name.startsWith('pl-form-')) {
		const formName = name.replaceAll('pl-form-', '');
		if (!customElements.get(name) && !importQueue.includes(name)) {
			importQueue.push(name);
			const module = await import(`/forms/${formName}`);
			customElements.define(name, module.default);
		}
	} else {
		if (!customElements.get(name) && !importQueue.includes(name)) {
			importQueue.push(name);
			const data = await fetch(`${host}/load-custom-element/${name}`);
			const path = await data.text();
			import('/' + path);
		}
	}
	return customElements.whenDefined(name);
}