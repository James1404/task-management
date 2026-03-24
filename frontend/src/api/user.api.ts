import type {
    LoginSchemaType,
    RegisterSchemaType,
} from "@/schemas/user.schema";
import { clearAccess, setAccess } from "@/stores/credentials";
import { getTaskManagementAPI } from "../../generated/backend";

export async function loginToUser(body: LoginSchemaType) {
    const data = await getTaskManagementAPI().postV1AuthLogin(
        { ...body },
        { withCredentials: true },
    );

    // const { data, error } = await client.POST("/v1/auth/login", {
    //     body: {
    //         ...schema,
    //     },
    //     credentials: "include",
    // });

    // if (error) {
    //     throw new Error(error.error);
    // }

    // if (!data) {
    //     throw new Error("Failed to load into user");
    // }

    setAccess(data.access);
}

export async function registerAccount(body: RegisterSchemaType) {
    const data = await getTaskManagementAPI().postV1AuthRegister(
        { ...body },
        { withCredentials: true },
    );

    // const { data, error } = await client.POST("/v1/auth/register", {
    //     body: schema,
    //     credentials: "include",
    // });

    // if (error) {
    //     throw new Error(error.error);
    // }

    // if (!data) {
    //     throw new Error("Failed to load into user");
    // }

    setAccess(data.access);
}

export async function logout() {
    const data = await getTaskManagementAPI().postV1AuthLogout({
        withCredentials: true,
    });

    // const { error } = await client.POST("/v1/auth/logout", {
    //     credentials: "same-origin",
    // });

    // console.log(`Logout error: ${error}`);

    clearAccess();
}
