const prisma = require("../../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.registerUser = async (req, res) => {
    try {
        // 1. Extract data from request body
        const { email, password } = req.body;

        // 2. Basic validation
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        // 3. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Generate verification token (simple version for now)
        const verificationToken = Math.random().toString(36).substring(2, 15);

        // 6. Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                verificationToken,
            },
        });

        // 7. Simulate sending email (for now)
        console.log("Verify your account using this token:");
        console.log(
            `http://localhost:5000/api/auth/verify/${verificationToken}`,
        );

        // 8. Send response
        res.status(201).json({
            message: "User registered. Check console for verification link.",
            verificationToken: user.verificationToken, //
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// VERIFY
exports.verifyUser = async (req, res) => {
    try {
        // 1. Get token from URL params
        const { token } = req.params;

        // 2. Find user with this token
        const user = await prisma.user.findFirst({
            where: { verificationToken: token },
        });

        // 3. If no user found
        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid or expired token" });
        }

        // 4. Update user as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
            },
        });

        // 5. Respond success
        res.json({
            message: "Email verified successfully. You can now log in.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// LOGIN
exports.loginUser = async (req, res) => {
    try {
        // 1. Extract data
        const { email, password } = req.body;

        // 2. Validate input
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        // 3. Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 4. Check if verified
        if (!user.isVerified) {
            return res
                .status(403)
                .json({ message: "Please verify your email first" });
        }

        // 5. Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 6. Generate JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // 7. Send response
        res.json({
            message: "Login successful",
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
