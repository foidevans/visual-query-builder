"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQueryStore } from "@/store/queryStore";
import { QueryNode } from "@/types/query";

interface SortableGroupProps {
  groupId: string;
  children: React.ReactNode;
  childIds: string[];
}

export function SortableGroup({ groupId, children, childIds }: SortableGroupProps) {
  const [mounted, setMounted] = useState(false);
  const reorderChildren = useQueryStore((s) => s.reorderChildren);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = childIds.indexOf(String(active.id));
    const toIndex = childIds.indexOf(String(over.id));
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderChildren(groupId, fromIndex, toIndex);
    }
  }

  if (!mounted) {
    return <div className="space-y-2 pl-2">{children}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 pl-2">{children}</div>
      </SortableContext>
    </DndContext>
  );
}
