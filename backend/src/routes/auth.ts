import { UnauthorizedError } from "../utils/error.ts";
import { FastifyInstance } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import auth_service from "../services/auth.services.ts";
import { register } from "node:module";

export default function routes(fastify: FastifyInstance, _options: object) {
    const AccessTokenResponse = Type.Object({
        access: Type.String(),
    });
    type AccessTokenResponseType = Static<typeof AccessTokenResponse>;

    const RegisterBody = Type.Object({
        email: Type.String({ format: "email" }),
        password: Type.String(),
        username: Type.String(),
    });
    type RegisterBodyType = Static<typeof RegisterBody>;

    fastify.post<{ Body: RegisterBodyType; Reply: AccessTokenResponseType }>(
        "/register",
        {
            schema: {
                body: RegisterBody,
                response: { 200: AccessTokenResponse },
            },
        },
        async (request, reply) => {
            const { refresh, access } = await auth_service.register(
                {
                    ...request.body,
                },
                fastify.prisma,
            );

            reply.setCookie("refresh", refresh, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                path: "/auth/refresh",
            });

            return {
                access,
            };
        },
    );

    const LoginBody = Type.Object({
        email: Type.String({ format: "email" }),
        password: Type.String(),
    });
    type LoginBodyType = Static<typeof LoginBody>;

    fastify.post<{ Body: LoginBodyType; Reply: AccessTokenResponseType }>(
        "/login",
        { schema: { body: LoginBody, response: { 200: AccessTokenResponse } } },
        async (request, reply) => {
            const { refresh, access } = await auth_service.login(
                {
                    ...request.body,
                },
                fastify.prisma,
            );

            reply.setCookie("refresh", refresh, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                path: "/auth/refresh",
            });

            return {
                access,
            };
        },
    );

    fastify.post("/logout", (_, reply) => {
        reply.status(502);
        return {};
    });

    fastify.post<{ Reply: AccessTokenResponseType }>(
        "/refresh",
        {
            schema: {
                response: { 200: AccessTokenResponse },
            },
        },
        async (request, reply) => {
            const refreshToken = request.cookies["refresh"];
            if (refreshToken == null) {
                throw new UnauthorizedError("Requires refresh token");
            }

            const { refresh, access } = await auth_service.refresh(
                {
                    refresh: refreshToken,
                },
                fastify.prisma,
            );

            reply.setCookie("refresh", refresh, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                path: "/auth/refresh",
            });

            return {
                access,
            };
        },
    );
}
