import "@std/dotenv/load";

import Fastify from "fastify";
import fp from "fastify-plugin";

import process from "node:process";
import prismaPlugin from "./plugins/prisma.ts";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import swagger from "@fastify/swagger";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { AppError } from "./utils/error.ts";
import routesPlugin from "@/plugins/routes.plugin.ts";

const fastify = Fastify({
    logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

const PORT = 3000;

// const file = await Deno.readFile("./openapi/openapi.yaml");
// const decoder = new TextDecoder("utf-8");
// const swaggerDocument = parse(decoder.decode(file));

fastify.register(cors, {
    origin: "http://localhost:5173",
    credentials: true,
});
fastify.register(cookie);
fastify.register(import("@fastify/rate-limit"), {
    max: 100,
    timeWindow: "1 minute",
});

fastify.register(prismaPlugin);

fastify.register(swagger, {
    openapi: {
        openapi: "3.0.4",
        info: {
            title: "Task Management API",
            description: "API for Task Management software backend",
            version: "0.0.1",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Dev server",
            },
            {
                url: "https://api.jamesbarnfather.co.uk",
                description: "Main (Production) server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
});

await fastify.register(import("@fastify/swagger-ui"), {
    routePrefix: "/docs",
    uiConfig: {
        docExpansion: "full",
        deepLinking: false,
    },
    uiHooks: {
        onRequest: function (_request, _reply, next) {
            next();
        },
        preHandler: function (_request, _reply, next) {
            next();
        },
    },
    staticCSP: true,
    transformStaticCSP: header => header,
    transformSpecification: (swaggerObject, _request, _reply) => {
        return swaggerObject;
    },
    transformSpecificationClone: true,
});

fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
        if (error.clearAuthCookie) {
            reply.clearCookie("refreshToken", {
                path: "/auth/refresh",
            });
        }

        reply.code(error.statusCode);
        return { error: error.message };
    }

    throw error;
});

await fastify.register(
    fp(
        async (server, _options) => {
            await server.register(routesPlugin, { prefix: "/v1" });
        },
        { name: "api-v1" },
    ),
);

fastify.get(
    "/",
    {
        schema: {
            response: {
                200: {
                    content: { "text/plain": { schema: { type: "string" } } },
                },
            },
        },
    },
    () => {
        return "Hello world";
    },
);

// await fastify.ready(err => {
//     if (err) {
//         throw err;
//     }
// });
// fastify.swagger();

try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
