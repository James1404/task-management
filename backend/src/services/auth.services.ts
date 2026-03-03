import { createHash, randomBytes, scryptSync } from "node:crypto";
import { Prisma } from "../../generated/prisma/browser.ts";
import { encode } from "../utils/jwt.ts";
import { v4 as uuidv4 } from "uuid";
import { InvalidCredentialsError, UnauthorizedError } from "../utils/error.ts";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { User } from "../plugins/auth.plugin.ts";

function generateSalt() {
    return randomBytes(128).toString("base64");
}

function hashPassword(password: string, salt: string) {
    const derivedKey = scryptSync(password, salt, 64);
    return derivedKey.toString("hex");
}

function createAccessToken(user: User) {
    return encode(
        { alg: "HS256", typ: "JWT" },
        {
            ...user,
            iat: Date.now() / 1000,
            exp: Date.now() / 1000 + 900,
        },
    );
}

function hashRefreshToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

async function issueRefreshToken(
    user_id: string,
    tx: Prisma.TransactionClient,
) {
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

interface Register {
    email: string;
    password: string;
    username: string;
}

async function register(details: Register, prisma: PrismaClient) {
    const salt = generateSalt();
    const hash = hashPassword(details.password, salt);

    if (
        await prisma.user.findUnique({
            where: { email: details.email },
        })
    ) {
        throw new InvalidCredentialsError("Email already in use");
    }

    const user = await prisma.user.create({
        data: {
            email: details.email,
            password: hash,
            salt: salt,
            username: details.username,
        },
    });

    const refresh = await issueRefreshToken(user.id, prisma);
    const access = createAccessToken({
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    });

    return {
        refresh,
        access,
    };
}

interface Login {
    email: string;
    password: string;
}

async function login(details: Login, prisma: PrismaClient) {
    const user = await prisma.user.findUnique({
        where: { email: details.email },
    });

    if (user == null) {
        throw new InvalidCredentialsError();
    }

    const hash = hashPassword(details.password, user.salt);

    if (hash != user.password) {
        throw new InvalidCredentialsError();
    }

    const refresh = await issueRefreshToken(user.id, prisma);
    const access = createAccessToken({
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    });

    return {
        refresh,
        access,
    };
}

interface Refresh {
    refresh: string;
}

async function refresh(details: Refresh, prisma: PrismaClient) {
    const hashedToken = hashRefreshToken(details.refresh);
    const dbToken = await prisma.refreshToken.findUnique({
        where: { token_hash: hashedToken },
    });

    if (dbToken == null) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    if (dbToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({
            where: { id: dbToken.id },
        });
        throw new UnauthorizedError("Refresh token expired");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: dbToken.userId,
        },
    });

    if (user == null) {
        throw new UnauthorizedError();
    }

    const refresh = await prisma.$transaction(async tx => {
        await tx.refreshToken.delete({
            where: { id: dbToken.id },
        });

        return await issueRefreshToken(dbToken.userId, tx);
    });

    const access = createAccessToken({
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    });

    return {
        refresh,
        access,
    };
}

export default { register, login, refresh };
