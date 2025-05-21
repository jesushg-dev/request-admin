'use client';

import { useCallback, useReducer } from 'react';
import { nodeColors } from '@/constants/workflow';
import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { generateUuid } from '@/lib/id';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StepperNavigationButtons } from '@/components/stepper/step-navigation-buttons';

import { StateModal, type StateValues } from '../state-modal';
import { TransitionModal, type TransitionValues } from '../transition-modal';

export type WorkflowNode = Node<StateValues>;
export type WorkflowEdge = Edge<TransitionValues>;
export type WorkflowData = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

type EditorState = {
  isAddingNode: boolean;
  isEditingNode: boolean;
  isEditingEdge: boolean;
  selectedNode: WorkflowNode | null;
  selectedEdge: WorkflowEdge | null;
};

type EditorAction =
  | { type: 'SELECT_NODE'; payload: WorkflowNode }
  | { type: 'SELECT_EDGE'; payload: WorkflowEdge }
  | { type: 'RESET_SELECTION' }
  | { type: 'START_ADDING_NODE' }
  | { type: 'SAVE_NODE' }
  | { type: 'SAVE_EDGE' }
  | { type: 'DELETE_NODE' }
  | { type: 'DELETE_EDGE' };

const initialState: EditorState = {
  isAddingNode: false,
  isEditingNode: false,
  isEditingEdge: false,
  selectedNode: null,
  selectedEdge: null,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SELECT_NODE':
      return { ...state, selectedNode: action.payload, selectedEdge: null, isEditingNode: true, isEditingEdge: false };
    case 'SELECT_EDGE':
      return { ...state, selectedEdge: action.payload, selectedNode: null, isEditingNode: false, isEditingEdge: true };
    case 'RESET_SELECTION':
      return { ...state, selectedNode: null, selectedEdge: null, isEditingNode: false, isEditingEdge: false };
    case 'START_ADDING_NODE':
      return { ...state, isAddingNode: true, isEditingNode: true, isEditingEdge: false, selectedNode: null, selectedEdge: null };
    case 'SAVE_NODE':
      return { ...state, isAddingNode: false, isEditingNode: false, selectedNode: null };
    case 'SAVE_EDGE':
      return { ...state, isEditingEdge: false, selectedEdge: null };
    case 'DELETE_NODE':
      return { ...state, isEditingNode: false, selectedNode: null };
    case 'DELETE_EDGE':
      return { ...state, isEditingEdge: false, selectedEdge: null };
    default:
      return state;
  }
}

interface RequestFlowDiagramEditorProps {
  onBack: () => void;
  onSubmit: ({ nodes, edges }: WorkflowData) => void;
  defaultValues?: WorkflowData;
}

