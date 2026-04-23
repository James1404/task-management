import { Spinner } from "@/components/ui/spinner";
import { getAccountOptions } from "@/queries/account.query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/account")({
    component: RouteComponent,
});

function RouteComponent() {
    const { data, status, error } = useQuery(getAccountOptions());

    if (status === "error") {
        return <span>Error: {error.message}</span>;
    }

    if (status === "pending") {
        return <Spinner />;
    }

    return (
        <div className="size-full py-2 px-5">
            <div>{JSON.stringify(data)}</div>
        </div>
    );
}
