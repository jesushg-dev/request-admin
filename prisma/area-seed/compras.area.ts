import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { generateUuid, UNSTABLE_TENANT_ID, type AssignationCategoryInput } from 'prisma/util';

export async function createComprasArea(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  hierarchyId: string,
  hierarchyLevelRequestTypeId: string,
  hierarchyLevelCategoryId: string,
  hierarchyLevelSubcategoryId: string
) {
  const areaId = generateUuid();
  const tenantId = UNSTABLE_TENANT_ID;

  const assignationCategories: AssignationCategoryInput[] = [
    {
      name: 'Cotizacion',
      description: '',
      subcategories: [
        {
          name: 'Planta Interna',
          description: '',
          subcategories: [
            { name: 'Acciones Comerciales', description: '' },
            { name: 'Administrativas', description: '' },
            { name: 'Conmutacion', description: '' },
            { name: 'Consumibles', description: '' },
            { name: 'Contenido', description: '' },
            { name: 'Datacenter', description: '' },
            { name: 'Decodificador Cpe', description: '' },
            { name: 'Equipo Venta', description: '' },
            { name: 'Equipos Cpe Corp', description: '' },
            { name: 'Fuerza Y Clima', description: '' },
            { name: 'Handsets', description: '' },
            { name: 'Mo Aliado Corporat', description: '' },
            { name: 'Mo Aliado Residenc', description: '' },
            { name: 'Marketing', description: '' },
            { name: 'Mobiliario Equipo', description: '' },
            { name: 'Planta Externa', description: '' },
            { name: 'Proyectos Especial', description: '' },
            { name: 'Publicidad', description: '' },
            { name: 'Solucion Adm Corpo', description: '' },
            { name: 'Terminales', description: '' },
            { name: 'Ti', description: '' },
            { name: 'Transmision', description: '' },
            { name: 'Traslados', description: '' },
          ],
        },
        {
          name: 'Planta Externa',
          description: '',
          subcategories: [
            { name: 'Cable Coaxial', description: '' },
            { name: 'Fibra Optica', description: '' },
            { name: 'Infraestructura Tv', description: '' },
            { name: 'Infraestructura Corporat', description: '' },
            { name: 'Infraestructura Red', description: '' },
            { name: 'Miscelaneos Infrae', description: '' },
            { name: 'Obra Civil', description: '' },
            { name: 'Obra Civil Tecnica', description: '' },
            { name: 'Planta Externa', description: '' },
            { name: 'Servicios', description: '' },
            { name: 'Servicios Tecnicos', description: '' },
          ],
        },
      ],
    },
  ];

  const assignationCategoryData = assignationCategories.map((category) => ({
    name: category.name,
    description: category.description,
    tenantId,
    hierarchyId,
    hierarchyLevelId: hierarchyLevelRequestTypeId,
    subcategories: {
      create: category.subcategories?.map((subcategory) => ({
        name: subcategory.name,
        description: subcategory.description,
        tenantId,
        hierarchyId,
        hierarchyLevelId: hierarchyLevelCategoryId,
        areaId,
        subcategories: {
          create: subcategory.subcategories?.map((subSubcategory) => ({
            name: subSubcategory.name,
            description: subSubcategory.description,
            tenantId,
            hierarchyId,
            hierarchyLevelId: hierarchyLevelSubcategoryId,
            areaId,
          })),
        },
      })),
    },
  }));

  await prisma.area.create({
    data: {
      id: areaId,
      name: 'Compras',
      description: '',
      tenantId,
      assignationCategories: {
        create: assignationCategoryData,
      },
    },
  });
}
