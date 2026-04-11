self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("install", (event) => {
    console.log("Service Worker installing...");
});

self.addEventListener("fetch", (event) => {
    // basic pass-through for now
});

self.addEventListener("push", function (event) {
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: data.body,
    });
});
