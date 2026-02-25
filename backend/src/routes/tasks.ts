import { RouteError } from "../utils.ts";
import { FastifyInstance } from "fastify";
import authPlugin from "../authPlugin.ts";
import { Static, Type } from "@sinclair/typebox";
import { Status } from "../../generated/prisma/enums.ts";

export default function routes(fastify: FastifyInstance, _options: object) {
    fastify.register(authPlugin);

    fastify.setErrorHandler((error, _request, reply) => {
        if (error instanceof RouteError) {
            const err = error as RouteError;
            reply.status(err.status_code);
            return { error: err.message };
        }

        throw error;
    });

    const GetQuery = Type.Object({
        projectId: Type.Number(),
    });
    type GetQueryType = Static<typeof GetQuery>;

    fastify.get<{ Querystring: GetQueryType }>(
        "/",
        { schema: { querystring: GetQuery } },
        async (request, _reply) => {
            const projectId = Number(request.query.projectId);
            if (projectId == null) {
                throw new RouteError("Requires project id");
            }

            const tasks = await fastify.prisma.task.findMany({
                where: { projectId },
            });

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
            const project = await fastify.prisma.project.findUnique({
                where: { id: request.body.projectId },
            });

            if (project == null) {
                throw new RouteError("Project does not exist with ID");
            }

            if (project.ownerId != request.user) {
                throw new RouteError("Access denied", 401);
            }

            const task = await fastify.prisma.task.create({
                data: {
                    title: request.body.title,
                    description: request.body.description,
                    status: request.body.status,
                    project: { connect: { id: request.body.projectId } },
                },
            });

            return { id: task.id };
        },
    );
}
