import Type, { Static } from "typebox";
import { Column as PrismaColumn } from "../../generated/prisma/client.ts";

export type ColumnID = string;

export const ColumnParams = Type.Object({
    columnId: Type.String(),
});
export type ColumnParamsType = Static<typeof ColumnParams>;

export type ColumnDataSchemaType = Static<typeof ColumnDataSchema>;
export const ColumnDataSchema = Type.Object({
    name: Type.String({ minLength: 3 }),
    order: Type.Integer(),
});

export type ColumnUpdateSchemaType = Static<typeof ColumnUpdateSchema>;
export const ColumnUpdateSchema = Type.Partial(ColumnDataSchema);

export type ColumnFullSchemaType = Static<typeof ColumnFullSchema>;
export const ColumnFullSchema = Type.Intersect([
    Type.Object({
        id: Type.String(),
    }),
    ColumnDataSchema,
]);

export function ColumnPrismaMap(from: PrismaColumn): ColumnFullSchemaType {
    return {
        id: from.id,
        name: from.name,
        order: from.order,
    };
}
