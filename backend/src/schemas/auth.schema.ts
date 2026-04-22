import Type, { Static } from "typebox";
import {
    EmailSchema,
    PasswordSchema,
    UserDataSchema,
} from "./account.schema.ts";

export const UserIdSchema = Type.Number();
export type UserId = Static<typeof UserIdSchema>;

export const AccessTokenSchema = Type.Object({
    access: Type.String(),
});
export type AccessTokenSchemaType = Static<typeof AccessTokenSchema>;

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
