import { createHmac } from "node:crypto";
import { Buffer } from "node:buffer";
import { User } from "../plugins/auth.plugin.ts";

type Alg = "HS256" | "RS256";
type Typ = "JWT";

interface Header {
    alg: Alg;
    typ: Typ;
}

interface Payload extends User {
    iat: number;
    exp: number;
}

interface JWT {
    header: Header;
    payload: Payload;
}

const secret = Deno.env.get("JWT_SECRET") ?? "unknown";

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
        const [headerbuf, payloadbuf, signaturebuf] = token.split(".");

        if (headerbuf == null || payloadbuf == null || signaturebuf == null) {
            return null;
        }

        const signature = genSignature(headerbuf, payloadbuf);

        if (signature != signaturebuf) {
            return null;
        }

        const header = JSON.parse(
            Buffer.from(headerbuf, "base64url").toString("utf-8"),
        );

        const payload = JSON.parse(
            Buffer.from(payloadbuf, "base64url").toString("utf-8"),
        );

        return { header, payload };
    } catch {
        return null;
    }
}
