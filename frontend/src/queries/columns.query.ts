import { createColumn, getAllColumns, getColumn } from "@/api/columns.api";
import { getAllTasks } from "@/api/tasks.api";
import type { ColumnDataSchemaType, ColumnID } from "@/schemas/columns.schema";
import type { ProjectID } from "@/schemas/project.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetAllColumns(projectId: ProjectID) {
    return useQuery({
        queryKey: ["project", projectId],
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
