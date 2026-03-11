import LoginField from "@/components/login-field";
import { loggedIn } from "@/stores/credentials";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Index,
    async beforeLoad() {
        if (loggedIn()) {
            throw redirect({
                to: "/dashboard",
                // search: {
                //     redirect: location.href,
                // },
            });
        }
    },
});

function Index() {
    return (
        <div className="p-2">
            <h3>Welcome Home!</h3>

            <LoginField />
        </div>
    );
}
