import client from "@/lib/fetch";
import type { ProjectDataSchemaType } from "@/schemas/project.schema";

export async function getProjects() {
    const { data: projects } = await client.GET("/v1/projects/", {
        credentials: "same-origin",
    });

    if (!projects) {
        throw new Error("Failed to load projects");
    }

    return projects;
}

export async function createProject(body: ProjectDataSchemaType) {
    const { data, error } = await client.POST("/v1/projects/", {
        body: {
            ...body,
        },
        credentials: "include",
    });

    if (error) {
        throw new Error(`Project creation error: ${error.error}`);
    }

    if (!data) {
        throw new Error("Failed to create project");
    }
}
