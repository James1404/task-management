import { createHash, randomBytes, scryptSync } from "node:crypto";
import { encode } from "../jwt.ts";
import { v4 as uuidv4 } from "uuid";
import { RouteError } from "../utils.ts";
import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import { Prisma } from "../../generated/prisma/client.ts";

function generateSalt(): string {
    return randomBytes(128).toString("base64");
}

function hashPassword(password: string, salt: string): string {
    const derivedKey = scryptSync(password, salt, 64);
    return derivedKey.toString("hex");
}

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

export default async function routes(
    fastify: FastifyInstance,
    _options: object,
) {
    fastify.setErrorHandler((error, _request, reply) => {
        if (error instanceof RouteError) {
            const err = error as RouteError;
            reply.status(err.status_code);
            return { error: err.message };
        }

        throw error;
    });

    const RegisterBody = Type.Object({
        email: Type.String({ format: "email" }),
        password: Type.String(),
        username: Type.String(),
    });
    type RegisterBodyType = Static<typeof RegisterBody>;

    fastify.post<{ Body: RegisterBodyType }>(
        "/register",
        { schema: { body: RegisterBody } },
        async (request, _reply) => {
            const salt = generateSalt();
            const hash = hashPassword(request.body.password, salt);

            if (
                await fastify.prisma.user.findUnique({
                    where: { email: request.body.email },
                })
            ) {
                throw new RouteError(`Account with email already exists`);
            }

            const user = await fastify.prisma.user.create({
                data: {
                    email: request.body.email,
                    password: hash,
                    salt: salt,
                    username: request.body.username,
                },
            });

            const refresh = await issueRefreshToken(user.id, fastify.prisma);
            const access = createAccessToken(user.id);

            return {
                refresh,
                access,
            };
        },
    );

    const LoginBody = Type.Object({
        email: Type.String({ format: "email" }),
        password: Type.String(),
    });
    type LoginBodyType = Static<typeof LoginBody>;

    fastify.post<{ Body: LoginBodyType }>(
        "/login",
        { schema: { body: LoginBody } },
        async (request, _reply) => {
            const user = await fastify.prisma.user.findUnique({
                where: { email: request.body.email },
            });

            if (user == null) {
                throw new RouteError("Account does not exist");
            }

            const hash = hashPassword(request.body.password, user.salt);

            if (hash != user.password) {
                throw new RouteError("Invalid credentials");
            }

            const refresh = await issueRefreshToken(user.id, fastify.prisma);
            const access = createAccessToken(user.id);

            return {
                refresh,
                access,
            };
        },
    );

    fastify.post("/logout", (_, reply) => {
        reply.status(502);
        return {};
    });

    const RefreshBody = Type.Object({
        refresh: Type.String(),
    });
    type RefreshBodyType = Static<typeof RefreshBody>;

    fastify.post<{ Body: RefreshBodyType }>(
        "/refresh",
        { schema: { body: RefreshBody } },
        async (request, _reply) => {
            const hashedToken = hashRefreshToken(request.body.refresh);
            const dbToken = await fastify.prisma.refreshToken.findUnique({
                where: { token_hash: hashedToken },
            });

            if (dbToken == null) {
                throw new RouteError("Invalid refreplyh token");
            }

            if (dbToken.expiresAt < new Date()) {
                await fastify.prisma.refreshToken.delete({
                    where: { id: dbToken.id },
                });
                throw new RouteError("Expired refreplyh token");
            }

            const newToken = await fastify.prisma.$transaction(async tx => {
                await tx.refreshToken.delete({
                    where: { id: dbToken.id },
                });

                return await issueRefreshToken(dbToken.userId, tx);
            });

            return {
                refresh: newToken,
                access: createAccessToken(dbToken.userId),
            };
        },
    );
}
