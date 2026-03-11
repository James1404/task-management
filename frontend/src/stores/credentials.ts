import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Credentials {
    access: string | null;
}

const useCredentials = create<Credentials>()(
    persist(
        _set => ({
            access: null,
        }),
        { name: "credentials" },
    ),
);

export function setAccess(newAccess: string) {
    useCredentials.setState(() => ({ access: newAccess }));
}

export function clearAccess() {
    return useCredentials.setState(() => ({ access: null }));
}

export function getAuthorizationHeader() {
    return `Bearer ${useCredentials.getState().access}`;
}

export function loggedIn() {
    return useCredentials.getState().access != null;
}

export default useCredentials;
