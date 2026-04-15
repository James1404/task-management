import { Column, PrismaClient } from "../../generated/prisma/client.ts";
import { User } from "@/plugins/auth.plugin.ts";
import { NotFoundError, UnauthorizedError } from "@/utils/error.ts";
import { ColumnID } from "../schemas/column.schema.ts";
import { clamp } from "../utils/math.ts";

const startIndex = 0;

async function checkUserPermission(
    user: User,
    columnId: ColumnID,
    prisma: PrismaClient,
) {
    const column = await prisma.column.findFirst({
        where: { project: { ownerId: user.sub } },
    });

    if (column === null) {
        throw new UnauthorizedError();
    }
}

async function getColumn(user: User, columnId: string, prisma: PrismaClient) {
    await checkUserPermission(user, columnId, prisma);

    const column = await prisma.column.findUnique({
        where: { id: columnId },
    });

    if (column == null) {
        throw new UnauthorizedError("Project does not exist with ID");
    }

    return column;
}

async function getAllColumns(user: User, prisma: PrismaClient) {
    return await prisma.column.findMany({
        where: { project: { ownerId: user.sub } },
        orderBy: { order: "asc" },
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

type Create = Omit<Column, "id" | "projectId" | "order">;
async function createColumn(
    user: User,
    projectId: string,
    details: Create,
    prisma: PrismaClient,
) {
    const lastColumn = await prisma.column.findFirst({
        where: { projectId },
        orderBy: { order: "desc" },
    });

    const order = lastColumn ? lastColumn.order + 1 : startIndex;

    return await prisma.column.create({
        data: {
            project: {
                connect: {
                    id: projectId,
                },
            },
            order,
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

    const lastColumn = await prisma.column.findFirst({
        where: { projectId: column.projectId },
        orderBy: { order: "desc" },
    });

    const lastColumnOrder = lastColumn ? lastColumn.order : startIndex;

    to = clamp(to, startIndex, lastColumnOrder);

    if (from === to) return;

    const tempOrder = -1; // must be outside normal range

    await prisma.$transaction(async tx => {
        await tx.column.update({
            where: { id: columnId },
            data: { order: tempOrder },
        });

        if (from > to) {
            await tx.column.updateMany({
                where: {
                    projectId: column.projectId,
                    order: {
                        gte: to,
                        lt: from,
                    },
                },
                data: {
                    order: { increment: 1 },
                },
            });
        } else {
            await tx.column.updateMany({
                where: {
                    projectId: column.projectId,
                    order: {
                        gt: from,
                        lte: to,
                    },
                },
                data: {
                    order: { decrement: 1 },
                },
            });
        }

        await tx.column.update({
            where: { id: columnId },
            data: { order: to },
        });
    });
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
