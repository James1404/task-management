import "@std/dotenv/load";
import { parse } from "@std/yaml";

import Fastify from "fastify";

import authentication from "./routes/auth.ts";
import tasks from "./routes/tasks.ts";
import user from "./routes/user.ts";
import projects from "./routes/projects.ts";
import { load } from "@std/dotenv";
import process from "node:process";
import prismaPlugin from "./prismaPlugin.ts";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

const env = await load({
    export: true,
});

const fastify = Fastify({
    logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

const PORT = Number(env.PORT) ?? 3000;

// const file = await Deno.readFile("./openapi/openapi.yaml");
// const decoder = new TextDecoder("utf-8");
// const swaggerDocument = parse(decoder.decode(file));

fastify.register(prismaPlugin);

fastify.register(authentication, { prefix: "/auth" });
fastify.register(user, { prefix: "/user" });
fastify.register(projects, { prefix: "/projects" });
fastify.register(tasks, { prefix: "/tasks" });

fastify.get("/", () => {
    return "Hello world";
});

try {
    await fastify.listen({ port: PORT });
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
