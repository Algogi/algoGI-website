"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, GripVertical } from "lucide-react";

interface Applicant {
  id: string;
  name: string;
  email: string;
  status: string;
  resumeUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface KanbanBoardProps {
  applicants: Applicant[];
  jobId: string;
  onApplicantClick: (id: string) => void;
  onStatusUpdate: (id: string, newStatus: string) => Promise<void>;
}

const statusColumns = [
  { id: "applied", label: "Applied", color: "bg-gray-500" },
  { id: "screening", label: "Screening", color: "bg-blue-500" },
  { id: "phone-interview", label: "Phone Interview", color: "bg-purple-500" },
  { id: "technical-interview", label: "Technical Interview", color: "bg-indigo-500" },
  { id: "final-interview", label: "Final Interview", color: "bg-pink-500" },
  { id: "offer", label: "Offer", color: "bg-yellow-500" },
  { id: "rejected", label: "Rejected", color: "bg-red-500" },
  { id: "hired", label: "Hired", color: "bg-green-500" },
];

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    applied: { variant: "secondary", label: "Applied" },
    screening: { variant: "default", label: "Screening" },
    "phone-interview": { variant: "default", label: "Phone Interview" },
    "technical-interview": { variant: "default", label: "Technical Interview" },
    "final-interview": { variant: "default", label: "Final Interview" },
    offer: { variant: "outline", label: "Offer" },
    rejected: { variant: "destructive", label: "Rejected" },
    hired: { variant: "default", label: "Hired" },
  };
  const config = statusConfig[status] || { variant: "secondary" as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

function DraggableCard({
  applicant,
  onApplicantClick,
  onStatusChange,
  isReverting,
}: {
  applicant: Applicant;
  onApplicantClick: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
  isReverting?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: applicant.id,
    data: {
      type: "card",
      applicant,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isReverting ? "all 0.3s ease" : transition,
    opacity: isDragging ? 0.5 : isReverting ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow bg-card"
        onClick={() => onApplicantClick(applicant.id)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{applicant.name}</h4>
                <a
                  href={`mailto:${applicant.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  {applicant.email}
                </a>
              </div>
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Applied: {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              {getStatusBadge(applicant.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplicantClick(applicant.id);
                }}
              >
                <Eye className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DroppableColumn({
  column,
  applicants,
  onApplicantClick,
  onStatusChange,
  reverting,
}: {
  column: typeof statusColumns[0];
  applicants: Applicant[];
  onApplicantClick: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
  reverting?: Set<string>;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const columnApplicants = applicants.filter((app) => app.status === column.id);
  const applicantIds = columnApplicants.map((app) => app.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 ${isOver ? "bg-muted/20 rounded-lg p-2 transition-colors" : ""}`}
    >
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 rounded-full ${column.color}`} />
          <h3 className="font-semibold text-white">{column.label}</h3>
          <Badge variant="secondary" className="ml-auto">
            {columnApplicants.length}
          </Badge>
        </div>
      </div>
      <SortableContext items={applicantIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[400px]">
          {columnApplicants.length === 0 ? (
            <div className={`text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg ${isOver ? "border-primary bg-primary/10" : ""}`}>
              {isOver ? "Drop here" : "No applicants"}
            </div>
          ) : (
            columnApplicants.map((applicant) => (
              <DraggableCard
                key={applicant.id}
                applicant={applicant}
                onApplicantClick={onApplicantClick}
                onStatusChange={onStatusChange}
                isReverting={reverting?.has(applicant.id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({
  applicants,
  jobId,
  onApplicantClick,
  onStatusUpdate,
}: KanbanBoardProps) {
  const [localApplicants, setLocalApplicants] = useState<Applicant[]>(applicants);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reverting, setReverting] = useState<Set<string>>(new Set());

  // Sync local state with props when applicants change
  useEffect(() => {
    setLocalApplicants(applicants);
  }, [applicants]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setError(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicantId = active.id as string;
    
    // Check if dropping on a column (status) or another card
    let newStatus: string;
    const overData = over.data.current;
    
    if (overData?.type === "column") {
      // Dropped directly on a column
      newStatus = over.id as string;
    } else {
      // Dropped on another card - get its status
      const targetApplicant = localApplicants.find((app) => app.id === over.id);
      if (!targetApplicant) return;
      newStatus = targetApplicant.status;
    }

    // Find the applicant being dragged
    const applicant = localApplicants.find((app) => app.id === applicantId);
    if (!applicant) return;

    // Only update if status changed
    if (applicant.status === newStatus) return;

    // Optimistic update - update UI immediately
    const originalStatus = applicant.status;
    setLocalApplicants((prev) =>
      prev.map((app) =>
        app.id === applicantId ? { ...app, status: newStatus } : app
      )
    );

    // Update backend
    onStatusUpdate(applicantId, newStatus).catch((err: any) => {
      // Revert on error
      setLocalApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId ? { ...app, status: originalStatus } : app
        )
      );
      setError(err.message || "Failed to update status. Please try again.");
      setReverting((prev) => new Set(prev).add(applicantId));
      
      // Clear revert animation after a moment
      setTimeout(() => {
        setReverting((prev) => {
          const next = new Set(prev);
          next.delete(applicantId);
          return next;
        });
        setError(null);
      }, 3000);
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This allows dropping on columns
  };

  const activeApplicant = activeId ? localApplicants.find((app) => app.id === activeId) : null;

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {statusColumns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                applicants={localApplicants}
                onApplicantClick={onApplicantClick}
                reverting={reverting}
                onStatusChange={async (id, newStatus) => {
                  // This is for button clicks, not drag and drop
                  const applicant = localApplicants.find((app) => app.id === id);
                  if (!applicant || applicant.status === newStatus) return;
                  
                  const originalStatus = applicant.status;
                  setLocalApplicants((prev) =>
                    prev.map((app) =>
                      app.id === id ? { ...app, status: newStatus } : app
                    )
                  );

                  try {
                    await onStatusUpdate(id, newStatus);
                    setError(null);
                  } catch (err: any) {
                    setLocalApplicants((prev) =>
                      prev.map((app) =>
                        app.id === id ? { ...app, status: originalStatus } : app
                      )
                    );
                    setError(err.message || "Failed to update status. Please try again.");
                    setReverting((prev) => new Set(prev).add(id));
                    setTimeout(() => {
                      setReverting((prev) => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                      });
                    }, 1000);
                  }
                }}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeApplicant ? (
            <Card className="w-80 opacity-90 rotate-3 shadow-2xl bg-card">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-white mb-1">{activeApplicant.name}</h4>
                    <p className="text-sm text-primary flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {activeApplicant.email}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Applied: {activeApplicant.createdAt ? new Date(activeApplicant.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    {getStatusBadge(activeApplicant.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}

