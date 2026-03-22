const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createChargeable,
    getChargeables,
    updateChargeable,
    deleteChargeable,
} = require("../controllers/chargeableController");

// Create
router.post("/", authMiddleware, createChargeable);

// Get all
router.get("/", authMiddleware, getChargeables);

// Update
router.put("/:id", authMiddleware, updateChargeable);

// Delete
router.delete("/:id", authMiddleware, deleteChargeable);

module.exports = router;
