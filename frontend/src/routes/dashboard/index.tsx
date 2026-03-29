import { CreateProjectDialog } from "@/components/create-project-dialog";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <Empty className="h-full">
            <EmptyHeader>
                <EmptyTitle>No Project Selected</EmptyTitle>
                <EmptyDescription>
                    Please select a project in the sidebar
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <CreateProjectDialog>
                    <Plus />
                </CreateProjectDialog>
            </EmptyContent>
        </Empty>
    );
}
