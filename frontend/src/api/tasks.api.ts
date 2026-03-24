import type { ColumnID } from "@/schemas/columns.schema";
import type {
    TaskDataSchemaType,
    TaskID,
    TaskSchemaType,
} from "@/schemas/task.schema";
import { getTaskManagementAPI } from "../../generated/backend";

export async function getAllTasks(columnId: ColumnID) {
    const data =
        await getTaskManagementAPI().getV1ColumnsColumnIdTasks(columnId);

    // const { data, error } = await client.GET("/v1/columns/{columnId}/tasks", {
    //     credentials: "same-origin",
    //     params: {
    //         path: {
    //             columnId,
    //         },
    //     },
    // });

    // if (error) {
    //     throw new Error(error.error);
    // }

    // if (!data) {
    //     throw new Error("Failed to load tasks");
    // }

    return data as TaskSchemaType[];
}

export async function createTask(columnId: ColumnID, body: TaskDataSchemaType) {
    const data = await getTaskManagementAPI().postV1ColumnsColumnIdTasks(
        columnId,
        { ...body },
    );

    // const { data, error } = await client.POST("/v1/columns/{columnId}/tasks", {
    //     params: { path: { columnId } },
    //     body: {
    //         ...body,
    //     },
    //     credentials: "include",
    // });

    // if (error) {
    //     throw new Error(`Task creation error: ${error.error}`);
    // }

    // if (!data) {
    //     throw new Error("Failed to create task");
    // }

    return data as TaskSchemaType;
}

export async function deleteTask(taskId: TaskID) {
    const data = await getTaskManagementAPI().deleteV1TasksTaskId(taskId);

    // const { data, error } = await client.DELETE("/v1/tasks/{taskId}", {
    //     params: { path: { taskId } },
    //     credentials: "include",
    // });

    // if (error) {
    //     throw new Error(`Task deletion error: ${error.error}`);
    // }

    // if (!data) {
    //     throw new Error("Failed to delete task");
    // }

    return data as TaskSchemaType;
}
