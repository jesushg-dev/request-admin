import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

import { generateUuid, UNSTABLE_TENANT_ID, type AssignmentCategoryInput } from '../util';

export async function createAreaTecnicaArea(
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
          name: 'Ultima Milla',
          description: '',
          subcategories: [
            { name: 'Fibra Clientes Y Troncales', description: '' },
            { name: 'Fibra Movil', description: '' },
            { name: 'Fibra Hfc', description: '' },
          ],
        },
        {
          name: 'Fibra Cobre Infraestructura',
          description: '',
          subcategories: [
            { name: 'Enlaces De Fibra', description: '' },
            { name: 'Proyectos Inducidos', description: '' },
            { name: 'Msan', description: '' },
          ],
        },
        {
          name: 'Hfc',
          description: '',
          subcategories: [{ name: 'Hfc Coaxial', description: '' }],
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
      name: 'Area Técnica',
      description: '',
      tenantId,
      assignmentCategories: {
        create: assignmentCategoryData,
      },
    },
  });
}