export function RequestFlowDiagramEditor({ onSubmit, onBack, defaultValues }: RequestFlowDiagramEditorProps) {
  const theme = useTheme();
  const t = useTranslations('admin.workflow.form.diagramEditor');
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const { isAddingNode, isEditingNode, isEditingEdge, selectedNode, selectedEdge } = state;

  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(defaultValues?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(defaultValues?.edges || []);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const edgeId = generateUuid();
      const newEdge: WorkflowEdge = {
        ...params,
        id: edgeId,
        label: t('transitions.new'),
        data: {
          id: edgeId,
          label: t('transitions.new'),
          description: '',
          requiresApproval: false,
          requiresJustification: false,
        },
        animated: true,
        style: { stroke: '#94a3b8' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#94a3b8',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      dispatch({ type: 'SELECT_EDGE', payload: newEdge });
    },
    [setEdges, t]
  );

  const onSelectionChange = useCallback(({ nodes, edges }: OnSelectionChangeParams<WorkflowNode, WorkflowEdge>) => {
    if (nodes.length === 1) {
      dispatch({ type: 'SELECT_NODE', payload: nodes[0] });
    } else if (edges.length === 1) {
      dispatch({ type: 'SELECT_EDGE', payload: edges[0] });
    } else {
      dispatch({ type: 'RESET_SELECTION' });
    }
  }, []);

  const validateDiagram = () => {
    const connectedNodes = new Set<string>();
    edges.forEach((edge) => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const disconnectedNodes = nodes.filter((node) => !connectedNodes.has(node.id));
    if (disconnectedNodes.length > 0) {
      toast.error(t('validation.error'), {
        description: t('validation.disconnectedNodes', { count: disconnectedNodes.length }),
      });
      return false;
    }

    const initialNodes = nodes.filter((node) => node.type === 'input');
    const finalNodes = nodes.filter((node) => node.type === 'output');

    if (initialNodes.length !== 1) {
      toast.error(t('validation.error'), {
        description: t('validation.initialNodes'),
      });
      return false;
    }

    if (finalNodes.length === 0) {
      toast.error(t('validation.error'), {
        description: t('validation.finalNodes'),
      });
      return false;
    }

    const nonFinalNodesWithoutExits = nodes.filter((node) => node.type !== 'output').filter((node) => !edges.some((edge) => edge.source === node.id));

    if (nonFinalNodesWithoutExits.length > 0) {
      toast.error(t('validation.error'), {
        description: t('validation.nonFinalNodesWithoutExits', { count: nonFinalNodesWithoutExits.length }),
      });
      return false;
    }

    toast.success(t('validation.success'), {
      description: t('validation.successDescription'),
    });
    return true;
  };

  const handleAddNode = () => {
    dispatch({ type: 'START_ADDING_NODE' });
  };

  const handleSaveNode = useCallback(
    (values: StateValues) => {
      if (isAddingNode) {
        const newNode: WorkflowNode = {
          id: values.id,
          data: { ...values },
          position: { x: 250, y: 150 },
          style: {
            color: nodeColors[values.color.value as keyof typeof nodeColors].color,
            background: nodeColors[values.color.value as keyof typeof nodeColors].bg,
            border: `1px solid ${nodeColors[values.color.value as keyof typeof nodeColors].border}`,
          },
          type: values.type.value === 'initial' ? 'input' : values.type.value === 'final' ? 'output' : undefined,
        };
        setNodes((nds) => [...nds, newNode]);
      } else if (selectedNode) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === values.id
              ? {
                  ...node,
                  data: { ...values },
                  style: {
                    color: nodeColors[values.color.value as keyof typeof nodeColors].color,
                    background: nodeColors[values.color.value as keyof typeof nodeColors].bg,
                    border: `1px solid ${nodeColors[values.color.value as keyof typeof nodeColors].border}`,
                  },
                  type: values.type.value === 'initial' ? 'input' : values.type.value === 'final' ? 'output' : undefined,
                }
              : node
          )
        );
      }
      dispatch({ type: 'SAVE_NODE' });
    },
    [isAddingNode, selectedNode, setNodes]
  );

  const handleSaveEdge = useCallback(
    (values: TransitionValues) => {
      if (selectedEdge) {
        setEdges((eds) =>
          eds.map((edge) =>
            edge.id === values.id
              ? {
                  ...edge,
                  label: values.label,
                  data: { ...edge.data, ...values },
                  type: 'smoothstep',
                }
              : edge
          )
        );
        dispatch({ type: 'SAVE_EDGE' });
      }
    },
    [selectedEdge, setEdges]
  );

  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      dispatch({ type: 'DELETE_NODE' });
    }
  };

  const handleDeleteEdge = () => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      dispatch({ type: 'DELETE_EDGE' });
    }
  };

  const handleBack = () => {
    onBack();
  };

  const handleSubmit = () => {
    if (validateDiagram()) {
      onSubmit({ nodes, edges });
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        fitView
        attributionPosition="bottom-left"
        colorMode={theme.theme === 'dark' ? 'dark' : 'light'}>
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />

        <Panel position="top-right">
          <Button size="icon" type="button" onClick={handleAddNode}>
            <Plus className="h-4 w-4" />
          </Button>
        </Panel>

        {isEditingNode && (
          <Panel position="top-left" className="bg-background border rounded-md p-4 shadow-md w-64">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{isAddingNode ? t('states.add') : t('states.edit')}</h3>
              {!isAddingNode && (
                <Button variant="destructive" size="icon" onClick={handleDeleteNode} aria-label={t('actions.deleteState')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <StateModal defaultValues={selectedNode?.data} onClose={() => dispatch({ type: 'SAVE_NODE' })} onSave={handleSaveNode} />
          </Panel>
        )}

        {isEditingEdge && (
          <Panel position="top-left" className="bg-background border rounded-md p-4 shadow-md w-64">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{t('transitions.edit')}</h3>
              <Button variant="destructive" size="icon" onClick={handleDeleteEdge} aria-label={t('actions.deleteTransition')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <TransitionModal defaultValues={selectedEdge?.data} onClose={() => dispatch({ type: 'SAVE_EDGE' })} onSave={handleSaveEdge} />
          </Panel>
        )}
      </ReactFlow>
      <div className="flex w-full justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{t('statesCounter', { count: nodes.length })}</Badge>
          <Badge variant="outline">{t('transitionsCounter', { count: edges.length })}</Badge>
        </div>
        <StepperNavigationButtons isFirstStep={false} isLastStep={false} onPrev={handleBack} onNext={handleSubmit} />
      </div>
    </div>
  );
}
