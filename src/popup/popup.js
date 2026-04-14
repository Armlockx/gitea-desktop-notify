document.addEventListener("DOMContentLoaded", () => {
    loadSettings();

    document.getElementById("checkNow").addEventListener("click", checkNotificationsNow);
});

async function loadSettings() {
    const settings = await chrome.storage.sync.get(["giteaUrl", "checkInterval", "keepNotification"]);

    if (settings.giteaUrl) {
        document.getElementById("serverUrl").textContent = settings.giteaUrl;
        document.getElementById("status").textContent = "🟢 Conectado";
        document.getElementById("status").style.color = "#22c55e";
    }

    if (settings.checkInterval) {
        document.getElementById("intervalValue").textContent = settings.checkInterval;
    }

    if (settings.keepNotification) {
        document.getElementById("keepNotification").textContent = settings.keepNotification;
    }
}

async function checkNotificationsNow() {
    const btn = document.getElementById("checkNow");
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
