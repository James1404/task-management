import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import z from "zod";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import client from "@/libs/fetch";
import { setAccess } from "@/stores/credentials";
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

const loginSchema = z.object({
    email: z.email(),
    password: z.string(),
});
type LoginSchemaType = z.infer<typeof loginSchema>;

function LoginForm() {
    const navigate = useNavigate({});

    const { handleSubmit, control } = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit: SubmitHandler<LoginSchemaType> = async formData => {
        const { data } = await client.POST("/auth/login", {
            body: {
                email: formData.email,
                password: formData.password,
            },
            credentials: "include",
        });

        if (data) {
            setAccess(data.access);
            navigate({ to: "/dashboard" });
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

                        <Button type="submit">Login</Button>
                    </FieldGroup>
                </FieldSet>
            </FieldGroup>
        </form>
    );
}

const registerSchema = z
    .object({
        email: z.email(),
        username: z.string(),
        password: z.string(),
        confirm_password: z.string(),
    })
    .refine(data => data.password === data.confirm_password, {
        error: "Passwords don't match",
        path: ["confirm_password"],
    });
type RegisterSchemaType = z.infer<typeof registerSchema>;

function RegisterForm() {
    const navigate = useNavigate({});

    const { handleSubmit, control } = useForm<RegisterSchemaType>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit: SubmitHandler<RegisterSchemaType> = async formData => {
        // navigate({ to: "/dashboard" });
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
                            name="username"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Username
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Your username..."
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
