"use client";

import * as React from "react";
import { use } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Prisma } from "@zenstackhq/runtime/models";

import { getRequestsFilteredByAreaAccess } from "@/actions/request";
import { updateCurrentStatus } from "@/actions/request-assignment";
import ErrorRetryFallback from "@/components/common/error-retry-fallback";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import * as Kanban from "@/components/ui/kanban";

import useTenantId from "@/hooks/use-tenant-id";
import { cn } from "@/lib/utils";
import { useFindManyRequestAssignment, useFindManyRequestWorkflow } from "@/services/api/hooks";
import { RequestWorkflowDefaultArgs } from "@/types/zenstackhq/workflow";
import { STATUS } from "@/constants/requests";
import { validateTransition, getStatusTransitions } from "@/lib/workflow";
import type { RequestWorkflowType } from "@/types/zenstackhq/workflow";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { DragEndEvent } from "@dnd-kit/core";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

const RequestAssignmentKanbanSelect = Prisma.validator<Prisma.RequestAssignmentFindManyArgs>()({
  select: {
    id: true,
    requestId: true,
    statusId: true,
    assignmentDate: true,
    slaDeadline: true,
    request: {
      select: {
        id: true,
        slug: true,
        issueSubject: true,
        description: true,
        isDraft: true,
      },
    },
    status: {
      select: {
        id: true,
        name: true,
        color: true,
        type: true,
      },
    },
    priority: {
      select: {
        id: true,
        name: true,
        primaryColor: true,
      },
    },
    assignedUsers: {
      where: { unAssignmentDate: null },
      select: {
        id: true,
        isCoordinator: true,
        userTenant: {
          select: {
            id: true,
            person: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    },
  },
});

type WorkflowWithStatuses = Prisma.RequestWorkflowGetPayload<typeof RequestWorkflowDefaultArgs>;
type AssignmentWithRelations = Prisma.RequestAssignmentGetPayload<typeof RequestAssignmentKanbanSelect>;
type WorkflowStatus = WorkflowWithStatuses["requestWorkflowStatus"][number];

interface KanbanTask {
  id: string;
  requestId: string;
  slug?: number | null;
  title: string;
  priority?: {
    name: string;
    color?: string | null;
  };
  assignees: string[];
  dueDate?: string;
}

interface KanbanBoardContextValue {
  statuses: WorkflowStatus[];
  columns: Record<string, KanbanTask[]>;
  isLoading: boolean;
  isPending: boolean;
  validTransitions: Map<string, Set<string>>;
  assignmentsMap: Map<string, AssignmentWithRelations>;
  activeTaskId: string | null;
  orderedStatuses: WorkflowStatus[];
}

const KanbanBoardDataContext = React.createContext<KanbanBoardContextValue | null>(null);

function orderStatuses(workflow: WorkflowWithStatuses | null): WorkflowStatus[] {
  if (!workflow) return [];

  const statuses = workflow.requestWorkflowStatus ?? [];
  if (statuses.length === 0) return [];

  const transitions = workflow.requestWorkflowTransition ?? [];
  const statusMap = new Map(statuses.map((status: WorkflowStatus) => [status.id, status] as const));

  const adjacency = new Map<string, string[]>();
  const incomingCounts = new Map<string, number>();
  const transitionPriority = new Map<string, number>();

  statuses.forEach((status: WorkflowStatus) => {
    adjacency.set(status.id, []);
    incomingCounts.set(status.id, 0);
  });

  transitions.forEach((transition: WorkflowWithStatuses["requestWorkflowTransition"][number]) => {
    if (!transition.fromStatusId || !transition.toStatusId) return;
    const neighbors = adjacency.get(transition.fromStatusId);
    if (neighbors) {
      neighbors.push(transition.toStatusId);
    }
    incomingCounts.set(transition.toStatusId, (incomingCounts.get(transition.toStatusId) ?? 0) + 1);
    transitionPriority.set(`${transition.fromStatusId}->${transition.toStatusId}`, transition.priority ?? 0);
  });

  const typeOrder: Record<string, number> = {
    [STATUS.INITIAL]: 0,
    [STATUS.DEFAULT]: 1,
    [STATUS.FINAL]: 2,
  };

  const compareStatuses = (a: WorkflowStatus, b: WorkflowStatus) => {
    const typeDiff = (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3);
    if (typeDiff !== 0) return typeDiff;

    const positionXDiff = (a.positionX ?? 0) - (b.positionX ?? 0);
    if (positionXDiff !== 0) return positionXDiff;

    const positionYDiff = (a.positionY ?? 0) - (b.positionY ?? 0);
    if (positionYDiff !== 0) return positionYDiff;

    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  };

  const getNeighborOrder = (fromId: string) => {
    const ids = [...(adjacency.get(fromId) ?? [])];
    return ids.sort((aId, bId) => {
      const aStatus = statusMap.get(aId);
      const bStatus = statusMap.get(bId);
      if (!aStatus || !bStatus) return 0;

      const priorityKeyA = `${fromId}->${aId}`;
      const priorityKeyB = `${fromId}->${bId}`;
      const priorityDiff = (transitionPriority.get(priorityKeyA) ?? 0) - (transitionPriority.get(priorityKeyB) ?? 0);
      if (priorityDiff !== 0) return priorityDiff;

      return compareStatuses(aStatus, bStatus);
    });
  };

  const queue: string[] = [];
  const visited = new Set<string>();
  const result: WorkflowStatus[] = [];

  const startNodes = statuses.filter((status: WorkflowStatus) => status.type === STATUS.INITIAL);
  const fallbackStartNodes = statuses.filter((status: WorkflowStatus) => (incomingCounts.get(status.id) ?? 0) === 0);

  const initialQueue = startNodes.length > 0 ? startNodes : fallbackStartNodes;
  initialQueue.sort(compareStatuses).forEach((status: WorkflowStatus) => {
    if (!visited.has(status.id)) queue.push(status.id);
  });

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) continue;
    const currentStatus = statusMap.get(currentId);
    if (!currentStatus) continue;

    visited.add(currentId);
    result.push(currentStatus);

    const neighbors = getNeighborOrder(currentId);
    neighbors.forEach((neighborId) => {
      if (!visited.has(neighborId)) {
        queue.push(neighborId);
      }
    });
  }

  if (result.length < statuses.length) {
    const remaining = statuses
      .filter((status: WorkflowStatus) => !visited.has(status.id))
      .sort(compareStatuses);
    result.push(...remaining);
  }

  return result;
}

export function KanbanTab() {
  const tenantId = useTenantId();
  const t = useTranslations("admin.request.kanban");
  const [isPending, startTransition] = React.useTransition();
  const [requestFilter, setRequestFilter] = React.useState<Prisma.RequestWhereInput | null>(null);
  const [isFilterLoading, setIsFilterLoading] = React.useState(true);
  const [filterError, setFilterError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!tenantId) return;

    let active = true;

    async function loadFilter() {
      setIsFilterLoading(true);
      try {
        const where = await getRequestsFilteredByAreaAccess(tenantId);
        if (!active) return;
        setRequestFilter(where);
        setFilterError(null);
      } catch (error) {
        console.error("Error fetching request filters", error);
        if (!active) return;
        setFilterError(t("filterError"));
        setRequestFilter({ id: { in: [] } });
      } finally {
        if (!active) return;
        setIsFilterLoading(false);
      }
    }

    loadFilter();

    return () => {
      active = false;
    };
  }, [tenantId]);

  const workflowArgs = React.useMemo(() => {
    if (!tenantId) return undefined;
    return {
      select: RequestWorkflowDefaultArgs.select,
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: [{ name: "asc" as const }],
    } satisfies Prisma.RequestWorkflowFindManyArgs;
  }, [tenantId]);

  const workflowsQuery = useFindManyRequestWorkflow(workflowArgs, {
    enabled: Boolean(workflowArgs),
    staleTime: 60_000,
  });

  const workflows = React.useMemo(() => (workflowsQuery.data ?? []) as WorkflowWithStatuses[], [workflowsQuery.data]);
  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!workflows.length) return;
    if (!selectedWorkflowId || !workflows.some((workflow) => workflow.id === selectedWorkflowId)) {
      setSelectedWorkflowId(workflows[0]?.id ?? null);
    }
  }, [workflows, selectedWorkflowId]);

  const selectedWorkflow = React.useMemo(() => workflows.find((workflow) => workflow.id === selectedWorkflowId) ?? null, [workflows, selectedWorkflowId]);

  const orderedStatuses = React.useMemo(() => orderStatuses(selectedWorkflow), [selectedWorkflow]);

  const assignmentWhere = React.useMemo<Prisma.RequestAssignmentWhereInput | null>(() => {
    if (!tenantId || !selectedWorkflow || !requestFilter) return null;
    return {
      tenantId,
      isActive: true,
      status: { workflowId: selectedWorkflow.id },
      request: requestFilter, // Mostrar todas las solicitudes, incluyendo borradores
    };
  }, [tenantId, selectedWorkflow, requestFilter]);

  const assignmentsArgs = React.useMemo(() => {
    if (!assignmentWhere) return undefined;
    return {
      ...RequestAssignmentKanbanSelect,
      where: assignmentWhere,
      orderBy: [{ assignmentDate: "desc" as const }],
    } satisfies Prisma.RequestAssignmentFindManyArgs;
  }, [assignmentWhere]);

  const assignmentsQuery = useFindManyRequestAssignment(assignmentsArgs, {
    enabled: Boolean(assignmentsArgs),
    staleTime: 15_000,
  });

  const assignments = React.useMemo(() => (assignmentsQuery.data ?? []) as AssignmentWithRelations[], [assignmentsQuery.data]);

  const assignmentsMap = React.useMemo(() => {
    const map = new Map<string, AssignmentWithRelations>();
    assignments.forEach((assignment) => {
      map.set(assignment.id, assignment);
    });
    return map;
  }, [assignments]);

  const workflowAsRequestWorkflowType = React.useMemo((): RequestWorkflowType | null => {
    if (!selectedWorkflow) return null;
    const typedStatuses = selectedWorkflow.requestWorkflowStatus.map((status: WorkflowStatus) => {
      let statusType: "initial" | "default" | "final" = "default";
      if (status.type === "initial") statusType = "initial";
      else if (status.type === "default") statusType = "default";
      else if (status.type === "final") statusType = "final";
      
      return {
        id: status.id,
        name: status.name,
        description: status.description,
        color: status.color,
        positionX: status.positionX,
        positionY: status.positionY,
        type: statusType,
      };
    });
    const workflow: RequestWorkflowType = {
      id: selectedWorkflow.id,
      name: selectedWorkflow.name,
      description: selectedWorkflow.description,
      isDefault: selectedWorkflow.isDefault,
      requireComments: selectedWorkflow.requireComments,
      notifyChanges: selectedWorkflow.notifyChanges,
      requestWorkflowStatus: typedStatuses,
      requestWorkflowTransition: selectedWorkflow.requestWorkflowTransition,
    };
    return workflow;
  }, [selectedWorkflow]);

  const validTransitions = React.useMemo(() => {
    if (!workflowAsRequestWorkflowType) return new Map<string, Set<string>>();
    const transitions = new Map<string, Set<string>>();
    assignments.forEach((assignment) => {
      const currentStatusId = assignment.status?.id ?? assignment.statusId;
      if (!currentStatusId) return;
      const { allowedTransitions } = getStatusTransitions(workflowAsRequestWorkflowType, currentStatusId);
      const allowedStatusIds = new Set(allowedTransitions.map((status) => status.id));
      transitions.set(assignment.id, allowedStatusIds);
    });
    return transitions;
  }, [assignments, workflowAsRequestWorkflowType]);

  const DRAFT_STATUS_ID = "__DRAFT__"; // Special ID for Draft column

  const groupedTasks = React.useMemo(() => {
    const base: Record<string, KanbanTask[]> = {};

    // Add Draft column at the beginning
    base[DRAFT_STATUS_ID] = [];

    // Add columns for each workflow status
    orderedStatuses.forEach((status) => {
      base[status.id] = [];
    });

    assignments.forEach((assignment) => {
      const isDraft = assignment.request?.isDraft ?? false;
      
      // If Draft, push into Draft column
      const statusId = isDraft ? DRAFT_STATUS_ID : (assignment.status?.id ?? assignment.statusId);
      if (!statusId) return;

      if (!base[statusId]) {
        base[statusId] = [];
      }

      const assignees = assignment.assignedUsers
        ?.map((assigned: AssignmentWithRelations["assignedUsers"][number]) => getAssigneeLabel(assigned.userTenant))
        .filter((value: string | null): value is string => Boolean(value)) ?? [];

      base[statusId].push({
        id: assignment.id,
        requestId: assignment.request?.id ?? assignment.requestId,
        slug: assignment.request?.slug ?? null,
        title: assignment.request?.issueSubject ?? t("noSubject"),
        priority: assignment.priority ? { name: assignment.priority.name, color: assignment.priority.primaryColor } : undefined,
        assignees,
        dueDate: formatDueDate(assignment.slaDeadline),
      });
    });

    return base;
  }, [assignments, orderedStatuses, t]);

  const [columns, setColumns] = React.useState<Record<string, KanbanTask[]>>({});
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);
  const [pendingMoves, setPendingMoves] = React.useState<Map<string, string>>(new Map()); // Map<assignmentId, newStatusId>
  // Flag to avoid an immediate sync pass overriding a just-applied local move
  const skipNextSyncRef = React.useRef(false);

  React.useEffect(() => {
    // Clean up pending moves that are already reflected by server data
    const movesToClean: string[] = [];
    pendingMoves.forEach((newStatusId, assignmentId) => {
      const assignment = assignmentsMap.get(assignmentId);
      const currentStatusId = assignment?.status?.id ?? assignment?.statusId;
      // If server shows the item already at target status, clear the pending move
      if (currentStatusId === newStatusId) {
        movesToClean.push(assignmentId);
      }
    });
    
    if (movesToClean.length > 0) {
      setPendingMoves((prev) => {
        const next = new Map(prev);
        movesToClean.forEach((id) => next.delete(id));
        return next;
      });
    }
  }, [assignmentsMap, pendingMoves]);

  React.useEffect(() => {
    // If a local optimistic update just happened, skip one sync pass
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    // Only sync from server when not dragging.
    // During drag, Kanban handles local visual updates.
    if (!activeTaskId && pendingMoves.size === 0 && !isPending) {
      // No pending moves: rebuild from server-derived groupedTasks
      setColumns(groupedTasks);
    } else if (!activeTaskId && pendingMoves.size > 0) {
      // Pending moves exist: overlay them on top of groupedTasks
      const updatedGroupedTasks = { ...groupedTasks };
      
      pendingMoves.forEach((newStatusId, assignmentId) => {
        // Find task across columns
        for (const [statusId, tasks] of Object.entries(updatedGroupedTasks)) {
          const taskIndex = tasks.findIndex((task) => task.id === assignmentId);
          if (taskIndex !== -1) {
            // Remove from current column
            updatedGroupedTasks[statusId] = tasks.filter((task) => task.id !== assignmentId);
            // Add into the target column
            if (!updatedGroupedTasks[newStatusId]) {
              updatedGroupedTasks[newStatusId] = [];
            }
            updatedGroupedTasks[newStatusId] = [...updatedGroupedTasks[newStatusId], tasks[taskIndex]];
            break;
          }
        }
      });
      
      setColumns(updatedGroupedTasks);
    }
  }, [groupedTasks, pendingMoves, activeTaskId, isPending]);

  const handleMove = React.useCallback(
    async (event: any, activeColumn: string, overColumn: string) => {
      const { active } = event;
      if (!tenantId || !workflowAsRequestWorkflowType || activeColumn === overColumn) {
        return;
      }

      const assignment = assignmentsMap.get(String(active.id));
      if (!assignment) {
        toast.error(t("assignmentNotFound"));
        await assignmentsQuery.refetch();
        return;
      }

      const currentStatusId = assignment.status?.id ?? assignment.statusId;
      if (!currentStatusId) {
        toast.error(t("statusNotFound"));
        await assignmentsQuery.refetch();
        return;
      }

      // Handle Draft column special case
      const DRAFT_STATUS_ID = "__DRAFT__";
      const isMovingFromDraft = activeColumn === DRAFT_STATUS_ID;
      const isMovingToDraft = overColumn === DRAFT_STATUS_ID;
      
      // When moving out of Draft, allow only to "initial" statuses
      if (isMovingFromDraft) {
        const targetStatus = orderedStatuses.find((s) => s.id === overColumn);
        if (!targetStatus) {
          toast.error(t("targetStatusNotFound"));
          setActiveTaskId(null);
          await assignmentsQuery.refetch();
          return;
        }
        
        // Only allow moving to "initial" statuses
        if (targetStatus.type !== STATUS.INITIAL) {
          toast.error(t("draftCanOnlyMoveToInitial"), {
            description: t("draftCanOnlyMoveToInitialDescription"),
          });
          setActiveTaskId(null);
          await assignmentsQuery.refetch();
          return;
        }

        // Ensure all requirements are fulfilled before leaving Draft
        try {
          const { areAllRequirementsFulfilled } = await import("@/actions/requirements");
          const allRequirementsFulfilled = await areAllRequirementsFulfilled(assignment.requestId, tenantId);
          
          if (!allRequirementsFulfilled) {
            toast.error(t("draftRequirementsNotFulfilled"));
            setActiveTaskId(null);
            await assignmentsQuery.refetch();
            return;
          }
        } catch (error) {
          console.error("Error checking requirements:", error);
          toast.error(t("updateError"), {
            description: t("unknownError"),
          });
          setActiveTaskId(null);
          await assignmentsQuery.refetch();
          return;
        }
      } else if (isMovingToDraft) {
        // Cannot move a non-draft request back to Draft
        toast.error(t("cannotMoveToDraft"));
        await assignmentsQuery.refetch();
        return;
      } else {
        // Normal transition validation for non-draft requests
        const isValid = validateTransition(workflowAsRequestWorkflowType, currentStatusId, overColumn);
        if (!isValid) {
          const fromName = assignment.status?.name ?? "N/A";
          const toName = orderedStatuses.find((s) => s.id === overColumn)?.name ?? "N/A";
          toast.error(t("invalidTransition"), {
            description: t("invalidTransitionDescription", { from: fromName, to: toName }),
          });
          setActiveTaskId(null);
          await assignmentsQuery.refetch();
          return;
        }
      }

      const targetStatus = orderedStatuses.find((s) => s.id === overColumn);
      if (!targetStatus && !isMovingToDraft) {
        toast.error(t("targetStatusNotFound"));
        await assignmentsQuery.refetch();
        return;
      }

      // Determine actual statusId to use:
      // - From Draft: use destination status id (overColumn)
      // - Otherwise: also use destination status id
      const actualStatusId = targetStatus?.id ?? overColumn;
      
      // If moving from Draft and status is the same as destination, we only
      // need to mark draft=false; `updateCurrentStatus` handles it.
      if (isMovingFromDraft && currentStatusId === actualStatusId) {
        // No-op here; handled by server action
      }

      // Add pending move and apply optimistic UI immediately
      const activeId = String(active.id);
      setPendingMoves((prev) => new Map(prev).set(activeId, overColumn));
      
      // Apply visual change immediately and mark this as a local update to avoid immediate overwrite
      skipNextSyncRef.current = true;
      setColumns((prevColumns) => {
        const newColumns = { ...prevColumns };
        const activeColumn = Object.keys(prevColumns).find((colId) => 
          prevColumns[colId]?.some((task) => task.id === activeId)
        );
        
        if (activeColumn && activeColumn !== overColumn) {
          // Remove from current column
          newColumns[activeColumn] = prevColumns[activeColumn].filter((task) => task.id !== activeId);
          // Add to destination column
          if (!newColumns[overColumn]) {
            newColumns[overColumn] = [];
          }
          const movedTask = prevColumns[activeColumn].find((task) => task.id === activeId);
          if (movedTask) {
            newColumns[overColumn] = [...newColumns[overColumn], movedTask];
          }
        }
        
        return newColumns;
      });

      startTransition(async () => {
        try {
          await updateCurrentStatus(tenantId, assignment.requestId, actualStatusId, {
            type: "STATUS_CHANGE",
            requiredReason: false,
            comments: t("statusChangedViaKanban"),
          });

          const fromName = isMovingFromDraft ? t("draftStatusName") : (assignment.status?.name ?? "N/A");
          const toName = targetStatus?.name ?? t("draftStatusName");
          toast.success(t("statusUpdated"), {
            description: t("statusUpdatedDescription", { from: fromName, to: toName }),
          });

          // Refetch para obtener los datos actualizados del servidor
          // Refetch to sync latest server state
          await assignmentsQuery.refetch();
        } catch (error) {
          console.error("Error updating status:", error);
          // Remove pending mark on error
          setPendingMoves((prev) => {
            const next = new Map(prev);
            next.delete(String(active.id));
            return next;
          });
          // Specific error handling
          let errorMessage = t("unknownError");
          if (error instanceof Error) {
            if (error.name === 'DraftRequirementsError' || error.message === 'DRAFT_REQUIREMENTS_NOT_FULFILLED') {
              errorMessage = t("draftRequirementsNotFulfilled");
            } else {
              errorMessage = error.message;
            }
          }
          
          toast.error(t("updateError"), {
            description: errorMessage,
          });
          await assignmentsQuery.refetch();
        }
      });
    },
    [tenantId, workflowAsRequestWorkflowType, assignmentsMap, orderedStatuses, assignmentsQuery, t]
  );

  const isLoading = workflowsQuery.isLoading || isFilterLoading || assignmentsQuery.isLoading;

  if (workflowsQuery.isError) {
    return <ErrorRetryFallback error={workflowsQuery.error} onRetry={workflowsQuery.refetch} />;
  }

  if (assignmentsQuery.isError) {
    return <ErrorRetryFallback error={assignmentsQuery.error} onRetry={assignmentsQuery.refetch} />;
  }

  if (!isLoading && (!workflows.length || !selectedWorkflow)) {
    return (
      <EmptyState
        title={t("noWorkflowsTitle")}
        description={t("noWorkflowsDescription")}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="workflow-select" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("workflowLabel")}
          </Label>
          <Select
            value={selectedWorkflowId ?? undefined}
            onValueChange={setSelectedWorkflowId}
            disabled={!workflows.length || workflowsQuery.isLoading}
          >
            <SelectTrigger id="workflow-select" className="w-64">
              <SelectValue placeholder={workflowsQuery.isLoading ? t("loadingWorkflows") : t("selectWorkflow")} />
            </SelectTrigger>
            <SelectContent>
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {(assignmentsQuery.isFetching || isPending) && (
            <span className="flex items-center gap-1">
              <Loader2 className="size-4 animate-spin" />
              {t("updating")}
            </span>
          )}
          <span>{assignments.length} {t("requests")}</span>
        </div>
      </div>

      {filterError && (
        <Alert variant="warning">
          <AlertTitle>{t("noFullAccess")}</AlertTitle>
          <AlertDescription>{filterError}</AlertDescription>
        </Alert>
      )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-x-auto">
          <KanbanBoardDataContext.Provider value={{ statuses: orderedStatuses, columns, isLoading, isPending, validTransitions, assignmentsMap, activeTaskId, orderedStatuses }}>
              <Kanban.Root
                value={columns}
                onValueChange={(newColumns) => {
                  // Permitir actualizaciones visuales durante el drag
                  setColumns(newColumns);
                  
                  // Si hay un item activo, detectar cambios de columna
                  if (activeTaskId) {
                    const taskId = String(activeTaskId);
                    const prevColumn = Object.keys(columns).find((colId) => 
                      columns[colId]?.some((task) => task.id === taskId)
                    );
                    const newColumn = Object.keys(newColumns).find((colId) => 
                      newColumns[colId]?.some((task) => task.id === taskId)
                    );
                    
                    // Si el item cambió de columna, procesar el cambio
                    if (prevColumn && newColumn && prevColumn !== newColumn) {
                      handleMove({ active: { id: taskId }, over: { id: newColumn } } as any, prevColumn, newColumn);
                    }
                  }
                }}
                onDragStart={(event) => {
                  setActiveTaskId(String(event.active.id));
                }}
                onDragEnd={() => {
                  // Resetear activeTaskId después de un breve delay para permitir que onValueChange procese el cambio
                  setTimeout(() => {
                    setActiveTaskId(null);
                  }, 100);
                }}
                onDragCancel={() => {
                  console.log("onDragCancel");
                  const taskId = activeTaskId ? String(activeTaskId) : null;
                  if (taskId) {
                    // Remover cualquier movimiento pendiente si se cancela
                    setPendingMoves((prev) => {
                      const next = new Map(prev);
                      next.delete(taskId);
                      return next;
                    });
                  }
                  setActiveTaskId(null);
                }}
                getItemValue={(item) => item.id}
                flatCursor
              >
              <Kanban.Board className="min-h-[24rem] min-w-max pr-2">
                {/* Draft column - always at the start */}
                <TaskColumn key={DRAFT_STATUS_ID} value={DRAFT_STATUS_ID} />
                {orderedStatuses.map((status) => (
                  <TaskColumn key={status.id} value={status.id} />
                ))}
              </Kanban.Board>
              <Kanban.Overlay>
                {({ value, variant }) => {
                  if (variant === "column") {
                    return <TaskColumn value={value} />;
                  }

                  const task = Object.values(columns)
                    .flat()
                    .find((item) => item.id === value);

                  if (!task) return null;

                  return <TaskCard task={task} />;
                }}
              </Kanban.Overlay>
            </Kanban.Root>
          </KanbanBoardDataContext.Provider>
        </div>
      </div>
    </div>
  );
}

