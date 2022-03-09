export async function customLoader(name) {
	if (name.startsWith('pl-form')) {
		const formName = name.replaceAll('pl-form-', '');
		if (!customElements.get(`pl-form-${formName}`)) {
			const module = await import(`/forms/${formName}`);
			return customElements.define(`pl-form-${formName}`, module.default);
		}
	} else {
		if (!customElements.get(`${name}`)) {
			const data = await fetch(`/load-custom-element/${name}`);
			const path = await data.text();
			import('/' + path);
			return customElements.whenDefined(name);
		}
	}
}