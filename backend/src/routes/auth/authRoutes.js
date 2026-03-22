const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyUser,
    loginUser,
} = require("../../controllers/auth/authController");

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);

module.exports = router;
