import { Column, PrismaClient } from "../../generated/prisma/client.ts";
import { User } from "@/plugins/auth.plugin.ts";
import { NotFoundError, UnauthorizedError } from "@/utils/error.ts";
import { ColumnID } from "../schemas/column.schema.ts";

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
    return await prisma.task.findMany({
        where: { columnId },
        orderBy: { order: "asc" },
    });
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

async function reorderColumn(
    user: User,
    columnId: ColumnID,
    to: number,
    prisma: PrismaClient,
) {
    // TODO: Check user permissions

    const column = await prisma.column.findFirst({
        where: { id: columnId },
    });

    if (!column) {
        throw new NotFoundError();
    }

    const from = column.order;

    if (from === to) return;

    const operations = [];

    if (from > to) {
        operations.push(
            prisma.column.updateMany({
                where: {
                    id: columnId,
                    order: {
                        gte: to,
                        lt: from,
                    },
                },
                data: {
                    order: { increment: 1 },
                },
            }),
        );
    } else {
        operations.push(
            prisma.column.updateMany({
                where: {
                    id: columnId,
                    order: {
                        gt: from,
                        lte: to,
                    },
                },
                data: {
                    order: { decrement: 1 },
                },
            }),
        );
    }

    operations.push(
        prisma.column.update({
            where: { id: columnId },
            data: { order: to },
        }),
    );

    await prisma.$transaction(operations);
}

export default {
    getColumn,
    getAllColumns,
    getColumnTasks,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumn,
};
