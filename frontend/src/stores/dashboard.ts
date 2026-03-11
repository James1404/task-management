import type { ProjectSchemaType } from "@/schemas/project.schema";
import { create } from "zustand";

type CurrentProject = {
    project: ProjectSchemaType | null;
};

type CurrentProjectActions = {};

const useCurrentProject = create<CurrentProject & CurrentProjectActions>()(
    set => ({
        project: null,
    }),
);
