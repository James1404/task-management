import Type, { Static } from "typebox";
import { Task as PrismaTask, Status } from "../../generated/prisma/client.ts";

export type TaskSchemaType = Static<typeof TaskSchema>;
export const TaskSchema = Type.Object({
    description: Type.Optional(Type.String()),
    title: Type.String(),
    status: Type.Enum(Status),
    projectId: Type.Integer(),
});

export type TaskUpdateSchemaType = Static<typeof TaskUpdateSchema>;
export const TaskUpdateSchema = Type.Partial(
    Type.Omit(TaskSchema, ["projectId"]),
);

export function TaskPrismaMap(from: PrismaTask): TaskSchemaType {
    return {
        description: from.description ?? undefined,
        title: from.title,
        status: from.status,
        projectId: from.projectId,
    };
}
