import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { generateUuid, UNSTABLE_TENANT_ID, type AssignmentCategoryInput } from 'prisma/util';

export async function createInternalCommissionsArea(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  hierarchyId: string,
  hierarchyLevelRequestTypeId: string,
  hierarchyLevelCategoryId: string,
  hierarchyLevelSubcategoryId: string
) {
  const areaId = generateUuid();
  const tenantId = UNSTABLE_TENANT_ID;

  const assignmentCategories: AssignmentCategoryInput[] = [
    {
      name: 'Solicitud',
      description: '',
      subcategories: [
        {
          name: 'Sistemas',
          description: '',
          subcategories: [
            { name: 'Creacion De Accesos', description: '' },
            { name: 'Baja De Accesos', description: '' },
            { name: 'Cambio', description: '' },
            { name: 'Claro Altas', description: '' },
            { name: 'Reinicio De Contraseñas Altas', description: '' },
            { name: 'Reinicio De Contraseñas Docflow', description: '' },
            { name: 'Reinicio De Contraseñas Syrem', description: '' },
            { name: 'Reinicio De Contraseñas Helpdesk', description: '' },
          ],
        },
        {
          name: 'Calculo De Comisiones Corporativo',
          description: '',
          subcategories: [
            { name: 'Renovaciones', description: '' },
            { name: 'Multas', description: '' },
            { name: 'Altas', description: '' },
          ],
        },
      ],
    },
    {
      name: 'Consulta',
      description: '',
      subcategories: [
        {
          name: 'Sistemas',
          description: '',
          subcategories: [
            { name: 'Creacion De Accesos', description: '' },
            { name: 'Baja De Accesos', description: '' },
            { name: 'Cambio', description: '' },
            { name: 'Claro Altas', description: '' },
            { name: 'Reinicio De Contraseñas Altas', description: '' },
            { name: 'Reinicio De Contraseñas Docflow', description: '' },
            { name: 'Reinicio De Contraseñas Syrem', description: '' },
            { name: 'Reinicio De Contraseñas Helpdesk', description: '' },
          ],
        },
        {
          name: 'Calculo De Comisiones Corporativo',
          description: '',
          subcategories: [
            { name: 'Renovaciones', description: '' },
            { name: 'Multas', description: '' },
            { name: 'Altas', description: '' },
          ],
        },
      ],
    },
    {
      name: 'Reclamo',
      description: '',
      subcategories: [
        {
          name: 'Sistemas',
          description: '',
          subcategories: [
            { name: 'Creacion De Accesos', description: '' },
            { name: 'Baja De Accesos', description: '' },
            { name: 'Cambio', description: '' },
            { name: 'Claro Altas', description: '' },
            { name: 'Reinicio De Contraseñas Altas', description: '' },
            { name: 'Reinicio De Contraseñas Docflow', description: '' },
            { name: 'Reinicio De Contraseñas Syrem', description: '' },
            { name: 'Reinicio De Contraseñas Helpdesk', description: '' },
          ],
        },
        {
          name: 'Calculo De Comisiones Corporativo',
          description: '',
          subcategories: [
            { name: 'Renovaciones', description: '' },
            { name: 'Multas', description: '' },
            { name: 'Altas', description: '' },
          ],
        },
      ],
    },
  ];

  const assignmentCategoryData = assignmentCategories.map((category) => ({
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
      name: 'Comisiones Internas',
      description: '',
      tenantId,
      assignmentCategories: {
        create: assignmentCategoryData,
      },
    },
  });
}
