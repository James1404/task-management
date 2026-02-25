import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { decode } from "./jwt.ts";

declare module "fastify" {
    interface FastifyRequest {
        user: string;
    }
}

const authPlugin: FastifyPluginAsync = fp(async (server, options) => {
    server.decorateRequest("user", "");

    server.addHook("preHandler", async (request, reply) => {
        try {
            const authorization = request.headers.authorization;
            if (authorization == null) {
                throw new Error("Authentication required");
            }

            const token = decode(authorization);

            if (token == null) {
                throw new Error("Invalid token");
            }

            if (token.payload.exp < Date.now() / 1000) {
                throw new Error("Expired token");
            }

            const user = await server.prisma.user.findUnique({
                where: { id: token.payload.sub },
            });

            if (user == null) {
                throw new Error("User does not exist");
            }

            request.user = user.id;
        } catch (err) {
            reply.status(401);
            return { error: (err as Error).message };
        }
    });
});

export default authPlugin;
