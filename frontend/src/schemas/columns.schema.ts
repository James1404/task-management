import z from "zod";

export type ColumnID = string;

export const ColumnDataSchema = z.object({
    name: z.string().min(3),
});

export type ColumnDataSchemaType = z.infer<typeof ColumnDataSchema>;

export const ColumnSchema = z.intersection(
    ColumnDataSchema,
    z.object({
        id: z.string(),
    }),
);
export type ColumnSchemaType = z.infer<typeof ColumnSchema>;
