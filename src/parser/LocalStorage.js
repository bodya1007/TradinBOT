class LocalStorage{
    constructor() {
        this._storage = localStorage;
    }

    set(key, value) {
        return this._storage.setItem(key, value);
    }

    get(key) {
        return this._storage.getItem(key)
    }
}

const storage = new LocalStorage()

module.exports = storage;