export enum WorkflowStatusType {
  INITIAL = 'initial',
  DEFAULT = 'default',
  FINAL = 'final',
}
export enum WorkflowStatusColor {
  GRAY = 'gray',
  BLUE = 'blue',
  INDIGO = 'indigo',
  GREEN = 'green',
  RED = 'red',
  YELLOW = 'yellow',
}

export const typeOptions = [
  { label: 'Initial', value: WorkflowStatusType.INITIAL },
  { label: 'Default', value: WorkflowStatusType.DEFAULT },
  { label: 'Final', value: WorkflowStatusType.FINAL },
] satisfies { label: string; value: WorkflowStatusType }[];

export const colorOptions = [
  { label: 'Gray', value: WorkflowStatusColor.GRAY },
  { label: 'Blue', value: WorkflowStatusColor.BLUE },
  { label: 'Indigo', value: WorkflowStatusColor.INDIGO },
  { label: 'Green', value: WorkflowStatusColor.GREEN },
  { label: 'Red', value: WorkflowStatusColor.RED },
  { label: 'Yellow', value: WorkflowStatusColor.YELLOW },
] satisfies { label: string; value: WorkflowStatusColor }[];

export const nodeColors = {
  red: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  gray: { bg: '#f3f4f6', color: '#111827', border: '#d1d5db' },
  blue: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  green: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  yellow: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  indigo: { bg: '#bfdbfe', color: '#1e40af', border: '#60a5fa' },
} as const;
