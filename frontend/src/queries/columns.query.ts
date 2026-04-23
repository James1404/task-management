import {
    createColumn,
    getAllColumns,
    getColumn,
    reorderColumn,
} from "@/api/columns.api";
import { getAllTasks } from "@/api/tasks.api";
import type {
    ColumnDataSchemaType,
    ColumnID,
    OrderType,
} from "@/schemas/columns.schema";
import type { ProjectID } from "@/schemas/project.schema";
import {
    mutationOptions,
    queryOptions,
    useQueryClient,
} from "@tanstack/react-query";

export function getAllColumnsOptions(projectId: ProjectID) {
    return queryOptions({
        queryKey: ["columns"],
        queryFn: async () => await getAllColumns(projectId),
        staleTime: 2 * 60 * 1000,
    });
}

export function getColumnOptions(columnId: ColumnID) {
    return queryOptions({
        queryKey: ["columns", columnId],
        queryFn: async () => await getColumn(columnId),
        staleTime: 2 * 60 * 1000,
    });
}

export function getColumnTasksOptions(columnId: ColumnID) {
    return queryOptions({
        queryKey: ["columns", columnId, "tasks"],
        queryFn: async () => await getAllTasks(columnId),
        staleTime: 2 * 60 * 1000,
    });
}

export function reorderColumnsOptions() {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: async ({
            columnId,
            order,
        }: {
            columnId: ColumnID;
            order: OrderType;
        }) => await reorderColumn(columnId, order),
        onSettled: async (_data, _error) => {
            await queryClient.invalidateQueries({
                queryKey: ["columns"],
            });
        },
    });
}

export function useCreateColumnsOptions(columnId: ColumnID) {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: async (body: ColumnDataSchemaType) =>
            await createColumn(columnId, body),
        onSuccess: async () =>
            await queryClient.invalidateQueries({
                queryKey: ["columns", columnId],
            }),
    });
}
