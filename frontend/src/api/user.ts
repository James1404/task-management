import client from "@/lib/fetch";
import type {
    LoginSchemaType,
    RegisterSchemaType,
} from "@/schemas/user.schema";
import { clearAccess, setAccess } from "@/stores/credentials";

export async function loginToUser(schema: LoginSchemaType) {
    const { data, error } = await client.POST("/v1/auth/login", {
        body: {
            ...schema,
        },
        credentials: "include",
    });

    if (error) {
        throw new Error(error.error);
    }

    if (!data) {
        throw new Error("Failed to load into user");
    }

    setAccess(data.access);
}

export async function registerAccount(schema: RegisterSchemaType) {
    const { data, error } = await client.POST("/v1/auth/register", {
        body: schema,
        credentials: "include",
    });

    if (error) {
        throw new Error(error.error);
    }

    if (!data) {
        throw new Error("Failed to load into user");
    }

    setAccess(data.access);
}

export async function logout() {
    const { error } = await client.POST("/v1/auth/logout", {
        credentials: "same-origin",
    });

    console.log(`Logout error: ${error}`);

    clearAccess();
}
