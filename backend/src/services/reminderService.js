const { sendNotification } = require("./pushService");
const prisma = require("../lib/prisma");

// 🔹 CALCULATE nextReminderDate FOR ONE ITEM
const calculateNextReminder = (item) => {
    const now = new Date();

    switch (item.itemType) {
        case "CONSUMABLE":
            if (item.consumable.quantity <= item.consumable.minThreshold) {
                // 🔥 KEEP EXISTING REMINDER DATE if already set
                return item.nextReminderDate || now;
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

        // 🔔 SEND NOTIFICATION IF DUE
        const now = new Date();

        if (
            nextReminderDate &&
            now >= nextReminderDate &&
            (!item.lastNotifiedAt || item.lastNotifiedAt < nextReminderDate)
        ) {
            const subscriptions = await prisma.pushSubscription.findMany({
                where: { userId: item.userId },
            });

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
                        title: "Reminder",
                        body: `${item.name} needs attention`,
                    },
                );
            }

            await prisma.item.update({
                where: { id: item.id },
                data: {
                    lastNotifiedAt: now,
                },
            });
        }
    }

    console.log("Reminders updated");
};

module.exports = {
    calculateNextReminder,
    updateAllReminders,
};
