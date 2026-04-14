// `storage` vem do módulo compartilhado ../utils/storage.js
const storage = (typeof window !== 'undefined' && window.storage) ? window.storage : ((typeof globalThis !== 'undefined') ? globalThis.storage : null);

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();

    const checkNowBtn = document.getElementById("checkNow");
    if (checkNowBtn) checkNowBtn.addEventListener("click", checkNotificationsNow);

    const keepEl = document.getElementById("keepNotification");
    if (keepEl) {
        keepEl.addEventListener("change", async (e) => {
            try {
                await storage.set({ keepNotification: e.target.checked });
            } catch (err) {
                console.error('Erro ao salvar keepNotification:', err);
            }
        });
    }
});

async function loadSettings() {
    const settings = await storage.get(["giteaUrl", "checkInterval", "keepNotification"]);

    const serverUrlEl = document.getElementById("serverUrl");
    const statusEl = document.getElementById("status");
    const intervalEl = document.getElementById("intervalValue");
    const keepEl = document.getElementById("keepNotification");

    if (settings.giteaUrl) {
        serverUrlEl.textContent = settings.giteaUrl;
        statusEl.textContent = "🟢 Conectado";
        statusEl.style.color = "#22c55e";
    } else {
        serverUrlEl.textContent = "Não configurado";
        statusEl.textContent = "🔴 Desconectado";
        statusEl.style.color = "";
    }

    if (settings.checkInterval) {
        intervalEl.textContent = settings.checkInterval;
    }

    if (keepEl) keepEl.checked = !!settings.keepNotification;
}

async function checkNotificationsNow() {
    const btn = document.getElementById("checkNow");
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = "Verificando...";

    try {
        await chrome.runtime.sendMessage({ action: "checkNotifications" });
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = "✓ Verificado";
            setTimeout(() => {
                btn.textContent = "Verificar Agora";
            }, 1000);
        }, 1000);
    } catch (error) {
        console.error("Erro ao verificar:", error);
        btn.disabled = false;
        btn.textContent = "Erro ao verificar";
    }
}
