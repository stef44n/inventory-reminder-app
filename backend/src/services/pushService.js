const webpush = require("web-push");

webpush.setVapidDetails(
    "mailto:test@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
);

// SEND NOTIFICATION
const sendNotification = async (subscription, payload) => {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (error) {
        console.error("Push error:", error);

        // 🔥 AUTO DELETE INVALID SUBSCRIPTIONS
        if (error.statusCode === 410 || error.statusCode === 404) {
            const prisma = require("../lib/prisma");

            await prisma.pushSubscription.deleteMany({
                where: {
                    endpoint: subscription.endpoint,
                },
            });

            console.log("Deleted expired subscription");
        }
    }
};

module.exports = { sendNotification };
