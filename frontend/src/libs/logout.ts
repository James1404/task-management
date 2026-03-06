import { clearAccess } from "@/stores/credentials";
import client from "./fetch";

export default async function logout() {
    const { data } = await client.POST("/auth/logout", {
        credentials: "same-origin",
    });

    clearAccess();
}
