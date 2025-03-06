import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

import { generateUuid, UNSTABLE_TENANT_ID, type AssignmentCategoryInput } from '../util';

export async function createAprobadosCreditoMesaControlArea(
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
      name: 'Validacion',
      description: '',
      subcategories: [
        {
          name: 'Validacion',
          description: '',
          subcategories: [
            { name: 'Validacion De Cliente', description: '' },
            { name: 'Compromiso', description: '' },
            { name: 'Venta Incobrable', description: '' },
            { name: 'Venta Extranjero', description: '' },
            { name: 'Cliente Con Seguimiento Desactivo', description: '' },
            { name: 'Cliente Nuevo Desea Otro Producto', description: '' },
            { name: 'Cliente Excede Limite De Credito', description: '' },
            { name: 'Segmentacion Del Cliente Manual', description: '' },
            { name: 'Validacion De Soporte De Ingresos', description: '' },
            { name: 'Sesion De Derechos O Crs', description: '' },
            { name: 'Agregar Favoritos', description: '' },
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

  return await prisma.area.create({
    data: {
      id: areaId,
      name: 'Aprobados Credito Mesa Control',
      description: '',
      tenantId,
      assignmentCategories: {
        create: assignmentCategoryData,
      },
    },
  });
}
