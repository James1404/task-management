import { FastifyPluginAsync } from "fastify";

import authentication from "@/routes/v1/auth.ts";
import tasks from "@/routes/v1/tasks.ts";
import columns from "@/routes/v1/columns.ts";
import projects from "@/routes/v1/projects.ts";
import health from "@/routes/v1/health.ts";
import account from "@/routes/v1/account.ts";

const routes: FastifyPluginAsync = async (server, options) => {
    await server.register(health, { prefix: "/health" });
    await server.register(authentication, { prefix: "/auth" });
    await server.register(account, { prefix: "/account" });
    await server.register(projects, { prefix: "/projects" });
    await server.register(columns, { prefix: "/columns" });
    await server.register(tasks, { prefix: "/tasks" });
};

export default routes;
