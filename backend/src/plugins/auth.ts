import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { decode } from "../utils/jwt.ts";
import { Type } from "@sinclair/typebox";

declare module "fastify" {
    interface FastifyRequest {
        user: string;
    }
}

const UnauthorizedResponseSchema = Type.Object({
    statusCode: Type.Literal(401),
    error: Type.Literal("Unauthorized"),
    message: Type.String(),
});

const ForbiddenResponseSchema = Type.Object({
    statusCode: Type.Literal(403),
    error: Type.Literal("Forbidden"),
    message: Type.String(),
});

const authPlugin: FastifyPluginAsync = fp(async (server, _options) => {
    server.decorateRequest("user", "");

    server.addHook("onRoute", routeOptions => {
        const existingResponses = routeOptions.schema?.response || {};
        routeOptions.schema = {
            ...routeOptions.schema,
            response: {
                ...existingResponses,
                401: {
                    ...UnauthorizedResponseSchema,
                    description: "Authentication failed or missing token",
                },
                403: {
                    ...ForbiddenResponseSchema,
                    description: "User does not have permission",
                },
            },
            security: [{ bearerAuth: [] }],
        };
    });

    server.addHook("preHandler", async (request, reply) => {
        const authorization = request.headers.authorization;
        if (authorization == null) {
            return reply.status(401).send({ error: "Authentication required" });
        }

        const token = decode(authorization);

        if (token == null) {
            return reply.status(400).send({ error: "Invalid token" });
        }

        if (token.payload.exp < Date.now() / 1000) {
            return reply.status(400).send({ error: "Expired token" });
        }

        const user = await server.prisma.user.findUnique({
            where: { id: token.payload.sub },
        });

        if (user == null) {
            return reply.status(404).send({ error: "User does not exist" });
        }

        request.user = user.id;
    });
});

export default authPlugin;
