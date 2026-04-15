const api = typeof browser !== 'undefined' ? browser : chrome;

let notificationUrls = {};
let checkInterval = 0.5;

api.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
        await api.tabs.create({
            url: api.runtime.getURL("src/home/home.html")
        });
    }

    const result = await api.storage.sync.get(["giteaUrl", "giteaToken"]);
    if (result.giteaUrl && result.giteaToken) {
        startAlarm();
    }
});

async function startAlarm() {
    const alarms = await api.alarms.getAll();
    const exists = alarms.some(alarm => alarm.name === "checkGitea");
    if (!exists) {
        api.alarms.create("checkGitea", {
            periodInMinutes: checkInterval
        });
    }
}

async function checkNotifications() {
    try {
        const settings = await api.storage.sync.get(["giteaUrl", "giteaToken", "keepNotification"]);

        if (!settings.giteaUrl || !settings.giteaToken) {
            console.warn("Gitea URL ou TOKEN não configurados");
            return;
        }

        const giteaUrl = settings.giteaUrl.replace(/\/$/, ""); // Remove trailing slash
        const res = await fetch(`${giteaUrl}/api/v1/notifications?status=unread`, {
            headers: {
                "Authorization": `token ${settings.giteaToken}`
            }
        });

        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }

        const data = await res.json();

        const result = await api.storage.local.get("seen");
        let seen = new Set(result.seen || []);

        for (const n of data) {
            if (!seen.has(n.id)) {
                seen.add(n.id);
                notificationUrls[n.id] = n.subject.html_url;

                const title = `${n.repository.full_name} - ${n.subject.type}`;
                const message = n.subject.title;

                const notifOptions = {
                    type: "basic",
                    iconUrl: api.runtime.getURL("icons/icon-48.png"),
                    title: title,
                    message: message,
                };

                if (settings.keepNotification) {
                    notifOptions.requireInteraction = true;
                }

                try {
                    await api.notifications.create(n.id.toString(), notifOptions);
                    console.log(`Notificação criada: ${title}`);
                } catch (err) {
                    console.warn("Falha ao criar notificação:", err);
                }
            }
        }

        await api.storage.local.set({ seen: Array.from(seen) });
    } catch (error) {
        console.error("Erro ao verificar notificações:", error);
    }
}
// Listener para alarmes
api.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkGitea") {
        checkNotifications();
    }
});

// Listener para cliques nas notificações
api.notifications.onClicked.addListener(async (id) => {
    const url = notificationUrls[id];
    if (url) {
        await api.tabs.create({ url: url });
    }
    await api.notifications.clear(id);
});

// Listener para mudanças nas configurações
api.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && (changes.giteaUrl || changes.giteaToken || changes.checkInterval)) {
        console.log("Configurações atualizadas");
        if (changes.checkInterval) {
            checkInterval = changes.checkInterval.newValue;
            api.alarms.clear("checkGitea").then(() => startAlarm());
        }
        checkNotifications();
    }
});

startAlarm();
