import Type, { Static } from "typebox";
import { Task as PrismaTask, Status } from "../../generated/prisma/client.ts";

export type TaskDataSchemaType = Static<typeof TaskDataSchema>;
export const TaskDataSchema = Type.Object({
    description: Type.Optional(Type.String({ maxLength: 255 })),
    title: Type.String({ maxLength: 32 }),
    status: Type.Enum(Status),
});

export const TaskFullSchema = Type.Intersect([
    TaskDataSchema,
    Type.Object({ id: Type.Integer(), projectId: Type.Integer() }),
]);
export type TaskFullSchemaType = Static<typeof TaskFullSchema>;

export type TaskUpdateSchemaType = Static<typeof TaskUpdateSchema>;
export const TaskUpdateSchema = Type.Partial(TaskDataSchema);

export function TaskPrismaMap(from: PrismaTask): TaskFullSchemaType {
    return {
        description: from.description ?? undefined,
        title: from.title,
        status: from.status,
        id: from.id,
        projectId: from.projectId,
    };
}
