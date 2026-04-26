self.addEventListener("install", (event) => {
    console.log("SW installing...");
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("SW activated");
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
    const data = event.data.json();

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
        }),
    );
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    event.waitUntil(clients.openWindow("/dashboard"));
});
