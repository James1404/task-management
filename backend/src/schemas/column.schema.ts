import Type, { Static } from "typebox";
import { Column as PrismaColumn } from "../../generated/prisma/client.ts";

export const ColumnIDSchema = Type.String();
export type ColumnID = string;

export const ColumnOrderSchema = Type.Number();
export type ColumnOrderType = Static<typeof ColumnOrderSchema>;

export const ColumnParams = Type.Object({
    columnId: Type.String(),
});
export type ColumnParamsType = Static<typeof ColumnParams>;

export type ColumnDataSchemaType = Static<typeof ColumnDataSchema>;
export const ColumnDataSchema = Type.Object({
    name: Type.String({ minLength: 3 }),
});

export type ColumnUpdateSchemaType = Static<typeof ColumnUpdateSchema>;
export const ColumnUpdateSchema = Type.Partial(ColumnDataSchema);

export type ColumnFullSchemaType = Static<typeof ColumnFullSchema>;
export const ColumnFullSchema = Type.Intersect([
    Type.Object({
        id: Type.String(),
        order: ColumnOrderSchema,
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

export const ColumnMoveBody = Type.Object({
    order: ColumnOrderSchema,
});
export type ColumnMoveBodyType = Static<typeof ColumnMoveBody>;
