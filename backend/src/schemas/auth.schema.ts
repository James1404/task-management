import Type, { Static } from "typebox";

export const AccessTokenSchema = Type.Object({
    access: Type.String(),
});
export type AccessTokenSchemaType = Static<typeof AccessTokenSchema>;

export const RegisterSchema = Type.Object({
    email: Type.String({ format: "email", maxLength: 255 }),
    password: Type.String({ minLength: 8, maxLength: 64 }),
    username: Type.String({ minLength: 8, maxLength: 30 }),
});
export type RegisterSchemaType = Static<typeof RegisterSchema>;

export const LoginSchema = Type.Object({
    email: Type.String({ format: "email", maxLength: 255 }),
    password: Type.String({ minLength: 8, maxLength: 64 }),
});
export type LoginSchemaType = Static<typeof LoginSchema>;
