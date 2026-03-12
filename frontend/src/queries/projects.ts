import { createProject, getProject, getProjects } from "@/api/projects";
import type { ProjectDataSchemaType } from "@/schemas/project.schema";
import {
    mutationOptions,
    queryOptions,
    useQueryClient,
} from "@tanstack/react-query";

export function currentProjectOptions(projectId: number) {
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
            await createProject(body),
        onSuccess: async () =>
            await queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });
}
