import { createFileRoute } from "@tanstack/react-router";
import client from "../libs/fetch";

export const Route = createFileRoute("/register")({
    component: RouteComponent,
});

function RouteComponent() {
    async function register(formdata: FormData) {
        const { data, error } = await client.POST("/auth/register", {
            body: {
                email: formdata.get("email")?.toString() ?? "",
                password: formdata.get("password")?.toString() ?? "",
                username: formdata.get("username")?.toString() ?? "",
            },
            credentials: "same-origin",
        });

        if (error) {
        }

        alert(data);
    }

    return (
        <div>
            <form
                className=" flex flex-col items-start gap-2"
                action={register}
            >
                <label>
                    Email: <input type="email" name="email" />
                </label>
                <label>
                    Password: <input type="password" name="password" />
                </label>
                <label>
                    Username: <input type="text" name="username" />
                </label>
                <input type="submit" value="Submit" />
            </form>
        </div>
    );
}
