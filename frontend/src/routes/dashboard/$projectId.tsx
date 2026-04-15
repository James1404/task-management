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
    getAllColumnsOptions,
    getColumnOptions,
    getColumnTasksOptions,
    reorderColumnsOptions,
} from "@/queries/columns.query";
import {
    createTaskOptions,
    deleteTaskOptions,
    moveTaskOptions,
    reorderTaskOptions,
} from "@/queries/tasks.query";
import type { ColumnID, ColumnSchemaType } from "@/schemas/columns.schema";
import {
    TaskCreateSchema,
    type TaskCreateSchemaType,
    type TaskSchemaType,
} from "@/schemas/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, notFound } from "@tanstack/react-router";
import {
    EllipsisVertical,
    GripVertical,
    MoveDown,
    MoveLeft,
    MoveRight,
    MoveUp,
    Plus,
    Trash,
} from "lucide-react";
import { Fragment, useRef, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
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
import { currentProjectOptions } from "@/queries/projects.query";
import { CollisionPriority } from "@dnd-kit/abstract";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/$projectId")({
    async loader({ params: { projectId } }) {
        try {
            await queryClient.fetchQuery(currentProjectOptions(projectId));
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
    const { handleSubmit, control } = useForm<TaskCreateSchemaType>({
        resolver: zodResolver(TaskCreateSchema),
        defaultValues: {
            title: "",
            description: undefined,
        },
    });

    const mutation = useMutation(createTaskOptions(columnId));

    const [dialogOpen, setDialogOpen] = useState(false);
    const onSubmit: SubmitHandler<TaskCreateSchemaType> = async formData => {
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

function DropdownMenuColumns(task: TaskSchemaType) {
    const { projectId } = Route.useParams();

    const { status, data } = useQuery(getAllColumnsOptions(projectId));
    const moveMutation = useMutation(moveTaskOptions());

    const moveTo = async (columnId: ColumnID) => {
        console.log("hello world, move to whater");

        await moveMutation.mutate({ task, columnId });
    };

    if (status === "pending") {
        return <Spinner />;
    }

    if (status === "error") {
        return <></>;
    }

    return (
        <>
            {data.map(col => (
                <DropdownMenuItem key={col.id} onClick={() => moveTo(col.id)}>
                    {col.name}
                </DropdownMenuItem>
            ))}
        </>
    );
}

function Task(task: TaskSchemaType) {
    const { description, title, id, columnId, order } = task;

    const mutation = useMutation(deleteTaskOptions(columnId, id));

    const onClick = async () => {
        await mutation.mutateAsync();
    };

    const reorderMutation = useMutation(reorderTaskOptions());

    const moveUp = async () => {
        await reorderMutation.mutate({ task, order: order - 1 });
    };

    const moveDown = async () => {
        await reorderMutation.mutate({ task, order: order + 1 });
    };

    const { ref, handleRef, isDragging, isDropTarget, isDragSource } =
        useSortable<DraggableType>({
            id,
            index: order,
            group: columnId,
            type: "task",
            accept: "task",
            data: { task },
        });

    const className = cn(
        `flex flex-row items-center gap-2
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
        <div className={className} ref={ref as any}>
            <div className="grow">
                <h3>{title}</h3>
            </div>
            <p>{description}</p>

            <Button variant="ghost" onClick={onClick}>
                <Trash />
            </Button>

            <Button variant="ghost" ref={handleRef}>
                <GripVertical />
            </Button>

            <div className="flex flex-col gap-1">
                <Button variant="ghost" onClick={moveUp}>
                    <MoveUp />
                </Button>
                <Button variant="ghost" onClick={moveDown}>
                    <MoveDown />
                </Button>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                        <EllipsisVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Move to column</DropdownMenuLabel>
                        <DropdownMenuColumns {...task} />
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function Tasks({ columnId }: { columnId: string }) {
    const { status, error, data } = useQuery(getColumnTasksOptions(columnId));

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

function Column({ id, order }: ColumnSchemaType) {
    const { status, error, data } = useQuery(getColumnOptions(id));

    const { ref, handleRef } = useSortable({
        id,
        index: order,
        type: "column",
        accept: ["task", "column"],
        collisionPriority: CollisionPriority.Low,
        modifiers: [RestrictToHorizontalAxis],
    });

    const reorderMutation = useMutation(reorderColumnsOptions());

    const moveLeft = async () => {
        await reorderMutation.mutate({ columnId: id, order: order - 1 });
    };

    const moveRight = async () => {
        await reorderMutation.mutate({ columnId: id, order: order + 1 });
    };

    if (status === "pending") {
        return <Spinner />;
    }

    if (status === "error") {
        return <span>Error: {error.message}</span>;
    }

    const contentClassName = cn(
        "h-full box-border border-2 border-dashed border-transparent transition-colors",
    );

    return (
        <Card className="h-full w-125" ref={ref}>
            <CardHeader>
                <CardTitle>
                    <Input
                        className="border-0 bg-transparent!"
                        value={data.name}
                        readOnly
                    />
                </CardTitle>
                <CardAction className="flex flex-row">
                    <span className="px-4 py-2">{order}</span>

                    <CreateTaskDialog columnId={id}>
                        <Plus />
                    </CreateTaskDialog>

                    <div className="flex flex-row gap-1">
                        <Button variant="ghost" onClick={moveLeft}>
                            <MoveLeft />
                        </Button>
                        <Button variant="ghost" onClick={moveRight}>
                            <MoveRight />
                        </Button>
                    </div>

                    <Button variant="ghost" ref={handleRef}>
                        <GripVertical />
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent className={contentClassName}>
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

    const { status, error, data } = useQuery(getAllColumnsOptions(projectId));

    const columnReorderMutation = useMutation(reorderColumnsOptions());
    const taskReorderMutation = useMutation(reorderTaskOptions());
    const taskMoveMutation = useMutation(moveTaskOptions());

    const restrictToElement = useRef(null);

    if (status === "pending") {
        return <Spinner />;
    }

    if (status === "error") {
        return <span>Error: {error.message}</span>;
    }

    const handleDragEnd: DragEndEvent = async event => {
        if (event.canceled) return;

        const { source } = event.operation;

        if (!isSortable(source)) {
            return;
        }

        if (source.type === "task") {
            if (source.initialGroup === source.group) {
                if (source.initialIndex === source.index) return;

                await taskReorderMutation.mutateAsync({
                    task: source.data.task,
                    order: source.index,
                });

                // console.log(
                //     `Dropped ${source.initialGroup} onto ${source.group}, initalIndex ${source.initialIndex} and index ${source.index}`,
                // );
            } else {
                if (!source.initialGroup || !source.group) return;

                // console.log("cangr group to ");

                await taskMoveMutation.mutateAsync({
                    task: source.data.task,
                    columnId: source.group.toString(),
                });
            }
        } else {
            if (source.initialIndex !== source.index) {
                console.log(
                    `move column from ${source.initialIndex} to ${source.index}`,
                );

                await columnReorderMutation.mutateAsync({
                    columnId: source.id.toString(),
                    order: source.index,
                });
            }
        }
    };

    return (
        <div
            className="size-full overflow-x-auto flex-nowrap"
            ref={restrictToElement}
        >
            <DragDropProvider<DraggableType>
                onDragEnd={handleDragEnd}
                onDragOver={event => {
                    event.preventDefault();
                }}
                // modifiers={[
                //     RestrictToElement.configure({
                //         element: restrictToElement.current,
                //     }),
                // ]}
            >
                <div className="h-full flex space-x-2 px-4 w-fit">
                    {data.map(col => (
                        <Fragment key={col.id}>
                            <CreateColumn columnId={col.id} />
                            <Column {...col} />
                        </Fragment>
                    ))}
                </div>
            </DragDropProvider>
        </div>
    );
}

function CurrentProject() {
    const { projectId } = Route.useParams();
    const { status, error } = useQuery(currentProjectOptions(projectId));

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
