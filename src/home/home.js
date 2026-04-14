const api = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener("DOMContentLoaded", () => {
    const skipBtn = document.getElementById("skipBtn");
    const closeBtn = document.getElementById("closeBtn");
    const setupForm = document.getElementById("setupForm");

    skipBtn.addEventListener("click", closeWindow);
    closeBtn.addEventListener("click", closeWindow);
    setupForm.addEventListener("submit", handleSubmit);

    // Carrega configurações existentes se houver
    loadExistingSettings();
});

async function loadExistingSettings() {
    const settings = await api.storage.sync.get(["giteaUrl", "giteaToken", "checkInterval"]);

    if (settings.giteaUrl) {
        document.getElementById("giteaUrl").value = settings.giteaUrl;
    }
    if (settings.giteaToken) {
        document.getElementById("giteaToken").value = settings.giteaToken;
    }
    if (settings.checkInterval) {
        document.getElementById("checkInterval").value = settings.checkInterval;
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const giteaUrl = document.getElementById("giteaUrl").value.trim();
    const giteaToken = document.getElementById("giteaToken").value.trim();
    const checkInterval = parseFloat(document.getElementById("checkInterval").value);

    // Validações
    if (!giteaUrl || !giteaToken) {
        showMessage("Por favor, preencha todos os campos.", "error");
        return;
    }

    if (checkInterval < 0.5) {
        showMessage("O intervalo mínimo é 0.5 minutos.", "error");
        return;
    }

    const submitBtn = document.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Verificando...";

    try {
        // Testa a conexão antes de salvar
        const url = giteaUrl.endsWith("/") ? giteaUrl.slice(0, -1) : giteaUrl;
        const res = await fetch(`${url}/api/v1/notifications?status=unread`, {
            headers: {
                "Authorization": `token ${giteaToken}`
            }
        });

        if (!res.ok) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Continuar";

            if (res.status === 401) {
                showMessage("❌ Token inválido. Verifique suas credenciais.", "error");
            } else if (res.status === 404) {
                showMessage("❌ Servidor não encontrado. Verifique a URL.", "error");
            } else {
                showMessage(`❌ Erro HTTP ${res.status} ao conectar.`, "error");
            }
            return;
        }

        // Sucesso! Salva as configurações
        await api.storage.sync.set({
            giteaUrl: giteaUrl,
            giteaToken: giteaToken,
            checkInterval: checkInterval
        });

        // Mostra mensagem de sucesso
        showSuccessScreen();

    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Continuar";
        showMessage("❌ Não foi possível conectar: " + error.message, "error");
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = text;
    messageDiv.className = "message " + type;
    messageDiv.style.display = "block";

    // Remove a mensagem depois de 5 segundos se for sucesso
    if (type === "success") {
        setTimeout(() => {
            messageDiv.style.display = "none";
        }, 5000);
    }
}

function showSuccessScreen() {
    const formContent = document.getElementById("formContent");
    const successContent = document.getElementById("successContent");

    formContent.style.display = "none";
    successContent.classList.add("show");
}

async function closeWindow() {
    // Fecha a janela e remove a aba ativa
    window.close();

    try {
        // Remove a aba ativa se houver
        const tabs = await api.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            await api.tabs.remove(tabs[0].id);
        }
    } catch (err) {
        console.warn("Não foi possível fechar a aba:", err);
    }
}
