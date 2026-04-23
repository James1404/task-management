import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { queryClient } from "@/lib/client";
import {
    getAccountOptions,
    logoutAccountOptions,
} from "@/queries/account.query";
import {
    currentProjectOptions,
    getAllProjectsOptions,
} from "@/queries/projects.query";
import { loggedIn } from "@/stores/credentials";
import {
    QueryClientProvider,
    useMutation,
    useQuery,
} from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    Outlet,
    redirect,
    useParams,
} from "@tanstack/react-router";
import { CircleUserRound, EllipsisVertical, LogOut } from "lucide-react";

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

function ProjectLink({
    id,
    name,
}: {
    id: string;
    name: string;
    description?: string;
}) {
    return (
        <Button asChild variant="outline">
            <Link
                to={"/dashboard/$projectId"}
                params={{ projectId: id.toString() }}
            >
                <span>{name}</span>
            </Link>
        </Button>
    );
}

function SidebarProjects() {
    const { isPending, isError, error, data } = useQuery(
        getAllProjectsOptions(),
    );

    if (isPending) {
        return (
            <span>
                <Spinner />
            </span>
        );
    }

    if (isError) {
        return <span>Error: {error.message}</span>;
    }

    return (
        <ScrollArea>
            <div className="flex flex-col gap-2">
                {data.map(project => (
                    <ProjectLink key={project.id} {...project} />
                ))}
            </div>
        </ScrollArea>
    );
}

function Nickname() {
    const { data, status, error } = useQuery(getAccountOptions());

    if (status === "error") {
        return <span>Error: {error.message}</span>;
    }

    if (status === "pending") {
        return (
            <span>
                <Spinner />
            </span>
        );
    }

    return <span className="truncate">{data.nickname}</span>;
}

function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const logoutMutator = useMutation(logoutAccountOptions());

    const onLogout = async () => {
        await logoutMutator.mutateAsync();
    };

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
                    <SidebarProjects />
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="flex flex-row justify-between"
                            >
                                <CircleUserRound size={48} />
                                <Nickname />
                                <EllipsisVertical />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>
                                    My Account
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link to="/dashboard/account">
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Button onClick={onLogout}>
                                        <LogOut />
                                        Logout
                                    </Button>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

function ProjectNameFromId({ projectId }: { projectId: string }) {
    const { isPending, isError, error, data } = useQuery(
        currentProjectOptions(projectId),
    );

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
                        className="overflow-x-auto max-x-full h-full max-h-full"
                        id="main-screen"
                    >
                        <Outlet />
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </QueryClientProvider>
    );
}
