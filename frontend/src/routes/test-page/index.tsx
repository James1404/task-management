import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test-page/")({
    component: RouteComponent,
});

import React, { memo, useCallback, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { Feedback, PointerSensor, KeyboardSensor } from "@dnd-kit/dom";
import type { DragDropEventHandlers } from "@dnd-kit/react";
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// import "./index.css";

function createRange(length: number) {
    return Array.from({ length }, (_, i) => i + 1);
}

const ITEM_COUNT = 6;

const sensors = [
    PointerSensor.configure({
        activatorElements(source) {
            return [source.element, source.handle];
        },
    }),
    KeyboardSensor,
];

interface SortableItemProps {
    id: string;
    column: string;
    index: number;
    accentColor: string;
}

const COLORS: Record<string, string> = {
    A: "#7193f1",
    B: "#FF851B",
    C: "#2ECC40",
    D: "#ff3680",
};

const SortableItem = memo(function SortableItem({
    id,
    column,
    index,
    accentColor,
}: PropsWithChildren<SortableItemProps>) {
    const group = column;
    const { handleRef, ref, isDragging, isDropTarget, isDragSource } =
        useSortable({
            id,
            group,
            accept: "item",
            type: "item",
            index,
            data: { group },
        });

    const className = cn(
        `flex flex-row items-center gap-2
        w-full min-w-0
        px-3 py-1
        rounded-md
        border
        shadow-none
        bg-card text-card-foreground
        transition-all`,
        !isDragging && "border-transparent",
        isDragging && "shadow-md",
        isDropTarget && "bg-blue-300",
        isDragSource && "bg-red-300",
    );

    return (
        <div className={className} ref={ref as any}>
            <div className="grow">
                <h3>{id}</h3>
            </div>

            <Button variant="ghost" ref={handleRef as any}>
                <GripVertical />
            </Button>
        </div>
    );
});

interface SortableColumnProps {
    id: string;
    index: number;
    rows: string[];
}

const SortableColumn = memo(function SortableColumn({
    rows,
    id,
    index,
}: PropsWithChildren<SortableColumnProps>) {
    const { handleRef, isDragging, ref } = useSortable({
        id,
        accept: ["column", "item"],
        collisionPriority: CollisionPriority.Low,
        type: "column",
        index,
    });

    const className = cn("h-full w-125 transition-all", isDragging && "shadow");

    return (
        <Card ref={ref as any} className={className}>
            <CardHeader className="flex flex-row justify-between items-center h-fit">
                <CardTitle>{id}</CardTitle>
                <CardAction>
                    <Button variant="ghost" ref={handleRef as any}>
                        <GripVertical />
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                {rows.map((itemId, itemIndex) => (
                    <SortableItem
                        key={itemId}
                        id={itemId}
                        column={id}
                        index={itemIndex}
                        accentColor={COLORS[id]}
                    />
                ))}
            </CardContent>
        </Card>
    );
});

function RouteComponent() {
    const [items, setItems] = useState({
        A: createRange(ITEM_COUNT).map(id => `A${id}`),
        B: createRange(ITEM_COUNT).map(id => `B${id}`),
        C: createRange(ITEM_COUNT).map(id => `C${id}`),
        D: [],
    });
    const [columns] = useState(Object.keys(items));
    const snapshot = useRef(structuredClone(items));

    return (
        <DragDropProvider
            sensors={sensors}
            onDragStart={useCallback<
                DragDropEventHandlers["onDragStart"]
            >(() => {
                snapshot.current = structuredClone(items);
            }, [items])}
            onDragOver={useCallback<DragDropEventHandlers["onDragOver"]>(
                event => {
                    const { source } = event.operation;

                    if (source && source.type === "column") {
                        return;
                    }

                    setItems(items => move(items, event));
                },
                [],
            )}
            onDragEnd={useCallback<DragDropEventHandlers["onDragEnd"]>(
                event => {
                    if (event.canceled) {
                        setItems(snapshot.current);
                        return;
                    }
                },
                [],
            )}
        >
            <div className="flex flex-row gap-5 p-5 h-full">
                {columns.map((column, columnIndex) => {
                    const rows = items[column as keyof typeof items];

                    return (
                        <SortableColumn
                            key={column}
                            id={column}
                            index={columnIndex}
                            rows={rows}
                        />
                    );
                })}
            </div>
        </DragDropProvider>
    );
}
