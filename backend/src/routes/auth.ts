import bodyParser from "body-parser";
import express from "express";
import { createHash, randomBytes, scryptSync } from "node:crypto";
import prisma from "../client";
import { encode } from "../jwt";

import { v4 as uuidv4 } from "uuid";

import { validate, z } from "../middleware";
import { Prisma } from "../../generated/prisma/client";

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
            throw new RouteError(`Account with email already exists`);
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

        let refresh = await issueRefreshToken(user.id, prisma);
        let access = createAccessToken(user.id);

        res.status(200).json({
            refresh,
            access,
        });
    } catch (e) {
        const err = e as RouteError;
        res.status(err.status_code).json({ error: err.message });
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
            throw new RouteError("Account does not exist");
        }

        let hash = hashPassword(req.body.password, user.salt);

        if (hash != user.password) {
            throw new RouteError("Invalid credentials");
        }

        let refresh = await issueRefreshToken(user.id, prisma);
        let access = createAccessToken(user.id);

        res.status(200).json({
            refresh,
            access,
        });
    } catch (e) {
        const err = e as RouteError;
        res.status(err.status_code).json({ error: err.message });
    }
});

router.post("/logout", async (req, res) => {
    // let user_id = res.locals["user"] as string;

    res.status(502).end();
});

function createAccessToken(user_id: string): string {
    return encode(
        { alg: "HS256", typ: "JWT" },
        {
            sub: user_id,
            iat: Date.now() / 1000,
            exp: Date.now() / 1000 + 900,
        },
    );
}
function hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

async function issueRefreshToken(
    user_id: string,
    tx: Prisma.TransactionClient,
): Promise<string> {
    const newToken = uuidv4();

    await tx.refreshToken.create({
        data: {
            token_hash: hashRefreshToken(newToken),
            user: {
                connect: {
                    id: user_id,
                },
            },
            expiresAt: new Date(Date.now() + 604800000),
        },
    });

    return newToken;
}

const refreshSchema = z.object({
    refresh: z.string(),
});

router.post("/refresh", validate(refreshSchema), async (req, res) => {
    try {
        const hashedToken = hashRefreshToken(req.body.refresh);
        const dbToken = await prisma.refreshToken.findUnique({
            where: { token_hash: hashedToken },
        });

        if (dbToken == null) {
            throw new RouteError("Invalid refresh token");
        }

        if (dbToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({
                where: { id: dbToken.id },
            });
            throw new RouteError("Expired refresh token");
        }

        let newToken = await prisma.$transaction(async tx => {
            await tx.refreshToken.delete({
                where: { id: dbToken.id },
            });

            return await issueRefreshToken(dbToken.userId, tx);
        });

        res.status(200).json({
            refresh: newToken,
            access: createAccessToken(dbToken.userId),
        });
    } catch (e) {
        const err = e as RouteError;
        res.status(err.status_code).json({ error: err.message });
    }
});

export default router;
