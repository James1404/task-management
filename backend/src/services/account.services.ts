import { PrismaClient, Role } from "../../generated/prisma/client.ts";
import { User } from "../plugins/auth.plugin.ts";
import { User as PrismaUser } from "../../generated/prisma/client.ts";

import { hashPassword } from "../utils/auth.utils.ts";
import { InvalidCredentialsError } from "../utils/error.ts";

async function deleteAccount(
    user: User,
    password: string,
    prisma: PrismaClient,
) {
    const userRow = await prisma.user.findUnique({
        where: { id: user.sub },
    });

    if (userRow == null) {
        throw new InvalidCredentialsError();
    }

    const hash = hashPassword(password, userRow.salt);

    if (hash != userRow.password) {
        throw new InvalidCredentialsError();
    }

    await prisma.user.deleteMany({
        where: {
            id: user.sub,
        },
    });
}

async function getAccount(user: User, prisma: PrismaClient) {
    const userRow = await prisma.user.findUnique({
        where: { id: user.sub },
    });

    if (userRow === null) {
        throw new InvalidCredentialsError();
    }

    return userRow;
}

type RemoveFromUser = {
    id: string;
    email: string;
    role: Role;
    password: string;
    salt: string;
    createdAt: Date;
    updatedAt: Date;
};

type Update = Partial<Omit<PrismaUser, keyof RemoveFromUser>>;

async function updateAccount(
    user: User,
    details: Update,
    prisma: PrismaClient,
) {
    const userRow = await prisma.user.findUnique({
        where: { id: user.sub },
    });

    if (userRow == null) {
        throw new InvalidCredentialsError();
    }

    return await prisma.user.update({
        where: {
            id: user.sub,
        },
        data: {
            ...details,
        },
    });
}

export default { deleteAccount, updateAccount, getAccount };
