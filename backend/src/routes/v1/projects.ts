import { UnauthorizedError } from "@/utils/error.ts";
import { FastifyInstance } from "fastify";

import { Type } from "typebox";

import authPlugin from "@/plugins/auth.plugin.ts";
import projectsServices from "@/services/projects.services.ts";
import {
    ProjectDataSchema,
    ProjectDataSchemaType,
    ProjectParams,
    ProjectParamsType,
    ProjectPrismaMap,
    ProjectSchema,
    ProjectSchemaType,
    ProjectUpdateSchema,
    ProjectUpdateSchemaType,
} from "@/schemas/projects.schema.ts";
import {
    ColumnDataSchema,
    ColumnDataSchemaType,
    ColumnFullSchema,
    ColumnFullSchemaType,
    ColumnPrismaMap,
} from "@/schemas/column.schema.ts";
import columnsServices from "@/services/columns.services.ts";

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
                where: { userId: request.user.sub },
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
        async (request, _reply) => {
            const project = await projectsServices.createProject(
                request.user,
                {
                    name: request.body.name,
                    description: request.body.description,
                },
                fastify.prisma,
            );

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
        async (request, _reply) => {
            const project = await fastify.prisma.project.findUnique({
                where: {
                    id: request.params.projectId,
                    userId: request.user.sub,
                },
                include: { columns: true },
            });

            if (project == null) {
                throw new UnauthorizedError("Project does not exist with ID");
            }

            return ProjectPrismaMap(project);
        },
    );

    fastify.get<{ Params: ProjectParamsType; Reply: ColumnFullSchemaType[] }>(
        "/:projectId/columns",
        {
            schema: {
                params: ProjectParams,
                response: { 200: Type.Array(ColumnFullSchema) },
                description: "Get all columns related to said project",
            },
        },
        async (request, _reply) => {
            const columns = await projectsServices.getProjectsColumns(
                request.user,
                request.params.projectId,
                fastify.prisma,
            );

            return columns.map(ColumnPrismaMap);
        },
    );

    fastify.post<{
        Params: ProjectParamsType;
        Body: ColumnDataSchemaType;
        Reply: ColumnFullSchemaType;
    }>(
        "/:projectId/columns",
        {
            schema: {
                params: ProjectParams,
                body: ColumnDataSchema,
                response: { 200: ColumnFullSchema },
                description: "Create a new column for said project",
            },
        },
        async (request, _reply) => {
            const column = await columnsServices.createColumn(
                request.user,
                request.params.projectId,
                request.body,
                fastify.prisma,
            );

            return column;
        },
    );

    fastify.patch<{
        Body: ProjectUpdateSchemaType;
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
        async (request, _reply) => {
            const project = await projectsServices.updateProject(
                request.user,
                request.params.projectId,
                request.body,
                fastify.prisma,
            );

            return ProjectPrismaMap(project);
        },
    );

    fastify.delete<{ Params: ProjectParamsType }>(
        "/:projectId",
        { schema: { params: ProjectParams, description: "Delete a project" } },
        async (request, reply) => {
            await projectsServices.deleteProject(
                request.user,
                request.params.projectId,
                fastify.prisma,
            );

            return reply.code(204).send();
        },
    );
}
