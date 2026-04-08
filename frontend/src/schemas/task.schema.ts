import z from "zod";

export const TaskIDSchema = z.string();
export type TaskID = z.infer<typeof TaskIDSchema>;

export const TaskDataSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    order: z.number(),
});
export type TaskDataSchemaType = z.infer<typeof TaskDataSchema>;

export const TaskCreateSchema = TaskDataSchema.omit({ order: true });
export type TaskCreateSchemaType = z.infer<typeof TaskCreateSchema>;

export const TaskUpdateSchema = TaskDataSchema.partial();
export type TaskUpdateSchemaType = z.infer<typeof TaskUpdateSchema>;

export const TaskSchema = z.intersection(
    TaskDataSchema,
    z.object({
        id: TaskIDSchema,
        columnId: z.string(),
    }),
);
export type TaskSchemaType = z.infer<typeof TaskSchema>;

export const MoveTaskSchema = z.union([
    z.object({
        columnId: z.string(),
        order: z.number().optional(),
    }),
    z.object({
        columnId: z.string().optional(),
        order: z.number(),
    }),
]);
export type MoveTaskSchemaType = z.infer<typeof MoveTaskSchema>;
// export type MoveTaskSchemaType =
//     | {
//           columnId: string;
//           order?: number;
//       }
//     | {
//           columnId?: string;
//           order: number;
//       };
