const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const prisma = require("../lib/prisma");

// SAVE SUBSCRIPTION
router.post("/subscribe", authMiddleware, async (req, res) => {
    try {
        const subscription = req.body;

        const { endpoint, keys } = subscription;

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return res
                .status(400)
                .json({ message: "Invalid subscription object" });
        }

        await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {},
            create: {
                userId: req.user.id,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                deviceType: "WEB",
            },
        });

        res.json({ message: "Subscription saved" });
    } catch (error) {
        console.error("FULL ERROR:", error);
        res.status(500).json({ message: error.message });
    }
});

const { sendNotification } = require("../services/pushService");

router.get("/test", authMiddleware, async (req, res) => {
    try {
        // 1. Get user subscriptions
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId: req.user.id },
        });

        if (!subscriptions.length) {
            return res.status(400).json({ message: "No subscriptions found" });
        }

        // 2. Send notification to each device
        for (const sub of subscriptions) {
            await sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                {
                    title: "🔥 Test Notification",
                    body: "Your push system is working!",
                },
            );
        }

        res.json({ message: "Notification sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending notification" });
    }
});

module.exports = router;
