import {
    Controller,
    useForm,
    useFormState,
    type Control,
    type FieldValues,
    type SubmitHandler,
} from "react-hook-form";
import { Card, CardContent } from "./ui/card";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
    LoginSchema,
    RegisterSchema,
    type LoginSchemaType,
    type RegisterSchemaType,
} from "@/schemas/user.schema";
import { loginToUser, registerAccount } from "@/api/user.api";
import React from "react";
import { cn } from "@/lib/utils";

function FormRootMessage<T extends FieldValues>({
    className,
    control,
    ...props
}: React.ComponentProps<"p"> & { control: Control<T> }) {
    const { errors } = useFormState({ control });
    const rootError = errors.root;
    if (!rootError) {
        return null;
    }

    return (
        <p
            data-slot="form-message"
            className={cn("text-destructive text-sm", className)}
            {...props}
        >
            {rootError.message}
        </p>
    );
}

function LoginForm() {
    const navigate = useNavigate({});

    const {
        handleSubmit,
        control,
        setError,
        formState: { errors },
    } = useForm<LoginSchemaType>({
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
        <form
            className="flex flex-col items-start gap-2"
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

                        <FormRootMessage<LoginSchemaType> control={control} />

                        <Button type="submit">Login</Button>
                    </FieldGroup>
                </FieldSet>
            </FieldGroup>
        </form>
    );
}

function RegisterForm() {
    const navigate = useNavigate({});

    const {
        handleSubmit,
        control,
        formState: { errors },
        setError,
    } = useForm<RegisterSchemaType>({
        resolver: zodResolver(RegisterSchema),
    });

    const onSubmit: SubmitHandler<RegisterSchemaType> = async formData => {
        try {
            await registerAccount(formData);
            navigate({ to: "/dashboard" });
        } catch (err) {
            setError("root", {
                type: "custom",
                message: (err as Error).message,
            });
        }
    };

    return (
        <form
            className="flex flex-col items-start gap-2"
            onSubmit={handleSubmit(onSubmit)}
        >
            <FieldGroup>
                <FieldSet>
                    <FieldLegend>Register an account</FieldLegend>
                    <FieldDescription>
                        Register a new account with the provided credentials
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
                            name="nickname"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Nickname
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Your nickname..."
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
                        <Controller
                            name="confirm_password"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Confirm Password
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        aria-invalid={fieldState.invalid}
                                        type="password"
                                        placeholder="Confirm your password..."
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <FormRootMessage<RegisterSchemaType>
                            control={control}
                        />

                        <Button type="submit">Register</Button>
                    </FieldGroup>
                </FieldSet>
            </FieldGroup>
        </form>
    );
}

export default function LoginField() {
    return (
        <Card>
            <CardContent>
                <Tabs defaultValue="login" className="w-100">
                    <TabsList>
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <LoginForm />
                    </TabsContent>
                    <TabsContent value="register">
                        <RegisterForm />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
