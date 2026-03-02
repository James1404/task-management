import { PrismaClient, Project } from "../../generated/prisma/client.ts";
import { UnauthorizedError } from "../utils/error.ts";

async function getProject(user: string, id: number, prisma: PrismaClient) {
    return await prisma.project.findUnique({ where: { id, ownerId: user } });
}

async function getAllProjects(user: string, prisma: PrismaClient) {
    return await prisma.project.findMany({ where: { ownerId: user } });
}

type Create = Omit<Project, "id" | "ownerId">;
async function createProject(
    user: string,
    details: Create,
    prisma: PrismaClient,
) {
    return await prisma.project.create({
        data: {
            owner: {
                connect: {
                    id: user,
                },
            },
            ...details,
        },
    });
}

type Update = Partial<Omit<Project, "id" | "ownerId">>;

async function updateProject(
    user: string,
    id: number,
    details: Update,
    prisma: PrismaClient,
) {
    // KNOWLEDGE: Updating fields to "undefined" doesnt change them.
    return await prisma.project.update({
        where: { id, ownerId: user },
        data: { ...details },
    });
}

async function deleteProject(user: string, id: number, prisma: PrismaClient) {
    const project = await prisma.project.findUnique({
        where: { id, ownerId: user },
    });

    if (project == null) {
        throw new UnauthorizedError("Project does not exist with ID");
    }

    await prisma.project.delete({ where: { id, ownerId: user } });
}

export default {
    getProject,
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
};
