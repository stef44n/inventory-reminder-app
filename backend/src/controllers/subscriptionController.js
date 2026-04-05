const prisma = require("../lib/prisma");

// CREATE
exports.createSubscription = async (req, res) => {
    try {
        const { name, category, cycleDays } = req.body;

        if (!name || !cycleDays) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const item = await prisma.item.create({
            data: {
                name,
                category,
                itemType: "SUBSCRIPTION",
                userId: req.user.id,
                subscription: {
                    create: {
                        lastRenewedAt: new Date(),
                        cycleDays,
                    },
                },
            },
            include: {
                subscription: true,
            },
        });

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET ALL
exports.getSubscriptions = async (req, res) => {
    try {
        const items = await prisma.item.findMany({
            where: {
                userId: req.user.id,
                itemType: "SUBSCRIPTION",
            },
            include: {
                subscription: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// UPDATE
exports.updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, cycleDays, lastRenewedAt } = req.body;

        const existingItem = await prisma.item.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!existingItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        const updatedItem = await prisma.item.update({
            where: { id },
            data: {
                name,
                category,
                lastUpdated: new Date(),
                subscription: {
                    update: {
                        cycleDays,
                        lastRenewedAt: lastRenewedAt
                            ? new Date(lastRenewedAt)
                            : undefined,
                    },
                },
            },
            include: {
                subscription: true,
            },
        });

        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE
exports.deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        const existingItem = await prisma.item.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!existingItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        await prisma.item.delete({
            where: { id },
        });

        res.json({ message: "Item deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.renewSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await prisma.subscription.update({
            where: { itemId: id },
            data: {
                lastRenewedAt: new Date(),
            },
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error renewing subscription" });
    }
};
