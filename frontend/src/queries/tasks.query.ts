import {
    createTask,
    deleteTask,
    getAllTasks,
    moveTask,
    reorderTask,
} from "@/api/tasks.api";
import type { ColumnID } from "@/schemas/columns.schema";
import type {
    TaskCreateSchemaType,
    TaskID,
    TaskSchemaType,
} from "@/schemas/task.schema";
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
        mutationFn: async (body: TaskCreateSchemaType) =>
            await createTask(columnId, body),
        onSuccess: async () =>
            await queryClient.invalidateQueries({
                queryKey: ["columns", columnId, "tasks"],
            }),
    });
}

export function moveTaskOptions() {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: async ({
            task: { id },
            columnId,
        }: {
            task: TaskSchemaType;
            columnId: ColumnID;
        }) => await moveTask(id, columnId),
        async onMutate(variables, context) {
            await context.client.cancelQueries({
                queryKey: ["columns", variables.columnId, "tasks"],
            });
            const previousTasks = context.client.getQueryData([
                "columns",
                variables.columnId,
                "tasks",
            ]);
            if (variables.task.columnId === variables.columnId) {
                return;
            }
            context.client.setQueryData(
                getTasksOptions(variables.columnId).queryKey,
                old =>
                    old
                        ? old.filter(item => item.id !== variables.task.id)
                        : [],
            );
            context.client.setQueryData(
                getTasksOptions(variables.columnId).queryKey,
                old => (old ? [...old, variables.task] : []),
            );
            return { previousTasks };
        },
        async onSettled(_data, _error, variables) {
            await queryClient.invalidateQueries({
                queryKey: ["columns", variables.task.columnId, "tasks"],
            });

            return await queryClient.invalidateQueries({
                queryKey: ["columns", variables.columnId, "tasks"],
            });
        },
    });
}

export function reorderTaskOptions() {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: async ({
            task: { id },
            order,
        }: {
            task: TaskSchemaType;
            order: number;
        }) => await reorderTask(id, order),
        async onMutate(variables, context) {
            await context.client.cancelQueries({
                queryKey: ["columns", variables.task.columnId, "tasks"],
            });
            const previousTasks = context.client.getQueryData([
                "columns",
                variables.task.columnId,
                "tasks",
            ]);
            context.client.setQueryData(
                ["columns", variables.task.columnId, "tasks"],
                (old: any[]) => {
                    const newTasks = [...old];
                    const [removed] = newTasks.splice(
                        Math.max(variables.task.order, 0),
                        1,
                    );
                    newTasks.splice(variables.order, 0, removed);
                    return newTasks;
                },
            );
            return { previousTasks };
        },
        async onSettled(_data, _error, variables) {
            await queryClient.invalidateQueries({
                queryKey: ["columns", variables.task.columnId, "tasks"],
            });
        },
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
