import { FastifyInstance } from "fastify";
import authPlugin from "@/plugins/auth.plugin.ts";
import { Static, Type } from "typebox";
import taskServices from "@/services/tasks.services.ts";
import {
    TaskFullSchema,
    TaskFullSchemaType,
    TaskParams,
    TaskParamsType,
    TaskPrismaMap,
    TaskUpdateSchema,
    TaskUpdateSchemaType,
} from "../../schemas/tasks.schema.ts";

export default async function routes(
    fastify: FastifyInstance,
    _options: object,
) {
    await fastify.register(authPlugin);

    fastify.get<{ Params: TaskParamsType }>(
        "/:taskId",
        { schema: { params: TaskParams } },
        async (request, _reply) => {
            const tasks = await taskServices.getTask(
                request.params.taskId,
                request.user,
                fastify.prisma,
            );

            return JSON.stringify(tasks);
        },
    );

    fastify.patch<{
        Body: TaskUpdateSchemaType;
        Params: TaskParamsType;
        Reply: TaskFullSchemaType;
    }>(
        "/:taskId",
        {
            schema: {
                body: TaskUpdateSchema,
                params: TaskParams,
                response: { 200: TaskFullSchema },
                description: "Update a task",
            },
        },
        async (request, reply) => {
            const task = await taskServices.updateTask(
                request.user,
                request.params.taskId,
                request.body,
                fastify.prisma,
            );

            reply.code(200);
            return TaskPrismaMap(task);
        },
    );

    fastify.delete<{ Params: TaskParamsType }>(
        "/:taskId",
        {
            schema: {
                params: TaskParams,
                description: "Delete a task",
                response: { 204: Type.Object({}) },
            },
        },
        async (request, reply) => {
            await taskServices.deleteTask(
                request.user,
                request.params.taskId,
                fastify.prisma,
            );

            return reply.code(204).send();
        },
    );
}
