let notificationUrls = {};
let checkInterval = 0.5;

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("src/home/home.html")
        });
    }
    
    chrome.storage.sync.get(["giteaUrl", "giteaToken"], (result) => {
        if (result.giteaUrl && result.giteaToken) {
            startAlarm();
        }
    });
});

function startAlarm() {
    chrome.alarms.getAll((alarms) => {
        const exists = alarms.some(alarm => alarm.name === "checkGitea");
        if (!exists) {
            chrome.alarms.create("checkGitea", {
                periodInMinutes: checkInterval
            });
        }
    });
}

async function checkNotifications() {
    try {
        const settings = await chrome.storage.sync.get(["giteaUrl", "giteaToken"]);
        
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

        const result = await chrome.storage.local.get("seen");
        let seen = new Set(result.seen || []);

        data.forEach(n => {
            if (!seen.has(n.id)) {
                seen.add(n.id);
                notificationUrls[n.id] = n.subject.html_url;

                const title = `${n.repository.full_name} - ${n.subject.type}`;
                const message = n.subject.title;

                chrome.notifications.create(n.id.toString(), {
                    type: "basic",
                    iconUrl: chrome.runtime.getURL("icons/icon-48.png"),
                    title: title,
                    message: message,
                    requireInteraction: true,
                });

                console.log(`Notificação criada: ${title}`);
            }
        });

        chrome.storage.local.set({ seen: Array.from(seen) });
    } catch (error) {
        console.error("Erro ao verificar notificações:", error);
    }
}

// Listener para alarmes
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkGitea") {
        checkNotifications();
    }
});

// Listener para clique em notificação
chrome.notifications.onClicked.addListener((id) => {
    const url = notificationUrls[id];
    if (url) {
        chrome.tabs.create({ url: url });
    }
    chrome.notifications.clear(id);
});

// Listener para quando as configurações mudam
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && (changes.giteaUrl || changes.giteaToken || changes.checkInterval)) {
        console.log("Configurações atualizadas");
        if (changes.checkInterval) {
            checkInterval = changes.checkInterval.newValue;
            chrome.alarms.clear("checkGitea", () => {
                startAlarm();
            });
        }
        checkNotifications();
    }
});

startAlarm();
