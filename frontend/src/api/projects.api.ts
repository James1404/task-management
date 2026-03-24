import type {
    ProjectDataSchemaType,
    ProjectID,
    ProjectSchemaType,
} from "@/schemas/project.schema";
import { createColumn } from "./columns.api";
import { getTaskManagementAPI } from "../../generated/backend";

export async function getProjects() {
    const data = await getTaskManagementAPI().getV1Projects();

    // const { data: projects } = await client.GET("/v1/projects/", {
    //     credentials: "same-origin",
    // });

    // if (!projects) {
    //     throw new Error("Failed to load projects");
    // }

    return data as ProjectSchemaType[];
}

export async function getProject(projectId: ProjectID) {
    const data = await getTaskManagementAPI().getV1ProjectsProjectId(projectId);

    // const { data, error } = await client.GET("/v1/projects/{projectId}", {
    //     credentials: "same-origin",
    //     params: {
    //         path: {
    //             projectId,
    //         },
    //     },
    // });

    // if (error) {
    //     throw new Error(error.error);
    // }

    // if (!data) {
    //     throw new Error("Failed to load projects");
    // }

    return data as ProjectSchemaType;
}

export async function createEmptyProject(body: ProjectDataSchemaType) {
    const data = await getTaskManagementAPI().postV1Projects({ ...body });

    // const { data, error } = await client.POST("/v1/projects/", {
    //     body: {
    //         ...body,
    //     },
    //     credentials: "include",
    // });

    // if (error) {
    //     throw new Error(`Project creation error: ${error.error}`);
    // }

    // if (!data) {
    //     throw new Error("Failed to create project");
    // }

    return data as ProjectSchemaType;
}

export async function createBasicProject(body: ProjectDataSchemaType) {
    const project = await createEmptyProject(body);

    await createColumn(project.id, { name: "ToDo" });
    await createColumn(project.id, { name: "In Progress" });
    await createColumn(project.id, { name: "Finished" });

    return project;
}
