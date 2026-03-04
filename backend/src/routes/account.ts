import { FastifyInstance } from "fastify";
import authPlugin from "../plugins/auth.plugin.ts";
import { InvalidCredentialsResponseSchema } from "../utils/error.ts";
import { Static, Type } from "@sinclair/typebox";
import accountServices from "../services/account.services.ts";

export default async function routes(
    fastify: FastifyInstance,
    _options: object,
) {
    await fastify.register(authPlugin);

    const DeleteBody = Type.Object({
        password: Type.String(),
    });
    type DeleteBodyType = Static<typeof DeleteBody>;

    fastify.post<{ Body: DeleteBodyType }>(
        "/delete",
        {
            schema: {
                body: DeleteBody,
                response: {
                    200: Type.Object({}),
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

            return reply.code(200).send();
        },
    );
}
