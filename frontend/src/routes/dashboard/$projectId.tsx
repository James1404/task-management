import { currentProjectOptions } from "@/queries/projects";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$projectId")({
    component: RouteComponent,
});

function CurrentProject() {
    const { projectId } = Route.useParams();
    const { isLoading, isError, error, data } = useQuery(
        currentProjectOptions(Number(projectId)),
    );

    if (isLoading) {
        return <span>Loading ...</span>;
    }

    if (isError) {
        return <span>Error: {error.message}</span>;
    }

    return (
        <div>
            <h1>{data?.name}</h1>
            <p>{data?.description}</p>
        </div>
    );
}

function RouteComponent() {
    return (
        <div>
            <CurrentProject />
        </div>
    );
}
