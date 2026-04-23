import { loggedIn } from "@/stores/credentials";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

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
        <main className="max-w-200 mx-auto p-5 min-h-screen flex flex-col items-center gap-5">
            <header className="flex flex-col justify-center items-center gap-5 h-screen">
                <h1 className="text-5xl">Task Management</h1>
                <p className="text-xl">By James Barnfather</p>

                <div className="flex flex-row gap-2">
                    <Button asChild variant="default">
                        <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link to="/register">Register</Link>
                    </Button>
                </div>
            </header>
        </main>
    );
}
