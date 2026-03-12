import { createFileRoute, redirect } from "@tanstack/react-router";
import { loggedIn } from "../stores/credentials";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";

import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
    ProjectDataSchema,
    type ProjectDataSchemaType,
} from "@/schemas/project.schema";
import {
    QueryClient,
    QueryClientProvider,
    queryOptions,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { createProject, getProject, getProjects } from "@/api/projects";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import useDashboard, { setProjectId } from "@/stores/dashboard";

export const Route = createFileRoute("/old_dashboard")({
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
    id: number;
    name: string;
    description?: string;
}) {
    const onClick = (projectId: number) => {
        setProjectId(projectId);
    };

    return (
        <Card className="">
            <CardHeader className="">
                <CardTitle>{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" onClick={() => onClick(id)}>
                    Open
                </Button>
            </CardContent>
        </Card>
    );
}

function Projects() {
    const { isPending, isError, error, data } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => await getProjects(),
        staleTime: 600000,
    });

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
                    <NewProjectDialog />
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

function NewProjectDialog() {
    const { handleSubmit, control } = useForm<ProjectDataSchemaType>({
        resolver: zodResolver(ProjectDataSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (body: ProjectDataSchemaType) =>
            await createProject(body),
        onSuccess: async () =>
            await queryClient.invalidateQueries({ queryKey: ["projects"] }),
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const onSubmit: SubmitHandler<ProjectDataSchemaType> = async formData => {
        const project = await mutation.mutateAsync(formData);
        setProjectId(project.id);
        setDialogOpen(false);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>Create New Project</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New project</DialogTitle>
                    <DialogDescription>Create a new project</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Name
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Name..."
                                ></Input>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    <Controller
                        name="description"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Description
                                </FieldLabel>
                                <Textarea
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Description..."
                                    className="min-h-30"
                                ></Textarea>
                                <FieldDescription>
                                    Tell us more about yourself. This will be
                                    used to help us personalize your experience.
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <DialogFooter>
                        <Field orientation="horizontal">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Create</Button>
                        </Field>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function currentProjectOptions() {
    const projectId = useDashboard.getState().projectId;

    return queryOptions({
        queryKey: ["currentProject"],
        queryFn: async () => getProject(projectId ?? 0),
        staleTime: 600000,
    });
}

function CurrentProject() {
    const projectId = useDashboard(state => state.projectId);

    if (projectId === null) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>No Project Selected</EmptyTitle>
                    <EmptyDescription>
                        Please select a project in the sidebar
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <NewProjectDialog />
                </EmptyContent>
            </Empty>
        );
    }

    const { isPending, isError, error, data } = useQuery(
        currentProjectOptions(),
    );

    if (isPending) {
        return <span>Loading project...</span>;
    }

    if (isError) {
        return <span>Error loading project: {error.message}</span>;
    }

    return (
        <div>
            <h1>{data.name}</h1>
            <p>{data.description}</p>
        </div>
    );
}

function Dashboard() {
    const { isPending, isError, error, data } = useQuery(
        currentProjectOptions(),
    );

    return (
        <SidebarProvider>
            <DashboardSidebar variant="inset" />
            <SidebarInset>
                <header className="flex items-center px-4 py-2">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mx-4" />
                    <h1 className="text-base font-bold">
                        {(() => {
                            if (isPending) {
                                return <span>Loading...</span>;
                            }

                            if (isError) {
                                return <span>Error: {error.message}</span>;
                            }

                            return <span>{data.name}</span>;
                        })()}
                    </h1>
                </header>
                <main className="h-full">
                    <div className="flex flex-col items-center justify-center h-full">
                        <CurrentProject />
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

const queryClient = new QueryClient();
function RouteComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <Dashboard />
        </QueryClientProvider>
    );
}
