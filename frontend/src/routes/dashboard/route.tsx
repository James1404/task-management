import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { queryClient } from "@/lib/client";
import { useCurrentProject, useGetAllProjects } from "@/queries/projects.query";
import { loggedIn } from "@/stores/credentials";
import { QueryClientProvider } from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    Outlet,
    redirect,
    useParams,
} from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
    component: RouteComponent,
    beforeLoad() {
        if (!loggedIn()) {
            throw redirect({
                to: "/",
            });
        }
    },
});

function Project({
    id,
    name,
    description,
}: {
    id: string;
    name: string;
    description?: string;
}) {
    return (
        <Card className="">
            <CardHeader className="">
                <CardTitle>{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" asChild>
                    <Link
                        to={"/dashboard/$projectId"}
                        params={{ projectId: id.toString() }}
                    >
                        Click me
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function Projects() {
    const { isPending, isError, error, data } = useGetAllProjects();

    if (isPending) {
        return <span>Loading...</span>;
    }

    if (isError) {
        return <span>Error: {error.message}</span>;
    }

    return (
        <ScrollArea>
            <div className="flex flex-col gap-2">
                {data.map(project => (
                    <Project key={project.id} {...project} />
                ))}
            </div>
        </ScrollArea>
    );
}

function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader>Hello header</SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <CreateProjectDialog>
                        Create new project
                    </CreateProjectDialog>
                </SidebarGroup>
                <Separator orientation="horizontal"></Separator>
                <SidebarGroup>
                    <Projects />
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>Sidebar FFOOooter</SidebarFooter>
        </Sidebar>
    );
}

function ProjectNameFromId({ projectId }: { projectId: string }) {
    const { isPending, isError, error, data } = useCurrentProject(projectId);

    if (isPending) {
        return <Spinner />;
    }

    if (isError) {
        return <span>Error: {error.message}</span>;
    }

    if (!data) {
        return <span>Project does not exist</span>;
    }

    return <h1 className="text-base font-bold">{data.name}</h1>;
}

function ProjectName() {
    const { projectId } = useParams({ strict: false });

    if (!projectId) {
        return <></>;
    }

    return <ProjectNameFromId projectId={projectId} />;
}

function RouteComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <DashboardSidebar variant="inset" />
                <SidebarInset className="overflow-hidden">
                    <header className="flex items-center px-4 py-2">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mx-4" />
                        <ProjectName />
                    </header>
                    <main
                        className="overflow-x-auto max-x-full h-full"
                        id="main-screen"
                    >
                        <Outlet />
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </QueryClientProvider>
    );
}
