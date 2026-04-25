self.addEventListener("push", (event) => {
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: data.body,
    });
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    event.waitUntil(clients.openWindow("/dashboard"));
});
