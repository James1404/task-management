import { RequestHandler } from "express";
import { createHmac } from "node:crypto";

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
};

type JWT = {
    header: Header;
    payload: Payload;
};

export function encodeToken(header: Header, payload: Payload): string {
    const headerbuf = Buffer.from(JSON.stringify(header)).toString("base64url");

    const payloadbuf = Buffer.from(JSON.stringify(payload)).toString(
        "base64url",
    );

    const secret = "a-string-secret-at-least-256-bits-long";

    const signature = createHmac("sha256", secret)
        .update(headerbuf + "." + payloadbuf)
        .digest("base64url");

    return `${headerbuf}.${payloadbuf}.${signature}`;
}

export const auth: RequestHandler = (res, req, next) => {
    console.log("log");
    next();
};
