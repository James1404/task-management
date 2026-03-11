import z from "zod";

export const LoginSchema = z.object({
    email: z.email(),
    password: z.string(),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
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
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
