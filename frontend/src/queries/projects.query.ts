import {
    createBasicProject,
    getProject,
    getProjects,
} from "@/api/projects.api";
import type {
    ProjectDataSchemaType,
    ProjectID,
} from "@/schemas/project.schema";
import {
    queryOptions,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

export function useCurrentProjectOptions(projectId: ProjectID) {
    return queryOptions({
        queryKey: ["currentProject", projectId],
        queryFn: async () => getProject(projectId),
        staleTime: 2 * 60 * 1000,
    });
}

export function useCurrentProject(projectId: ProjectID) {
    return useQuery(useCurrentProjectOptions(projectId));
}

export function useGetAllProjects() {
    return useQuery({
        queryKey: ["projects"],
        queryFn: async () => await getProjects(),
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: ProjectDataSchemaType) =>
            await createBasicProject(body),
        onSuccess: async () =>
            await queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });
}
