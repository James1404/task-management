import { getAccount, logoutAccount } from "@/api/user.api";
import { clearAccess } from "@/stores/credentials";
import {
    mutationOptions,
    queryOptions,
    useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function getAccountOptions() {
    return queryOptions({
        queryKey: ["user"],
        queryFn: async () => await getAccount(),
        staleTime: 2 * 60 * 1000,
    });
}

export function logoutAccountOptions() {
    const queryClient = useQueryClient();
    const navigate = useNavigate({});

    return mutationOptions({
        mutationFn: async () => await logoutAccount(),
        onSettled: async () => {
            clearAccess();
            queryClient.clear();
            navigate({ to: "/" });
        },
    });
}
