import { FastifyInstance } from "fastify";
import authPlugin from "../plugins/auth.plugin.ts";

export default async function routes(
    fastify: FastifyInstance,
    _options: object,
) {
    await fastify.register(authPlugin);

    fastify.get("/", (request, _reply) => {
        return JSON.stringify(request.user);
    });
}
