import { FastifyInstance } from "fastify";
import authPlugin from "@/plugins/auth.plugin.ts";
import { InvalidCredentialsResponseSchema } from "@/utils/error.ts";
import { Type } from "typebox";
import accountServices from "@/services/account.services.ts";
import {
    DeleteUserSchema,
    DeleteUserSchemaType,
    UserUpdateSchema,
    UserUpdateSchemaType,
} from "../../schemas/account.schema.ts";
import { UserDataSchemaType } from "../../schemas/auth.schema.ts";

export default async function routes(
    fastify: FastifyInstance,
    _options: object,
) {
    await fastify.register(authPlugin);

    fastify.delete<{ Body: DeleteUserSchemaType }>(
        "/",
        {
            schema: {
                body: DeleteUserSchema,
                response: {
                    204: Type.Object({}),
                    ...InvalidCredentialsResponseSchema,
                },
                description: "Delete user",
            },
        },
        async (request, reply) => {
            await accountServices.deleteAccount(
                request.user,
                request.body.password,
                fastify.prisma,
            );

            reply.clearCookie("refreshToken", {
                path: "/auth/refresh",
            });

            return reply.code(204).send();
        },
    );

    fastify.patch<{ Body: UserUpdateSchemaType; Reply: UserDataSchemaType }>(
        "/",
        {
            schema: {
                body: UserUpdateSchema,
                response: {
                    200: UserUpdateSchema,
                    ...InvalidCredentialsResponseSchema,
                },
                description: "Update account details",
            },
        },
        async (request, reply) => {
            const user = await accountServices.updateAccount(
                request.user,
                request.body,
                fastify.prisma,
            );

            return reply.code(200).send(user);
        },
    );
}
