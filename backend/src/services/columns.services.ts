import { Column, PrismaClient } from "../../generated/prisma/client.ts";
import { User } from "@/plugins/auth.plugin.ts";
import { UnauthorizedError } from "@/utils/error.ts";

async function getColumn(user: User, columnId: string, prisma: PrismaClient) {
    const column = await prisma.column.findUnique({
        where: { id: columnId, project: { ownerId: user.sub } },
    });

    if (column == null) {
        throw new UnauthorizedError("Project does not exist with ID");
    }

    return column;
}

async function getAllColumns(user: User, prisma: PrismaClient) {
    return await prisma.column.findMany({
        where: { project: { ownerId: user.sub } },
    });
}

async function getColumnTasks(
    user: User,
    columnId: string,
    prisma: PrismaClient,
) {
    return await prisma.task.findMany({ where: { columnId } });
}

type Create = Omit<Column, "id" | "projectId">;
async function createColumn(
    user: User,
    projectId: string,
    details: Create,
    prisma: PrismaClient,
) {
    return await prisma.column.create({
        data: {
            project: {
                connect: {
                    id: projectId,
                },
            },
            ...details,
        },
    });
}

type Update = Partial<Omit<Column, "id" | "projectId">>;
async function updateColumn(
    user: User,
    columnId: string,
    details: Update,
    prisma: PrismaClient,
) {
    return await prisma.column.update({
        where: {
            id: columnId,
        },
        data: {
            ...details,
        },
    });
}

async function deleteColumn(
    user: User,
    columnId: string,
    prisma: PrismaClient,
) {
    return await prisma.column.delete({
        where: { id: columnId },
    });
}

export default {
    getColumn,
    getAllColumns,
    getColumnTasks,
    createColumn,
    updateColumn,
    deleteColumn,
};
