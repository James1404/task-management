import { FastifyInstance } from "fastify";
import { RouteError } from "../utils.ts";
import authPlugin from "../authPlugin.ts";

export default async function routes(
    fastify: FastifyInstance,
    _options: object,
) {
    fastify.register(authPlugin);

    fastify.setErrorHandler((error, _request, reply) => {
        if (error instanceof RouteError) {
            const err = error as RouteError;
            reply.status(err.status_code);
            return { error: err.message };
        }

        throw error;
    });

    fastify.get("/", (request, _reply) => {
        return `Hello there from tasks: user = ${request.user}`;
    });
}
