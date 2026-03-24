const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createExpiry,
    getExpiryItems,
    updateExpiry,
    deleteExpiry,
} = require("../controllers/expiryController");

// Create
router.post("/", authMiddleware, createExpiry);

// Get all
router.get("/", authMiddleware, getExpiryItems);

// Update
router.put("/:id", authMiddleware, updateExpiry);

// Delete
router.delete("/:id", authMiddleware, deleteExpiry);

module.exports = router;
