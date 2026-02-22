import bodyParser from "body-parser";
import express, { Request, RequestHandler } from "express";
import { randomBytes, scryptSync } from "node:crypto";
import prisma from "../client";
import { encode } from "../jwt";

import { validate, z } from "../middleware";

const router = express.Router();
const jsonParser = bodyParser.json();
router.use(jsonParser);

function generateSalt(): string {
    return randomBytes(128).toString("base64");
}

function hashPassword(password: string, salt: string): string {
    let derivedKey = scryptSync(password, salt, 64);

    return derivedKey.toString("hex");
}

const registerSchema = z.object({
    email: z.string(),
    password: z.string(),

    first_name: z.string(),
    last_name: z.string(),
});

router.post("/register", validate(registerSchema), async (req, res) => {
    try {
        let salt = generateSalt();
        let hash = hashPassword(req.body.password, salt);

        if (
            await prisma.user.findUnique({ where: { email: req.body.email } })
        ) {
            throw new Error(`Account with email already exists`);
        }

        const user = await prisma.user.create({
            data: {
                email: req.body.email,
                password: hash,
                salt: salt,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
            },
        });

        let token = encode(
            { alg: "HS256", typ: "JWT" },
            {
                sub: user.id,
                name: user.email,
                iat: Date.now() / 1000,
                exp: Date.now() / 1000 + 86400,
            },
        );

        res.status(201);
        res.json({ token });
    } catch (err) {
        res.status(403);
        res.json({ error: (err as Error).message });
    }
});

const loginSchema = z.object({
    email: z.string(),
    password: z.string(),
});

router.post("/login", validate(loginSchema), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: req.body.email },
        });

        if (user == null) {
            throw new Error("Account does not exist");
        }

        let hash = hashPassword(req.body.password, user.salt);

        if (hash != user.password) {
            throw new Error("Invalid credentials");
        }

        let token = encode(
            { alg: "HS256", typ: "JWT" },
            {
                sub: user.id,
                name: user.email,
                iat: Date.now() / 1000,
                exp: Date.now() / 1000 + 86400,
            },
        );

        res.status(200);
        res.json({ token });
    } catch (err) {
        res.status(401);
        res.json({ error: (err as Error).message });
    }
});

export default router;
