import { FastifyInstance } from "fastify";

export default function routes(fastify: FastifyInstance, _options: object) {
    fastify.get("/", async (_response, reply) => {
        return reply.code(200).send();
    });

    fastify.get("/ready", async (_response, reply) => {
        try {
            await fastify.prisma.$queryRaw`SELECT 1`;

            return reply.send({
                status: "ready",
                database: "connected",
            });
        } catch (_) {
            return reply.code(503).send({
                status: "not_ready",
                database: "disconnected",
            });
        }
    });
}
