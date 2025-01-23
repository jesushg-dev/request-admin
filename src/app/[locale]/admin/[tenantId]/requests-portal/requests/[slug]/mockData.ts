import { FormSubmission } from '@/components/common/request/detail/submissions-viewer';

export type Area = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  avatar: string;
};

export const projectDetails = {
  id: '123456',
  clientId: 'client123',
  clientName: 'Acme Corp',
  issueSubject: 'System Upgrade Request',
  description:
    'The Sales Automation System project aims to develop a comprehensive software solution that automates sales processes, improves efficiency, and enhances customer relationship management.',
  priority: 'High',
  statusId: 'status123',
  statusName: 'In Progress',
  requestCategoryId: 'category1',
  requestCategoryName: 'System Upgrade',
  assignmentCategoryId: 'category2',
  assignmentCategoryName: 'IT Department',
  createdAt: '2023-08-23T10:00:00Z',
  updatedAt: '2023-09-15T14:30:00Z',
  closedAt: null,
  closedBy: null,
  closedComment: null,
};

export const teamMembers: User[] = [
  { id: '1', name: 'John Doe', avatar: '/placeholder.svg?height=48&width=48' },
  { id: '2', name: 'Jane Smith', avatar: '/placeholder.svg?height=48&width=48' },
  { id: '3', name: 'Bob Johnson', avatar: '/placeholder.svg?height=48&width=48' },
  { id: '4', name: 'Alice Brown', avatar: '/placeholder.svg?height=48&width=48' },
  { id: '5', name: 'Charlie Davis', avatar: '/placeholder.svg?height=48&width=48' },
];

export const areas: Area[] = [
  { id: '1', name: 'IT Department' },
  { id: '2', name: 'Sales Department' },
  { id: '3', name: 'Marketing Department' },
  { id: '4', name: 'Human Resources' },
];

export const attachments = [
  { id: 1, name: 'Requirements.pdf', type: 'picture_as_pdf', size: '2.3mb' },
  { id: 2, name: 'Mockups.zip', type: 'folder_zip', size: '5.1mb' },
  { id: 3, name: 'Budget.xlsx', type: 'description', size: '1.2mb' },
  { id: 4, name: 'Timeline.png', type: 'image', size: '3.7mb' },
];

export const tasks = [
  { id: 1, description: 'Review client requirements', completed: true },
  { id: 2, description: 'Create system architecture diagram', completed: false },
  { id: 3, description: 'Develop user authentication module', completed: false },
  { id: 4, description: 'Design database schema', completed: false },
  { id: 5, description: 'Implement data migration strategy', completed: false },
];

export const activities = [
  {
    id: 1,
    date: '2023-09-15',
    title: 'Status Updated',
    description: "Request status changed to 'In Progress'",
  },
  {
    id: 2,
    date: '2023-09-10',
    title: 'New Document Added',
    description: "Added 'Requirements.pdf' to the request",
  },
  {
    id: 3,
    date: '2023-09-05',
    title: 'Assignment Changed',
    description: 'Request assigned to IT Department',
  },
  {
    id: 4,
    date: '2023-08-23',
    title: 'Request Created',
    description: 'New system upgrade request submitted by Acme Corp',
  },
];

export const requestAssignment = {
  id: 'assignment123',
  priority: 'High',
  comment: 'Please handle this request as soon as possible',
  assignmentDate: '2023-09-05T09:00:00Z',
  unAssignmentDate: null,
  type: 'Department',
  userId: null,
  areaId: '2',
  statusId: 'status123',
  statusName: 'In Progress',
};

export const submissions: FormSubmission[] = [
  {
    id: '1',
    formName: 'Customer Feedback',
    submittedAt: '2023-05-15T10:30:00Z',
    content: {
      name: 'John Doe',
      email: 'john@example.com',
      rating: '5',
      feedback: 'Great service!',
    },
  },
  {
    id: '2',
    formName: 'Product Survey',
    submittedAt: '2023-05-16T14:45:00Z',
    content: {
      productName: 'SuperWidget',
      satisfaction: '4',
      improvements: 'Could be more durable',
    },
  },
  {
    id: '3',
    formName: 'Event Registration',
    submittedAt: '2023-05-17T09:15:00Z',
    content: {
      attendeeName: 'Jane Smith',
      eventDate: '2023-06-01',
      dietaryRestrictions: 'Vegetarian',
    },
  },
];

export const sLAs = [
  {
    id: '1',
    resolutionTime: 24,
    escalationTime: 12,
    requestCategoryId: 'cat1',
    requestCategoryName: 'IT Support',
  },
  {
    id: '2',
    resolutionTime: 48,
    escalationTime: null,
    requestCategoryId: 'cat2',
    requestCategoryName: 'HR Inquiries',
  },
  {
    id: '3',
    resolutionTime: 72,
    escalationTime: 36,
    requestCategoryId: 'cat3',
    requestCategoryName: 'Facilities Management',
  },
];

export const guideDocuments = [
  {
    id: 'gd1',
    name: 'IT Troubleshooting Guide',
    url: 'https://example.com/it-guide',
    status: 1,
    expirationDate: '2024-12-31T23:59:59Z',
    version: 2,
    requestCategoryId: 'cat1',
    requestCategoryName: 'IT Support',
  },
  {
    id: 'gd2',
    name: 'Employee Onboarding Checklist',
    url: null,
    status: 1,
    expirationDate: null,
    version: 1,
    requestCategoryId: 'cat2',
    requestCategoryName: 'HR Inquiries',
  },
];

export const documents = [
  {
    id: 'doc1',
    name: 'Laptop Replacement Request',
    url: 'https://example.com/laptop-request',
    status: 2,
    expirationDate: '2023-12-31T23:59:59Z',
    requestId: 'req1',
    requestName: 'New Laptop Request',
  },
  {
    id: 'doc2',
    name: 'Vacation Request Form',
    url: null,
    status: 1,
    expirationDate: null,
    requestId: 'req2',
    requestName: 'Vacation Request',
  },
];