interface TaskCardProps extends Omit<React.ComponentProps<typeof Kanban.Item>, "value"> {
  task: KanbanTask;
}

function TaskCard({ task, ...props }: TaskCardProps) {
  const t = useTranslations("admin.request.kanban");
  const tenantId = useTenantId();
  const assigneeLabel = React.useMemo(() => {
    if (!task.assignees.length) return t("unassigned");
    if (task.assignees.length === 1) return task.assignees[0];
    return `${task.assignees[0]} +${task.assignees.length - 1}`;
  }, [task.assignees, t]);

  return (
    <Kanban.Item key={task.id} value={task.id} asChild {...props}>
      <div className="rounded-md border bg-card p-3 shadow-xs cursor-pointer hover:bg-accent/50 transition-colors">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-1 flex-1">
              {task.slug != null && <span className="text-muted-foreground font-mono text-xs">#{task.slug}</span>}
              <span className="line-clamp-2 font-medium text-sm">{task.title}</span>
            </div>
            <div className="flex items-start gap-1 flex-shrink-0">
              {task.priority && (
                <Badge
                  className={cn(
                    "pointer-events-none h-5 rounded-sm px-1.5 text-[11px]",
                    task.priority.color ? "border-transparent" : "bg-muted"
                  )}
                  style={task.priority.color ? getPriorityStyles(task.priority.color) : undefined}
                >
                  {task.priority.name}
                </Badge>
              )}
              {tenantId && task.requestId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Link
                    href={{
                      pathname: "/admin/[tenantId]/requests/[slug]",
                      params: { tenantId, slug: task.requestId },
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="sr-only">Ver</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="line-clamp-1">{assigneeLabel}</span>
            {task.dueDate && <time className="text-[11px] tabular-nums">{task.dueDate}</time>}
          </div>
        </div>
      </div>
    </Kanban.Item>
  );
}

interface TaskColumnProps extends Omit<React.ComponentProps<typeof Kanban.Column>, "children"> {}

function TaskColumn({ value, className, ...props }: TaskColumnProps) {
  const context = use(KanbanBoardDataContext);
  const t = useTranslations("admin.request.kanban");

  if (!context) {
    throw new Error("TaskColumn must be rendered within a KanbanBoardDataContext provider");
  }

  const { statuses, columns, isLoading, isPending, validTransitions, assignmentsMap, activeTaskId, orderedStatuses } = context;
  
  // Manejar la columna especial de Draft
  const DRAFT_STATUS_ID = "__DRAFT__";
  const isDraftColumn = value === DRAFT_STATUS_ID;
  
  const status = React.useMemo(() => {
    if (isDraftColumn) {
      // Create a virtual status for Draft
      return {
        id: DRAFT_STATUS_ID,
        name: t("draftStatusName"),
        color: "#9ca3af", // gray
        type: "initial" as const,
      };
    }
    return statuses.find((item) => item.id === value);
  }, [statuses, value, isDraftColumn, t]);

  if (!status) return null;

  const tasks = columns[value] ?? [];

  const isDropDisabled = React.useMemo(() => {
    if (!activeTaskId) return false;
    const taskId = String(activeTaskId);
    const assignment = assignmentsMap.get(taskId);
    if (!assignment) return false;
    
    const DRAFT_STATUS_ID = "__DRAFT__";
    const isDraftColumn = value === DRAFT_STATUS_ID;
    const isDraft = assignment.request?.isDraft ?? false;
    
    // Si se está moviendo hacia Draft y la solicitud no está en borrador, deshabilitar
    if (isDraftColumn && !isDraft) {
      return true;
    }
    
    // Si se está moviendo desde Draft (solicitud en borrador), solo permitir estados "initial"
    if (isDraft) {
      const targetStatus = orderedStatuses.find((s) => s.id === value);
      if (targetStatus && targetStatus.type !== STATUS.INITIAL) {
        return true; // Deshabilitar si no es un estado inicial
      }
      // Permitir mover desde Draft a estados initial
      return false;
    }
    
    // Si se está moviendo hacia una columna normal, usar validación de transiciones
    const currentStatusId = assignment.status?.id ?? assignment.statusId;
    if (!currentStatusId) return false;
    if (currentStatusId === value) return false;
    
    const allowedIds = validTransitions.get(assignment.id);
    const statusId = String(value);
    return allowedIds ? !allowedIds.has(statusId) : true;
  }, [activeTaskId, assignmentsMap, validTransitions, value, orderedStatuses]);

  return (
    <Kanban.Column
      value={value}
      disabled={isDropDisabled}
      className={cn(
        "flex-shrink-0 basis-80 rounded-lg border bg-muted/20 p-3 transition-opacity relative",
        isDropDisabled && "opacity-40",
        className
      )}
      {...props}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: status.color ?? "var(--color-primary)" }}
            aria-hidden="true"
          />
          <span className="font-semibold text-sm">{status.name}</span>
          <Badge variant="secondary" className="pointer-events-none rounded-sm">
            {tasks.length}
          </Badge>
          {isDraftColumn && (
            <Badge variant="outline" className="pointer-events-none rounded-sm text-xs">
              {t("draftBadge")}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {isLoading && tasks.length === 0 && <ColumnSkeleton />}
        {!isLoading && tasks.length === 0 && <EmptyColumn />}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} asHandle />
        ))}
      </div>
      {isPending && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-background/40" />
          <div className="pointer-events-none absolute inset-x-0 top-2 flex items-center justify-center">
            <span className="inline-flex items-center gap-1 rounded-sm bg-background/90 px-2 py-1 text-[11px] text-muted-foreground shadow-xs">
              <Loader2 className="size-3 animate-spin" />
              {t("updating")}
            </span>
          </div>
        </>
      )}
    </Kanban.Column>
  );
}

function ColumnSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-20 w-full" />
      ))}
    </div>
  );
}

function EmptyColumn() {
  const t = useTranslations("admin.request.kanban");
  return (
    <div className="border-border text-muted-foreground flex h-20 items-center justify-center rounded-md border border-dashed text-xs">
      {t("noRequests")}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function getAssigneeLabel(userTenant: AssignmentWithRelations["assignedUsers"][number]["userTenant"]) {
  const firstName = userTenant.person?.firstName ?? "";
  const lastName = userTenant.person?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;
  return userTenant.user?.email ?? null;
}

function formatDueDate(value: Date | string | null | undefined) {
  if (!value) return undefined;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString();
}

function getPriorityStyles(color: string) {
  try {
    return {
      backgroundColor: hexToRgba(color, 0.12),
      color,
    } satisfies React.CSSProperties;
  } catch (error) {
    console.error("Invalid priority color", error);
    return undefined;
  }
}

function hexToRgba(hex: string, alpha: number) {
  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const bigint = Number.parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

