import { loginToUser } from "@/api/user.api";
import { FormRootMessage } from "@/components/form-root-message";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoginSchema, type LoginSchemaType } from "@/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

export const Route = createFileRoute("/login")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate({});

    const { handleSubmit, control, setError } = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit: SubmitHandler<LoginSchemaType> = async formData => {
        try {
            await loginToUser(formData);
            navigate({ to: "/dashboard" });
        } catch (err) {
            setError("root", {
                type: "custom",
                message: (err as Error).message,
            });
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form
                className="max-w-full w-125 flex flex-col items-start gap-2"
                onSubmit={handleSubmit(onSubmit)}
            >
                <FieldGroup>
                    <FieldSet>
                        <FieldLegend>Login to your account</FieldLegend>
                        <FieldDescription>
                            Enter your email below to login to your account
                        </FieldDescription>
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Your email..."
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="password"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Password
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            aria-invalid={fieldState.invalid}
                                            type="password"
                                            placeholder="Your password..."
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <FormRootMessage<LoginSchemaType>
                                control={control}
                            />
                            <Button type="submit">Login</Button>
                        </FieldGroup>
                    </FieldSet>
                </FieldGroup>
            </form>
        </div>
    );
}
