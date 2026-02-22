import { RequestHandler } from "express";
import { createHmac } from "node:crypto";
import prisma from "./client";

type Alg = "HS256" | "RS256";
type Typ = "JWT";

type Header = {
    alg: Alg;
    typ: Typ;
};

type Payload = {
    sub: string;
    iat: number;
    exp: number;
};

type JWT = {
    header: Header;
    payload: Payload;
};

const secret = process.env["JWT_SECRET"] ?? "unknown";

function genSignature(headerbuf: string, payloadbuf: string): string {
    return createHmac("sha256", secret)
        .update(headerbuf + "." + payloadbuf)
        .digest("base64url");
}

export function encode(header: Header, payload: Payload): string {
    const headerbuf = Buffer.from(JSON.stringify(header)).toString("base64url");

    const payloadbuf = Buffer.from(JSON.stringify(payload)).toString(
        "base64url",
    );

    const signature = genSignature(headerbuf, payloadbuf);

    return `${headerbuf}.${payloadbuf}.${signature}`;
}

export function decode(token: string): JWT | null {
    try {
        let [headerbuf, payloadbuf, signaturebuf] = token.split(".");

        const signature = genSignature(headerbuf, payloadbuf);

        const header = JSON.parse(
            Buffer.from(headerbuf, "base64url").toString("utf-8"),
        );

        const payload = JSON.parse(
            Buffer.from(payloadbuf, "base64url").toString("utf-8"),
        );

        if (signature != signaturebuf) {
            return null;
        }

        return { header, payload };
    } catch {
        return null;
    }
}

export const auth: RequestHandler = async (req, res, next) => {
    try {
        if (req.headers.authorization == null) {
            throw new Error("Authentication required");
        }

        const token = decode(req.headers.authorization);

        if (token == null) {
            throw new Error("Invalid token");
        }

        if (token.payload.exp < Date.now() / 1000) {
            throw new Error("Expired token");
        }

        const user = await prisma.user.findUnique({
            where: { id: token.payload.sub },
        });

        if (user == null) {
            throw new Error("User does not exist");
        }

        res.locals["user"] = user.id;

        next();
    } catch (err) {
        res.status(401);
        res.json({ error: (err as Error).message });
    }
};
