import { FastifyInstance } from "fastify";
import authPlugin from "../plugins/auth.ts";

export default function routes(fastify: FastifyInstance, _options: object) {
    fastify.register(authPlugin);

    fastify.get("/", (request, _reply) => {
        return `Hello there from tasks: user = ${request.user}`;
    });
}
