import Type, { Static } from "typebox";

export const AccessTokenSchema = Type.Object({
    access: Type.String(),
});
export type AccessTokenSchemaType = Static<typeof AccessTokenSchema>;

export const NicknameSchema = Type.String({ minLength: 8, maxLength: 30 });
export const EmailSchema = Type.String({ format: "email", maxLength: 255 });
export const PasswordSchema = Type.String({ minLength: 8, maxLength: 64 });

export const UserDataSchema = Type.Object({
    nickname: NicknameSchema,
});
export type UserDataSchemaType = Static<typeof UserDataSchema>;

export const RegisterSchema = Type.Intersect([
    Type.Object({
        email: EmailSchema,
        password: PasswordSchema,
        confirm_password: PasswordSchema,
    }),
    UserDataSchema,
]);
export type RegisterSchemaType = Static<typeof RegisterSchema>;

export const LoginSchema = Type.Object({
    email: EmailSchema,
    password: PasswordSchema,
});
export type LoginSchemaType = Static<typeof LoginSchema>;
