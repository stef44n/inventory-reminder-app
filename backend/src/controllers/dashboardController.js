const prisma = require("../lib/prisma");

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const now = new Date();

        // 🔹 1. LOW STOCK (Consumables)
        const lowStock = await prisma.item.findMany({
            where: {
                userId,
                itemType: "CONSUMABLE",
                consumable: {
                    quantity: {
                        lte: prisma.consumable.fields.minThreshold,
                    },
                },
            },
            include: { consumable: true },
        });

        // 🔹 2. NEEDS CHARGING
        const chargeables = await prisma.item.findMany({
            where: {
                userId,
                itemType: "CHARGEABLE",
            },
            include: { chargeable: true },
        });

        const needsCharging = chargeables.filter((item) => {
            const last = item.chargeable.lastChargedAt;
            const cycle = item.chargeable.chargeCycleDays;

            const nextCharge = new Date(last);
            nextCharge.setDate(nextCharge.getDate() + cycle);

            return now >= nextCharge;
        });

        // 🔹 3. EXPIRING SOON
        const expiryItems = await prisma.item.findMany({
            where: {
                userId,
                itemType: "EXPIRY",
            },
            include: { expiry: true },
        });

        const expiringSoon = expiryItems.filter((item) => {
            const expiryDate = new Date(item.expiry.expiryDate);
            const notifyBefore = item.expiry.notifyDaysBefore;

            const notifyDate = new Date(expiryDate);
            notifyDate.setDate(notifyDate.getDate() - notifyBefore);

            return now >= notifyDate;
        });

        // 🔹 4. SUBSCRIPTIONS DUE
        const subscriptions = await prisma.item.findMany({
            where: {
                userId,
                itemType: "SUBSCRIPTION",
            },
            include: { subscription: true },
        });

        const dueSubscriptions = subscriptions.filter((item) => {
            const last = item.subscription.lastRenewedAt;
            const cycle = item.subscription.cycleDays;

            const nextRenewal = new Date(last);
            nextRenewal.setDate(nextRenewal.getDate() + cycle);

            return now >= nextRenewal;
        });

        // 🔹 Final response
        res.json({
            lowStock,
            needsCharging,
            expiringSoon,
            dueSubscriptions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
