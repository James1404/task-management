import "@std/dotenv/load";
import { parse } from "@std/yaml";

import Fastify from "fastify";

import authentication from "./routes/auth.ts";
import tasks from "./routes/tasks.ts";
import user from "./routes/user.ts";
import projects from "./routes/projects.ts";
import { load } from "@std/dotenv";
import process from "node:process";
import prismaPlugin from "./plugins/prisma.ts";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import swagger from "@fastify/swagger";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { UnauthorizedError } from "./utils/error.ts";
import health from "./routes/health.ts";

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
        onRequest: function (request, reply, next) {
            next();
        },
        preHandler: function (request, reply, next) {
            next();
        },
    },
    staticCSP: true,
    transformStaticCSP: header => header,
    transformSpecification: (swaggerObject, request, reply) => {
        return swaggerObject;
    },
    transformSpecificationClone: true,
});

fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof UnauthorizedError) {
        const err = error as UnauthorizedError;
        reply.status(err.status_code);
        return { error: err.message };
    }

    throw error;
});

fastify.register(health, { prefix: "/health" });
fastify.register(authentication, { prefix: "/auth" });
fastify.register(user, { prefix: "/user" });
fastify.register(projects, { prefix: "/projects" });
fastify.register(tasks, { prefix: "/tasks" });

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
