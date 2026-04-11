const publicKey = "vapid_public_key"; // 🔥 vapid_public_key

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPush() {
    const token = localStorage.getItem("token");
    // console.log("TOKEN:", token);

    const registration = await navigator.serviceWorker.ready;

    const existingSub = await registration.pushManager.getSubscription();

    if (existingSub) {
        await existingSub.unsubscribe();
    }

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    console.log(subscription.endpoint);

    await fetch("http://localhost:5000/api/push/subscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
    });

    alert("Notifications enabled!");
}
