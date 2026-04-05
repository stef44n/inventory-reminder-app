const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { renewSubscription } = require("../controllers/subscriptionController");

const {
    createSubscription,
    getSubscriptions,
    updateSubscription,
    deleteSubscription,
} = require("../controllers/subscriptionController");

// Create
router.post("/", authMiddleware, createSubscription);

// Get all
router.get("/", authMiddleware, getSubscriptions);

// Update
router.put("/:id", authMiddleware, updateSubscription);
router.put("/:id/renew", authMiddleware, renewSubscription);

// Delete
router.delete("/:id", authMiddleware, deleteSubscription);

module.exports = router;
