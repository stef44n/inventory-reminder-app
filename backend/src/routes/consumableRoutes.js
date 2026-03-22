const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createConsumable,
    getConsumables,
    updateConsumable,
    deleteConsumable,
} = require("../controllers/consumableController");

// Create
router.post("/", authMiddleware, createConsumable);

// Get all
router.get("/", authMiddleware, getConsumables);

// Update
router.put("/:id", authMiddleware, updateConsumable);

// Delete
router.delete("/:id", authMiddleware, deleteConsumable);

module.exports = router;
