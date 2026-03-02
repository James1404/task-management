import { FastifyInstance } from "fastify";
import authPlugin from "../plugins/auth.ts";
import { Static, Type } from "@sinclair/typebox";
import { Status } from "../../generated/prisma/enums.ts";
import task_service from "../services/tasks.services.ts";

export default function routes(fastify: FastifyInstance, _options: object) {
    fastify.register(authPlugin);

    const GetQuery = Type.Object({
        taskId: Type.Number(),
    });
    type GetQueryType = Static<typeof GetQuery>;

    fastify.get<{ Querystring: GetQueryType }>(
        "/",
        { schema: { querystring: GetQuery } },
        async (request, _reply) => {
            const tasks = await task_service.getTask(
                request.query.taskId,
                fastify.prisma,
            );

            return JSON.stringify(tasks);
        },
    );

    const PostBody = Type.Object({
        projectId: Type.Number(),
        title: Type.String(),
        description: Type.Optional(Type.String()),
        status: Type.Enum(Status, { default: Status.TODO }),
    });
    type PostBodyType = Static<typeof PostBody>;

    fastify.post<{ Body: PostBodyType }>(
        "/",
        { schema: { body: PostBody } },
        async (request, _reply) => {
            const task = await task_service.createTask(
                { user: request.user, ...request.body },
                fastify.prisma,
            );

            return { id: task.id };
        },
    );

    const PutQuery = Type.Object({
        taskId: Type.Number(),
    });
    type PutQueryType = Static<typeof PutQuery>;

    const PutBody = Type.Object({
        title: Type.Optional(Type.String()),
        description: Type.Optional(Type.String()),
        status: Type.Optional(Type.Enum(Status)),
    });
    type PutBodyType = Static<typeof PutBody>;

    fastify.put<{ Body: PutBodyType; Querystring: PutQueryType }>(
        "/",
        { schema: { body: PutBody, querystring: PutQuery } },
        async (request, reply) => {
            await task_service.updateTask(
                request.user,
                request.query.taskId,
                request.body,
                fastify.prisma,
            );

            return reply.code(204).send();
        },
    );

    const DeleteQuery = Type.Object({
        taskId: Type.Number(),
    });
    type DeleteQueryType = Static<typeof DeleteQuery>;

    fastify.delete<{ Querystring: DeleteQueryType }>(
        "/",
        { schema: { querystring: DeleteQuery } },
        async (request, reply) => {
            await task_service.deleteTask(
                request.user,
                request.query.taskId,
                fastify.prisma,
            );

            return reply.code(204).send();
        },
    );
}
