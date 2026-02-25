import { RouteError } from "../utils.ts";
import { FastifyInstance } from "fastify";

import { Type, Static } from "@sinclair/typebox";
import authPlugin from "../authPlugin.ts";

export default async function routes(
    fastify: FastifyInstance,
    options: Object,
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
            const project = await fastify.prisma.project.create({
                data: {
                    owner: {
                        connect: {
                            id: request.user,
                        },
                    },
                    name: request.body.name,
                    description: request.body.description,
                },
            });

            reply.status(200);
            return project;
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
                throw new RouteError("Project does not exist with ID");
            }

            reply.status(400);
            return JSON.stringify(project);
        },
    );

    fastify.post<{ Params: ProjectParamsType }>(
        "/:projectId",
        { schema: { params: ProjectParams } },
        async (request, reply) => {
            const project = await fastify.prisma.project.findUnique({
                where: {
                    id: Number(request.params.projectId),
                    ownerId: request.user,
                },
            });

            if (project == null) {
                throw new RouteError("Project does not exist with ID");
            }

            reply.status(200);
            return JSON.stringify(project);
        },
    );

    fastify.delete<{ Params: ProjectParamsType }>(
        "/:projectId",
        { schema: { params: ProjectParams } },
        async (request, reply) => {
            const project = await fastify.prisma.project.findUnique({
                where: {
                    id: Number(request.params.projectId),
                    ownerId: request.user,
                },
            });

            if (project == null) {
                throw new RouteError("Project does not exist with ID");
            }

            await fastify.prisma.project.delete({
                where: {
                    id: Number(request.params.projectId),
                    ownerId: request.user,
                },
            });

            reply.status(204);
            return {};
        },
    );
}
