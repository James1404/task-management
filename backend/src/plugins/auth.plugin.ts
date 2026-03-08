import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { decode } from "../utils/jwt.ts";
import { Type } from "typebox";
import { Role } from "../../generated/prisma/enums.ts";
import { UnauthorizedError } from "../utils/error.ts";

declare module "fastify" {
    interface FastifyRequest {
        user: User;
    }
}

const UnauthorizedResponseSchema = Type.Object({
    error: Type.String(),
});

const ForbiddenResponseSchema = Type.Object({
    error: Type.String(),
});

export interface User {
    sub: string;
    role: Role;
}

const authPlugin: FastifyPluginAsync = fp(async (server, _options) => {
    server.decorateRequest("user");

    server.addHook("onRoute", routeOptions => {
        const existingResponses = routeOptions.schema?.response || {};
        const existingHeaders = routeOptions.schema?.headers || {};
        routeOptions.schema = {
            ...routeOptions.schema,
            headers: {
                ...existingHeaders,
            },
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

    server.addHook("preHandler", async (request, _reply) => {
        const authHeader = request.headers.authorization;
        if (authHeader == null) {
            throw new UnauthorizedError(
                "Authentication must be sent via header required",
            );
        }

        const [bearer, auth] = authHeader.split(" ", 2);

        if (bearer != "Bearer") {
            throw new UnauthorizedError(
                'Only "Bearer" token authentication is valid',
            );
        }

        const token = decode(auth);

        if (token == null) {
            throw new UnauthorizedError("Invalid token");
        }

        if (token.payload.exp < Date.now() / 1000) {
            throw new UnauthorizedError("Expired token");
        }

        const user = await server.prisma.user.findUnique({
            where: { id: token.payload.sub },
        });

        if (user == null) {
            throw new UnauthorizedError();
        }

        request.user = token.payload;
    });
});

export default authPlugin;
