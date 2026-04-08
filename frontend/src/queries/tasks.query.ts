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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetTasks(columnId: ColumnID) {
    return useQuery({
        queryKey: ["columns", columnId, "tasks"],
        queryFn: async () => await getAllTasks(columnId),
        staleTime: 2 * 60 * 1000,
    });
}

export function useCreateTask(columnId: ColumnID) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: TaskCreateSchemaType) =>
            await createTask(columnId, body),
        onSuccess: async () =>
            await queryClient.invalidateQueries({
                queryKey: ["columns", columnId, "tasks"],
            }),
    });
}

export function useMoveTask() {
    const queryClient = useQueryClient();

    return useMutation({
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
                ["columns", variables.task.columnId, "tasks"],
                (old: any[]) =>
                    old.filter(item => item.id !== variables.task.id),
            );

            context.client.setQueryData(
                ["columns", variables.columnId, "tasks"],
                (old: any) => [...old, variables.task],
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

export function useReorderTask() {
    const queryClient = useQueryClient();

    return useMutation({
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
                (old: any[]) =>
                    old.filter(item => item.id !== variables.task.id),
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

export function useDeleteTask(columnId: ColumnID, taskId: TaskID) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => await deleteTask(taskId),
        onSuccess: async () =>
            await queryClient.invalidateQueries({
                queryKey: ["columns", columnId, "tasks"],
            }),
    });
}
