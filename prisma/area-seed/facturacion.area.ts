import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { generateUuid, UNSTABLE_TENANT_ID, type AssignmentCategoryInput } from '../util';

export async function createFacturacionArea(
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
          name: 'Multimedia',
          description: '',
          subcategories: [{ name: 'Facturacion Por Instalacion', description: '' }],
        },
        {
          name: 'Finiquitos',
          description: '',
          subcategories: [{ name: 'Finiquitos', description: '' }],
        },
        {
          name: 'Autoconsumo',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
            { name: 'Pruebas Internas', description: '' },
            { name: 'Prueba Clientes (Degustacion)', description: '' },
            { name: 'Donacion', description: '' },
            { name: 'Deduccion De Equipo', description: '' },
            { name: 'Cantidad De Registros', description: '' },
          ],
        },
        {
          name: 'Parametrizacion',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Pospago', description: '' },
            { name: 'Prepago', description: '' },
          ],
        },
        {
          name: 'Reporte',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Revision De Facturas',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Exoneracion Iba',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Generar Factura Sap',
          description: '',
          subcategories: [{ name: 'Generar Factura Sap', description: '' }],
        },
        {
          name: 'Nota De Credito',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Nota De Debito',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'St-Pre Facturacion',
          description: '',
          subcategories: [
            { name: 'Television', description: '' },
            { name: 'Linea Fija', description: '' },
            { name: 'Enlace De Datos', description: '' },
            { name: 'Otros', description: '' },
          ],
        },
      ],
    },
    {
      name: 'Finiquitos',
      description: '',
      subcategories: [
        {
          name: 'Multimedia',
          description: '',
          subcategories: [{ name: 'Facturacion Por Instalacion', description: '' }],
        },
        {
          name: 'Finiquitos',
          description: '',
          subcategories: [{ name: 'Finiquitos', description: '' }],
        },
        {
          name: 'Autoconsumo',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
            { name: 'Pruebas Internas', description: '' },
            { name: 'Prueba Clientes (Degustacion)', description: '' },
            { name: 'Donacion', description: '' },
            { name: 'Deduccion De Equipo', description: '' },
            { name: 'Cantidad De Registros', description: '' },
          ],
        },
        {
          name: 'Parametrizacion',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Pospago', description: '' },
            { name: 'Prepago', description: '' },
          ],
        },
        {
          name: 'Reporte',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Revision De Facturas',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Exoneracion Iba',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Generar Factura Sap',
          description: '',
          subcategories: [{ name: 'Generar Factura Sap', description: '' }],
        },
        {
          name: 'Nota De Credito',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Nota De Debito',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'St-Pre Facturacion',
          description: '',
          subcategories: [
            { name: 'Television', description: '' },
            { name: 'Linea Fija', description: '' },
            { name: 'Enlace De Datos', description: '' },
            { name: 'Otros', description: '' },
          ],
        },
      ],
    },
    {
      name: 'Autoconsumo',
      description: '',
      subcategories: [
        {
          name: 'Multimedia',
          description: '',
          subcategories: [{ name: 'Facturacion Por Instalacion', description: '' }],
        },
        {
          name: 'Finiquitos',
          description: '',
          subcategories: [{ name: 'Finiquitos', description: '' }],
        },
        {
          name: 'Autoconsumo',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
            { name: 'Pruebas Internas', description: '' },
            { name: 'Prueba Clientes (Degustacion)', description: '' },
            { name: 'Donacion', description: '' },
            { name: 'Deduccion De Equipo', description: '' },
            { name: 'Cantidad De Registros', description: '' },
          ],
        },
        {
          name: 'Parametrizacion',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Pospago', description: '' },
            { name: 'Prepago', description: '' },
          ],
        },
        {
          name: 'Reporte',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Revision De Facturas',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Exoneracion Iba',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Generar Factura Sap',
          description: '',
          subcategories: [{ name: 'Generar Factura Sap', description: '' }],
        },
        {
          name: 'Nota De Credito',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Nota De Debito',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'St-Pre Facturacion',
          description: '',
          subcategories: [
            { name: 'Television', description: '' },
            { name: 'Linea Fija', description: '' },
            { name: 'Enlace De Datos', description: '' },
            { name: 'Otros', description: '' },
          ],
        },
      ],
    },
    {
      name: 'Parametrizacion',
      description: '',
      subcategories: [
        {
          name: 'Multimedia',
          description: '',
          subcategories: [{ name: 'Facturacion Por Instalacion', description: '' }],
        },
        {
          name: 'Finiquitos',
          description: '',
          subcategories: [{ name: 'Finiquitos', description: '' }],
        },
        {
          name: 'Autoconsumo',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
            { name: 'Pruebas Internas', description: '' },
            { name: 'Prueba Clientes (Degustacion)', description: '' },
            { name: 'Donacion', description: '' },
            { name: 'Deduccion De Equipo', description: '' },
            { name: 'Cantidad De Registros', description: '' },
          ],
        },
        {
          name: 'Parametrizacion',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Pospago', description: '' },
            { name: 'Prepago', description: '' },
          ],
        },
        {
          name: 'Reporte',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Revision De Facturas',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Exoneracion Iba',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Generar Factura Sap',
          description: '',
          subcategories: [{ name: 'Generar Factura Sap', description: '' }],
        },
        {
          name: 'Nota De Credito',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'Nota De Debito',
          description: '',
          subcategories: [
            { name: 'Multimedia', description: '' },
            { name: 'Movil', description: '' },
          ],
        },
        {
          name: 'St-Pre Facturacion',
          description: '',
          subcategories: [
            { name: 'Television', description: '' },
            { name: 'Linea Fija', description: '' },
            { name: 'Enlace De Datos', description: '' },
            { name: 'Otros', description: '' },
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
      name: 'Facturacion',
      description: '',
      tenantId,
      assignmentCategories: {
        create: assignmentCategoryData,
      },
    },
  });
}
