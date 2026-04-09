import { PrismaClient, Project } from "../../generated/prisma/client.ts";
import { User } from "../plugins/auth.plugin.ts";
import { NotFoundError } from "../utils/error.ts";

async function getProject(user: User, projectId: string, prisma: PrismaClient) {
    return await prisma.project.findUnique({
        where: { id: projectId, ownerId: user.sub },
    });
}

async function getAllProjects(user: User, prisma: PrismaClient) {
    return await prisma.project.findMany({ where: { ownerId: user.sub } });
}

async function getProjectsColumns(
    user: User,
    projectId: string,
    prisma: PrismaClient,
) {
    return await prisma.column.findMany({
        where: { projectId },
        orderBy: { order: "asc" },
    });
}

type Create = Omit<Project, "id" | "ownerId">;
async function createProject(
    user: User,
    details: Create,
    prisma: PrismaClient,
) {
    return await prisma.project.create({
        data: {
            owner: {
                connect: {
                    id: user.sub,
                },
            },
            ...details,
        },
    });
}

type Update = Partial<Omit<Project, "id" | "ownerId">>;

async function updateProject(
    user: User,
    projectId: string,
    details: Update,
    prisma: PrismaClient,
) {
    // KNOWLEDGE: Updating fields to "undefined" doesnt change them.
    return await prisma.project.update({
        where: { id: projectId, ownerId: user.sub },
        data: { ...details },
    });
}

async function deleteProject(
    user: User,
    projectId: string,
    prisma: PrismaClient,
) {
    const project = await prisma.project.findUnique({
        where: { id: projectId, ownerId: user.sub },
    });

    if (project == null) {
        throw new NotFoundError("Project not found");
    }

    await prisma.project.delete({
        where: { id: projectId, ownerId: user.sub },
    });
}

export default {
    getProject,
    getAllProjects,
    getProjectsColumns,
    createProject,
    updateProject,
    deleteProject,
};
