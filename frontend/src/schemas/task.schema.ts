import z from "zod";

export const TaskIDSchema = z.string();
export type TaskID = z.infer<typeof TaskIDSchema>;

export const TaskDataSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
});
export type TaskDataSchemaType = z.infer<typeof TaskDataSchema>;

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
