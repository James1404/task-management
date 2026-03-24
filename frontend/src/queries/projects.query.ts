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
    mutationOptions,
    queryOptions,
    useQueryClient,
} from "@tanstack/react-query";

export function currentProjectOptions(projectId: ProjectID) {
    return queryOptions({
        queryKey: ["currentProject", projectId],
        queryFn: async () => getProject(projectId),
        staleTime: 2 * 60 * 1000,
    });
}

export function getAllProjectsOptions() {
    return queryOptions({
        queryKey: ["projects"],
        queryFn: async () => await getProjects(),
    });
}

export function createProjectOptions() {
    const queryClient = useQueryClient();

    return mutationOptions({
        mutationFn: async (body: ProjectDataSchemaType) =>
            await createBasicProject(body),
        onSuccess: async () =>
            await queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });
}
