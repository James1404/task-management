import { createHash, randomBytes, scryptSync } from "node:crypto";
import { encode } from "./jwt.ts";
import { User } from "../plugins/auth.plugin.ts";

export function generateSalt() {
    return randomBytes(128).toString("base64");
}

export function hashPassword(password: string, salt: string) {
    const derivedKey = scryptSync(password, salt, 64);
    return derivedKey.toString("hex");
}

export function createAccessToken(user: User) {
    return encode(
        { alg: "HS256", typ: "JWT" },
        {
            ...user,
            iat: Date.now() / 1000,
            exp: Date.now() / 1000 + 900,
        },
    );
}

export function hashRefreshToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}
