import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

declare module "fastify" {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}

const prismaPlugin: FastifyPluginAsync = fp(async (server, options) => {
    const adapter = new PrismaPg({
        connectionString: Deno.env.get("DATABASE_URL"),
    });

    const prisma = new PrismaClient({ adapter });

    await prisma.$connect();

    server.decorate("prisma", prisma);

    server.addHook("onClose", async server => {
        await server.prisma.$disconnect();
    });
});

export default prismaPlugin;
