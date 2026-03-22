const prisma = require("../lib/prisma");

// CREATE
exports.createChargeable = async (req, res) => {
    try {
        const { name, category, chargeCycleDays } = req.body;

        if (!name || !chargeCycleDays) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const item = await prisma.item.create({
            data: {
                name,
                category,
                itemType: "CHARGEABLE",
                userId: req.user.id,
                chargeable: {
                    create: {
                        lastChargedAt: new Date(),
                        chargeCycleDays,
                    },
                },
            },
            include: {
                chargeable: true,
            },
        });

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET ALL
exports.getChargeables = async (req, res) => {
    try {
        const items = await prisma.item.findMany({
            where: {
                userId: req.user.id,
                itemType: "CHARGEABLE",
            },
            include: {
                chargeable: true,
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
exports.updateChargeable = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, chargeCycleDays, lastChargedAt } = req.body;

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
                chargeable: {
                    update: {
                        chargeCycleDays,
                        lastChargedAt: lastChargedAt
                            ? new Date(lastChargedAt)
                            : undefined,
                    },
                },
            },
            include: {
                chargeable: true,
            },
        });

        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE
exports.deleteChargeable = async (req, res) => {
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
