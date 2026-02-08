import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const router = express.Router();


function signToken(userId) {
    return jwt.sign(
        { userId },                 // payload (what's inside the token)
        process.env.JWT_SECRET,     // secret key to sign it
        { expiresIn: "7d" }         // token expiry
    );
}


//SIGN UP

router.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    // 1) Basic checks
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    // 2) Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ message: "Email is already in use." });
    }

    // 3) Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) Create user in DB
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
        select: {
            id: true,
            email: true,
            createdAt: true,
        },
    });

    // 5) Create token
    const token = signToken(user.id);

    // 6) Respond
    res.status(201).json({ user, token });
});


// LOG IN
 
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // 1) Basic checks
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    // 2) Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
    }

    // 3) Compare password with hashed password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password." });
    }

    // 4) Create token
    const token = signToken(user.id);

    // 5) Return safe user info (not password)
    res.json({
        user: { id: user.id, email: user.email, createdAt: user.createdAt },
        token,
    });
});

export default router;
