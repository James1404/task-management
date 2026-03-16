import Type, { Static } from "typebox";
import { Task as PrismaTask } from "../../generated/prisma/client.ts";

export const TaskParams = Type.Object({
    taskId: Type.Number(),
});
export type TaskParamsType = Static<typeof TaskParams>;

export type TaskDataSchemaType = Static<typeof TaskDataSchema>;
export const TaskDataSchema = Type.Object({
    description: Type.Optional(Type.String({ maxLength: 255 })),
    title: Type.String({ maxLength: 32 }),
});

export const TaskFullSchema = Type.Intersect([
    TaskDataSchema,
    Type.Object({ id: Type.Integer(), columnId: Type.String() }),
]);
export type TaskFullSchemaType = Static<typeof TaskFullSchema>;

export type TaskUpdateSchemaType = Static<typeof TaskUpdateSchema>;
export const TaskUpdateSchema = Type.Partial(TaskDataSchema);

export function TaskPrismaMap(from: PrismaTask): TaskFullSchemaType {
    return {
        description: from.description ?? undefined,
        title: from.title,
        id: from.id,
        columnId: from.columnId,
    };
}
