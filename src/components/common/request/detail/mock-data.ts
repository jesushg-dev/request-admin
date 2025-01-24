export const mockRequest = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  clientName: 'Acme Corporation',
  issueSubject: 'System Integration Request #45',
  description: 'Need to integrate new payment gateway with existing system',
  priority: 'High',
  statusName: 'In Progress',
  requestCategoryName: 'Integration',
  assignmentCategoryName: 'Technical',
  createdAt: '2024-01-20T10:00:00Z',
  updatedAt: '2024-01-23T15:30:00Z',
  closedAt: null,
  closedBy: null,
  closedComment: null,
  comment: 'Urgent integration needed for Q1 launch',
};

export const mockTeamMembers = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Lead Developer',
    avatarUrl: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'System Analyst',
    avatarUrl: '/placeholder.svg?height=40&width=40',
  },
  {
    id: '3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    role: 'Project Manager',
    avatarUrl: '/placeholder.svg?height=40&width=40',
  },
];

export const mockAreas = [
  { id: '1', name: 'Development' },
  { id: '2', name: 'Quality Assurance' },
  { id: '3', name: 'Operations' },
];

export const mockRelatedIncidents = [
  {
    id: '1',
    relatedId: '234e5678-e89b-12d3-a456-426614174001',
    issueSubject: 'Payment Gateway Downtime',
  },
  {
    id: '2',
    relatedId: '345e6789-e89b-12d3-a456-426614174002',
    issueSubject: 'Database Connection Issues',
  },
];

export const mockRequestAssignments = [
  {
    id: '1',
    priority: 'High',
    comment: 'Assign to senior developer',
    assignmentDate: '2024-01-20T11:00:00Z',
    unAssignmentDate: null,
    slaStart: '2024-01-20T11:00:00Z',
    slaDeadline: '2024-01-27T11:00:00Z',
    slaEnd: null,
    userTenantId: '1',
    areaId: '1',
  },
  {
    id: '2',
    priority: 'Medium',
    comment: 'Assign to junior developer',
    assignmentDate: '2024-01-20T11:00:00Z',
    unAssignmentDate: null,
    slaStart: '2024-01-20T11:00:00Z',
    slaDeadline: '2024-01-27T11:00:00Z',
    slaEnd: null,
    userTenantId: '2',
    areaId: '2',
  },
  {
    id: '3',
    priority: 'Low',
    comment: 'Assign to intern',
    assignmentDate: '2024-01-20T11:00:00Z',
    unAssignmentDate: null,
    slaStart: '2024-01-20T11:00:00Z',
    slaDeadline: '2024-01-27T11:00:00Z',
    slaEnd: null,
    userTenantId: '3',
    areaId: '3',
  },
];

export const mockAttachments = [
  {
    id: '1',
    name: 'Requirements.pdf',
    size: '2.4 MB',
    type: 'document',
    url: '/placeholder.svg?height=200&width=200',
    createdAt: '2024-01-20T10:15:00Z',
    isActive: true,
  },
  {
    id: '2',
    name: 'Setup Guide.pdf',
    size: '1.8 MB',
    type: 'guide',
    url: '/placeholder.svg?height=200&width=200',
    createdAt: '2024-01-20T11:30:00Z',
    isActive: true,
  },
  {
    id: '3',
    name: 'Old Specs.pdf',
    size: '756 KB',
    type: 'document',
    url: '/placeholder.svg?height=200&width=200',
    createdAt: '2024-01-21T09:45:00Z',
    isActive: false,
  },
  {
    id: '4',
    name: 'New Specs.pdf',
    size: '1.2 MB',
    type: 'document',
    url: '/placeholder.svg?height=200&width=200',
    createdAt: '2024-01-22T14:00:00Z',
    isActive: true,
  },
  {
    id: '5',
    name: 'User Guide.pdf',
    size: '3.1 MB',
    type: 'guide',
    url: '/placeholder.svg?height=200&width=200',
    createdAt: '2024-01-23T09:00:00Z',
    isActive: true,
  },
  {
    id: '6',
    name: 'API Reference.pdf',
    size: '2.7 MB',
    type: 'guide',
    url: '/placeholder.svg?height=200&width=200',
    createdAt: '2024-01-23T11:30:00Z',
    isActive: true,
  },
  {
    id: '7',
    name: 'Data Model.pdf',
    size: '1.9 MB',
    type: 'guide',
    url: '/placeholder.svg?height=200&width=200',
    createdAt: '2024-01-23T14:45:00Z',
    isActive: true,
  }
];

export const mockSatisfactionSurvey = {
  id: '1',
  rating: 4,
  feedback: 'Good service, but could be faster',
  submittedAt: '2024-01-28T09:00:00Z',
};

export const mockTaskProgress = {
  completed: 1,
  total: 5,
};

export const mockSubmissions = {
  count: 12,
  total: 15,
};

export const mockSLA = {
  resolutionTime: 24,
  escalationTime: 12,
  timeRemaining: 22,
  progress: 7,
};
