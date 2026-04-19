import { PrismaClient, Task } from "../../generated/prisma/client.ts";
import { User } from "../plugins/auth.plugin.ts";
import columnServices from "@/services/columns.services.ts";
import { ForbiddenError, NotFoundError } from "../utils/error.ts";
import { ColumnID } from "../schemas/column.schema.ts";
import { TaskID } from "../schemas/tasks.schema.ts";
import { clamp } from "../utils/math.ts";
import projectsServices from "./projects.services.ts";

const startIndex = 0;
const parkingIndex = -1;

async function getTask(id: TaskID, user: User, prisma: PrismaClient) {
    const task = await prisma.task.findUnique({
        where: { id, column: { project: { userId: user.sub } } },
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
    const { project } = await columnServices.getColumn(user, columnId, prisma);

    const lastTask = await prisma.task.findFirst({
        where: { columnId, column: { project: { userId: user.sub } } },
        orderBy: { order: "desc" },
    });

    const order = lastTask ? lastTask.order + 1 : startIndex;

    return await prisma.task.create({
        data: {
            title: details.title,
            description: details.description,
            column: { connect: { id: columnId } },
            project: {
                connect: {
                    id: project.id,
                },
            },
            order,
        },
    });
}

type Update = Partial<
    Omit<
        Task,
        | "id"
        | "projectId"
        | "order"
        | "createdAt"
        | "updatedAt"
        | "columnId"
        | "userId"
    >
>;

async function updateTask(
    user: User,
    taskId: TaskID,
    details: Update,
    prisma: PrismaClient,
) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (task === null) {
        throw new NotFoundError("Task not found");
    }

    await projectsServices.checkPermission(
        user,
        { projectId: task.projectId },
        prisma,
    );

    // KNOWLEDGE: Updating fields to "undefined" doesnt change them.
    return await prisma.task.update({
        where: { id: taskId },
        data: { ...details },
    });
}

async function deleteTask(user: User, taskId: TaskID, prisma: PrismaClient) {
    // TODO: Check user permissions

    const task = await prisma.task.findUnique({
        where: { id: taskId },
    });

    if (task === null) {
        throw new NotFoundError("Task not found");
    }

    await projectsServices.checkPermission(user, task, prisma);

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
        where: {
            id: taskId,
            column: { project: { userId: user.sub } },
        },
    });

    if (task === null) {
        throw new NotFoundError("Task not found");
    }

    await projectsServices.checkPermission(
        user,
        { projectId: task.projectId },
        prisma,
    );

    const from = task.order;

    const lastTask = await prisma.task.findFirst({
        where: { columnId: task.columnId },
        orderBy: { order: "desc" },
    });

    const lastTaskOrder = lastTask ? lastTask.order : startIndex;

    to = clamp(to, startIndex, lastTaskOrder);

    if (from === to) return;

    await prisma.$transaction(async tx => {
        await tx.task.update({
            where: { id: taskId },
            data: { order: parkingIndex },
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
        where: {
            id: taskId,
            column: { project: { userId: user.sub } },
        },
    });

    if (task === null) {
        throw new NotFoundError("Task not found");
    }

    await projectsServices.checkPermission(
        user,
        { projectId: task.projectId },
        prisma,
    );

    if (task.columnId === columnId) {
        return;
    }

    const lastTask = await prisma.task.findFirst({
        where: { columnId },
        orderBy: { order: "desc" },
    });

    const order = lastTask ? lastTask.order + 1 : startIndex;

    return await prisma.$transaction(async tx => {
        await tx.task.update({
            where: {
                id: taskId,
            },
            data: {
                columnId,
                order: parkingIndex,
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

        return await tx.task.update({
            where: { id: taskId },
            data: { order },
        });
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
