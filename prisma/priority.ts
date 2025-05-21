export function getPriorities() {
  const priorities = [
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Alta',
      description: 'Alta impacto o urgencia. Debe ser resuelto rápidamente.',
      primaryColor: '#FF0000', // Orange
      level: 1,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Media',
      description: 'Impacto y urgencia moderados. Manejado en procesos normales.',
      primaryColor: '#FFA500', // Orange
      level: 2,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Baja',
      description: 'Impacto y urgencia baja. Manejado en procesos estándar.',
      primaryColor: '#008000', // Green
      level: 3,
    },
  ];

  return priorities;
}
