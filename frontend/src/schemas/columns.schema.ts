import z from "zod";

export type ColumnID = string;

export const OrderSchema = z.number();
export type OrderType = z.infer<typeof OrderSchema>;

export const ColumnDataSchema = z.object({
    name: z.string().min(3),
});

export type ColumnDataSchemaType = z.infer<typeof ColumnDataSchema>;

export const ColumnSchema = z.intersection(
    ColumnDataSchema,
    z.object({
        id: z.string(),
        order: OrderSchema,
    }),
);
export type ColumnSchemaType = z.infer<typeof ColumnSchema>;
