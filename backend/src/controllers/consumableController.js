const prisma = require("../lib/prisma");

// CREATE CONSUMABLE
exports.createConsumable = async (req, res) => {
    try {
        const { name, category, quantity, minThreshold, unit } = req.body;

        if (!name || quantity == null || minThreshold == null) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const item = await prisma.item.create({
            data: {
                name,
                category,
                itemType: "CONSUMABLE",
                userId: req.user.id,
                consumable: {
                    create: {
                        quantity,
                        minThreshold,
                        unit,
                    },
                },
            },
            include: {
                consumable: true,
            },
        });

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET ALL CONSUMABLES
exports.getConsumables = async (req, res) => {
    try {
        const items = await prisma.item.findMany({
            where: {
                userId: req.user.id,
                itemType: "CONSUMABLE",
            },
            include: {
                consumable: true,
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

// UPDATE CONSUMABLE
exports.updateConsumable = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, quantity, minThreshold, unit } = req.body;

        // Ensure item belongs to user
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
                consumable: {
                    update: {
                        quantity,
                        minThreshold,
                        unit,
                    },
                },
            },
            include: {
                consumable: true,
            },
        });

        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE CONSUMABLE
exports.deleteConsumable = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure ownership
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
