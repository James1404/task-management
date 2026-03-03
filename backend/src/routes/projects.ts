import { UnauthorizedError } from "../utils/error.ts";
import { FastifyInstance } from "fastify";

import { Type, Static } from "@sinclair/typebox";
import authPlugin from "../plugins/auth.plugin.ts";
import projectsServices from "../services/projects.services.ts";

export const ProjectParams = Type.Object({
    projectId: Type.Number(),
});
export type ProjectParamsType = Static<typeof ProjectParams>;

export const ProjectData = Type.Object({
    name: Type.String(),
    description: Type.String(),
});
export type ProjectDataType = Static<typeof ProjectData>;

export default async function routes(
    fastify: FastifyInstance,
    _options: object,
) {
    await fastify.register(authPlugin);

    fastify.get("/", async (request, reply) => {
        const projects = await fastify.prisma.project.findMany({
            where: { ownerId: request.user.sub },
            include: { tasks: true },
        });

        reply.status(200);
        return projects;
    });

    fastify.post<{ Body: ProjectDataType }>(
        "/",
        {
            schema: {
                body: ProjectData,
                description: "Create new project",
                response: {},
            },
        },
        async (request, reply) => {
            const project = await projectsServices.createProject(
                request.user.sub,
                {
                    name: request.body.name,
                    description: request.body.description,
                },
                fastify.prisma,
            );

            reply.status(200);
            return JSON.stringify(project);
        },
    );

    fastify.get<{ Params: ProjectParamsType }>(
        "/:projectId",
        { schema: { params: ProjectParams, description: "Get project data" } },
        async (request, reply) => {
            const project = await fastify.prisma.project.findUnique({
                where: {
                    id: request.params.projectId,
                    ownerId: request.user.sub,
                },
                include: { tasks: true },
            });

            if (project == null) {
                throw new UnauthorizedError("Project does not exist with ID");
            }

            reply.status(400);
            return JSON.stringify(project);
        },
    );

    fastify.put<{ Body: ProjectDataType; Params: ProjectParamsType }>(
        "/:projectId",
        {
            schema: {
                body: ProjectData,
                params: ProjectParams,
                description: "Update project data",
            },
        },
        async (request, reply) => {
            const project = await projectsServices.updateProject(
                request.user.sub,
                request.params.projectId,
                request.body,
                fastify.prisma,
            );

            reply.status(200);
            return JSON.stringify(project);
        },
    );

    fastify.delete<{ Params: ProjectParamsType }>(
        "/:projectId",
        { schema: { params: ProjectParams, description: "Delete a project" } },
        async (request, reply) => {
            await projectsServices.deleteProject(
                request.user.sub,
                Number(request.params.projectId),
                fastify.prisma,
            );

            reply.status(204);
            return {};
        },
    );
}
