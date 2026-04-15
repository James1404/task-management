import {
    InvalidCredentialsResponseSchema,
    UnauthorizedError,
    UnauthorizedResponseSchema,
} from "@/utils/error.ts";
import { FastifyInstance } from "fastify";
import { Type } from "typebox";
import authServices from "@/services/auth.services.ts";
import {
    AccessTokenSchema,
    AccessTokenSchemaType,
    LoginSchema,
    LoginSchemaType,
    RegisterSchema,
    RegisterSchemaType,
} from "@/schemas/auth.schema.ts";

export default function routes(fastify: FastifyInstance, _options: object) {
    fastify.post<{ Body: RegisterSchemaType; Reply: AccessTokenSchemaType }>(
        "/register",
        {
            schema: {
                body: RegisterSchema,
                response: {
                    200: AccessTokenSchema,
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
                path: "/v1/auth/refresh",
            });

            return {
                access,
            };
        },
    );

    fastify.post<{ Body: LoginSchemaType; Reply: AccessTokenSchemaType }>(
        "/login",
        {
            schema: {
                body: LoginSchema,
                response: {
                    200: AccessTokenSchema,
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
                path: "/v1/auth/refresh",
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
                path: "/v1/auth/refresh",
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
                path: "/v1/auth/refresh",
            });

            return reply.code(200).send();
        },
    );

    fastify.post<{ Reply: AccessTokenSchemaType }>(
        "/refresh",
        {
            schema: {
                response: {
                    200: AccessTokenSchema,
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
                path: "/v1/auth/refresh",
            });

            return {
                access,
            };
        },
    );
}
