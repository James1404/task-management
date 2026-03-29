import { PrismaClient, Task } from "../../generated/prisma/client.ts";
import { User } from "../plugins/auth.plugin.ts";
import columnServices from "@/services/columns.services.ts";
import { ForbiddenError, NotFoundError } from "../utils/error.ts";
import { ColumnID } from "../schemas/column.schema.ts";
import { TaskID, TaskOrderType } from "../schemas/tasks.schema.ts";
import prismaConfig from "../../prisma.config.ts";

async function getTask(id: TaskID, user: User, prisma: PrismaClient) {
    const task = await prisma.task.findUnique({
        where: { id },
        include: { column: true },
    });

    if (task == null) {
        throw new NotFoundError("Task not found");
    }

    await columnServices.getColumn(user, task.columnId, prisma);

    return task;
}

interface Create {
    title: string;
    description?: string;
}

async function createTask(
    user: User,
    columnId: ColumnID,
    details: Create,
    prisma: PrismaClient,
) {
    await columnServices.getColumn(user, columnId, prisma);

    return await prisma.task.create({
        data: {
            title: details.title,
            description: details.description,
            column: { connect: { id: columnId } },
        },
    });
}

type Update = Partial<Omit<Task, "id" | "projectId">>;

async function updateTask(
    user: User,
    taskId: TaskID,
    details: Update,
    prisma: PrismaClient,
) {
    // KNOWLEDGE: Updating fields to "undefined" doesnt change them.
    return await prisma.task.update({
        where: { id: taskId, column: { project: { ownerId: user.sub } } },
        data: { ...details },
    });
}

async function deleteTask(user: User, taskId: TaskID, prisma: PrismaClient) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            column: {
                include: { project: true },
            },
        },
    });

    if (task == null) {
        throw new NotFoundError("Task not found");
    }

    if (task.column.project.ownerId != user.sub) {
        throw new ForbiddenError();
    }

    await prisma.task.delete({ where: { id: taskId } });
}

async function reorderColumn(
    columnId: ColumnID,
    start: number,
    end: number,
    prisma: PrismaClient,
) {
    await prisma.$transaction([
        prisma.task.updateMany({
            where: {
                columnId,
                order: {
                    gte: start,
                    lt: end,
                },
            },
            data: {
                order: { increment: 1 },
            },
        }),
    ]);
}

async function moveTaskToColumn(
    user: User,
    taskId: TaskID,
    columnId: ColumnID,
    order: TaskOrderType,
    prisma: PrismaClient,
) {
    const task = await prisma.task.update({
        where: {
            id: taskId,
        },
        data: {
            columnId,
            order,
        },
    });

    return task;
}

export default {
    getTask,
    createTask,
    updateTask,
    deleteTask,
    moveTaskToColumn,
};
