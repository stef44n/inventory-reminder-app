const prisma = require("../lib/prisma");

// CREATE
exports.createExpiry = async (req, res) => {
    try {
        const { name, category, expiryDate, notifyDaysBefore } = req.body;

        if (!name || !expiryDate || notifyDaysBefore == null) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const item = await prisma.item.create({
            data: {
                name,
                category,
                itemType: "EXPIRY",
                userId: req.user.id,
                expiry: {
                    create: {
                        expiryDate: new Date(expiryDate),
                        notifyDaysBefore,
                    },
                },
            },
            include: {
                expiry: true,
            },
        });

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET ALL
exports.getExpiryItems = async (req, res) => {
    try {
        const items = await prisma.item.findMany({
            where: {
                userId: req.user.id,
                itemType: "EXPIRY",
            },
            include: {
                expiry: true,
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
exports.updateExpiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, expiryDate, notifyDaysBefore } = req.body;

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
                expiry: {
                    update: {
                        expiryDate: expiryDate
                            ? new Date(expiryDate)
                            : undefined,
                        notifyDaysBefore,
                    },
                },
            },
            include: {
                expiry: true,
            },
        });

        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE
exports.deleteExpiry = async (req, res) => {
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
