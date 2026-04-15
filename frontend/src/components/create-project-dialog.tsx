import {
    ProjectDataSchema,
    type ProjectDataSchemaType,
} from "@/schemas/project.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { createProjectOptions } from "@/queries/projects.query";
import { useMutation } from "@tanstack/react-query";

export function CreateProjectDialog({
    children,
}: {
    children: React.ReactNode;
}) {
    const navigate = useNavigate({ from: "/dashboard/" });
    const { handleSubmit, control } = useForm<ProjectDataSchemaType>({
        resolver: zodResolver(ProjectDataSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const mutation = useMutation(createProjectOptions());

    const [dialogOpen, setDialogOpen] = useState(false);
    const onSubmit: SubmitHandler<ProjectDataSchemaType> = async formData => {
        const project = await mutation.mutateAsync(formData);
        setDialogOpen(false);
        navigate({
            to: "/dashboard/$projectId",
            params: { projectId: project.id },
        });
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">{children}</Button>
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
