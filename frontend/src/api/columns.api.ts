import type {
    ColumnDataSchemaType,
    ColumnID,
    ColumnSchemaType,
} from "@/schemas/columns.schema";
import { getTaskManagementAPI } from "../../generated/backend";
import type { ProjectID } from "@/schemas/project.schema";

export async function getAllColumns(projectId: ProjectID) {
    const columns =
        await getTaskManagementAPI().getV1ProjectsProjectIdColumns(projectId);

    // const { data, error } = await client.GET(
    //     "/v1/projects/{projectId}/columns",
    //     {
    //         credentials: "same-origin",
    //         params: {
    //             path: {
    //                 projectId,
    //             },
    //         },
    //     },
    // );

    // if (error) {
    //     throw new Error(error.error);
    // }

    // if (!data) {
    //     throw new Error("Failed to load tasks");
    // }

    return columns as ColumnSchemaType[];
}

export async function getColumn(columnId: ColumnID) {
    const columns = await getTaskManagementAPI().getV1ColumnsColumnId(columnId);
    return columns as ColumnSchemaType;
}

export async function createColumn(
    projectId: string,
    body: ColumnDataSchemaType,
) {
    const column = await getTaskManagementAPI().postV1ProjectsProjectIdColumns(
        projectId,
        {
            ...body,
        },
    );

    // const { data, error } = await client.POST(
    //     "/v1/projects/{projectId}/columns",
    //     {
    //         params: { path: { projectId } },
    //         body: {
    //             ...body,
    //         },
    //         credentials: "include",
    //     },
    // );

    // if (error) {
    //     throw new Error(`Column creation error: ${error.error}`);
    // }

    // if (!data) {
    //     throw new Error("Failed to create column");
    // }

    return column as ColumnSchemaType;
}
