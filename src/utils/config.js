/**
 * Arquivo de configurações compartilhadas
 * Constantes e funções auxiliares usadas em toda a extensão
 */
const api = typeof browser !== 'undefined' ? browser : chrome;

const CONFIG = {
    API_VERSION: "v1",
    STORAGE_KEYS: {
        GITEA_URL: "giteaUrl",
        GITEA_TOKEN: "giteaToken",
        CHECK_INTERVAL: "checkInterval",
        SEEN_NOTIFICATIONS: "seen"
    },
    DEFAULTS: {
        CHECK_INTERVAL: 0.5, // minutos
        MIN_CHECK_INTERVAL: 0.5
    },
    ALARM_NAME: "checkGitea",
    ICON_PATH: "icons/icon-128.png"
};

/**
 * Obter configurações do armazenamento
 */
async function getStorageSettings() {
    return await api.storage.sync.get([
        CONFIG.STORAGE_KEYS.GITEA_URL,
        CONFIG.STORAGE_KEYS.GITEA_TOKEN,
        CONFIG.STORAGE_KEYS.CHECK_INTERVAL
    ]);
}

/**
 * Salvar configurações no armazenamento
 */
async function saveStorageSettings(url, token, interval) {
    const settings = {};
    settings[CONFIG.STORAGE_KEYS.GITEA_URL] = url;
    settings[CONFIG.STORAGE_KEYS.GITEA_TOKEN] = token;
    settings[CONFIG.STORAGE_KEYS.CHECK_INTERVAL] = interval;

    return await api.storage.sync.set(settings);
}

/**
 * Normalizar URL do Gitea (remove trailing slash)
 */
function normalizeGiteaUrl(url) {
    return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Construir URL da API
 */
function buildApiUrl(baseUrl, endpoint) {
    const normalized = normalizeGiteaUrl(baseUrl);
    return `${normalized}/api/${CONFIG.API_VERSION}${endpoint}`;
}
