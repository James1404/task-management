import { FastifyInstance } from "fastify";
import authPlugin from "@/plugins/auth.plugin.ts";
import {
    ColumnFullSchema,
    ColumnFullSchemaType,
    ColumnParams,
    ColumnParamsType,
    ColumnPrismaMap,
    ColumnUpdateSchema,
    ColumnUpdateSchemaType,
} from "@/schemas/column.schema.ts";
import columnsServices from "@/services/columns.services.ts";
import {
    TaskDataSchema,
    TaskDataSchemaType,
    TaskFullSchema,
    TaskFullSchemaType,
    TaskPrismaMap,
} from "../../schemas/tasks.schema.ts";
import Type from "typebox";
import tasksServices from "../../services/tasks.services.ts";

export default async function routes(
    fastify: FastifyInstance,
    _options: object,
) {
    await fastify.register(authPlugin);

    fastify.get<{ Params: ColumnParamsType; Reply: ColumnFullSchemaType }>(
        "/:columnId",
        {
            schema: {
                params: ColumnParams,
                description: "Get column data",
                response: {
                    200: ColumnFullSchema,
                },
            },
        },
        async (request, reply) => {
            const column = await columnsServices.getColumn(
                request.user,
                request.params.columnId,
                fastify.prisma,
            );

            return ColumnPrismaMap(column);
        },
    );

    fastify.patch<{
        Body: ColumnUpdateSchemaType;
        Params: ColumnParamsType;
        Reply: ColumnFullSchemaType;
    }>(
        "/:columnId",
        {
            schema: {
                body: ColumnUpdateSchema,
                params: ColumnParams,
                description: "Update project data",
                response: {
                    200: ColumnFullSchema,
                },
            },
        },
        async (request, _reply) => {
            const project = await columnsServices.updateColumn(
                request.user,
                request.params.columnId,
                request.body,
                fastify.prisma,
            );

            return ColumnPrismaMap(project);
        },
    );

    fastify.delete<{ Params: ColumnParamsType }>(
        "/:columnId",
        {
            schema: {
                params: ColumnParams,
                description: "Get column data",
                response: {
                    204: Type.Object({}),
                },
            },
        },
        async (request, reply) => {
            await columnsServices.deleteColumn(
                request.user,
                request.params.columnId,
                fastify.prisma,
            );

            return reply.code(204).send();
        },
    );

    fastify.get<{ Params: ColumnParamsType; Reply: TaskFullSchemaType[] }>(
        "/:columnId/tasks",
        {
            schema: {
                params: ColumnParams,
                description: "Get tasks from column",
                response: {
                    200: Type.Array(TaskFullSchema),
                },
            },
        },
        async (request, reply) => {
            const tasks = await columnsServices.getColumnTasks(
                request.user,
                request.params.columnId,
                fastify.prisma,
            );

            return tasks.map(TaskPrismaMap);
        },
    );

    fastify.post<{
        Body: TaskDataSchemaType;
        Params: ColumnParamsType;
        Reply: TaskFullSchemaType;
    }>(
        "/:columnId/tasks",
        {
            schema: {
                body: TaskDataSchema,
                params: ColumnParams,
                description: "Create tasks in column",
                response: {
                    200: TaskFullSchema,
                },
            },
        },
        async (request, reply) => {
            const task = await tasksServices.createTask(
                request.user,
                request.params.columnId,
                request.body,
                fastify.prisma,
            );

            return TaskPrismaMap(task);
        },
    );
}
