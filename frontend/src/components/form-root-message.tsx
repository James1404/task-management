import { cn } from "@/lib/utils";
import { useFormState, type Control, type FieldValues } from "react-hook-form";

export function FormRootMessage<T extends FieldValues>({
    className,
    control,
    ...props
}: React.ComponentProps<"p"> & { control: Control<T> }) {
    const { errors } = useFormState({ control });
    const rootError = errors.root;
    if (!rootError) {
        return null;
    }

    return (
        <p
            data-slot="form-message"
            className={cn("text-destructive text-sm", className)}
            {...props}
        >
            {rootError.message}
        </p>
    );
}
