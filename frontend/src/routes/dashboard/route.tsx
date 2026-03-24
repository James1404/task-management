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
import {
    currentProjectOptions,
    getAllProjectsOptions,
} from "@/queries/projects.query";
import { loggedIn } from "@/stores/credentials";
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from "@tanstack/react-query";
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
    const { isPending, isError, error, data } = useQuery(
        getAllProjectsOptions(),
    );

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
    const { isPending, isError, error, data } = useQuery(
        currentProjectOptions(projectId),
    );

    if (isPending) {
        return <span>Loading...</span>;
    }

    if (isError) {
        return <span>Error: {error.message}</span>;
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

const queryClient = new QueryClient();

function RouteComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <DashboardSidebar variant="inset" />
                <SidebarInset>
                    <header className="flex items-center px-4 py-2">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mx-4" />
                        <ProjectName />
                    </header>
                    <main className="h-full">
                        <div className="flex flex-col items-center justify-center h-full">
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </QueryClientProvider>
    );
}
