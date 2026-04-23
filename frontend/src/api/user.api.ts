import type {
    LoginSchemaType,
    RegisterSchemaType,
} from "@/schemas/user.schema";
import { setAccess } from "@/stores/credentials";
import { getTaskManagementAPI } from "../../generated/backend";
import { isAxiosError } from "axios";

export async function loginToUser(body: LoginSchemaType) {
    try {
        const data = await getTaskManagementAPI().postV1AuthLogin(
            { ...body },
            { withCredentials: true },
        );
        setAccess(data.access);
    } catch (err) {
        if (isAxiosError(err)) {
            throw new Error("Failed to login into user");
        }

        throw err;
    }
}

export async function getAccount() {
    try {
        const data = await getTaskManagementAPI().getV1Account({
            withCredentials: true,
        });

        return data;
    } catch (err) {
        if (isAxiosError(err)) {
            throw new Error("Failed to get user data");
        }

        throw err;
    }
}

export async function registerAccount(body: RegisterSchemaType) {
    const data = await getTaskManagementAPI().postV1AuthRegister(
        { ...body },
        { withCredentials: true },
    );

    setAccess(data.access);
}

export async function logoutAccount() {
    await getTaskManagementAPI().postV1AuthLogout({
        withCredentials: true,
    });
}
