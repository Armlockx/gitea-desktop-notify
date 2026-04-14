// Storage wrapper: fornece `storage.get(keys)` e `storage.set(items)` que retornam Promises.
// Funciona com `chrome.storage.sync`, `browser.storage.sync` ou fallback para localStorage.
(function () {
    function createStorage() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            const sync = chrome.storage.sync;
            return {
                get: (keys) => new Promise((resolve, reject) => {
                    try {
                        const maybe = sync.get(keys, (res) => {
                            if (chrome.runtime && chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                            resolve(res || {});
                        });
                        if (maybe && typeof maybe.then === 'function') maybe.then(resolve).catch(reject);
                    } catch (err) { reject(err); }
                }),
                set: (items) => new Promise((resolve, reject) => {
                    try {
                        const maybe = sync.set(items, () => {
                            if (chrome.runtime && chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                            resolve();
                        });
                        if (maybe && typeof maybe.then === 'function') maybe.then(resolve).catch(reject);
                    } catch (err) { reject(err); }
                })
            };
        }

        if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
            return { get: (keys) => browser.storage.sync.get(keys), set: (items) => browser.storage.sync.set(items) };
        }

        return {
            get: (keys) => Promise.resolve((() => {
                const res = {};
                if (Array.isArray(keys)) {
                    keys.forEach(k => {
                        const raw = localStorage.getItem(k);
                        try { res[k] = JSON.parse(raw); } catch { res[k] = raw; }
                    });
                } else if (typeof keys === 'string') {
                    const raw = localStorage.getItem(keys);
                    try { res[keys] = JSON.parse(raw); } catch { res[keys] = raw; }
                } else if (keys && typeof keys === 'object') {
                    Object.keys(keys).forEach(k => {
                        const raw = localStorage.getItem(k);
                        try { res[k] = JSON.parse(raw); } catch { res[k] = raw; }
                        if (res[k] === null || res[k] === undefined) res[k] = keys[k];
                    });
                }
                return res;
            })()),
            set: (items) => Promise.resolve(Object.entries(items).forEach(([k, v]) => {
                try { localStorage.setItem(k, JSON.stringify(v)); } catch { localStorage.setItem(k, String(v)); }
            }))
        };
    }

    try {
        // Expor globalmente como `storage` para páginas da extensão
        window.storage = createStorage();
    } catch (err) {
        // Em contextos sem `window` (improvável para pages), tentar expor no globalThis
        try { globalThis.storage = createStorage(); } catch (e) { /* ignore */ }
    }
})();
