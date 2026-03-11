import { UnauthorizedError } from "@/utils/error.ts";
import { FastifyInstance } from "fastify";

import { Type, Static } from "typebox";

import authPlugin from "@/plugins/auth.plugin.ts";
import projectsServices from "@/services/projects.services.ts";
import {
    ProjectDataSchema,
    ProjectDataSchemaType,
    ProjectPrismaMap,
    ProjectSchema,
    ProjectSchemaType,
    ProjectUpdateSchema,
} from "@/schemas/projects.schema.ts";
import {
    TaskDataSchema,
    TaskDataSchemaType,
    TaskFullSchema,
    TaskFullSchemaType,
    TaskPrismaMap,
} from "@/schemas/tasks.schema.ts";
import tasksServices from "@/services/tasks.services.ts";

export const ProjectParams = Type.Object({
    projectId: Type.Number(),
});
export type ProjectParamsType = Static<typeof ProjectParams>;

export default async function routes(
    fastify: FastifyInstance,
    _options: object,
) {
    await fastify.register(authPlugin);

    fastify.get<{ Reply: ProjectSchemaType[] }>(
        "/",
        {
            schema: {
                response: {
                    200: Type.Array(ProjectSchema),
                },
            },
        },
        async (request, reply) => {
            const projectRows = await fastify.prisma.project.findMany({
                where: { ownerId: request.user.sub },
            });

            reply.code(200);
            return projectRows.map(ProjectPrismaMap);
        },
    );

    fastify.post<{ Body: ProjectDataSchemaType; Reply: ProjectSchemaType }>(
        "/",
        {
            schema: {
                body: ProjectDataSchema,
                description: "Create new project",
                response: {
                    200: ProjectSchema,
                },
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

            reply.code(200);
            return ProjectPrismaMap(project);
        },
    );

    fastify.get<{ Params: ProjectParamsType; Reply: ProjectSchemaType }>(
        "/:projectId",
        {
            schema: {
                params: ProjectParams,
                description: "Get project data",
                response: {
                    200: ProjectSchema,
                },
            },
        },
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

            reply.code(400);
            return ProjectPrismaMap(project);
        },
    );

    fastify.get<{ Params: ProjectParamsType; Reply: TaskFullSchemaType[] }>(
        "/:projectId/tasks",
        {
            schema: {
                params: ProjectParams,
                response: { 200: Type.Array(TaskFullSchema) },
                description: "Get all tasks related to said project",
            },
        },
        async (request, reply) => {
            const taskRows = await projectsServices.getProjectsTasks(
                request.user.sub,
                request.params.projectId,
                fastify.prisma,
            );

            return taskRows.map(TaskPrismaMap);
        },
    );

    fastify.post<{ Params: ProjectParamsType; Body: TaskDataSchemaType }>(
        "/:projectId/tasks",
        {
            schema: {
                params: ProjectParams,
                body: TaskDataSchema,
                response: { 200: TaskFullSchema },
                description: "Create a new task for said project",
            },
        },
        async (request, reply) => {
            const task = await tasksServices.createTask(
                request.user,
                request.params.projectId,
                { ...request.body },
                fastify.prisma,
            );

            return task;
        },
    );

    fastify.patch<{
        Body: ProjectDataSchemaType;
        Params: ProjectParamsType;
        Reply: ProjectSchemaType;
    }>(
        "/:projectId",
        {
            schema: {
                body: ProjectUpdateSchema,
                params: ProjectParams,
                description: "Update project data",
                response: {
                    200: ProjectSchema,
                },
            },
        },
        async (request, reply) => {
            const project = await projectsServices.updateProject(
                request.user.sub,
                request.params.projectId,
                request.body,
                fastify.prisma,
            );

            reply.code(200);
            return ProjectPrismaMap(project);
        },
    );

    fastify.post<{ Params: ProjectParamsType }>(
        "/delete/:projectId",
        { schema: { params: ProjectParams, description: "Delete a project" } },
        async (request, reply) => {
            await projectsServices.deleteProject(
                request.user.sub,
                Number(request.params.projectId),
                fastify.prisma,
            );

            reply.code(204);
            return {};
        },
    );
}
