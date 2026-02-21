import bodyParser from "body-parser";
import express, { Request } from "express";
import { randomBytes, scryptSync } from "node:crypto";
import prisma from "../client";
import { encode } from "../jwt";

const router = express.Router();
const jsonParser = bodyParser.json();

function generateSalt(): string {
    return randomBytes(128).toString("base64");
}

function hashPassword(password: string, salt: string): string {
    let derivedKey = scryptSync(password, salt, 64);

    return derivedKey.toString("hex");
}

interface RegisterReq extends Request {
    body: {
        email: string;
        password: string;
    };
}

router.post("/register", jsonParser, async (req: RegisterReq, res) => {
    let salt = generateSalt();
    let hash = hashPassword(req.body.password, salt);

    if (await prisma.user.findUnique({ where: { email: req.body.email } })) {
        res.send(`Account already exists with email: ${req.body.email}`);
        return;
    }

    await prisma.user.create({
        data: {
            email: req.body.email,
            password: hash,
            salt: salt,
        },
    });

    res.send(
        `${req.body["password"]} once hashed is: ${hash}, with salt: ${salt}`,
    );
});

interface LoginReq extends Request {
    body: {
        email: string;
        password: string;
    };
}

router.post("/login", jsonParser, async (req: LoginReq, res) => {
    const user = await prisma.user.findUnique({
        where: { email: req.body.email },
    });

    if (user == null) {
        res.send("Account does not exist");
        return;
    }

    let hash = hashPassword(req.body.password, user.salt);

    if (hash != user.password) {
        res.send("Invalid credentials");
        return;
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

    res.send(`Success: ${token}`);
});

export default router;
