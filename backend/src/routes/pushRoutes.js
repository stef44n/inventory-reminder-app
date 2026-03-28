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

module.exports = router;
