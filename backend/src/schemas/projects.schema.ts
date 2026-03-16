import Type, { Static } from "typebox";
import { Prisma } from "../../generated/prisma/browser.ts";
import { Project as PrismaProject } from "../../generated/prisma/client.ts";

export const ProjectParams = Type.Object({
    projectId: Type.String(),
});
export type ProjectParamsType = Static<typeof ProjectParams>;

export type ProjectDataSchemaType = Static<typeof ProjectDataSchema>;
export const ProjectDataSchema = Type.Object({
    name: Type.String(),
    description: Type.String(),
});

export type ProjectUpdateSchemaType = Static<typeof ProjectUpdateSchema>;
export const ProjectUpdateSchema = Type.Partial(
    Type.Object({
        name: Type.String(),
        description: Type.String(),
    }),
);

export type ProjectSchemaType = Static<typeof ProjectSchema>;
export const ProjectSchema = Type.Intersect([
    ProjectDataSchema,
    Type.Object({
        id: Type.String(),
    }),
]);

export function ProjectPrismaMap(from: PrismaProject): ProjectSchemaType {
    return {
        id: from.id,
        name: from.name,
        description: from.description,
    };
}
