'use client';

import React, { createContext, ReactNode, useContext, useReducer, useRef } from 'react';

import type { AvailableNode, ExecutionHistoryEntry, FlowEdge, FlowNode, NodeSpecificStates, ParallelGroups, PendingDecision, ProcessFlow } from '@/types/execution-flow';

export interface ExecutionState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  processFlow: ProcessFlow | null;
  currentNodeId: string | null;
  completedNodeIds: string[];
  availableNodes: AvailableNode[];
  progress: number;
  currentLevel: number;
  totalLevels: number;
  error: string | null;
  isPlaying: boolean;
  isComplete: boolean;
  pendingDecision: PendingDecision | null;
  selectedNode: FlowNode | null;
  showFullDiagram: boolean;
  nodeSpecificStates: NodeSpecificStates;
  parallelGroups: ParallelGroups;
  activeTab: string;
  slaWarnings: Record<string, boolean>;
  executionHistory: ExecutionHistoryEntry[];
}

type Action =
  | { type: 'SET_PROCESS_FLOW'; payload: ProcessFlow }
  | { type: 'SET_NODES'; payload: FlowNode[] }
  | { type: 'SET_EDGES'; payload: FlowEdge[] }
  | { type: 'SET_CURRENT_NODE_ID'; payload: string | null }
  | { type: 'SET_COMPLETED_NODES'; payload: string[] }
  | { type: 'SET_AVAILABLE_NODES'; payload: AvailableNode[] }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_LEVELS'; payload: { current: number; total: number } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_COMPLETE'; payload: boolean }
  | { type: 'SET_PENDING_DECISION'; payload: PendingDecision | null }
  | { type: 'SET_SELECTED_NODE'; payload: FlowNode | null }
  | { type: 'SET_SHOW_FULL_DIAGRAM'; payload: boolean }
  | { type: 'SET_NODE_SPECIFIC_STATES'; payload: NodeSpecificStates }
  | { type: 'SET_PARALLEL_GROUPS'; payload: ParallelGroups }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SLA_WARNINGS'; payload: Record<string, boolean> }
  | { type: 'SET_EXECUTION_HISTORY'; payload: ExecutionHistoryEntry[] };

const initialState: ExecutionState = {
  processFlow: null,
  nodes: [],
  edges: [],
  currentNodeId: null,
  completedNodeIds: [],
  availableNodes: [],
  progress: 0,
  currentLevel: 1,
  totalLevels: 1,
  error: null,
  isPlaying: false,
  isComplete: false,
  pendingDecision: null,
  selectedNode: null,
  showFullDiagram: false,
  nodeSpecificStates: {},
  parallelGroups: {},
  activeTab: 'execution',
  slaWarnings: {},
  executionHistory: [],
};

function reducer(state: ExecutionState, action: Action): ExecutionState {
  switch (action.type) {
    case 'SET_PROCESS_FLOW':
      return { ...state, processFlow: action.payload };
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    case 'SET_EDGES':
      return { ...state, edges: action.payload };
    case 'SET_CURRENT_NODE_ID':
      return { ...state, currentNodeId: action.payload };
    case 'SET_COMPLETED_NODES':
      return { ...state, completedNodeIds: action.payload };
    case 'SET_AVAILABLE_NODES':
      return { ...state, availableNodes: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_LEVELS':
      return { ...state, currentLevel: action.payload.current, totalLevels: action.payload.total };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_COMPLETE':
      return { ...state, isComplete: action.payload };
    case 'SET_PENDING_DECISION':
      return { ...state, pendingDecision: action.payload };
    case 'SET_SELECTED_NODE':
      return { ...state, selectedNode: action.payload };
    case 'SET_SHOW_FULL_DIAGRAM':
      return { ...state, showFullDiagram: action.payload };
    case 'SET_NODE_SPECIFIC_STATES':
      return { ...state, nodeSpecificStates: action.payload };
    case 'SET_PARALLEL_GROUPS':
      return { ...state, parallelGroups: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_SLA_WARNINGS':
      return { ...state, slaWarnings: action.payload };
    case 'SET_EXECUTION_HISTORY':
      return { ...state, executionHistory: action.payload };
    default:
      return state;
  }
}

interface ExecutionContextType {
  state: ExecutionState;
  dispatch: React.Dispatch<Action>;
  timersRef: React.MutableRefObject<Record<string, NodeJS.Timeout>>;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined);

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});

  return <ExecutionContext.Provider value={{ state, dispatch, timersRef }}>{children}</ExecutionContext.Provider>;
}

export function useExecutionContext() {
  const context = useContext(ExecutionContext);
  if (!context) {
    throw new Error('useExecutionContext must be used within an ExecutionProvider');
  }
  return context;
}
