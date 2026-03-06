import { createFileRoute, redirect } from "@tanstack/react-router";
import { loggedIn } from "../stores/credentials";
import client from "../libs/fetch";
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

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard")({
    component: RouteComponent,
    async beforeLoad({ location }) {
        if (!loggedIn()) {
            throw redirect({
                to: "/",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
    async loader(_ctx) {
        const { data: projects } = await client.GET("/projects/", {
            credentials: "same-origin",
        });

        if (!projects) {
            throw new Error("Faield to load projecfts");
        }

        return projects;
    },
    onError({ error }) {
        alert(error);
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
    return (
        <div className=" border-2 w-fit px-5 py-3 rounded-xl">
            <div>{id}</div>
            <div>{name}</div>
            <div>{description}</div>
        </div>
    );
}

const createProjectSchema = z.object({
    name: z.string().min(3),
    description: z.string(),
});
type CreateProjectType = z.infer<typeof createProjectSchema>;

function RouteComponent() {
    const data = Route.useLoaderData();

    const { handleSubmit, control } = useForm<CreateProjectType>({
        resolver: zodResolver(createProjectSchema),
    });

    const onSubmit: SubmitHandler<CreateProjectType> = async formData => {
        // const { data, error } = await client.POST("/projects/", {
        //     body: {
        //         ...formData,
        //     },
        //     credentials: "include",
        // });

        // if (error) {
        //     return;
        // }

        // if (!data) {
        //     return;
        // }

        console.log(formData);
    };

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Create Project</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New project</DialogTitle>
                        <DialogDescription>
                            Create a new project
                        </DialogDescription>
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
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
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
                                        Tell us more about yourself. This will
                                        be used to help us personalize your
                                        experience.
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </form>
                    <DialogFooter>
                        <Field orientation="horizontal">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Create</Button>
                        </Field>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div>{data.map(Project)}</div>
        </>
    );
}
