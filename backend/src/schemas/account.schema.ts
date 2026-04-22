import Type, { Static } from "typebox";
import { Role } from "../../generated/prisma/enums.ts";
import { User as PrismaUser } from "../../generated/prisma/client.ts";

export const UserIdSchema = Type.String();
export type UserId = Static<typeof UserIdSchema>;

export const NicknameSchema = Type.String({ minLength: 8, maxLength: 30 });
export const EmailSchema = Type.String({ format: "email", maxLength: 255 });
export const PasswordSchema = Type.String({ minLength: 8, maxLength: 64 });
export const RoleSchema = Type.Enum(Role);

export const UserDataSchema = Type.Object({
    email: EmailSchema,
    nickname: NicknameSchema,
});
export type UserDataSchemaType = Static<typeof UserDataSchema>;

export const UserFullSchema = Type.Intersect([
    UserDataSchema,
    Type.Object({
        id: UserIdSchema,
        role: RoleSchema,
    }),
]);
export type UserFullSchemaType = Static<typeof UserFullSchema>;

export function UserPrismaMap(from: PrismaUser): UserFullSchemaType {
    return {
        nickname: from.nickname,
        email: from.email,
        id: from.id,
        role: from.role,
    };
}

export const DeleteUserSchema = Type.Object({
    password: PasswordSchema,
});
export type DeleteUserSchemaType = Static<typeof DeleteUserSchema>;

export const UserUpdateSchema = Type.Partial(
    Type.Omit(UserDataSchema, ["email"]),
);
export type UserUpdateSchemaType = Static<typeof UserUpdateSchema>;
