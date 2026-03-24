import z from "zod";

const EmailSchema = z.email();
const PasswordSchema = z.string().min(8);
const NicknameSchema = z.string().min(8);

export const LoginSchema = z.object({
    email: EmailSchema,
    password: PasswordSchema,
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
    .object({
        email: EmailSchema,
        nickname: NicknameSchema,
        password: PasswordSchema,
        confirm_password: PasswordSchema,
    })
    .refine(data => data.password === data.confirm_password, {
        error: "Passwords don't match",
        path: ["confirm_password"],
    });
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
