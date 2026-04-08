import { PrismaClient, Task } from "../../generated/prisma/client.ts";
import { User } from "../plugins/auth.plugin.ts";
import columnServices from "@/services/columns.services.ts";
import { ForbiddenError, NotFoundError } from "../utils/error.ts";
import { ColumnID } from "../schemas/column.schema.ts";
import { TaskID } from "../schemas/tasks.schema.ts";
import { clamp } from "../utils/math.ts";

async function getTask(id: TaskID, user: User, prisma: PrismaClient) {
    // TODO: Check user permissions

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
    // TODO: Check user permissions

    await columnServices.getColumn(user, columnId, prisma);

    const lastTask = await prisma.task.findFirst({
        where: { columnId },
        orderBy: { order: "desc" },
    });

    console.log(lastTask);

    const order = lastTask ? lastTask.order + 1 : 1;

    return await prisma.task.create({
        data: {
            title: details.title,
            description: details.description,
            column: { connect: { id: columnId } },
            order,
        },
    });
}

type Update = Partial<
    Omit<
        Task,
        "id" | "projectId" | "order" | "createdAt" | "updatedAt" | "columnId"
    >
>;

async function updateTask(
    user: User,
    taskId: TaskID,
    details: Update,
    prisma: PrismaClient,
) {
    // TODO: Check user permissions

    // KNOWLEDGE: Updating fields to "undefined" doesnt change them.
    return await prisma.task.update({
        where: { id: taskId, column: { project: { ownerId: user.sub } } },
        data: { ...details },
    });
}

async function deleteTask(user: User, taskId: TaskID, prisma: PrismaClient) {
    // TODO: Check user permissions

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

    await prisma.$transaction([
        prisma.task.delete({ where: { id: taskId } }),
        prisma.task.updateMany({
            where: {
                order: {
                    gt: task.order,
                },
            },
            data: {
                order: { decrement: 1 },
            },
        }),
    ]);
}

async function reorderTask(
    user: User,
    taskId: TaskID,
    to: number,
    prisma: PrismaClient,
) {
    // TODO: Check user permissions

    const task = await prisma.task.findFirst({
        where: { id: taskId },
    });

    if (!task) {
        throw new NotFoundError();
    }

    const from = task.order;

    const lastTask = await prisma.task.findFirst({
        where: { columnId: task.columnId },
        orderBy: { order: "desc" },
    });

    const lastTaskOrder = lastTask ? lastTask.order : 1;

    to = clamp(to, 1, lastTaskOrder);

    if (from === to) return;

    const tempOrder = -1; // must be outside normal range

    await prisma.$transaction(async tx => {
        await tx.task.update({
            where: { id: taskId },
            data: { order: tempOrder },
        });

        if (from > to) {
            await tx.task.updateMany({
                where: {
                    columnId: task.columnId,
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
            await tx.task.updateMany({
                where: {
                    columnId: task.columnId,
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

        await tx.task.update({
            where: { id: taskId },
            data: { order: to },
        });
    });
}

async function moveTaskToColumn(
    user: User,
    taskId: TaskID,
    columnId: ColumnID,
    prisma: PrismaClient,
) {
    // TODO: Check user permissions
    const task = await prisma.task.findFirst({
        where: { id: taskId },
    });

    if (!task) {
        throw new NotFoundError();
    }

    const lastTask = await prisma.task.findFirst({
        where: { columnId },
        orderBy: { order: "desc" },
    });

    console.log(lastTask);

    const order = lastTask ? lastTask.order + 1 : 1;

    return await prisma.$transaction(async tx => {
        const result = await tx.task.update({
            where: {
                id: taskId,
            },
            data: {
                columnId,
                order,
            },
        });

        await tx.task.updateMany({
            where: {
                columnId: task.columnId,
                order: {
                    gt: task.order,
                },
            },
            data: {
                order: { decrement: 1 },
            },
        });

        return result;
    });
}

export default {
    getTask,
    createTask,
    updateTask,
    deleteTask,
    reorderTask,
    moveTaskToColumn,
};
