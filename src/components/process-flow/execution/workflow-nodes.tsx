import { Fragment, ReactNode, type FC } from 'react';
import { useAtom } from 'jotai';
import { useTranslations } from 'next-intl';

import { AvailableNode } from '@/types/execution-flow';

import { ApprovalNode, ConditionNode, LoopNode, NotificationNode, TaskNode, TimerNode } from './nodes';
import { EndNode } from './nodes/end-node';
import { GatewayNode } from './nodes/gateway-node';
import { MessageNode } from './nodes/message-node';
import { StartNode } from './nodes/start-node';
import { StepNode } from './nodes/step-node';
import { SubprocessNode } from './nodes/subprocess-node';
import { availableNodesAtom, completedNodeIdsAtom, isCompleteAtom } from './store/use-execution-store';

type BranchGroup = {
  branchName: string;
  branchType: string;
  nodes: AvailableNode[];
};

interface WorkflowNodesProps {
  tenantId: string;
  executionId: string;
}

const WorkflowNodes: FC<WorkflowNodesProps> = ({ tenantId, executionId }) => {
  const [completedNodeIds] = useAtom(completedNodeIdsAtom);
  const [availableNodes] = useAtom(availableNodesAtom);
  const [isComplete] = useAtom(isCompleteAtom);
  const t = useTranslations('component.flowExecution.workflowNodes');

  const groupNodesByParent = (nodes: AvailableNode[]): Map<string, AvailableNode[]> => {
    return nodes.reduce((map: Map<string, AvailableNode[]>, node: AvailableNode) => {
      const parentId = node.parentId ?? 'root';
      const currentNodes = map.get(parentId) ?? [];
      return map.set(parentId, [...currentNodes, node]);
    }, new Map());
  };

  const renderNode = (availableNode: AvailableNode): ReactNode => {
    const nodeProps = {
      tenantId,
      executionId,
      nodeId: availableNode.node.id,
      isActive: availableNode.isActive && !isComplete,
      isCompleted: completedNodeIds.includes(availableNode.node.id),
      isBlocked: availableNode.isBlocked && !isComplete,
    };

    switch (availableNode.node.type) {
      case 'start':
        return <StartNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'end':
        return <EndNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'step':
        return <StepNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'subprocess':
        return <SubprocessNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'gateway':
        return <GatewayNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'condition':
        return <ConditionNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'approval':
        return <ApprovalNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'timer':
        return <TimerNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'notification':
        return <NotificationNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'task':
        return <TaskNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'loop':
        return <LoopNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      case 'message':
        return <MessageNode key={availableNode.node.id} {...nodeProps} {...availableNode.node.data} />;
      default:
        return <div className="bg-red-500 p-4">{t('nodeNotFound', { type: availableNode.node.type ?? 'N/A' })}</div>;
    }
  };

  const getBranchType = (branchName: string): { type: string; label: string } => {
    const parts = branchName.split('-');
    const lastPart = parts[parts.length - 1];

    switch (lastPart) {
      case 'approve':
        return { type: 'approve', label: t('branchTypes.approve') };
      case 'reject':
        return { type: 'reject', label: t('branchTypes.reject') };
      case 'yes':
        return { type: 'yes', label: t('branchTypes.yes') };
      case 'no':
        return { type: 'no', label: t('branchTypes.no') };
      default:
        return { type: 'default', label: branchName };
    }
  };

  // Procesamiento principal
  const renderNodeGroups = (): ReactNode[] => {
    const filteredNodes = availableNodes
      .filter((n: AvailableNode) => !n.isCompleted || isComplete)
      .sort((a: AvailableNode, b: AvailableNode) => a.level - b.level || (a.node.data.label ?? '').localeCompare(b.node.data.label ?? ''));

    const parentMap = groupNodesByParent(filteredNodes);
    const processed = new Set<string>();
    const elements: ReactNode[] = [];

    const rootNodes = parentMap.get('root') ?? [];

    rootNodes.forEach((node: AvailableNode) => {
      if (processed.has(node.node.id)) return;

      // Renderizar nodo padre
      elements.push(renderNode(node));
      processed.add(node.node.id);

      // Procesar hijos
      const children = parentMap.get(node.node.id) ?? [];
      const branchGroups = children.reduce((acc: BranchGroup[], child: AvailableNode) => {
        const branchName = child.branch ?? 'default';
        const { type, label } = getBranchType(branchName);

        const existingGroup = acc.find((g) => g.branchName === branchName);
        if (existingGroup) {
          existingGroup.nodes.push(child);
        } else {
          acc.push({
            branchName: label,
            branchType: type,
            nodes: [child],
          });
        }

        return acc;
      }, []);

      if (branchGroups.length > 0) {
        elements.push(
          <div key={`branch-group-${node.node.id}`} className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {branchGroups.map((group) => {
              const isDecisionBranch = group.branchType === 'approve' || group.branchType === 'reject' || group.branchType === 'yes' || group.branchType === 'no';

              return (
                <div key={`${node.node.id}-${group.branchName}`} className="flex flex-col gap-2">
                  {isDecisionBranch && (
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className={`px-2 py-1 rounded-md ${group.branchType === 'approve' || group.branchType === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {group.branchName}
                      </span>
                      <div className="h-px bg-gray-200 flex-1" />
                    </div>
                  )}

                  {group.nodes.map((child: AvailableNode) => {
                    if (processed.has(child.node.id)) return null;
                    processed.add(child.node.id);
                    return <Fragment key={child.node.id}>{renderNode(child)}</Fragment>;
                  })}
                </div>
              );
            })}
          </div>
        );
      }
    });

    return elements;
  };

  return <div className="flex flex-col">{renderNodeGroups()}</div>;
};

export default WorkflowNodes;
