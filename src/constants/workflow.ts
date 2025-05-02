export const typeOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Initial', value: 'initial' },
  { label: 'Final', value: 'final' },
];

export const colorOptions = [
  { label: 'Gray', value: 'gray' },
  { label: 'Blue', value: 'blue' },
  { label: 'Indigo', value: 'indigo' },
  { label: 'Green', value: 'green' },
  { label: 'Red', value: 'red' },
  { label: 'Yellow', value: 'yellow' },
];

export const nodeColors = {
  red: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  gray: { bg: '#f3f4f6', color: '#111827', border: '#d1d5db' },
  blue: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  green: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  yellow: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  indigo: { bg: '#bfdbfe', color: '#1e40af', border: '#60a5fa' },
} as const;
