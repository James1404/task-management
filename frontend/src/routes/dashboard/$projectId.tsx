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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
    getColumnsOptions,
    getColumnTasksOptions,
} from "@/queries/columns.query";
import { currentProjectOptions } from "@/queries/projects.query";
import { createTaskOptions, deleteTaskOptions } from "@/queries/tasks.query";
import type { ColumnID, ColumnSchemaType } from "@/schemas/columns.schema";
import {
    TaskDataSchema,
    type TaskDataSchemaType,
    type TaskSchemaType,
} from "@/schemas/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

export const Route = createFileRoute("/dashboard/$projectId")({
    component: RouteComponent,
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

    const mutation = useMutation(createTaskOptions(columnId));

    const [dialogOpen, setDialogOpen] = useState(false);
    const onSubmit: SubmitHandler<TaskDataSchemaType> = async formData => {
        const task = await mutation.mutateAsync(formData);
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

function Task({ description, title, id, columnId }: TaskSchemaType) {
    const mutation = useMutation(deleteTaskOptions(columnId, id));

    const onClick = async () => {
        await mutation.mutateAsync();
    };

    return (
        <div className="flex flex-row w-full justify-between">
            <h3>{title}</h3>
            <p>{description}</p>

            <Button variant="ghost" onClick={onClick}>
                <Trash />
            </Button>
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
        <div className="flex flex-col gap-2">
            {data.map(task => (
                <Task {...task} key={task.id} />
            ))}
        </div>
    );
}

function Column({ name, id }: ColumnSchemaType) {
    return (
        <Card className="h-full w-150">
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardAction>
                    <CreateTaskDialog columnId={id}>
                        <Plus />
                    </CreateTaskDialog>
                </CardAction>
            </CardHeader>
            <CardContent>
                <Tasks columnId={id} />
            </CardContent>
        </Card>
    );
}

function CreateColumn({ columnId }: { columnId: ColumnID | undefined }) {
    return (
        <Button variant="ghost">
            <Plus />
        </Button>
    );
}

function Columns() {
    const { projectId } = Route.useParams();

    const { status, error, data } = useQuery(getColumnsOptions(projectId));

    if (status === "pending") {
        return <Spinner />;
    }

    if (status === "error") {
        return <span>Error: {error.message}</span>;
    }

    return (
        <ScrollArea className="h-full">
            <div className="h-full w-full overflow-auto flex flex-row gap-2 px-5">
                {data.map(col => (
                    <>
                        <CreateColumn />
                        <Column {...col} key={col.id} />
                    </>
                ))}
            </div>

            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

function CurrentProject() {
    const { projectId } = Route.useParams();
    const { status, error, data } = useQuery(currentProjectOptions(projectId));

    if (status === "pending") {
        return <Spinner />;
    }

    if (status === "error") {
        return <span>Error: {error.message}</span>;
    }

    return (
        <div className="h-full w-full py-2">
            <Columns />
        </div>
    );
}

function RouteComponent() {
    return <CurrentProject />;
}
