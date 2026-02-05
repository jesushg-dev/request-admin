/**
 * @jest-environment node
 */

// Import after mocks
import { currentSession, requireUser } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { FlowNodeType } from '@/types/execution-flow';

import { createExecutionFlow, createExecutionLog } from '../execution-flow';

// Mock external dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
  requireUser: jest.fn(),
}));

const mockDb: any = {
  $transaction: jest.fn(),
  request: {
    findMany: jest.fn(),
  },
  executionModelInstance: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  executionFlowDefinition: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  executionModelHistory: {
    createMany: jest.fn(),
  },
  executionModelLog: {
    create: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

describe('Execution Flow Actions', () => {
  const mockSession = { user: { id: 'user-123' }, tenantId: 'tenant-123' };
  const mockTenantId = 'tenant-1';
  const mockRequestCategoryId = 'category-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (requireUser as jest.Mock).mockImplementation(async () => {
      const s = await (currentSession as any)();
      return s?.user ?? s;
    });
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('createExecutionFlow', () => {
    const mockProcessFlow = {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: 'node-1',
          type: 'start' as FlowNodeType,
          position: { x: 100, y: 100 },
          data: {
            label: 'Start Node',
            linkedGuides: ['guide-1', 'guide-2'],
          },
        },
        {
          id: 'node-2',
          type: 'end' as FlowNodeType,
          position: { x: 200, y: 200 },
          data: {
            label: 'End Node',
            linkedGuides: [],
          },
        },
      ],
      edges: [
        {
          id: 'edge-1',
          type: 'default',
          source: 'node-1',
          target: 'node-2',
          sourceHandle: 'output',
          animated: false,
          style: { stroke: '#000' },
          markerEnd: { type: 'arrow' },
        },
      ],
    };

    it('should create execution flow successfully', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          request: {
            findMany: jest.fn().mockResolvedValue([]),
          },
          executionModelInstance: {
            findMany: jest.fn().mockResolvedValue([]),
          },
          executionFlowDefinition: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({
              id: 'flow-1',
              version: 1,
              nodes: mockProcessFlow.nodes,
              edges: mockProcessFlow.edges,
            }),
          },
          executionModelHistory: {
            createMany: jest.fn(),
          },
        };
        return await callback(mockTx);
      });

      (mockDb.$transaction as jest.Mock).mockImplementation(mockTransaction);

      const result = await createExecutionFlow(mockProcessFlow, mockRequestCategoryId, mockTenantId);

      expect(result).toEqual({
        id: 'flow-1',
        version: 1,
        nodes: mockProcessFlow.nodes,
        edges: mockProcessFlow.edges,
      });

      expect(mockDb.$transaction).toHaveBeenCalled();
    });

    it('should create execution flow with version increment when existing flow exists', async () => {
      const existingFlow = { id: 'existing-flow', version: 2 };
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          request: {
            findMany: jest.fn().mockResolvedValue([]),
          },
          executionModelInstance: {
            findMany: jest.fn().mockResolvedValue([]),
          },
          executionFlowDefinition: {
            findFirst: jest.fn().mockResolvedValue(existingFlow),
            create: jest.fn().mockResolvedValue({
              id: 'flow-2',
              version: 3,
              nodes: mockProcessFlow.nodes,
              edges: mockProcessFlow.edges,
            }),
          },
          executionModelHistory: {
            createMany: jest.fn(),
          },
        };
        return await callback(mockTx);
      });

      (mockDb.$transaction as jest.Mock).mockImplementation(mockTransaction);

      const result = await createExecutionFlow(mockProcessFlow, mockRequestCategoryId, mockTenantId);

      expect(result).toEqual({
        id: 'flow-2',
        version: 3,
        nodes: mockProcessFlow.nodes,
        edges: mockProcessFlow.edges,
      });
    });

    it('should create history records when active executions exist', async () => {
      const existingFlow = { id: 'existing-flow', version: 1 };
      const relatedRequests = [{ id: 'request-1' }, { id: 'request-2' }];
      const activeExecutions = [{ id: 'execution-1' }, { id: 'execution-2' }];

      const mockTx = {
        request: {
          findMany: jest.fn().mockResolvedValue(relatedRequests),
        },
        executionModelInstance: {
          findMany: jest.fn().mockResolvedValue(activeExecutions),
        },
        executionFlowDefinition: {
          findFirst: jest.fn().mockResolvedValue(existingFlow),
          create: jest.fn().mockResolvedValue({
            id: 'flow-2',
            version: 2,
            nodes: mockProcessFlow.nodes,
            edges: mockProcessFlow.edges,
          }),
        },
        executionModelHistory: {
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
      };

      (mockDb.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      await createExecutionFlow(mockProcessFlow, mockRequestCategoryId, mockTenantId);

      expect(mockTx.executionModelHistory.createMany).toHaveBeenCalledWith({
        data: [
          {
            tenantId: mockTenantId,
            previousFlowId: existingFlow.id,
            newFlowId: 'flow-2',
            reason: 'Version update - Active execution migration',
            updatedAt: expect.any(Date),
            executionId: 'execution-1',
          },
          {
            tenantId: mockTenantId,
            previousFlowId: existingFlow.id,
            newFlowId: 'flow-2',
            reason: 'Version update - Active execution migration',
            updatedAt: expect.any(Date),
            executionId: 'execution-2',
          },
        ],
      });
    });

    it('should throw error when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(createExecutionFlow(mockProcessFlow, mockRequestCategoryId, mockTenantId)).rejects.toThrow();
    });

    it('should handle database transaction errors', async () => {
      (mockDb.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(createExecutionFlow(mockProcessFlow, mockRequestCategoryId, mockTenantId)).rejects.toThrow('Database error');
    });
  });

  describe('createExecutionLog', () => {
    const mockExecutionId = 'execution-1';
    const mockNodeId = 'node-1';
    const mockEventType = 'start' as FlowNodeType;
    const mockData = { message: 'Test log data' };
    const mockOutcome = 'success' as const;

    it('should create execution log successfully', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          executionModelLog: {
            create: jest.fn().mockResolvedValue({
              id: 'log-1',
              executionId: mockExecutionId,
              nodeId: mockNodeId,
              eventType: mockEventType,
              details: JSON.stringify(JSON.stringify(mockData)),
              outcome: mockOutcome,
            }),
          },
          executionModelInstance: {
            update: jest.fn(),
          },
        };
        return await callback(mockTx);
      });

      (mockDb.$transaction as jest.Mock).mockImplementation(mockTransaction);

      const result = await createExecutionLog(mockTenantId, mockExecutionId, mockNodeId, mockEventType, mockData, mockOutcome);

      expect(result).toEqual({
        id: 'log-1',
        executionId: mockExecutionId,
        nodeId: mockNodeId,
        eventType: mockEventType,
        details: JSON.stringify(JSON.stringify(mockData)),
        outcome: mockOutcome,
      });

      expect(mockDb.$transaction).toHaveBeenCalled();
    });

    it('should update execution status to in_progress when event type is start', async () => {
      const mockTx = {
        executionModelLog: {
          create: jest.fn().mockResolvedValue({
            id: 'log-1',
            executionId: mockExecutionId,
            nodeId: mockNodeId,
            eventType: mockEventType,
            details: JSON.stringify(JSON.stringify(mockData)),
            outcome: mockOutcome,
          }),
        },
        executionModelInstance: {
          update: jest.fn().mockResolvedValue({ id: mockExecutionId, status: 'in_progress' }),
        },
      };

      (mockDb.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      await createExecutionLog(mockTenantId, mockExecutionId, mockNodeId, 'start', mockData, mockOutcome);

      expect(mockTx.executionModelInstance.update).toHaveBeenCalledWith({
        where: { id: mockExecutionId },
        data: { status: 'in_progress' },
      });
    });

    it('should not update execution status when event type is not start', async () => {
      const mockTx = {
        executionModelLog: {
          create: jest.fn().mockResolvedValue({
            id: 'log-1',
            executionId: mockExecutionId,
            nodeId: mockNodeId,
            eventType: 'end',
            details: JSON.stringify(JSON.stringify(mockData)),
            outcome: mockOutcome,
          }),
        },
        executionModelInstance: {
          update: jest.fn().mockResolvedValue({ id: mockExecutionId, status: 'completed' }),
        },
      };

      (mockDb.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      await createExecutionLog(mockTenantId, mockExecutionId, mockNodeId, 'end', mockData, mockOutcome);

      expect(mockTx.executionModelInstance.update).not.toHaveBeenCalled();
    });

    it('should throw error when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(createExecutionLog(mockTenantId, mockExecutionId, mockNodeId, mockEventType, mockData, mockOutcome)).rejects.toThrow();
    });

    it('should handle database transaction errors', async () => {
      (mockDb.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(createExecutionLog(mockTenantId, mockExecutionId, mockNodeId, mockEventType, mockData, mockOutcome)).rejects.toThrow('Database error');
    });
  });
});
