import Type, { Static } from "typebox";
import { PasswordSchema, UserDataSchema } from "./auth.schema.ts";

export const DeleteUserSchema = Type.Object({
    password: PasswordSchema,
});
export type DeleteUserSchemaType = Static<typeof DeleteUserSchema>;

export const UserUpdateSchema = Type.Partial(UserDataSchema);
export type UserUpdateSchemaType = Static<typeof UserUpdateSchema>;
