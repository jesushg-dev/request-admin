export function getITILStatuses() {
  const itilStates = [
    {
      name: 'Draft',
      itilCode: 'draft',
      level: 1,
      description: 'Initial request registration',
      isActive: true,
      isFinal: false,
      requiresApproval: false,
    },
    {
      name: 'CAB Review',
      itilCode: 'cab_review',
      level: 2,
      description: 'Change Advisory Board evaluation',
      isActive: true,
      isFinal: false,
      requiresApproval: true,
    },
    {
      name: 'Approved',
      itilCode: 'approved',
      level: 3,
      description: 'Formally authorized for implementation',
      isActive: true,
      isFinal: false,
      requiresApproval: false,
    },
    {
      name: 'Implementing',
      itilCode: 'implementing',
      level: 4,
      description: 'Active change implementation',
      isActive: true,
      isFinal: false,
      requiresApproval: false,
    },
    {
      name: 'Closed',
      itilCode: 'closed',
      level: 5,
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
      toCode: 'cab_review',
      maxDuration: 1440,
      isDefault: true,
      priority: 1,
    },
    {
      fromCode: 'cab_review',
      toCode: 'draft',
      priority: 2,
      description: 'Rejection path',
    },
    {
      fromCode: 'cab_review',
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
