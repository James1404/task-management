import {
    InvalidCredentialsResponseSchema,
    UnauthorizedError,
    UnauthorizedResponseSchema,
} from "../utils/error.ts";
import { FastifyInstance } from "fastify";
import { Static, Type } from "typebox";
import authServices from "../services/auth.services.ts";

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
                response: {
                    200: AccessTokenResponse,
                    ...InvalidCredentialsResponseSchema,
                },
                description:
                    "Register an account with a username, email and password",
            },
        },
        async (request, reply) => {
            const { refresh, access } = await authServices.register(
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
        {
            schema: {
                body: LoginBody,
                response: {
                    200: AccessTokenResponse,
                    ...InvalidCredentialsResponseSchema,
                },
                description:
                    "Login to your account, returns refresh and access token",
            },
        },
        async (request, reply) => {
            const { refresh, access } = await authServices.login(
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

    fastify.post(
        "/logout",
        {
            schema: {
                response: {
                    200: Type.Object({}),
                    ...UnauthorizedResponseSchema,
                },
                description: "Logout of a session",
            },
        },
        async (request, reply) => {
            const refreshToken = request.cookies["refresh"];
            if (refreshToken == null) {
                throw new UnauthorizedError("Refresh token missing");
            }

            await authServices.logout(
                request.user,
                refreshToken,
                fastify.prisma,
            );

            reply.clearCookie("refreshToken", {
                path: "/auth/refresh",
            });

            return reply.code(200).send();
        },
    );

    fastify.post(
        "/logoutAll",
        {
            schema: {
                response: {
                    200: Type.Object({}),
                    ...UnauthorizedResponseSchema,
                },
                description: "Logout of all session",
            },
        },
        async (request, reply) => {
            const refreshToken = request.cookies["refresh"];
            if (refreshToken == null) {
                throw new UnauthorizedError("Refresh token missing");
            }

            await authServices.logout(
                request.user,
                refreshToken,
                fastify.prisma,
            );

            reply.clearCookie("refreshToken", {
                path: "/auth/refresh",
            });

            return reply.code(200).send();
        },
    );

    fastify.post<{ Reply: AccessTokenResponseType }>(
        "/refresh",
        {
            schema: {
                response: {
                    200: AccessTokenResponse,
                    ...UnauthorizedResponseSchema,
                },
                description: "Refresh your authentication tokens",
            },
        },
        async (request, reply) => {
            const refreshToken = request.cookies["refresh"];
            if (refreshToken == null) {
                throw new UnauthorizedError("Refresh token missing");
            }

            const { refresh, access } = await authServices.refresh(
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
