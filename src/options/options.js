document.addEventListener("DOMContentLoaded", loadSettings);
document.getElementById("settingsForm").addEventListener("submit", saveSettings);
document.getElementById("testBtn").addEventListener("click", testConnection);

async function loadSettings() {
    const settings = await chrome.storage.sync.get(["giteaUrl", "giteaToken", "checkInterval", "keepNotification"]);

    if (settings.giteaUrl) {
        document.getElementById("giteaUrl").value = settings.giteaUrl;
    }
    if (settings.giteaToken) {
        document.getElementById("giteaToken").value = settings.giteaToken;
    }
    if (settings.checkInterval) {
        document.getElementById("checkInterval").value = settings.checkInterval;
    }
    if (settings.keepNotification !== undefined) {
        document.getElementById("keepNotification").checked = settings.keepNotification;
    }
}

async function saveSettings(e) {
    e.preventDefault();

    const giteaUrl = document.getElementById("giteaUrl").value.trim();
    const giteaToken = document.getElementById("giteaToken").value.trim();
    const checkInterval = parseFloat(document.getElementById("checkInterval").value);
    const keepNotification = document.getElementById("keepNotification").checked;

    if (!giteaUrl || !giteaToken) {
        showMessage("Por favor, preencha todos os campos obrigatórios.", "error");
        return;
    }

    if (checkInterval < 0.5) {
        showMessage("O intervalo mínimo é 0.5 minutos.", "error");
        return;
    }

    try {
        await chrome.storage.sync.set({
            giteaUrl: giteaUrl,
            giteaToken: giteaToken,
            checkInterval: checkInterval,
            keepNotification: keepNotification
        });
        showMessage("✓ Configurações salvas com sucesso!", "success");
    } catch (error) {
        showMessage("Erro ao salvar: " + error.message, "error");
    }
}

async function testConnection() {
    const giteaUrl = document.getElementById("giteaUrl").value.trim();
    const giteaToken = document.getElementById("giteaToken").value.trim();

    if (!giteaUrl || !giteaToken) {
        showMessage("Preencha a URL e o token antes de testar.", "error");
        return;
    }

    const testBtn = document.getElementById("testBtn");
    testBtn.disabled = true;
    testBtn.textContent = "🔄 Testando...";

    try {
        const url = giteaUrl.endsWith("/") ? giteaUrl.slice(0, -1) : giteaUrl;
        const res = await fetch(`${url}/api/v1/notifications?status=unread`, {
            headers: {
                "Authorization": `token ${giteaToken}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            showMessage(`✓ Conexão OK! Você tem ${data.length} notificações.`, "success");
        } else if (res.status === 401) {
            showMessage("✗ Token inválido. Verifique suas credenciais.", "error");
        } else if (res.status === 404) {
            showMessage("✗ Servidor não encontrado. Verifique a URL.", "error");
        } else {
            showMessage(`✗ Erro HTTP ${res.status}`, "error");
        }
    } catch (error) {
        showMessage("✗ Não foi possível conectar: " + error.message, "error");
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = "🧪 Testar Conexão";
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = text;
    messageDiv.className = "message " + type;

    if (type === "success") {
        setTimeout(() => {
            messageDiv.textContent = "";
            messageDiv.className = "message";
        }, 3000);
    }
}
