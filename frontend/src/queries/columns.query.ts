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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetAllColumns(projectId: ProjectID) {
    return useQuery({
        queryKey: ["columns"],
        queryFn: async () => await getAllColumns(projectId),
        staleTime: 2 * 60 * 1000,
    });
}

export function useGetColumn(columnId: ColumnID) {
    return useQuery({
        queryKey: ["columns", columnId],
        queryFn: async () => await getColumn(columnId),
        staleTime: 2 * 60 * 1000,
    });
}

export function useGetColumnTasks(columnId: ColumnID) {
    return useQuery({
        queryKey: ["columns", columnId, "tasks"],
        queryFn: async () => await getAllTasks(columnId),
        staleTime: 2 * 60 * 1000,
    });
}

export function useReorderColumns(columnId: ColumnID) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (order: OrderType) =>
            await reorderColumn(columnId, order),
        onSuccess: async () =>
            await queryClient.invalidateQueries({
                queryKey: ["columns", columnId],
            }),
    });
}

export function useCreateColumns(columnId: ColumnID) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: ColumnDataSchemaType) =>
            await createColumn(columnId, body),
        onSuccess: async () =>
            await queryClient.invalidateQueries({
                queryKey: ["columns", columnId],
            }),
    });
}
