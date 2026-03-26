const prisma = require("../lib/prisma");

// 🔹 CALCULATE nextReminderDate FOR ONE ITEM
const calculateNextReminder = (item) => {
    const now = new Date();

    switch (item.itemType) {
        case "CONSUMABLE":
            if (item.consumable.quantity <= item.consumable.minThreshold) {
                return now;
            }
            return null;

        case "CHARGEABLE": {
            const last = new Date(item.chargeable.lastChargedAt);
            const next = new Date(last);
            next.setDate(next.getDate() + item.chargeable.chargeCycleDays);
            return next;
        }

        case "EXPIRY": {
            const expiry = new Date(item.expiry.expiryDate);
            const notifyDate = new Date(expiry);
            notifyDate.setDate(
                notifyDate.getDate() - item.expiry.notifyDaysBefore,
            );
            return notifyDate;
        }

        case "SUBSCRIPTION": {
            const last = new Date(item.subscription.lastRenewedAt);
            const next = new Date(last);
            next.setDate(next.getDate() + item.subscription.cycleDays);
            return next;
        }

        default:
            return null;
    }
};

// 🔹 UPDATE ALL ITEMS
const updateAllReminders = async () => {
    const items = await prisma.item.findMany({
        include: {
            consumable: true,
            chargeable: true,
            expiry: true,
            subscription: true,
        },
    });

    for (const item of items) {
        const nextReminderDate = calculateNextReminder(item);

        await prisma.item.update({
            where: { id: item.id },
            data: { nextReminderDate },
        });
    }

    console.log("Reminders updated");
};

module.exports = {
    calculateNextReminder,
    updateAllReminders,
};
