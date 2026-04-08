import type { ColumnID } from "@/schemas/columns.schema";
import type {
    TaskCreateSchemaType,
    TaskID,
    TaskSchemaType,
    TaskUpdateSchemaType,
} from "@/schemas/task.schema";
import { getTaskManagementAPI } from "../../generated/backend";

export async function getAllTasks(columnId: ColumnID) {
    const data =
        await getTaskManagementAPI().getV1ColumnsColumnIdTasks(columnId);

    return data as TaskSchemaType[];
}

export async function createTask(
    columnId: ColumnID,
    body: TaskCreateSchemaType,
) {
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

export async function updateTask(taskId: ColumnID, body: TaskUpdateSchemaType) {
    const data = await getTaskManagementAPI().patchV1TasksTaskId(taskId, {
        ...body,
    });

    return data as TaskSchemaType;
}

export async function reorderTask(taskId: TaskID, order: number) {
    const data = await getTaskManagementAPI().patchV1TasksTaskIdMove(taskId, {
        order,
    });

    return data as TaskSchemaType;
}

export async function moveTask(taskId: TaskID, columnId: ColumnID) {
    const data = await getTaskManagementAPI().patchV1TasksTaskIdMove(taskId, {
        columnId,
    });

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
