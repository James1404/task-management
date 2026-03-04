import { PrismaClient } from "../../generated/prisma/client.ts";
import { User } from "../plugins/auth.plugin.ts";
import { hashPassword } from "../utils/auth.utils.ts";
import { InvalidCredentialsError } from "../utils/error.ts";

async function deleteAccount(
    user: User,
    password: string,
    prisma: PrismaClient,
) {
    const userRow = await prisma.user.findUnique({
        where: { id: user.sub, email: user.email, username: user.username },
    });

    if (userRow == null) {
        throw new InvalidCredentialsError();
    }

    const hash = hashPassword(password, userRow.salt);

    if (hash != userRow.password) {
        throw new InvalidCredentialsError();
    }

    await prisma.user.deleteMany({
        where: {
            id: user.sub,
            email: user.email,
            username: user.username,
        },
    });
}

export default { deleteAccount };
