import { Column, PrismaClient } from "../../generated/prisma/client.ts";
import { User } from "@/plugins/auth.plugin.ts";
import {
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "@/utils/error.ts";
import { ColumnID } from "../schemas/column.schema.ts";
import { clamp } from "../utils/math.ts";
import { ProjectID } from "../schemas/projects.schema.ts";
import projectsServices from "./projects.services.ts";

const startIndex = 0;

async function getColumn(user: User, columnId: ColumnID, prisma: PrismaClient) {
    const column = await prisma.column.findUnique({
        where: { id: columnId },
    });

    if (column == null) {
        throw new UnauthorizedError("Project does not exist with ID");
    }

    const project = await projectsServices.checkPermission(
        user,
        column,
        prisma,
    );

    return { column, project };
}

async function getColumnTasks(
    user: User,
    columnId: ColumnID,
    prisma: PrismaClient,
) {
    const column = await prisma.column.findUnique({ where: { id: columnId } });

    if (column === null) {
        throw new NotFoundError("Column not found");
    }

    await projectsServices.checkPermission(
        user,
        { projectId: column.projectId },
        prisma,
    );

    return await prisma.task.findMany({
        where: { columnId },
        orderBy: { order: "asc" },
    });
}

type Create = Omit<Column, "id" | "projectId" | "order" | "userId">;
async function createColumn(
    user: User,
    projectId: ProjectID,
    details: Create,
    prisma: PrismaClient,
) {
    await projectsServices.checkPermission(user, { projectId }, prisma);

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
    columnId: ColumnID,
    details: Update,
    prisma: PrismaClient,
) {
    const column = await prisma.column.findUnique({ where: { id: columnId } });

    if (column === null) {
        throw new NotFoundError("Column not found");
    }

    await projectsServices.checkPermission(user, column, prisma);

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
    columnId: ColumnID,
    prisma: PrismaClient,
) {
    const column = await prisma.column.findUnique({ where: { id: columnId } });

    if (column === null) {
        throw new NotFoundError("Column not found");
    }

    await projectsServices.checkPermission(user, column, prisma);

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

    if (column === null) {
        throw new NotFoundError("Column not found");
    }

    await projectsServices.checkPermission(user, column, prisma);

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
    getColumnTasks,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumn,
};
