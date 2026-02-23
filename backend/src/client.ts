import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: Deno.env.get("DATABASE_URL"),
});

const prisma = new PrismaClient({ adapter });

export default prisma;
