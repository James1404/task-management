import Type, { Static } from "typebox";
import { Task as PrismaTask } from "../../generated/prisma/client.ts";

export const TaskIDSchema = Type.String();
export type TaskID = Static<typeof TaskIDSchema>;

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
});

export const TaskFullSchema = Type.Intersect([
    TaskDataSchema,
    Type.Object({
        id: TaskIDSchema,
        columnId: Type.String(),
        order: TaskOrderSchema,
    }),
]);
export type TaskFullSchemaType = Static<typeof TaskFullSchema>;

export type TaskUpdateSchemaType = Static<typeof TaskUpdateSchema>;
export const TaskUpdateSchema = Type.Partial(Type.Intersect([TaskDataSchema]));

export function TaskPrismaMap(from: PrismaTask): TaskFullSchemaType {
    return {
        description: from.description ?? undefined,
        title: from.title,
        order: from.order,
        id: from.id,
        columnId: from.columnId,
    };
}

export const TaskMoveBody = Type.Union([
    Type.Object({
        columnId: Type.String(),
        order: Type.Optional(TaskOrderSchema),
    }),
    Type.Object({
        columnId: Type.Optional(Type.String()),
        order: TaskOrderSchema,
    }),
]);
export type TaskMoveBodyType = Static<typeof TaskMoveBody>;
