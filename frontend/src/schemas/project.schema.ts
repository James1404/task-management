import z from "zod";

export type ProjectID = string;

export const ProjectDataSchema = z.object({
    name: z.string().min(3),
    description: z.string(),
});
export type ProjectDataSchemaType = z.infer<typeof ProjectDataSchema>;

export const ProjectSchema = z.intersection(
    ProjectDataSchema,
    z.object({
        id: z.string(),
    }),
);
export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
