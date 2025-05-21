interface Guide {
  id: string;
  title: string;
  description: string;
}
// Lista de guías disponibles

export const availableGuides: Guide[] = [
  {
    id: 'manual-activacion',
    title: 'Manual de activación de servicios móviles',
    description: 'Guía completa sobre el proceso de activación de servicios móviles',
  },
  {
    id: 'verificacion-documentos',
    title: 'Verificación de documentos de identidad',
    description: 'Procedimiento para verificar la autenticidad de documentos de identidad',
  },
  {
    id: 'planes-corporativos',
    title: 'Planes corporativos disponibles',
    description: 'Catálogo de planes corporativos con detalles y precios',
  },
  {
    id: 'tutorial-sistema',
    title: 'Tutorial: Sistema de activaciones',
    description: 'Video tutorial sobre cómo usar el sistema de activaciones',
  },
  {
    id: 'politicas-seguridad',
    title: 'Políticas de seguridad',
    description: 'Políticas de seguridad para el manejo de información confidencial',
  },
  {
    id: 'procedimiento-escalacion',
    title: 'Procedimiento de escalación',
    description: 'Pasos a seguir para escalar incidencias o problemas',
  },
];
