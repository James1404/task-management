import { createTask, deleteTask, getAllTasks } from "@/api/tasks.api";
import type { ColumnID } from "@/schemas/columns.schema";
import type { TaskDataSchemaType, TaskID } from "@/schemas/task.schema";
import {
    mutationOptions,
    queryOptions,
    useQueryClient,
} from "@tanstack/react-query";

export function getTasksOptions(columnId: ColumnID) {
    return queryOptions({
        queryKey: ["columns", columnId, "tasks"],
        queryFn: async () => await getAllTasks(columnId),
        staleTime: 2 * 60 * 1000,
    });
}

export function createTaskOptions(columnId: ColumnID) {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: async (body: TaskDataSchemaType) =>
            await createTask(columnId, body),
        onSuccess: async () =>
            await queryClient.invalidateQueries({
                queryKey: ["columns", columnId, "tasks"],
            }),
    });
}

export function deleteTaskOptions(columnId: ColumnID, taskId: TaskID) {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: async () => await deleteTask(taskId),
        onSuccess: async () =>
            await queryClient.invalidateQueries({
                queryKey: ["columns", columnId, "tasks"],
            }),
    });
}
