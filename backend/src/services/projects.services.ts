import { PrismaClient, Project } from "../../generated/prisma/client.ts";
import { User } from "../plugins/auth.plugin.ts";
import { ProjectID } from "../schemas/projects.schema.ts";
import {
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "../utils/error.ts";

async function checkPermission(
    user: User,
    { projectId }: { projectId: ProjectID },
    prisma: PrismaClient,
) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (project === null) {
        throw new UnauthorizedError("Project does not exist with ID");
    }

    if (project.userId !== user.sub && user.role !== "ADMIN") {
        throw new ForbiddenError();
    }

    return project;
}

async function getProject(
    user: User,
    projectId: ProjectID,
    prisma: PrismaClient,
) {
    return await checkPermission(user, { projectId }, prisma);
}

async function getAllProjects(user: User, prisma: PrismaClient) {
    return await prisma.project.findMany({ where: { userId: user.sub } });
}

async function getProjectsColumns(
    user: User,
    projectId: ProjectID,
    prisma: PrismaClient,
) {
    await checkPermission(user, { projectId }, prisma);

    return await prisma.column.findMany({
        where: { projectId },
        orderBy: { order: "asc" },
    });
}

type Create = Omit<Project, "id" | "userId">;
async function createProject(
    user: User,
    details: Create,
    prisma: PrismaClient,
) {
    return await prisma.project.create({
        data: {
            user: {
                connect: {
                    id: user.sub,
                },
            },
            ...details,
        },
    });
}

type Update = Partial<Omit<Project, "id" | "userId">>;

async function updateProject(
    user: User,
    projectId: ProjectID,
    details: Update,
    prisma: PrismaClient,
) {
    await checkPermission(user, { projectId }, prisma);

    // KNOWLEDGE: Updating fields to "undefined" doesnt change them.
    return await prisma.project.update({
        where: { id: projectId, userId: user.sub },
        data: { ...details },
    });
}

async function deleteProject(
    user: User,
    projectId: ProjectID,
    prisma: PrismaClient,
) {
    await checkPermission(user, { projectId }, prisma);

    await prisma.project.delete({
        where: { id: projectId, userId: user.sub },
    });
}

export default {
    checkPermission,
    getProject,
    getAllProjects,
    getProjectsColumns,
    createProject,
    updateProject,
    deleteProject,
};
