import { createColumn, getAllColumns } from "@/api/columns.api";
import { getAllTasks } from "@/api/tasks.api";
import type { ColumnDataSchemaType, ColumnID } from "@/schemas/columns.schema";
import {
    mutationOptions,
    queryOptions,
    useQueryClient,
} from "@tanstack/react-query";

export function getColumnsOptions(columnId: ColumnID) {
    return queryOptions({
        queryKey: ["columns", columnId],
        queryFn: async () => await getAllColumns(columnId),
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

export function createColumnsOptions(columnId: ColumnID) {
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
