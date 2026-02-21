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
    name: string;
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
        let asd = token.split(".");
        if (asd.length != 3) {
            return null;
        }

        const signature = genSignature(asd[0], asd[1]);

        const header = JSON.parse(
            Buffer.from(asd[0], "base64url").toString("utf-8"),
        );

        const payload = JSON.parse(
            Buffer.from(asd[1], "base64url").toString("utf-8"),
        );

        if (signature != asd[2]) {
            return null;
        }

        console.log(header);
        console.log(payload);

        return { header, payload };
    } catch {
        return null;
    }
}

export const auth: RequestHandler = async (req, res, next) => {
    if (req.headers.authorization == null) {
        res.send("No JWT token");
        return;
    }

    const token = decode(req.headers.authorization);

    if (token == null) {
        res.send("Invalid JWT token");
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id: token.payload.sub },
    });

    if (user == null) {
        res.send("User does not exist");
        return;
    }

    res.locals["user"] = user.id;

    next();
};
