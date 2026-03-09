import { PrismaClient, Task } from "../../generated/prisma/client.ts";
import { Status } from "../../generated/prisma/enums.ts";
import { User } from "../plugins/auth.plugin.ts";
import { ForbiddenError, NotFoundError } from "../utils/error.ts";

async function getProject(id: number, user: User, prisma: PrismaClient) {
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            tasks: true,
        },
    });

    if (project == null) {
        throw new NotFoundError("Project not found");
    }

    if (project.ownerId != user.sub) {
        throw new ForbiddenError();
    }

    return project;
}

async function getTask(id: number, user: User, prisma: PrismaClient) {
    const task = await prisma.task.findUnique({
        where: { id },
        include: { project: true },
    });

    if (task == null) {
        throw new NotFoundError("Task not found");
    }

    await getProject(task.projectId, user, prisma);

    return task;
}

interface Create {
    title: string;
    description?: string;
    status: Status;
}

async function createTask(
    user: User,
    projectId: number,
    details: Create,
    prisma: PrismaClient,
) {
    getProject(projectId, user, prisma);

    return await prisma.task.create({
        data: {
            title: details.title,
            description: details.description,
            status: details.status,
            project: { connect: { id: projectId } },
        },
    });
}

type Update = Partial<Omit<Task, "id" | "projectId">>;

async function updateTask(
    user: User,
    taskId: number,
    details: Update,
    prisma: PrismaClient,
) {
    // KNOWLEDGE: Updating fields to "undefined" doesnt change them.
    return await prisma.task.update({
        where: { id: taskId, project: { ownerId: user.sub } },
        data: { ...details },
    });
}

async function deleteTask(user: User, taskId: number, prisma: PrismaClient) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            project: true,
        },
    });

    if (task == null) {
        throw new NotFoundError("Task not found");
    }

    if (task.project.ownerId != user.sub) {
        throw new ForbiddenError();
    }

    await prisma.task.delete({ where: { id: taskId } });
}

export default {
    getTask,
    createTask,
    updateTask,
    deleteTask,
};
