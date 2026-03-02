import { UnauthorizedError } from "../utils/error.ts";
import { FastifyInstance } from "fastify";

import { Type, Static } from "@sinclair/typebox";
import authPlugin from "../plugins/auth.ts";
import projectsServices from "../services/projects.services.ts";

export default function routes(fastify: FastifyInstance, _options: object) {
    fastify.register(authPlugin);

    fastify.get("/", async (request, reply) => {
        const projects = await fastify.prisma.project.findMany({
            where: { ownerId: request.user },
            include: { tasks: true },
        });

        reply.status(200);
        return projects;
    });

    const PostRequest = Type.Object({
        name: Type.String(),
        description: Type.String(),
    });
    type PostRequestType = Static<typeof PostRequest>;

    fastify.post<{ Body: PostRequestType }>(
        "/",
        {
            schema: {
                body: PostRequest,
            },
        },
        async (request, reply) => {
            const project = await projectsServices.createProject(
                request.user,
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

    const ProjectParams = Type.Object({
        projectId: Type.Number(),
    });
    type ProjectParamsType = Static<typeof ProjectParams>;

    fastify.get<{ Params: ProjectParamsType }>(
        "/:projectId",
        { schema: { params: ProjectParams } },
        async (request, reply) => {
            const project = await fastify.prisma.project.findUnique({
                where: {
                    id: request.params.projectId,
                    ownerId: request.user,
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

    fastify.put<{ Params: ProjectParamsType }>(
        "/:projectId",
        { schema: { params: ProjectParams } },
        async (request, reply) => {
            const project = await projectsServices.updateProject(
                request.user,
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
        { schema: { params: ProjectParams } },
        async (request, reply) => {
            await projectsServices.deleteProject(
                request.user,
                Number(request.params.projectId),
                fastify.prisma,
            );

            reply.status(204);
            return {};
        },
    );
}
