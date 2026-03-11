import z from "zod";

export const ProjectDataSchema = z.object({
    name: z.string().min(3),
    description: z.string(),
});
export type ProjectDataSchemaType = z.infer<typeof ProjectDataSchema>;

export const ProjectSchema = z.intersection(
    ProjectDataSchema,
    z.object({
        id: z.number(),
    }),
);
export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
