import { FastifyInstance } from "fastify";
import authPlugin from "@/plugins/auth.plugin.ts";
import { Static, Type } from "typebox";
import { Status } from "../../../generated/prisma/enums.ts";
import taskServices from "@/services/tasks.services.ts";
import {
    TaskDataSchema,
    TaskDataSchemaType,
    TaskFullSchema,
    TaskFullSchemaType,
    TaskPrismaMap,
    TaskUpdateSchema,
    TaskUpdateSchemaType,
} from "../../schemas/tasks.schema.ts";

const TaskIdQuery = Type.Object({
    taskId: Type.Number(),
});
type TaskIdQueryType = Static<typeof TaskIdQuery>;

export default async function routes(
    fastify: FastifyInstance,
    _options: object,
) {
    await fastify.register(authPlugin);

    fastify.get<{ Querystring: TaskIdQueryType }>(
        "/",
        { schema: { querystring: TaskIdQuery } },
        async (request, _reply) => {
            const tasks = await taskServices.getTask(
                request.query.taskId,
                request.user,
                fastify.prisma,
            );

            return JSON.stringify(tasks);
        },
    );

    fastify.patch<{
        Body: TaskUpdateSchemaType;
        Querystring: TaskIdQueryType;
        Reply: TaskFullSchemaType;
    }>(
        "/",
        {
            schema: {
                body: TaskUpdateSchema,
                querystring: TaskIdQuery,
                response: { 200: TaskFullSchema },
                description: "Update a task",
            },
        },
        async (request, reply) => {
            const task = await taskServices.updateTask(
                request.user,
                request.query.taskId,
                request.body,
                fastify.prisma,
            );

            reply.code(200);
            return TaskPrismaMap(task);
        },
    );

    fastify.post<{ Querystring: TaskIdQueryType }>(
        "/delete",
        { schema: { querystring: TaskIdQuery, description: "Delete a task" } },
        async (request, reply) => {
            await taskServices.deleteTask(
                request.user,
                request.query.taskId,
                fastify.prisma,
            );

            return reply.code(204).send();
        },
    );
}
