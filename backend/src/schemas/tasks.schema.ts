import Type, { Static } from "typebox";
import { Task as PrismaTask } from "../../generated/prisma/client.ts";
import { ColumnParams } from "./column.schema.ts";

export type TaskID = string;

export const TaskOrderSchema = Type.Number();
export type TaskOrderType = Static<typeof TaskOrderSchema>;

export const TaskParams = Type.Object({
    taskId: Type.String(),
});
export type TaskParamsType = Static<typeof TaskParams>;

export type TaskDataSchemaType = Static<typeof TaskDataSchema>;
export const TaskDataSchema = Type.Object({
    description: Type.Optional(Type.String({ maxLength: 255 })),
    title: Type.String({ maxLength: 32 }),
    order: TaskOrderSchema,
});

export const TaskFullSchema = Type.Intersect([
    TaskDataSchema,
    Type.Object({ id: Type.String(), columnId: Type.String() }),
]);
export type TaskFullSchemaType = Static<typeof TaskFullSchema>;

export type TaskUpdateSchemaType = Static<typeof TaskUpdateSchema>;
export const TaskUpdateSchema = Type.Partial(TaskDataSchema);

export function TaskPrismaMap(from: PrismaTask): TaskFullSchemaType {
    return {
        description: from.description ?? undefined,
        title: from.title,
        order: from.order,
        id: from.id,
        columnId: from.columnId,
    };
}

export const TaskMoveParams = Type.Intersect([
    TaskParams,
    ColumnParams,
    Type.Object({ order: TaskOrderSchema }),
]);
export type TaskMoveParamsType = Static<typeof TaskMoveParams>;
