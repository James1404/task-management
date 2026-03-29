import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
    useGetAllColumns,
    useGetColumn,
    useGetColumnTasks,
} from "@/queries/columns.query";
import {
    useCreateTask,
    useDeleteTask,
    useMoveTask,
} from "@/queries/tasks.query";
import type { ColumnID, ColumnSchemaType } from "@/schemas/columns.schema";
import {
    TaskDataSchema,
    type TaskDataSchemaType,
    type TaskSchemaType,
} from "@/schemas/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { GripVertical, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
    DragDropProvider,
    useDraggable,
    useDroppable,
    type DragEndEvent,
} from "@dnd-kit/react";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/client";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import {
    useCurrentProject,
    useCurrentProjectOptions,
} from "@/queries/projects.query";

export const Route = createFileRoute("/dashboard/$projectId")({
    async loader({ params: { projectId } }) {
        try {
            await queryClient.fetchQuery(useCurrentProjectOptions(projectId));
        } catch (err) {
            throw notFound({ data: err });
        }
    },
    component: RouteComponent,
    notFoundComponent: NotFoundComponent,
});

function CreateTaskDialog({
    columnId,
    children,
}: {
    columnId: ColumnID;
    children: React.ReactNode;
}) {
    const { handleSubmit, control } = useForm<TaskDataSchemaType>({
        resolver: zodResolver(TaskDataSchema),
        defaultValues: {
            title: "",
            description: undefined,
        },
    });

    const mutation = useCreateTask(columnId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const onSubmit: SubmitHandler<TaskDataSchemaType> = async formData => {
        await mutation.mutateAsync(formData);
        setDialogOpen(false);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost">{children}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New project</DialogTitle>
                    <DialogDescription>Create a new project</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                        name="title"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Title
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Title..."
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

type DraggableType = {
    task: TaskSchemaType;
};

function Task(task: TaskSchemaType) {
    const { description, title, id, columnId } = task;

    const mutation = useDeleteTask(columnId, id);

    const onClick = async () => {
        await mutation.mutateAsync();
    };

    const { ref, handleRef, isDragging } = useDraggable<DraggableType>({
        id,
        data: { task },
        // modifiers: [RestrictToElement.configure({ element: null })],
    });

    const className = cn(
        `flex flex-row justify-between items-center
        w-full min-w-0
        px-3 py-1
        rounded-md
        border
        shadow-none
        bg-card text-card-foreground
        transition-all`,
        !isDragging && "border-transparent",
        isDragging && "shadow-md",
    );

    return (
        <div className={className} ref={ref}>
            <h3>{title}</h3>
            <p>{description}</p>

            <div>
                <Button variant="ghost" onClick={onClick}>
                    <Trash />
                </Button>

                <Button variant="ghost" ref={handleRef}>
                    <GripVertical />
                </Button>
            </div>
        </div>
    );
}

function Tasks({ columnId }: { columnId: string }) {
    const { status, error, data } = useGetColumnTasks(columnId);

    if (status === "pending") {
        return <Spinner />;
    }

    if (status === "error") {
        return <span>Error: {error.message}</span>;
    }

    return (
        <div className="h-full flex flex-col gap-2">
            {data.map(task => (
                <Task {...task} key={task.id} />
            ))}
        </div>
    );
}

function Column({ id }: ColumnSchemaType) {
    const { status, error, data } = useGetColumn(id);

    const { ref, isDropTarget } = useDroppable<DraggableType>({
        id,
    });

    if (status === "pending") {
        return <Spinner />;
    }

    if (status === "error") {
        return <span>Error: {error.message}</span>;
    }

    const contentClassName = cn(
        "h-full box-border border-2 border-dashed border-transparent transition-colors",
        isDropTarget && "border-blue-500",
    );

    return (
        <Card className="h-full w-125">
            <CardHeader>
                <CardTitle>
                    <Input
                        className="border-0 bg-transparent!"
                        value={data.name}
                    />
                </CardTitle>
                <CardAction>
                    <CreateTaskDialog columnId={id}>
                        <Plus />
                    </CreateTaskDialog>
                </CardAction>
            </CardHeader>
            <CardContent ref={ref} className={contentClassName}>
                <Tasks columnId={id} />
            </CardContent>
        </Card>
    );
}

function CreateColumn({}: { columnId: ColumnID | undefined }) {
    return (
        <Button
            variant="ghost"
            className="size-7 h-full flex flex-col items-center justify-center space-y-2 group rounded-xl"
        >
            <Plus className="text-transparent group-hover:text-current transition-colors" />
        </Button>
    );
}

function Columns() {
    const { projectId } = Route.useParams();

    const { status, error, data } = useGetAllColumns(projectId);

    const mutation = useMoveTask();

    if (status === "pending") {
        return <Spinner />;
    }

    if (status === "error") {
        return <span>Error: {error.message}</span>;
    }

    const handleDragEnd: DragEndEvent = async ({ operation, canceled }) => {
        if (canceled) return;

        const { target, source } = operation;

        if (!target || !source) return;

        console.log(`Dropped ${source.id} onto ${target.id}`);

        await mutation.mutateAsync({
            task: source.data.task,
            to: target.id.toString(),
        });
    };

    return (
        <div className="size-full overflow-x-auto flex-nowrap">
            <DragDropProvider<DraggableType> onDragEnd={handleDragEnd}>
                <div className="h-full flex space-x-2 px-4 w-fit">
                    {data.map((col, idx) => (
                        <>
                            <CreateColumn key={idx} columnId={col.id} />
                            <Column {...col} key={col.id} />
                        </>
                    ))}
                </div>
            </DragDropProvider>
        </div>
    );
}

function CurrentProject() {
    const { projectId } = Route.useParams();
    const { status, error } = useCurrentProject(projectId);

    if (status === "pending") {
        return <Spinner />;
    }

    if (status === "error") {
        return <span>Error: {error.message}</span>;
    }

    return (
        <div className="size-full py-2">
            <Columns />
        </div>
    );
}

function RouteComponent() {
    return <CurrentProject />;
}

function NotFoundComponent() {
    return (
        <Empty className="h-full">
            <EmptyHeader>
                <EmptyTitle>Project does not exist</EmptyTitle>
                <EmptyDescription>
                    Please select a project in the sidebar or create a new one
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
