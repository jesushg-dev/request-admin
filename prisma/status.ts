import { STATUS } from '@/constants/requests';

export function getITILStatuses() {
  const itilStates = [
    {
      name: 'Draft',
      itilCode: 'draft',
      level: STATUS.DRAFT,
      description: 'Initial request registration',
      isActive: true,
      isFinal: false,
      requiresApproval: false,
    },
    {
      name: 'Review',
      itilCode: 'review',
      level: STATUS.REVIEW,
      description: 'Change Advisory Board evaluation',
      isActive: true,
      isFinal: false,
      requiresApproval: true,
    },
    {
      name: 'Approved',
      itilCode: 'approved',
      level: STATUS.APPROVED,
      description: 'Formally authorized for implementation',
      isActive: true,
      isFinal: false,
      requiresApproval: false,
    },
    {
      name: 'Implementing',
      itilCode: 'implementing',
      level: STATUS.IMPLEMENTING,
      description: 'Active change implementation',
      isActive: true,
      isFinal: false,
      requiresApproval: false,
    },
    {
      name: 'Closed',
      itilCode: 'closed',
      level: STATUS.CLOSED,
      description: 'Successfully completed and verified',
      isActive: true,
      isFinal: true,
      requiresApproval: false,
    },
  ];

  return itilStates;
}

export function getITILTransitions() {
  const itilTransitions = [
    {
      fromCode: 'draft',
      toCode: 'review',
      maxDuration: 1440,
      isDefault: true,
      priority: 1,
    },
    {
      fromCode: 'review',
      toCode: 'draft',
      priority: 2,
      description: 'Rejection path',
    },
    {
      fromCode: 'review',
      toCode: 'approved',
      maxDuration: 2880,
      requiresApproval: true,
      priority: 1,
    },
    {
      fromCode: 'approved',
      toCode: 'implementing',
      maxDuration: 4320,
      isDefault: true,
    },
    {
      fromCode: 'implementing',
      toCode: 'closed',
      maxDuration: 10080,
      isDefault: true,
    },
  ];

  return itilTransitions;
}
