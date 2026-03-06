import {
    createRootRoute,
    Link,
    Outlet,
    useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { loggedIn } from "../stores/credentials";
import {
    NavigationMenu,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import logout from "@/libs/logout";

function RootLayout() {
    const navigate = useNavigate({});
    const onLogout = async () => {
        await logout();
        navigate({ to: "/" });
    };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <TooltipProvider>
                <main className="p-2">
                    <NavigationMenu>
                        <NavigationMenuLink asChild>
                            <Link to="/">Home</Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                            <Link to="/about">About</Link>
                        </NavigationMenuLink>
                        {loggedIn() ? (
                            <>
                                <NavigationMenuLink asChild>
                                    <Link to="/dashboard">Dashboard</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                Logout
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                Are you sure you want to logout?
                                            </DialogHeader>

                                            <Field orientation="horizontal">
                                                <DialogClose asChild>
                                                    <Button variant="outline">
                                                        Cancel
                                                    </Button>
                                                </DialogClose>
                                                <Button
                                                    type="submit"
                                                    onClick={onLogout}
                                                >
                                                    Logout
                                                </Button>
                                            </Field>
                                        </DialogContent>
                                    </Dialog>
                                </NavigationMenuLink>
                            </>
                        ) : (
                            <>
                                {/* <NavigationMenuLink asChild>
                                    <Link to="/login">Login</Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild>
                                    <Link to="/register">Register</Link>
                                </NavigationMenuLink> */}
                            </>
                        )}
                    </NavigationMenu>

                    <hr />
                    <Outlet />
                    <TanStackRouterDevtools />
                </main>
                <Toaster />
            </TooltipProvider>
        </ThemeProvider>
    );
}

export const Route = createRootRoute({ component: RootLayout });
