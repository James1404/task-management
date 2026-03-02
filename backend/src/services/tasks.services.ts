import { PrismaClient, Task } from "../../generated/prisma/client.ts";
import { Status } from "../../generated/prisma/enums.ts";
import { UnauthorizedError } from "../utils/error.ts";

async function getTask(id: number, prisma: PrismaClient) {
    return await prisma.task.findMany({
        where: { id },
    });
}

interface Create {
    user: string;
    projectId: number;
    title: string;
    description?: string;
    status: Status;
}

async function createTask(details: Create, prisma: PrismaClient) {
    const project = await prisma.project.findUnique({
        where: { id: details.projectId },
    });

    if (project == null) {
        throw new UnauthorizedError("Project does not exist with ID");
    }

    if (project.ownerId != details.user) {
        throw new UnauthorizedError("Access denied");
    }

    return await prisma.task.create({
        data: {
            title: details.title,
            description: details.description,
            status: details.status,
            project: { connect: { id: details.projectId } },
        },
    });
}

type Update = Partial<Omit<Task, "id" | "projectId">>;

async function updateTask(
    user: string,
    taskId: number,
    details: Update,
    prisma: PrismaClient,
) {
    // KNOWLEDGE: Updating fields to "undefined" doesnt change them.
    return await prisma.task.update({
        where: { id: taskId, project: { ownerId: user } },
        data: { ...details },
    });
}

async function deleteTask(user: string, taskId: number, prisma: PrismaClient) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            project: true,
        },
    });

    if (task == null) {
        throw new UnauthorizedError("Task does not exists");
    }

    if (task.project.ownerId != user) {
        throw new UnauthorizedError("Incorrect credentials");
    }

    await prisma.task.delete({ where: { id: taskId } });
}

export default {
    getTask,
    createTask,
    updateTask,
    deleteTask,
};
