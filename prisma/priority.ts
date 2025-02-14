export function getPriorities() {
  const priorities = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Critical',
      description: 'Requires immediate attention due to high impact and urgency.',
      primaryColor: '#FF0000', // Red
      level: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'High',
      description: 'High impact or urgency. Should be resolved quickly.',
      primaryColor: '#FFA500', // Orange
      level: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Medium',
      description: 'Moderate impact and urgency. Addressed in normal workflows.',
      primaryColor: '#FFFF00', // Yellow
      level: 3,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Low',
      description: 'Low impact and urgency. Handled in standard processing.',
      primaryColor: '#008000', // Green
      level: 4,
    },
  ];

  return priorities;
}
