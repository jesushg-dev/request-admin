export function getPriorities() {
  const priorities = [
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'High',
      description: 'High impact or urgency. Should be resolved quickly.',
      primaryColor: '#FF0000', // Orange
      level: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Medium',
      description: 'Moderate impact and urgency. Addressed in normal workflows.',
      primaryColor: '#FFA500', // Orange
      level: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Low',
      description: 'Low impact and urgency. Handled in standard processing.',
      primaryColor: '#008000', // Green
      level: 3,
    },
  ];

  return priorities;
}
