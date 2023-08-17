class Cache {
	constructor() {
		this.store = {};
	}

	// Set a value in the cache with a key
	set(key, value, ttl = null) {
		const data = {
			value,
			expiry: ttl ? Date.now() + ttl : null,
		};
		this.store[key] = data;
	}

	// Get a value from the cache using a key
	get(key) {
		const data = this.store[key];
		if (!data) {
			return null;
		}

		// Check if the data has expired
		if (data.expiry && Date.now() > data.expiry) {
			delete this.store[key];
			return null;
		}

		return data.value;
	}

	// Remove a value from the cache using a key
	remove(key) {
		delete this.store[key];
	}

	// Clear the entire cache
	clear() {
		this.store = {};
	}
}

module.exports = new Cache();
