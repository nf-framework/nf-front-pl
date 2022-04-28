let unauthorizedRequests = [];

export function requestData(url, params = {}) {
	return new Promise((resolve, reject) => {
		if (!params.unauthorized && unauthorizedRequests.length != 0) {
			unauthorizedRequests.push({
				arguments: [url, params],
				resolve: resolve,
				reject: reject
			});
			return;
		}
		fetch(`${url}`, params).then((response) => {
			if (response.ok) {
				if (unauthorizedRequests.length != 0) {
					let reqs = unauthorizedRequests;
					unauthorizedRequests = [];
					reqs.forEach(req => {
						requestData.apply(this, req.arguments).then(req.resolve).catch(req.reject);
					});
				}

				resolve(response);
			} else if (response.status === 401) {
				if (unauthorizedRequests.length == 0) {
					window.dispatchEvent(new CustomEvent('unauthorized'));
				}
				unauthorizedRequests.push({
					arguments: [url, params],
					resolve: resolve,
					reject: reject
				});
			} else {
				reject(response);
			}
		}).catch((err) => {
			reject(err);
		});
	});
}